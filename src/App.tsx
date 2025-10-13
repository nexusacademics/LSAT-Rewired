// App.tsx
import React, { useState, useCallback, useEffect } from 'react';

// Import custom hooks for separation of concerns
import { useAuth } from './hooks/useAuth';
import { useTestData } from './hooks/useTestData';
import { useTestDetails } from './hooks/useTestDetails';
import { useTestSessions } from './hooks/useTestSessions';

// Import components
import Dashboard from './components/Dashboard';
import SessionsPage from './components/SessionsPage';
import TripleReview from './components/TripleReview';
import PerformanceTracker from './components/PerformanceTracker';
import FloatingChatButton from './components/FloatingChatButton';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import StudyScheduleBuilder from './components/StudyScheduleBuilder';
import LandingPage from './components/LandingPage';
import { supabase } from './lib/supabase';

// Import types
import type { TestSession } from './types/user';
import type { ProcessedQuestion, ProcessedPrepTest } from './types/test-data';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Define view type
type AppView = 'landing' | 'dashboard' | 'triple-review' | 'performance' | 'studyscheduler' | 'profile' | 'billing' | 'sessions';

// Define Message interface for chat history
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

// Main App Content Component (needs to be inside ThemeProvider)
function AppContent() {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat] = useState<{ questionId: string, phase: string } | null>(null);
  const [hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent] = useState(false);

  // Custom hooks handle specific concerns
  const { user, supabaseUser, subscription, isLoading: authLoading, restoreMockUser } = useAuth();
  
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

  const isLoading = authLoading || dataLoading;

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

  const handleSignOut = async () => {
    try {
      if (user) {
        const storageKey = `lsat-rewired-sessions-${user.id}`;
        localStorage.removeItem(storageKey);
      }

      await supabase.auth.signOut();
      setCurrentView('landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogin = () => {
    restoreMockUser();
    setCurrentView('dashboard');
  };

  if (isLoading) {
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
        {currentView !== 'landing' && (
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user || undefined}
            onSignOut={handleSignOut}
          />
        )}

        {currentView === 'landing' ? (
          <LandingPage onLogin={handleLogin} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' && user && (
            <Dashboard
              user={user}
              allProcessedTests={allProcessedTests}
            />
          )}

          {currentView === 'sessions' && user && (
            <SessionsPage
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
            <div className="text-center py-12">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Profile Settings</h2>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Profile management coming soon</p>
            </div>
          )}

          {currentView === 'billing' && (
            <div className="text-center py-12">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Billing & Subscription</h2>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>Billing management coming soon</p>
            </div>
          )}
          </main>
        )}

        {user && currentView !== 'landing' && (
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
      </div>
    </div>
  );
}

// Main App Component (wraps with ThemeProvider)
function App() {
  return (
    <ThemeProvider>
      <AppContent />
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
