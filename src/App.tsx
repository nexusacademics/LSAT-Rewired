// App.tsx
import React, { useState, useCallback } from 'react';

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
import type { ProcessedQuestion, ProcessedPrepTest } from './types/test-data'; // Ensure ProcessedPrepTest is imported

// Define view type
type AppView = 'dashboard' | 'triple-review' | 'performance' | 'subscription';

// Define Message interface for chat history
export interface Message { // Exported for use in FloatingChatButton
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  // State to hold conversation messages, lifted to App.tsx
  const [messages, setMessages] = useState<Message[]>([]);
  // NEW: State to control the chat bubble's open/closed state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Custom hooks handle specific concerns
  const { user, supabaseUser, subscription, isLoading: authLoading } = useAuth();
  const { allProcessedTests, isLoading: dataLoading } = useTestData();

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

  // MODIFIED: handleExitSession to close chat and clear messages
  const handleExitSession = useCallback(() => {
    exitSession();
    setCurrentView('dashboard');
    setIsChatOpen(false); // Close the chat bubble
    setMessages([]); // Clear chat messages
  }, [exitSession]);


  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Ensure processedPrepTest is available for TripleReview
  const processedPrepTest = currentSession ? allProcessedTests[currentSession.testId] : undefined;

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

        {currentView === 'triple-review' && currentSession && processedPrepTest && ( // Ensure processedPrepTest is defined
          <TripleReview
            session={currentSession}
            onUpdateSession={updateSession}
            onExitSession={handleExitSession}
            processedPrepTest={processedPrepTest} // Pass the derived processedPrepTest
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
          messages={messages} // Pass messages state
          setMessages={setMessages} // Pass setMessages function
          isOpen={isChatOpen} // NEW: Pass isOpen state
          setIsOpen={setIsChatOpen} // NEW: Pass setIsOpen function
        />
      )}
    </div>
  );
}

// Custom hook to derive current question data
function useCurrentQuestionData(
  currentView: AppView,
  currentSession: TestSession | null,
  allProcessedTests: { [key: string]: ProcessedPrepTest } // Use ProcessedPrepTest type
): ProcessedQuestion | null {
  if (currentView !== 'triple-review' || !currentSession) {
    return null;
  }

  const currentTest = allProcessedTests[currentSession.testId];
  if (!currentTest) return null;

  const currentSection = currentSession.selectedSectionId
    ? currentTest.sections.find((sec: any) => sec.id === currentSession.selectedSectionId)
    : currentTest.sections[currentSession.currentSectionIndex];

  if (!currentSection || currentSession.currentQuestionIndex >= currentSection.questions.length) {
    return null;
  }

  return currentSection.questions[currentSession.currentQuestionIndex]; // Corrected to use currentQuestionIndex
}

export default App;
