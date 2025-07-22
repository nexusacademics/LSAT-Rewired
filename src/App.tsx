import React, { useState } from 'react';
import { Brain, Users, Target, MessageCircle, BookOpen, Timer, TrendingUp, Crown } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TripleReview from './components/TripleReview';
// import CircuitBuilder from './components/CircuitBuilder'; // REMOVED: CircuitBuilder is now managed by TripleReview
import PerformanceTracker from './components/PerformanceTracker';
import AIChat from './components/AIChat'; // Keep import for FloatingChatButton to use
import FloatingChatButton from './components/FloatingChatButton'; // New import
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

// Import the raw JSON data
import rawPrepTest140 from './data/fullPrepTest140.json';

// --- New Interfaces to match your JSON structure ---
interface RawPrepTest {
  sections: RawSection[];
  moduleName: string;
}

interface RawSection {
  sectionId: string;
  sectionName: string;
  items: RawQuestionItem[];
}

interface RawQuestionItem {
  itemId: string;
  stimulusText: string;
  stemText: string;
  options: { optionLetter: string; optionContent: string }[];
  correctAnswer: string;
}

// --- Existing/Adapted Interface for Processed Questions ---
export interface ProcessedQuestion {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  type: string; // e.g., 'Logical Reasoning', 'Reading Comprehension'
}

// New interface for processed sections
export interface ProcessedSection {
  id: string; // e.g., LR140A-1
  name: string; // e.g., LR140A-1 or Logical Reasoning Section A
  questions: ProcessedQuestion[];
}

export interface ProcessedPrepTest {
  id: string; // Added ID for easier lookup
  name: string; // moduleName
  sections: ProcessedSection[]; // Array of processed sections
}

// --- Data Processing Function (Moved from TripleReview) ---
function processRawPrepTest(rawData: RawPrepTest): ProcessedPrepTest {
  // Helper to strip HTML tags and convert escaped newlines
  const stripHtmlTags = (html: string): string => {
  // First, replace </p> tags with double newlines to preserve paragraph breaks
  let processedHtml = html.replace(/<\/p>/g, '\n\n');
  // Then, create a DOM parser to strip all other HTML tags
  const doc = new DOMParser().parseFromString(processedHtml, 'text/html');
  // Get text content and convert any remaining escaped newlines, then trim whitespace
  return (doc.body.textContent || "").replace(/\\n/g, '\n').trim();
};

  // Helper to convert option letter to 0-indexed number
  const optionLetterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  const processedSections: ProcessedSection[] = rawData.sections.map(rawSection => {
    const sectionType = rawSection.sectionId.startsWith('LR') ? 'Logical Reasoning' :
                        rawSection.sectionId.startsWith('RC') ? 'Reading Comprehension' :
                        'Question'; // Default for other types

    const processedQuestions: ProcessedQuestion[] = rawSection.items.map(item => {
      const processedOptions = item.options.map(opt => stripHtmlTags(opt.optionContent));
      const processedCorrectAnswer = optionLetterToIndex(item.correctAnswer);

      return {
        id: item.itemId,
        passage: stripHtmlTags(item.stimulusText),
        question: stripHtmlTags(item.stemText),
        options: processedOptions,
        correctAnswer: processedCorrectAnswer,
        type: sectionType,
      };
    });

    return {
      id: rawSection.sectionId,
      name: rawSection.sectionName, // Use sectionName from JSON for display
      questions: processedQuestions,
    };
  });

  return {
    id: rawData.moduleName, // Use moduleName as the ID for the PrepTest
    name: rawData.moduleName,
    sections: processedSections,
  };
}


export type User = {
  id: string;
  email: string;
  name: string; // This will still be derived, perhaps from firstName
  firstName?: string; // New
  lastName?: string; // New
  username?: string; // New
  lawhubCredentials?: {
    username: string;
    verified: boolean;
  };
  stats: {
    circuitsCreated: number;
    testsCompleted: number;
    averageAnalysisScore: number;
    rank: number;
  };
};

export type QuestionAnalysisNotes = {
  questionTypeAnalysis: string;
  argumentStructure: string;
  answerChoiceAnalysis: string;
};

export type TestSession = {
  id: string;
  testId: string; // Now stores the ID of the PrepTest (e.g., "PrepTest 140")
  userId: string;
  phase: 'timed' | 'blind-review' | 'strategy-review';
  timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed'; // Optional for non-timed phases
  customTimeMinutes?: number; // For custom timing
  startTime: Date;
  endTime?: Date; // Marks session as completed if set
  circuits: Circuit[];
  flaggedQuestions: string[]; // Array of question IDs that are flagged
  answeredQuestions: { [questionId: string]: number }; // Map of questionId to selected option index (0-indexed) for the CURRENT phase
  timedAnswers: { [questionId: string]: number }; // NEW: Stores answers from the timed phase
  blindReviewAnswers: { [questionId: string]: number }; // NEW: Stores answers from the blind review phase
  analysisNotes: { [questionId: string]: QuestionAnalysisNotes }; // NEW: Stores analysis notes for each question
  currentSectionIndex: number; // Added to track current section
  selectedSectionId?: string; // New: Optional, for single-section sessions
  completedSectionIds: string[]; // NEW: Array of section IDs completed in this session
  completedPhases: ('timed' | 'blind-review' | 'strategy-review')[]; // NEW: Tracks completed phases for this session
};

