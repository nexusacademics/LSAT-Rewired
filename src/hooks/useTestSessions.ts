// hooks/useTestSessions.ts
import { useState, useCallback, useEffect } from 'react';
import type { User, TestSession } from '../types/user';

// Helper function to restore Date objects from JSON
const reviveDates = (session: any): TestSession => {
  return {
    ...session,
    startTime: new Date(session.startTime),
    endTime: session.endTime ? new Date(session.endTime) : undefined,
    pausedAt: session.pausedAt ? new Date(session.pausedAt) : undefined,
    circuits: session.circuits?.map((circuit: any) => ({
      ...circuit,
      createdAt: new Date(circuit.createdAt)
    })) || []
  };
};

// Helper function to get the localStorage key for a user
const getStorageKey = (userId: string) => `lsat-rewired-sessions-${userId}`;

export function useTestSessions(user: User | null) {
  const [userSessions, setUserSessions] = useState<TestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);

  // Load sessions from localStorage when component mounts or user changes
  useEffect(() => {
    if (!user) {
      setUserSessions([]);
      setCurrentSession(null);
      return;
    }

    try {
      const storageKey = getStorageKey(user.id);
      const storedSessions = localStorage.getItem(storageKey);
      
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        const sessionsWithDates = parsedSessions.map(reviveDates);
        setUserSessions(sessionsWithDates);
        
        console.log(`Loaded ${sessionsWithDates.length} sessions from localStorage for user ${user.id}`);
      } else {
        console.log(`No stored sessions found for user ${user.id}`);
        setUserSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      setUserSessions([]);
    }
  }, [user]);

  // Save sessions to localStorage whenever userSessions changes
  useEffect(() => {
    if (!user || userSessions.length === 0) {
      return;
    }

    try {
      const storageKey = getStorageKey(user.id);
      localStorage.setItem(storageKey, JSON.stringify(userSessions));
      console.log(`Saved ${userSessions.length} sessions to localStorage for user ${user.id}`);
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
      
      // If localStorage is full, try to clear old sessions
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to clear old sessions...');
        try {
          // Keep only the 10 most recent sessions
          const recentSessions = userSessions
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 10);
          
          localStorage.setItem(storageKey, JSON.stringify(recentSessions));
          setUserSessions(recentSessions);
          console.log(`Cleared old sessions, kept ${recentSessions.length} recent sessions`);
        } catch (secondError) {
          console.error('Failed to clear old sessions:', secondError);
        }
      }
    }
  }, [userSessions, user]);

  // Clear localStorage when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentSession(null);
    }
  }, [user]);

  const startNewTestSession = useCallback((
    testId: string,
    phase: 'timed' | 'blind-review' | 'strategy-review',
    timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed',
    customTimeMinutes?: number,
    selectedSectionId?: string
  ) => {
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
    console.log('Updating session:', updatedSession.id);

    // Validate session state to prevent unexpected resets
    setCurrentSession(prevSession => {
      if (!prevSession || prevSession.id !== updatedSession.id) {
        return updatedSession;
      }

      // Detect and prevent suspicious resets
      const isMovingBackwardsInSection =
        updatedSession.currentSectionIndex === prevSession.currentSectionIndex &&
        updatedSession.currentQuestionIndex < prevSession.currentQuestionIndex;

      const isMovingToEarlierSection =
        updatedSession.currentSectionIndex < prevSession.currentSectionIndex;

      if (isMovingBackwardsInSection || isMovingToEarlierSection) {
        // Allow intentional backwards navigation (user clicking previous button)
        const isIntentionalBackwardsNavigation =
          (isMovingBackwardsInSection &&
           updatedSession.currentQuestionIndex === prevSession.currentQuestionIndex - 1) ||
          (isMovingToEarlierSection && updatedSession.currentQuestionIndex === 0);

        if (!isIntentionalBackwardsNavigation) {
          console.warn('⚠️ Prevented suspicious session reset:', {
            prevQuestion: prevSession.currentQuestionIndex,
            newQuestion: updatedSession.currentQuestionIndex,
            prevSection: prevSession.currentSectionIndex,
            newSection: updatedSession.currentSectionIndex
          });

          // Merge the updates but preserve navigation state
          return {
            ...updatedSession,
            currentQuestionIndex: prevSession.currentQuestionIndex,
            currentSectionIndex: prevSession.currentSectionIndex
          };
        }
      }

      return updatedSession;
    });

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

  // Utility function to clear all stored sessions (for debugging or user preference)
  const clearStoredSessions = useCallback(() => {
    if (!user) return;
    
    try {
      const storageKey = getStorageKey(user.id);
      localStorage.removeItem(storageKey);
      setUserSessions([]);
      setCurrentSession(null);
      console.log(`Cleared all stored sessions for user ${user.id}`);
    } catch (error) {
      console.error('Error clearing stored sessions:', error);
    }
  }, [user]);

  return {
    userSessions,
    currentSession,
    startNewTestSession,
    resumeTestSession,
    updateSession,
    exitSession,
    clearStoredSessions
  };
}
