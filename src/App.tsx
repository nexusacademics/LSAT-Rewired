// App.tsx
import React, { useState } from 'react';

// Import custom hooks for separation of concerns
import { useAuth } from './hooks/useAuth';
import { useTestData } from './hooks/useTestData';
import { useTestSessions } => {
    if (!user) {
      console.warn('Cannot start test session: no user logged in');
      return;
    }

    const newSession: TestSession = {
      id: `session-${Date.now()}`,
      testId,
      userId: user.id,
      phase,
      timeMode: phase === 'timed' ? timeMode : undefined,
      customTimeMinutes: phase === 'timed' ? customTimeMinutes : undefined,
      startTime: new Date(),
      circuits: [],
      flaggedQuestions: [],
      answeredQuestions: {},
      timedAnswers: {},
      blindReviewAnswers: {},
      analysisNotes: {},
      currentSectionIndex: 0,
      currentQuestionIndex: 0, // Initialize currentQuestionIndex to 0
      selectedSectionId,
      completedSectionIds: [],
      completedPhases: [],
    };

    console.log('Starting new test session:', newSession.id); // Debug log
    
    setUserSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  }, [user]);

  const resumeTestSession = useCallback((sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => {
    const sessionToResume = userSessions.find(session => session.id === sessionId);
    if (!sessionToResume) {
      console.warn('Cannot resume session: session not found', sessionId);
      return;
    }

    let updatedSession = { ...sessionToResume };

    if (targetPhase) {
      // Store answers from the phase just completed before resetting for the new phase
      // This logic is handled in TripleReview.handleSubmitSection
      
      // Starting a new review phase for a completed session
      updatedSession = {
        ...updatedSession,
        phase: targetPhase, // Set to the new phase
        endTime: undefined, // Clear end time as it's now in progress for this new phase
        currentSectionIndex: 0,
        currentQuestionIndex: 0, // Reset currentQuestionIndex for new phase
        answeredQuestions: {}, // Reset answered questions for the new phase
        flaggedQuestions: [],
        completedSectionIds: [],
      };
    }
    // If targetPhase is not provided, it means we are resuming the current in-progress phase.
    // In this case, no changes to phase or state reset are needed.

    console.log('Resuming test session:', updatedSession.id, 'phase:', updatedSession.phase); // Debug log

    setCurrentSession(updatedSession);
    // Persist the changes to userSessions
    setUserSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  }, [userSessions]);

  const updateSession = useCallback((updatedSession: TestSession) => {
    setCurrentSession(updatedSession);
    setUserSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  }, []);

  const exitSession = useCallback(() => {
    console.log('Exiting current session'); // Debug log
    setCurrentSession(null);
  }, []);

  return {
    userSessions,
    currentSession,
    startNewTestSession,
    resumeTestSession,
    updateSession,
    exitSession
  };
}

