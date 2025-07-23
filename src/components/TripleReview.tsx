import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, ChevronRight, Brain, BookOpen, Target, Flag, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { TestSession, ProcessedPrepTest, ProcessedSection, ProcessedQuestion, Circuit, DiagramNode, QuestionAnalysisNotes } from '../App'; // Import types from App.tsx
import CircuitBuilder from './CircuitBuilder'; // Import CircuitBuilder

interface TripleReviewProps {
  session: TestSession;
  onUpdateSession: (session: TestSession) => void;
  onExitSession: () => void;
  processedPrepTest: ProcessedPrepTest; // Now received as a prop
}

const TripleReview: React.FC<TripleReviewProps> = ({
  session,
  onUpdateSession,
  onExitSession,
  processedPrepTest // Destructure the prop
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState(session.phase === 'timed');
  const [timeRemaining, setTimeRemaining] = useState(35 * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [showEndSectionWarning, setShowEndSectionWarning] = useState(false); // This state will no longer be used
  const [greyedOutOptions, setGreyedOutOptions] = useState<{[questionId: string]: number[]}>({});
  const [showCircuitBuilder, setShowCircuitBuilder] = useState(false); // New state for CircuitBuilder visibility
  const [showStrategySummary, setShowStrategySummary] = useState(session.phase === 'strategy-review' && !session.completedPhases.includes('strategy-review')); // NEW: State for strategy summary
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Determine the sections and questions relevant to the current session
  const currentSections: ProcessedSection[] = session.selectedSectionId
    ? processedPrepTest.sections.filter(sec => sec.id === session.selectedSectionId)
    : processedPrepTest.sections;

  const currentSectionData = currentSections[session.currentSectionIndex];
  const questionsInCurrentSection = currentSectionData?.questions || [];

  const currentQuestionData = questionsInCurrentSection[currentQuestionIndex];

 

  // Find the existing circuit for the current question, if any
  const existingCircuitForQuestion = session.circuits.find(
    (c) => c.questionId === currentQuestionData?.id
  );

  // Calculate initial time based on timeMode
  const getInitialTime = () => {
    const baseTime = 35 * 60; // 35 minutes in seconds
    switch (session.timeMode) {
      case '1.5x': return Math.floor(baseTime * 1.5);
      case '2x': return baseTime * 2;
      case 'custom': return (session.customTimeMinutes || 35) * 60;
      case 'untimed': return Infinity;
      default: return baseTime;
    }
  };

  // Reset timer when section changes or component mounts
  useEffect(() => {
    if (session.phase === 'timed') {
      setTimeRemaining(getInitialTime());
    }
  }, [session.currentSectionIndex, session.timeMode, session.customTimeMinutes, session.phase]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && session.phase === 'timed' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            setIsTimerRunning(false);
            handleSubmitSection(); // Auto-submit section when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, session.phase, timeRemaining]);

  const getTimeDisplay = () => {
    if (session.timeMode === 'untimed') return '∞';
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600';
    if (timeRemaining <= 300) return 'text-orange-600';
    return 'text-slate-900';
  };

  const getTimerBgColor = () => {
    if (timeRemaining <= 60) return 'bg-red-100';
    if (timeRemaining <= 300) return 'bg-orange-100';
    return '';
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'timed': return 'blue';
      case 'blind-review': return 'teal';
      case 'strategy-review': return 'orange';
      default: return 'slate';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'timed': return Timer;
      case 'blind-review': return Target;
      case 'strategy-review': return BookOpen;
      default: return Brain;
    }
  };

  const PhaseIcon = getPhaseIcon(session.phase);
  const phaseColor = getPhaseColor(session.phase);

  const getPhaseTitle = (phase: string) => {
    switch (phase) {
      case 'timed': return 'Timed Test';
      case 'blind-review': return 'Blind Review';
      case 'strategy-review': return 'Strategy Review & Action Plan';
      default: return 'Test Session';
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsInCurrentSection.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      scrollToTop();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      scrollToTop();
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
    scrollToTop();
  };

  const handleToggleFlag = () => {
    const questionId = currentQuestionData.id;
    const newFlaggedQuestions = session.flaggedQuestions.includes(questionId)
      ? session.flaggedQuestions.filter(id => id !== questionId)
      : [...session.flaggedQuestions, questionId];

    onUpdateSession({ ...session, flaggedQuestions: newFlaggedQuestions });
  };

  const handleAnswerSelection = (optionIndex: number) => {
    const questionId = currentQuestionData.id;

    onUpdateSession({
      ...session,
      answeredQuestions: {
        ...session.answeredQuestions,
        [questionId]: optionIndex,
      },
    });

    setGreyedOutOptions(prev => {
      const currentGreyed = prev[questionId] || [];
      const newGreyed = currentGreyed.filter(idx => idx !== optionIndex);
      return { ...prev, [questionId]: newGreyed };
    });
  };

  const handleToggleGreyOut = (questionId: string, optionIndex: number) => {
    setGreyedOutOptions(prev => {
      const currentGreyed = prev[questionId] || [];
      let newGreyed;
      if (currentGreyed.includes(optionIndex)) {
        newGreyed = currentGreyed.filter(idx => idx !== optionIndex);
      } else {
        newGreyed = [...currentGreyed, optionIndex];
      }

      if (session.answeredQuestions[questionId] === optionIndex) {
        const newAnsweredQuestions = { ...session.answeredQuestions };
        delete newAnsweredQuestions[questionId];
        onUpdateSession({ ...session, answeredQuestions: newAnsweredQuestions });
      }

      return { ...prev, [questionId]: newGreyed };
    });
  };

  // New handler for saving/updating circuits from CircuitBuilder
  const handleSaveCircuitFromBuilder = (updatedCircuit: Circuit) => {
    if (!currentQuestionData) return; // Should not happen if CircuitBuilder is open

    let updatedCircuits;
    if (existingCircuitForQuestion) {
      // Update existing circuit
      updatedCircuits = session.circuits.map((c) =>
        c.id === updatedCircuit.id ? updatedCircuit : c
      );
    } else {
      // Add new circuit
      updatedCircuits = [...session.circuits, updatedCircuit];
    }
    onUpdateSession({ ...session, circuits: updatedCircuits });
    // Removed: setShowCircuitBuilder(false); // Do not close circuit builder after saving
  };

  const handleSubmitSection = () => {
    setShowSectionTransition(true);
  };

  const handleConfirmSectionSubmit = () => {
    const nextSectionIndex = session.currentSectionIndex + 1;
    const updatedCompletedSectionIds = [...session.completedSectionIds, currentSectionData.id];

    // Save answered questions for the current phase before moving on
    let updatedSession = { ...session };
    if (session.phase === 'timed') {
      updatedSession.timedAnswers = { ...session.answeredQuestions };
    } else if (session.phase === 'blind-review') {
      updatedSession.blindReviewAnswers = { ...session.answeredQuestions };
    }
    updatedSession.answeredQuestions = {}; // Reset for next phase

    if (nextSectionIndex < currentSections.length) { // Check against currentSections length
      onUpdateSession({
        ...updatedSession,
        currentSectionIndex: nextSectionIndex,
        completedSectionIds: updatedCompletedSectionIds,
      });
      setCurrentQuestionIndex(0);
      setShowSectionTransition(false);
      scrollToTop();
    } else {
      // All sections completed for the current phase
      const updatedCompletedPhases = [...session.completedPhases, session.phase];
      onUpdateSession({
        ...updatedSession, // Use updatedSession to carry over saved answers
        endTime: new Date(), // Mark session as completed for this phase
        completedSectionIds: updatedCompletedSectionIds,
        completedPhases: updatedCompletedPhases, // Add current phase to completed phases
      });
      setShowSectionTransition(false);
      onExitSession(); // Exit to dashboard after test completion for this phase
    }
  };

  const handleEndSection = () => {
    // Directly submit the section, bypassing the second warning modal
    handleSubmitSection();
  };

  // handleConfirmEndSession is no longer needed as showEndSectionWarning is removed
  // const handleConfirmEndSession = () => {
  //   setShowEndSectionWarning(false);
  //   onExitSession();
  // };

  const isLastQuestionOfSection = currentQuestionIndex === questionsInCurrentSection.length - 1;
  const isLastSection = session.currentSectionIndex === currentSections.length - 1;

  if (!currentQuestionData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-40">
        <p className="text-lg text-slate-700">Loading section data...</p>
      </div>
    );
  }

  // Define selected answer for display in TripleReview
  const selectedAnswerIndex = session.answeredQuestions[currentQuestionData.id];
  const selectedAnswerText = selectedAnswerIndex !== undefined
    ? currentQuestionData.options[selectedAnswerIndex]
    : null;

  // Helper to format section names for display
  const formatSectionDisplayName = (section: ProcessedSection, index: number) => {
    return `Section ${index + 1}`; // Always display as "Section #"
  };

  // Construct the formatted section name for the header
  const formattedSectionDisplay = `${processedPrepTest.name} - Section ${session.currentSectionIndex + 1}`;

  // NEW: Score Calculation for Summary Screen
  const calculateScore = (answers: { [questionId: string]: number }, targetSections: ProcessedSection[]) => {
    let correctCount = 0;
    let totalQuestionsInScope = 0;

    for (const section of targetSections) {
      totalQuestionsInScope += section.questions.length; // Total questions in this section
      for (const question of section.questions) {
        if (answers.hasOwnProperty(question.id)) {
          if (answers[question.id] === question.correctAnswer) {
            correctCount++;
          }
        }
      }
    }
    return { correct: correctCount, total: totalQuestionsInScope };
  };

  const timedScore = calculateScore(session.timedAnswers, currentSections);
  const blindReviewScore = calculateScore(session.blindReviewAnswers, currentSections);

  // Handler for analysis notes
  const handleNoteChange = (noteType: keyof QuestionAnalysisNotes, value: string) => {
    onUpdateSession({
      ...session,
      analysisNotes: {
        ...session.analysisNotes,
        [currentQuestionData.id]: {
          ...(session.analysisNotes[currentQuestionData.id] || { questionTypeAnalysis: '', argumentStructure: '', answerChoiceAnalysis: '' }),
          [noteType]: value,
        },
      },
    });
  };

  // NEW: Strategy Review Summary Screen
  if (session.phase === 'strategy-review' && showStrategySummary) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-40 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full text-center my-4 max-h-[90vh] overflow-y-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">Strategy Review: Performance Summary</h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8">
            Review your performance across different phases for {processedPrepTest.name}
            {session.selectedSectionId ? ` - Section ${session.currentSectionIndex + 1}` : ''}.
          </p>

          {session.selectedSectionId ? (
            // Single section summary
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">Timed Phase</h2>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600">{timedScore.correct}/{timedScore.total}</p>
                <p className="text-sm sm:text-base text-blue-700 mt-2">Correct</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-teal-800 mb-2">Blind Review Phase</h2>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600">{blindReviewScore.correct}/{blindReviewScore.total}</p>
                <p className="text-sm sm:text-base text-teal-700 mt-2">Correct</p>
              </div>
            </div>
          ) : (
            // Whole test summary - display per section
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 max-h-96 overflow-y-auto">
              {processedPrepTest.sections.map((section, index) => {
                const sectionTimedAnswers: { [key: string]: number } = {};
                const sectionBlindReviewAnswers: { [key: string]: number } = {};

                // Filter answers relevant to this section
                section.questions.forEach(q => {
                  if (session.timedAnswers.hasOwnProperty(q.id)) {
                    sectionTimedAnswers[q.id] = session.timedAnswers[q.id];
                  }
                  if (session.blindReviewAnswers.hasOwnProperty(q.id)) {
                    sectionBlindReviewAnswers[q.id] = session.blindReviewAnswers[q.id];
                  }
                });

                const sectionTimedScore = calculateScore(sectionTimedAnswers, [section]);
                const sectionBlindReviewScore = calculateScore(sectionBlindReviewAnswers, [section]);

                return (
                  <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Section {index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-1">Timed</h4>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{sectionTimedScore.correct}/{sectionTimedScore.total}</p>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 sm:p-4">
                        <h4 className="text-base sm:text-lg font-semibold text-teal-800 mb-1">Blind Review</h4>
                        <p className="text-2xl sm:text-3xl font-bold text-teal-600">{sectionBlindReviewScore.correct}/{sectionBlindReviewScore.total}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowStrategySummary(false)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Question Review <ChevronRight className="h-5 w-5 inline ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 z-40">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 py-4 px-6 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 bg-${phaseColor}-100 rounded-xl`}>
              <PhaseIcon className={`h-6 w-6 text-${phaseColor}-600`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {getPhaseTitle(session.phase)}
              </h1>
              <p className="text-slate-600">
                {formattedSectionDisplay} • Question {currentQuestionIndex + 1} of {questionsInCurrentSection.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session.phase === 'timed' && (
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-mono font-bold transition-all ${getTimerColor()} ${getTimerBgColor()} ${timeRemaining <= 60 ? 'animate-pulse' : ''} px-2 py-1 rounded`}>
                  {getTimeDisplay()}
                </div>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-lg ${
                    isTimerRunning
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
            )}

            <button
              onClick={handleToggleFlag}
              className={`p-2 rounded-lg transition-colors ${
                session.flaggedQuestions.includes(currentQuestionData.id)
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={session.flaggedQuestions.includes(currentQuestionData.id) ? "Unflag Question" : "Flag Question"}
            >
              <Flag className="h-5 w-5" />
            </button>

            {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
              <button
                onClick={onExitSession}
                className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
              >
                {session.phase === 'blind-review' ? 'Exit Blind Review' : 'Exit Strategy Review'}
              </button>
            )}

            {session.phase === 'strategy-review' && (
              <button
                onClick={() => setShowStrategySummary(true)}
                className="px-3 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors text-sm font-medium"
              >
                View Summary
              </button>
            )}

            <button
              onClick={handleEndSection} // This will now directly call handleSubmitSection
              className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
            >
              End Section
            </button>

            <div className="flex space-x-1">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {isLastQuestionOfSection ? (
                <button
                  onClick={handleSubmitSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  {isLastSection ? 'Finish Test' : (session.selectedSectionId ? 'Finish Section' : 'Next Section')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper - This is the scrollable area */}
      <div ref={mainContentRef} className="flex-1 p-6 overflow-y-auto">
        {/* Section Transition Modal (now the only modal) */}
        {showSectionTransition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSectionTransition(false)}>
            <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                {isLastSection ? 'Test Complete!' : `Section ${session.currentSectionIndex + 1} Complete!`}
              </h3>
              <p className="text-slate-600 mb-6">
                {isLastSection
                  ? 'You have completed all sections of this test.'
                  : `You have completed Section ${session.currentSectionIndex + 1}. Are you ready to move on to the next section?`
                }
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSectionTransition(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Continue Working
                </button>
                <button
                  onClick={handleConfirmSectionSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isLastSection ? 'Finish Test' : (session.selectedSectionId ? 'Finish Section' : 'Next Section')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The showEndSectionWarning JSX block has been completely removed */}

        {session.phase === 'timed' && !isTimerRunning && (
          <div className="absolute inset-0 bg-slate-100 bg-opacity-95 flex flex-col items-center justify-center z-40 p-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Test Paused</h2>
            <p className="text-lg text-slate-700 mb-8">Your test is currently paused. Choose an option:</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsTimerRunning(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-6 w-6 inline mr-2" />
                Resume Test
              </button>
              <button
                onClick={onExitSession}
                className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
              >
                Exit Testing Session
              </button>
            </div>
          </div>
        )}

        {showCircuitBuilder && session.phase !== 'timed' ? (
          <div className="grid lg:grid-cols-4 gap-6 h-full"> {/* Changed to lg:grid-cols-4 */}
            {/* Left Column: Passage & Selected Answer (managed by TripleReview) */}
            <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="prose max-w-none">
                  <div className="text-slate-700 leading-relaxed">
                    <div className="whitespace-pre-line">{currentQuestionData.passage}</div>
                  </div>
                </div>
              </div>

              {/* Conditional Answer Display in Circuit Builder */}
              {session.phase === 'blind-review' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Selected Answer</h3>
                  {selectedAnswerText ? (
                    <p className="text-slate-700 font-medium">
                      ({String.fromCharCode(65 + selectedAnswerIndex)}) {selectedAnswerText}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">
                      No answer selected yet. Your choice will appear here.
                    </p>
                  )}
                </div>
              )}

              {session.phase === 'strategy-review' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Correct Answer</h3>
                  <p className="text-slate-700 font-medium">
                    ({String.fromCharCode(65 + currentQuestionData.correctAnswer)}) {currentQuestionData.options[currentQuestionData.correctAnswer]}
                  </p>
                </div>
              )}
            </div>

            {/* CircuitBuilder takes the remaining 3 columns */}
            <div className="lg:col-span-3 h-full"> {/* Changed to lg:col-span-3 */}
            
              <CircuitBuilder
                onBack={() => setShowCircuitBuilder(false)}
                onSaveCircuit={handleSaveCircuitFromBuilder} // Pass the new handler
                questionData={currentQuestionData}
                session={session}
                existingCircuit={existingCircuitForQuestion} // Pass the existing circuit
              />
            </div>
          </div>
        ) : (
          // Original layout when CircuitBuilder is not shown or in timed mode
          <div className={session.phase === 'timed' ? "grid lg:grid-cols-3 gap-6 h-full" : "grid lg:grid-cols-5 gap-6 h-full"}>
            {/* Left Column: Passage */}
            <div className="lg:col-span-2 space-y-6 h-full overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="prose max-w-none">
                  <div className="text-slate-700 leading-relaxed">
                    <div className="whitespace-pre-line">{currentQuestionData.passage}</div>
                  </div>
                </div>
              </div>

              {/* Circuit Builder box (button to open) */}
              {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Circuit Builder</h3>

                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="font-medium text-teal-800">Build Your Circuit</span>
                    </div>
                    <p className="text-sm text-teal-700">
                      Map out the logical structure of this argument to earn circuit points.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCircuitBuilder(true)} // Toggle CircuitBuilder visibility
                    className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-700 transition-colors"
                  >
                    Open Circuit Builder
                  </button>

                  {existingCircuitForQuestion && ( // Check if a circuit exists for this question
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-800 font-medium">
                        Circuit Created ✓
                      </div>
                      <div className="text-green-700 text-sm">
                        Quality Score: {existingCircuitForQuestion.analysisQuality}/100
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Conditionally rendered */}
            {session.phase !== 'timed' && (
              <div className="lg:col-span-2 space-y-6 h-full overflow-y-auto">
                {/* Analysis Template box - MOVED TO TOP */}
                {session.phase === 'blind-review' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis Template</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Question Type Analysis
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Identify the question type and what it's asking for..."
                          value={session.analysisNotes[currentQuestionData.id]?.questionTypeAnalysis || ''}
                          onChange={(e) => handleNoteChange('questionTypeAnalysis', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Argument Structure
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Break down the premises and conclusion..."
                          value={session.analysisNotes[currentQuestionData.id]?.argumentStructure || ''}
                          onChange={(e) => handleNoteChange('argumentStructure', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Answer Choice Analysis
                        </label>
                        <textarea
                          rows={4}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Evaluate each answer choice and explain why the correct answer works..."
                          value={session.analysisNotes[currentQuestionData.id]?.answerChoiceAnalysis || ''}
                          onChange={(e) => handleNoteChange('answerChoiceAnalysis', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {session.phase === 'strategy-review' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Answer Explanations</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Question Type Analysis
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Identify the question type and what it's asking for..."
                          value={session.analysisNotes[currentQuestionData.id]?.questionTypeAnalysis || ''}
                          onChange={(e) => handleNoteChange('questionTypeAnalysis', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Argument Structure
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Break down the premises and conclusion..."
                          value={session.analysisNotes[currentQuestionData.id]?.argumentStructure || ''}
                          onChange={(e) => handleNoteChange('argumentStructure', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Answer Choice Analysis
                        </label>
                        <textarea
                          rows={4}
                          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Evaluate each answer choice and explain why the correct answer works..."
                          value={session.analysisNotes[currentQuestionData.id]?.answerChoiceAnalysis || ''}
                          onChange={(e) => handleNoteChange('answerChoiceAnalysis', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {session.phase !== 'timed' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Notes</h3>
                    <textarea
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jot down thoughts, patterns, or insights..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Right Column: Question Stem & Options */}
            <div className={session.phase === 'timed' ? "lg:col-span-1 space-y-6 h-full overflow-y-auto" : "lg:col-span-1 space-y-6 h-full overflow-y-auto"}>
              {/* Question Stem (NEW LOCATION 2) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    <div className="whitespace-pre-line">{currentQuestionData.question}</div>
                  </h3>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Answer Choices</h3>
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => {
                    const isGreyedOut = greyedOutOptions[currentQuestionData.id]?.includes(index);
                    const isCorrect = index === currentQuestionData.correctAnswer;
                    const timedAnswerChosen = session.timedAnswers[currentQuestionData.id];
                    const blindReviewAnswerChosen = session.blindReviewAnswers[currentQuestionData.id];

                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-4 border rounded-xl transition-colors ${
                          isCorrect && session.phase === 'strategy-review' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <label className="flex items-start space-x-3 flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="answer"
                            value={index}
                            checked={session.phase === 'strategy-review' ? false : session.answeredQuestions[currentQuestionData.id] === index} // Fixed: Do not auto-select correct answer in strategy review
                            onChange={() => handleAnswerSelection(index)}
                            className="mt-1 text-blue-600"
                            disabled={session.phase === 'timed' && !isTimerRunning || session.phase === 'strategy-review'} // Disable in strategy review
                          />
                          <span className="font-medium text-slate-700 mr-3">
                            ({String.fromCharCode(65 + index)})
                          </span>
                          <span className={`text-slate-700 flex-1 ${isGreyedOut ? 'opacity-50 text-slate-400 line-through' : ''}`}>
                            {option}
                          </span>
                        </label>
                        {session.phase === 'strategy-review' && (
                          <div className="flex items-center space-x-2 text-sm">
                            {isCorrect && <span className="text-green-600 font-medium">Correct</span>}
                            {timedAnswerChosen === index && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'}`}>
                                Timed {isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                            {blindReviewAnswerChosen === index && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'}`}>
                                Blind {isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                            {timedAnswerChosen === undefined && index === currentQuestionData.correctAnswer && ( // Fixed: Use === undefined
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                Timed Ø
                              </span>
                            )}
                            {blindReviewAnswerChosen === undefined && index === currentQuestionData.correctAnswer && ( // Fixed: Use === undefined
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                Blind Ø
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleGreyOut(currentQuestionData.id, index)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title={isGreyedOut ? "Show option" : "Grey out option"}
                        >
                          {isGreyedOut ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Question Tracker */}
      <div className="bg-white shadow-lg border-t border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2">
          {questionsInCurrentSection.map((q, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAnswered = session.answeredQuestions.hasOwnProperty(q.id);
            const isFlagged = session.flaggedQuestions.includes(q.id);

            let bgColor = 'bg-slate-200';
            let textColor = 'text-slate-600';

            if (isAnswered) {
              bgColor = 'bg-blue-500';
              textColor = 'text-white';
            }
            if (isFlagged) {
              bgColor = 'bg-yellow-500';
              textColor = 'text-white';
            }
            if (isCurrent) {
              bgColor = 'bg-purple-600 ring-2 ring-purple-300';
              textColor = 'text-white';
            }

            return (
              <button
                key={q.id}
                onClick={() => handleQuestionJump(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${bgColor} ${textColor}`}
                title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TripleReview;
