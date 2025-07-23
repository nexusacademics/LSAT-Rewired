// App.tsx
import React, { useState } from 'react';

// Import custom hooks for separation of concerns
import { useAuth } from './hooks/useAuth';
import { useTestData } from './hooks/useTestData';
import { useTestSessions } from './hooks/useTestSessions';

// Import components
import Dashboard from './components/Dashboard';
import TripleReview from './components/TripleReview';
import PerformanceTracker from './components/PerformanceTracker';
import FloatingChatButton from './components/FloatingChatButton';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';

// Import types
import type { TestSession } from './types/user';
import type { ProcessedQuestion } from './types/test-data';

// Define view type
type AppView = 'dashboard' | 'triple-review' | 'performance' | 'subscription';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Custom hooks handle specific concerns
  const { user, supabaseUser, subscription, isLoading: authLoading } = useAuth();
  const { allProcessedTests, isLoading: dataLoading } = useTestData();

  // ADD THIS LINE:
  console.log('All Processed Tests in App.tsx:', allProcessedTests);

  const {
    userSessions,
    currentSession,
    startNewTestSession,
    resumeTestSession,
    updateSession,
    exitSession
  } = useTestSessions(user);

  const isLoading = authLoading || dataLoading;

  // Derive current question data for chat
  const currentQuestionDataForChat = useCurrentQuestionData(
    currentView,
    currentSession,
    allProcessedTests
  );

  // Event handlers
  const handleStartNewSession = (
    testId: string,
    phase: 'timed' | 'blind-review' | 'strategy-review',
    timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed',
    customTimeMinutes?: number,
    selectedSectionId?: string
  ) => {
    startNewTestSession(testId, phase, timeMode, customTimeMinutes, selectedSectionId);
    setCurrentView('triple-review');
  };

  const handleResumeSession = (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => {
    resumeTestSession(sessionId, targetPhase);
    setCurrentView('triple-review');
  };

  const handleExitSession = () => {
    exitSession();
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        userStats={user?.stats}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            userSessions={userSessions}
            onStartNewTestSession={handleStartNewSession}
            onResumeTestSession={handleResumeSession}
            allProcessedTests={allProcessedTests}
          />
        )}

        {currentView === 'triple-review' && currentSession && (
          <TripleReview
            session={currentSession}
            onUpdateSession={updateSession}
            onExitSession={handleExitSession}
            processedPrepTest={allProcessedTests[currentSession.testId]}
          />
        )}

        {currentView === 'performance' && user && (
          <PerformanceTracker user={user} />
        )}
      </main>

      {user && (
        <FloatingChatButton
          user={user}
          currentView={currentView}
          currentSession={currentSession}
          currentQuestionData={currentQuestionDataForChat}
          allProcessedTests={allProcessedTests}
        />
      )}
    </div>
  );
}

// Custom hook to derive current question data
function useCurrentQuestionData(
  currentView: AppView,
  currentSession: TestSession | null,
  allProcessedTests: { [key: string]: any }
): ProcessedQuestion | null {
  if (currentView !== 'triple-review' || !currentSession) {
    return null;
  }

  const currentTest = allProcessedTests[currentSession.testId];
  if (!currentTest) return null;

  const currentSection = currentSession.selectedSectionId
    ? currentTest.sections.find((sec: any) => sec.id === currentSession.selectedSectionId)
    : currentTest.sections[currentSession.currentSectionIndex];

  if (!currentSection || currentSession.currentSectionIndex >= currentSection.questions.length) {
    return null;
  }

  return currentSection.questions[currentSession.currentSectionIndex];
}

export default App;
