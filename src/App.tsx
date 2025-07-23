// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { supabase } from './lib/supabase'; // Ensure supabase is imported
import { useAuth } from './hooks/useAuth';
import { useTestData } from './hooks/useTestData';
import { useTestSessions } from './hooks/useTestSessions';
import { processRawPrepTest } from './utils/dataProcessing'; // Import the processing function

// Components
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TripleReview from './components/TripleReview';
import PerformanceTracker from './components/PerformanceTracker';
import FloatingChatButton from './components/FloatingChatButton'; // Import FloatingChatButton

// Types
import type { User, TestSession, ProcessedPrepTest, ProcessedSection, ProcessedQuestion } from './types/user'; // Import all necessary types

// Define Message interface for chat history
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

// Re-export types from user.ts for convenience in other files
export type { User, TestSession, ProcessedPrepTest, ProcessedSection, ProcessedQuestion };

type AppView = 'dashboard' | 'triple-review' | 'performance' | 'subscription';

function App() {
  const { user, isLoading: isAuthLoading, subscription } = useAuth();
  const { allProcessedTests, isLoading: isTestDataLoading } = useTestData();
  const {
    userSessions,
    currentSession,
    startNewTestSession,
    resumeTestSession,
    updateSession,
    exitSession
  } = useTestSessions(user);

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]); // State for chat messages
  const [isChatOpen, setIsChatOpen] = useState(false); // NEW: State to control chat bubble visibility

  // Determine current question data for AI Chat context
  const currentQuestionData: ProcessedQuestion | null = currentSession
    ? allProcessedTests[currentSession.testId]?.sections
        .find(section => section.id === (currentSession.selectedSectionId || allProcessedTests[currentSession.testId].sections[currentSession.currentSectionIndex]?.id))
        ?.questions[currentSession.currentQuestionIndex] || null
    : null;

  // Handle view changes
  const handleViewChange = useCallback((view: AppView) => {
    setCurrentView(view);
    // Close chat when navigating away from Triple Review or Circuit Builder
    if (view !== 'triple-review' && view !== 'circuit-builder') {
      setIsChatOpen(false);
    }
  }, []);

  // Override exitSession to also close the chat bubble
  const handleExitSession = useCallback(() => {
    exitSession();
    setCurrentView('dashboard');
    setIsChatOpen(false); // NEW: Close chat bubble when exiting session
    setMessages([]); // Clear chat messages when exiting a session
  }, [exitSession]);

  if (isAuthLoading || isTestDataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        userStats={user?.stats}
      />

      <main className="flex-1 p-6">
        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            userSessions={userSessions}
            onStartNewTestSession={startNewTestSession}
            onResumeTestSession={resumeTestSession}
            allProcessedTests={allProcessedTests}
          />
        )}

        {currentView === 'triple-review' && currentSession && processedPrepTest && (
          <TripleReview
            session={currentSession}
            onUpdateSession={updateSession}
            onExitSession={handleExitSession} // Use the wrapped exit session
            processedPrepTest={processedPrepTest}
          />
        )}

        {currentView === 'performance' && user && (
          <PerformanceTracker user={user} />
        )}

        {currentView === 'subscription' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Subscription Status</h1>
            {subscription ? (
              <p className="text-slate-700">
                Your current subscription status is: <span className="font-semibold">{subscription.subscription_status}</span>
                {subscription.price_id && ` (Price ID: ${subscription.price_id})`}
              </p>
            ) : (
              <p className="text-slate-700">You do not have an active subscription.</p>
            )}
            <p className="text-slate-600 mt-4">
              Manage your subscription through your Stripe customer portal or contact support.
            </p>
          </div>
        )}
      </main>

      {user && (
        <FloatingChatButton
          user={user}
          currentView={currentView}
          currentSession={currentSession}
          currentQuestionData={currentQuestionData}
          allProcessedTests={allProcessedTests}
          messages={messages}
          setMessages={setMessages}
          isOpen={isChatOpen} // NEW: Pass isOpen state
          setIsOpen={setIsChatOpen} // NEW: Pass setIsOpen setter
        />
      )}
    </div>
  );
}

export default App;
