// App.tsx
import React, { useState, useCallback, useEffect } from 'react';

// Import contexts
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

// Import custom hooks for separation of concerns
import { useTestData } from './hooks/useTestData';
import { useTestDetails } from './hooks/useTestDetails';
import { useTestSessions } from './hooks/useTestSessions';

// Import components
import Dashboard from './components/Dashboard';
import TripleReview from './components/TripleReview';
import PerformanceTracker from './components/PerformanceTracker';
import FloatingChatButton from './components/FloatingChatButton';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import StudyScheduleBuilder from './components/StudyScheduleBuilder';
import ProfileSettings from './components/ProfileSettings';
import AuthModal from './components/Auth/AuthModal';

// Import types
import type { TestSession } from './types/user';
import type { ProcessedQuestion, ProcessedPrepTest } from './types/test-data';
import type { User } from './types/user';

// Define view type
type AppView = 'dashboard' | 'triple-review' | 'performance' | 'studyscheduler' | 'subscription' | 'profile';

// Define Message interface for chat history
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

// Main App Content Component (needs to be inside ThemeProvider and AuthProvider)
function AppContent() {
  const { theme } = useTheme();
  const { user: authUser, profile, subscription, isLoading: authLoading } = useAuthContext();

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat] = useState<{ questionId: string, phase: string } | null>(null);
  const [hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Convert auth user and profile to User type for compatibility
  const user: User | null = authUser && profile ? {
    id: authUser.id,
    email: authUser.email || '',
    name: profile.first_name || profile.username || authUser.email?.split('@')[0] || 'User',
    firstName: profile.first_name,
    lastName: profile.last_name,
    username: profile.username,
    stats: {
      circuitsCreated: 0,
      testsCompleted: 0,
      averageAnalysisScore: 0,
      rank: 0
    }
  } : null;
  
  // Keep old hook for Dashboard search functionality (will be removed in Phase 4)
  const { allProcessedTests, isLoading: dataLoading } = useTestData();
  
  // New hook for on-demand test loading
  const { testData: currentTestData, isLoading: isLoadingTest, fetchTestById, clearTestData } = useTestDetails();

  const {
    userSessions,
    currentSession,
    startNewTestSession,
    resumeTestSession,
    updateSession,
    exitSession
  } = useTestSessions(user);

  // Fetch test data when session starts or changes
  useEffect(() => {
    if (currentSession && currentView === 'triple-review') {
      console.log('Session active, fetching test data...');
      fetchTestById(currentSession.testId, currentSession.selectedSectionId);
    } else if (!currentSession) {
      clearTestData();
    }
  }, [currentSession?.id, currentSession?.testId, currentSession?.selectedSectionId, currentView, fetchTestById, clearTestData]);

  // Derive current question data for chat
  const currentQuestionDataForChat = useCurrentQuestionData(
    currentView,
    currentSession,
    currentTestData || allProcessedTests
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
    setIsChatOpen(false);
  };

  const handleResumeSession = (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => {
    resumeTestSession(sessionId, targetPhase);
    setCurrentView('triple-review');
    setIsChatOpen(false);
  };

  const handleExitSession = useCallback(() => {
    exitSession();
    clearTestData();
    setCurrentView('dashboard');
    setIsChatOpen(false);
    setMessages([]);
    setLastProcessedQuestionIdForChat(null);
    setHasInitialChatWelcomeBeenSent(false);
  }, [exitSession, clearTestData]);

  if (authLoading || (authUser && !profile)) {
    return <LoadingSpinner />;
  }

  // Use currentTestData if available, otherwise fallback to allProcessedTests
  const processedPrepTest = currentTestData || (currentSession ? allProcessedTests[currentSession.testId] : undefined);

  // Dynamic background classes based on theme
  const backgroundClasses = theme === 'dark' 
    ? 'bg-gray-900' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  return (
    <div className="app">
      <div className={'min-h-screen transition-all duration-500 ' + backgroundClasses}>
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenAuth={() => setIsAuthModalOpen(true)}
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
            isLoadingTest ? (
              <LoadingSpinner />
            ) : processedPrepTest ? (
              <TripleReview
                session={currentSession}
                onUpdateSession={updateSession}
                onExitSession={handleExitSession}
                processedPrepTest={processedPrepTest}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">Loading test data...</p>
              </div>
            )
          )}

          {currentView === 'studyscheduler' && (
            <StudyScheduleBuilder />
          )}
          
          {currentView === 'performance' && user && (
            <PerformanceTracker user={user} />
          )}

          {currentView === 'profile' && (
            <ProfileSettings />
          )}
        </main>

        {authUser && user && (
          <FloatingChatButton
            user={user}
            currentView={currentView}
            currentSession={currentSession}
            currentQuestionData={currentQuestionDataForChat}
            allProcessedTests={currentTestData ? { [currentTestData.id]: currentTestData } : allProcessedTests}
            messages={messages}
            setMessages={setMessages}
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
            lastProcessedQuestionIdForChat={lastProcessedQuestionIdForChat}
            setLastProcessedQuestionIdForChat={setLastProcessedQuestionIdForChat}
            hasInitialChatWelcomeBeenSent={hasInitialChatWelcomeBeenSent}
            setHasInitialChatWelcomeBeenSent={setHasInitialChatWelcomeBeenSent}
          />
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}

// Main App Component (wraps with ThemeProvider and AuthProvider)
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Custom hook to derive current question data
function useCurrentQuestionData(
  currentView: AppView,
  currentSession: TestSession | null,
  testData: ProcessedPrepTest | Record<string, ProcessedPrepTest>
): ProcessedQuestion | null {
  if (currentView !== 'triple-review' || !currentSession) {
    return null;
  }

  let currentTest: ProcessedPrepTest | undefined;
  
  if ('id' in testData) {
    currentTest = testData as ProcessedPrepTest;
  } else {
    currentTest = (testData as Record<string, ProcessedPrepTest>)[currentSession.testId];
  }

  if (!currentTest) return null;

  const currentSection = currentSession.selectedSectionId
    ? currentTest.sections.find((sec: any) => sec.id === currentSession.selectedSectionId)
    : currentTest.sections[currentSession.currentSectionIndex];

  if (!currentSection || currentSession.currentQuestionIndex >= currentSection.questions.length) {
    return null;
  }

  return currentSection.questions[currentSession.currentQuestionIndex];
}

export default App;