export type Circuit = {
  id: string;
  questionId: string;
  diagram: DiagramNode[];
  annotations: string[];
  analysisQuality: number;
  createdAt: Date;
};

export type DiagramNode = {
  id: string;
  type: 'premise' | 'conclusion' | 'assumption' | 'counterexample' | 'connector' | 'assumed-valid' | 'assumed-invalid' | 'implied-correct' | 'conclusion-subject' | 'conclusion-predicate' | 'minor-premise' | 'major-premise' | 'backing-premise' | 'counterclaim' | 'correct-answer'; // Added new types
  shape: 'rectangle' | 'rounded-rectangle' | 'ellipse';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number }; // Add optional size property
  connections: { targetId: string; style: 'solid' | 'dashed' }[];
};

interface SupabaseUser {
  id: string;
  email?: string;
}

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'triple-review' | 'performance'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Process all raw test data once and store in a map
  const allProcessedTests: { [key: string]: ProcessedPrepTest } = {
    [rawPrepTest140.moduleName]: processRawPrepTest(rawPrepTest140),
    // Add other processed tests here if you had more raw data files
    // e.g., 'PrepTest 141': processRawPrepTest(rawPrepTest141),
  };

  // State to hold all user's test sessions
  const [userSessions, setUserSessions] = useState<TestSession[]>([]);
  // State to hold the currently active session
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);

  const fetchSubscription = async (): Promise<SubscriptionData | null> => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      } else {
        setSubscription(data);
        return data;
      }
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      return null;
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    // Fetch user profile from the new 'profiles' table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, first_name, last_name')
      .eq('id', supabaseUser.id)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (error) {
      console.error('Error fetching user profile:', error);
      // Fallback if there's a real error (e.g., network issue, malformed query)
      const mockUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        stats: {
          circuitsCreated: 50,
          testsCompleted: 10,
          averageAnalysisScore: 88,
          rank: 100
        }
      };
      setUser(mockUser);
      return;
    }

    // If profile is null (no row found by maybeSingle), use mock data
    if (!profile) {
      console.warn('No profile found for user, using mock data.');
      const mockUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        stats: {
          circuitsCreated: 50,
          testsCompleted: 10,
          averageAnalysisScore: 88,
          rank: 100
        }
      };
      setUser(mockUser);
      return;
    }

    const userProfile: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile.first_name || profile.username || supabaseUser.email?.split('@')[0] || 'User', // Use first name or username for display
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.username,
      stats: {
        circuitsCreated: 50,
        testsCompleted: 10,
        averageAnalysisScore: 88,
        rank: 100
      }
    };
    setUser(userProfile);
  };

  const handleAuthSuccess = async (user: SupabaseUser) => {
    setSupabaseUser(user);
    await createUserProfile(user); // Ensure profile is created/fetched before checking subscription
    const subData = await fetchSubscription(); // No need to pass userId, RLS handles it
    setCurrentView('dashboard');
  };

  // Check for authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleAuthSuccess(session.user);
        } else {
          // If no session, create a mock user for dashboard display
          const mockSupabaseUser: SupabaseUser = {
            id: 'mock-user-id', // A consistent mock ID for development
            email: 'mock@example.com',
          };
          const mockUser: User = {
            id: mockSupabaseUser.id,
            email: mockSupabaseUser.email || '',
            name: mockSupabaseUser.email?.split('@')[0] || 'User',
            firstName: 'Mock',
            lastName: 'User',
            username: 'mockuser',
            stats: {
              circuitsCreated: 50,
              testsCompleted: 10,
              averageAnalysisScore: 88,
              rank: 100
            }
          };
          setSupabaseUser(mockSupabaseUser);
          setUser(mockUser); // Directly set the mock user
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthSuccess(session.user);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        setCurrentView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to start a new test session
  const startNewTestSession = (
    testId: string, // Now receives the ID of the selected PrepTest
    phase: 'timed' | 'blind-review' | 'strategy-review',
    timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed',
    customTimeMinutes?: number,
    selectedSectionId?: string // New parameter
  ) => {
    const newSession: TestSession = {
      id: `session-${Date.now()}`,
      testId, // Use the passed testId
      userId: user!.id,
      phase,
      timeMode: phase === 'timed' ? timeMode : undefined, // Only set timeMode for timed sessions
      customTimeMinutes: phase === 'timed' ? customTimeMinutes : undefined,
      startTime: new Date(),
      circuits: [],
      flaggedQuestions: [],
      answeredQuestions: {}, // Answers for the current phase
      timedAnswers: {}, // Initialize empty
      blindReviewAnswers: {}, // Initialize empty
      analysisNotes: {}, // Initialize empty
      currentSectionIndex: 0,
      selectedSectionId: selectedSectionId, // Assign new parameter
      completedSectionIds: [], // Initialize empty
      completedPhases: [], // NEW: Initialize empty
    };
    setUserSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSession(newSession);
    setCurrentView('triple-review');
  };

  // Function to resume an existing test session or start a new phase
  const resumeTestSession = (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => {
    const sessionToResume = userSessions.find(session => session.id === sessionId);
    if (sessionToResume) {
      let updatedSession = { ...sessionToResume };

      if (targetPhase) {
        // Store answers from the phase just completed before resetting for the new phase
        // This logic is now handled in TripleReview.handleSubmitSection
        // if (sessionToResume.phase === 'timed') {
        //   updatedSession.timedAnswers = sessionToResume.answeredQuestions;
        // } else if (sessionToResume.phase === 'blind-review') {
        //   updatedSession.blindReviewAnswers = sessionToResume.answeredQuestions;
        // }

        // Starting a new review phase for a completed session
        updatedSession = {
          ...updatedSession, // Use updatedSession to carry over timedAnswers/blindReviewAnswers
          phase: targetPhase, // Set to the new phase
          endTime: undefined, // Clear end time as it's now in progress for this new phase
          currentSectionIndex: 0,
          answeredQuestions: {}, // Reset answered questions for the new phase
          flaggedQuestions: [],
          // circuits: [], // Circuits are specific to a review phase, so reset for new phase - REMOVED THIS LINE
          completedSectionIds: [],
        };
      }
      // If targetPhase is not provided, it means we are resuming the current in-progress phase.
      // In this case, no changes to phase or state reset are needed.

      setCurrentSession(updatedSession);
      // Persist the changes to userSessions
      setUserSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      setCurrentView('triple-review');
    }
  };

  // REMOVED: openCircuitBuilder is now handled within TripleReview
  // const openCircuitBuilder = (questionId: string) => {
  //   setCurrentView('circuit-builder');
  // };

  // Handler to update the current session and persist changes to userSessions
  const handleUpdateSession = (updatedSession: TestSession) => {
    setCurrentSession(updatedSession);
    setUserSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
  };

  // Handler to exit the current session and return to dashboard
  const handleExitSession = () => {
    // When exiting, simply clear the current session and return to dashboard.
    // The session remains in userSessions for potential resumption, regardless of phase.
    setCurrentSession(null);
    setCurrentView('dashboard');
  };

  // Derive current question data for the chat bot if in TripleReview mode
  let currentQuestionDataForChat: ProcessedQuestion | null = null;
  let currentProcessedTest: ProcessedPrepTest | undefined;

  if (currentSession) {
    currentProcessedTest = allProcessedTests[currentSession.testId];
  }

  if (currentView === 'triple-review' && currentSession && currentProcessedTest) {
    const currentSectionData = currentSession.selectedSectionId
      ? currentProcessedTest.sections.find(sec => sec.id === currentSession.selectedSectionId)
      : currentProcessedTest.sections[currentSession.currentSectionIndex];

    if (currentSectionData && currentSession.currentSectionIndex < currentSectionData.questions.length) {
      currentQuestionDataForChat = currentSectionData.questions[currentSession.currentSectionIndex];
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          <span className="text-xl text-slate-700">Loading LSAT Rewired...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setCurrentView('dashboard')}
              >
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-900">LSAT Rewired</span>
              </div>

              <div className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('performance')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'performance'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setCurrentView('subscription')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'subscription'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Subscription
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">{user?.stats.circuitsCreated} Circuits</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-700">Rank #{user?.stats.rank}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && user && ( // Ensure user is not null before passing to Dashboard
          <Dashboard 
            user={user} 
            userSessions={userSessions} // Pass all user sessions
            onStartNewTestSession={startNewTestSession} // Pass new session starter
            onResumeTestSession={resumeTestSession} // Pass session resume function
            allProcessedTests={allProcessedTests} // Pass all processed test data
          />
        )}

        {currentView === 'triple-review' && currentSession && currentProcessedTest && (
          <TripleReview
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            // onOpenCircuitBuilder={openCircuitBuilder} // REMOVED: No longer passed from App
            onExitSession={handleExitSession}
            processedPrepTest={currentProcessedTest} // Pass the specific processed test data for the current session
          />
        )}

        {/* REMOVED: CircuitBuilder is now rendered within TripleReview */}
        {/* {currentView === 'circuit-builder' && (
          <CircuitBuilder
            onBack={() => setCurrentView('triple-review')}
            onSaveCircuit={(circuit) => {
              // Save circuit logic here
              setCurrentView('triple-review');
            }}
          />
        )} */}

        {currentView === 'performance' && user && ( // Ensure user is not null before passing to PerformanceTracker
          <PerformanceTracker user={user} />
        )}
      </main>

      {/* Floating Chat Button */}
      {user && (
        <FloatingChatButton
          user={user}
          currentView={currentView}
          currentSession={currentSession}
          currentQuestionData={currentQuestionDataForChat} // NEW PROP
        />
      )}
    </div>
  );
}

export default App;
