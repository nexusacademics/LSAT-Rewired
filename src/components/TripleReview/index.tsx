// components/TripleReview/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TestSession, ProcessedPrepTest, ProcessedSection, ProcessedQuestion, Circuit } from '../../App';
import CircuitBuilder from '../CircuitBuilder';
import FloatingCircuitBuilderButton from '../FloatingCircuitBuilderButton';
import { Header } from './Header';
import { PassagePanel } from './PassagePanel';
import { QuestionPanel } from './QuestionPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { QuestionTracker } from './QuestionTracker';
import { StrategySummary } from './StrategySummary';
import { SectionTransition } from './SectionTransition';
import { PausedOverlay } from './PausedOverlay';
import { PauseReviewPopup } from './PauseReviewPopup';
import { useTimer } from '../../hooks/useTimer';
import { useQuestionNavigation } from '../../hooks/useQuestionNavigation';
import { useAnswerSelection } from '../../hooks/useAnswerSelection';
import { usePortal } from '../../hooks/usePortal';


interface TripleReviewProps {
  session: TestSession;
  onUpdateSession: (session: TestSession) => void;
  onExitSession: () => void;
  processedPrepTest: ProcessedPrepTest;
}

const TripleReview: React.FC<TripleReviewProps> = ({
  session,
  onUpdateSession,
  onExitSession,
  processedPrepTest
}) => {
  const Portal = usePortal('modal-root');
  const [isTimerRunning, setIsTimerRunning] = useState(session.phase === 'timed');
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [showCircuitBuilder, setShowCircuitBuilder] = useState(false);
  const [showStrategySummary, setShowStrategySummary] = useState(
    session.phase === 'strategy-review' && !session.completedPhases.includes('strategy-review')
  );
  const [isSectionTransitionTriggeredByTimer, setIsSectionTransitionTriggeredByTimer] = useState(false);
  
  // Add pause popup state
  const [showPausePopup, setShowPausePopup] = useState(false);
  const [pauseReviewType, setPauseReviewType] = useState<'Blind Review' | 'Strategy Review'>('Blind Review');

  const [hasDismissedTooltipForQuestion, setHasDismissedTooltipForQuestion] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastSavedScore, setLastSavedScore] = useState<number | undefined>();

  // Add formatting toolbar state
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const clearPassageFormattingRef = useRef<(() => void) | null>(null);

  // Determine sections and current question
  const currentSections: ProcessedSection[] = session.selectedSectionId
    ? processedPrepTest.sections.filter(sec => sec.id === session.selectedSectionId)
    : processedPrepTest.sections;

  const currentSectionData = currentSections[session.currentSectionIndex];
  const questionsInCurrentSection = currentSectionData?.questions || [];
  const currentQuestionData = questionsInCurrentSection[session.currentQuestionIndex];
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'loose' | 'relaxed'>('loose');

  const handleTextSizeChange = (size: 'small' | 'medium' | 'large') => {
    setTextSize(size);
  };

  const handleLineSpacingChange = (spacing: 'normal' | 'loose' | 'relaxed') => {
    setLineSpacing(spacing);
  };
  
  // Reset tooltip, success bubble, and formatting tool when question changes
  useEffect(() => {
    setHasDismissedTooltipForQuestion(false);
    setShowSuccessMessage(false);
    setLastSavedScore(undefined);
    setSelectedTool(null); // Clear selected tool when navigating between questions
  }, [currentQuestionData?.id]);

  // Formatting toolbar handlers
  const handleToolSelect = (toolId: string | null) => {
    setSelectedTool(selectedTool === toolId ? null : toolId);
  };

  const handleClearFormatting = () => {
    if (clearPassageFormattingRef.current) {
      clearPassageFormattingRef.current();
    }
    setSelectedTool(null);
  };

  const getInitialTime = () => {
    // Check if we have a saved timer state for this section
    const sectionTimerKey = `section-${session.currentSectionIndex}`;
    const savedTimeRemaining = session.timerStates?.[sectionTimerKey];
    
    if (savedTimeRemaining !== undefined && session.phase === 'timed') {
      return savedTimeRemaining;
    }
    
    // Default time calculation
    const baseTime = 35 * 60;
    switch (session.timeMode) {
      case '1.5x': return Math.floor(baseTime * 1.5);
      case '2x': return baseTime * 2;
      case 'custom': return (session.customTimeMinutes || 35) * 60;
      case 'untimed': return Infinity;
      default: return baseTime;
    }
  };

  const [isIntermissionMode, setIsIntermissionMode] = useState(false);
  const [intermissionDuration, setIntermissionDuration] = useState(0);
  
  const handleSubmitSection = React.useCallback((triggeredByTimer: boolean = false) => {
  if (triggeredByTimer) {
    setIsSectionTransitionTriggeredByTimer(true);
  } else {
    setIsSectionTransitionTriggeredByTimer(false);
  }
  setShowSectionTransition(true);
}, []);

  // Modified pause handler to save timer state
  const handlePauseReview = () => {
    // Save current timer state if in timed mode
    if (session.phase === 'timed') {
      const sectionTimerKey = `section-${session.currentSectionIndex}`;
      const updatedTimerStates = {
        ...session.timerStates,
        [sectionTimerKey]: timeRemaining
      };
      
      const updatedSession = {
        ...session,
        timerStates: updatedTimerStates,
        isPaused: true,
        pausedAt: new Date()
      };
      
      onUpdateSession(updatedSession);
    }
    
    const reviewType = session.phase === 'blind-review' ? 'Blind Review' : 'Strategy Review';
    setPauseReviewType(reviewType);
    setShowPausePopup(true);
  };

  // Add a new handler for immediate exit (bypass popup)
  const handleImmediateExit = () => {
    // Save current timer state if in timed mode before immediate exit
    if (session.phase === 'timed') {
      const sectionTimerKey = `section-${session.currentSectionIndex}`;
      const updatedTimerStates = {
        ...session.timerStates,
        [sectionTimerKey]: timeRemaining
      };
      
      const updatedSession = {
        ...session,
        timerStates: updatedTimerStates,
        isPaused: true,
        pausedAt: new Date()
      };
      
      // Use a callback to ensure the session is updated before exiting
      onUpdateSession(updatedSession);
      
      // Small delay to ensure state is saved
      setTimeout(() => {
        onExitSession();
      }, 100);
      return;
    }
    
    onExitSession();
  };

  // Handle popup actions
  const handleReturnToDashboard = () => {
    // Ensure timer state is saved before exiting
    if (session.phase === 'timed') {
      const sectionTimerKey = `section-${session.currentSectionIndex}`;
      const updatedTimerStates = {
        ...session.timerStates,
        [sectionTimerKey]: timeRemaining
      };
      
      const updatedSession = {
        ...session,
        timerStates: updatedTimerStates,
        isPaused: true,
        pausedAt: new Date()
      };
      
      // Save the session state before exiting
      onUpdateSession(updatedSession);
    }
    
    setShowPausePopup(false);
    onExitSession(); // This will return to dashboard
  };

  const handleContinueReviewing = () => {
    setShowPausePopup(false);
    // Resume timer if it was running and we're in timed mode
    if (session.phase === 'timed') {
      const updatedSession = {
        ...session,
        isPaused: false,
        pausedAt: undefined
      };
      onUpdateSession(updatedSession);
      setIsTimerRunning(true);
    }
  };

  const {
    timeRemaining,
    getTimeDisplay,
    getTimerColor,
    getTimerBgColor,
    resetTimer,
  } = useTimer({
    initialTime: getInitialTime(),
    isRunning: isTimerRunning,
    onTimeUp: () => {
      setIsSectionTransitionTriggeredByTimer(true);
      handleSubmitSection(true);
    },
    phase: session.phase
  });

  // Effect to save timer state periodically during timed sessions
  useEffect(() => {
    if (session.phase === 'timed' && isTimerRunning) {
      const interval = setInterval(() => {
        const sectionTimerKey = `section-${session.currentSectionIndex}`;
        const updatedTimerStates = {
          ...session.timerStates,
          [sectionTimerKey]: timeRemaining
        };
        
        onUpdateSession({
          ...session,
          timerStates: updatedTimerStates
        });
      }, 10000); // Save every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [session.phase, isTimerRunning, timeRemaining, session.currentSectionIndex]);

  const {
    mainContentRef,
    handleNextQuestion,
    handlePreviousQuestion,
    handleQuestionJump,
    isLastQuestionOfSection
  } = useQuestionNavigation({
    session,
    questionsInCurrentSection,
    onUpdateSession
  });

  const {
    greyedOutOptions,
    handleAnswerSelection,
    handleToggleGreyOut,
    handleToggleFlag,
    handleNoteChange
  } = useAnswerSelection({
    session,
    onUpdateSession
  });

  const existingCircuitForQuestion = session.circuits.find(
    (c) => c.questionId === currentQuestionData?.id
  );

  const handleSaveCircuitFromBuilder = (updatedCircuit: Circuit) => {
    if (!currentQuestionData) return;

    let updatedCircuits;
    if (existingCircuitForQuestion) {
      updatedCircuits = session.circuits.map((c) =>
        c.id === updatedCircuit.id ? updatedCircuit : c
      );
    } else {
      updatedCircuits = [...session.circuits, updatedCircuit];
    }

    onUpdateSession({ ...session, circuits: updatedCircuits });
    setLastSavedScore(updatedCircuit.analysisQuality);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleConfirmSectionSubmit = () => {
    const nextSectionIndex = session.currentSectionIndex + 1;
    const updatedCompletedSectionIds = [...session.completedSectionIds, currentSectionData.id];

    const isFullTest = !session.selectedSectionId && currentSections.length === 4;
      // Decide if this transition is intermission and set timer accordingly
      if (isFullTest) {
        // Between sections 1&2 and 3&4: 1 minute
        // Between 2&3: 10 minutes
        if (nextSectionIndex === 1 || nextSectionIndex === 3) {
          setIntermissionDuration(60);  // 1 minute break
          setIsIntermissionMode(true);
          setShowSectionTransition(false);
          return;  // wait for intermission to finish
        } else if (nextSectionIndex === 2) {
          setIntermissionDuration(600); // 10 minute break
          setIsIntermissionMode(true);
          setShowSectionTransition(false);
          return;  // wait for intermission to finish
        }
      }
    
    let updatedSession = { ...session };
    if (session.phase === 'timed') {
      updatedSession.timedAnswers = { ...session.answeredQuestions };
      // Clear the timer state for the completed section
      const sectionTimerKey = `section-${session.currentSectionIndex}`;
      const updatedTimerStates = { ...session.timerStates };
      delete updatedTimerStates[sectionTimerKey];
      updatedSession.timerStates = updatedTimerStates;
    } else if (session.phase === 'blind-review') {
      updatedSession.blindReviewAnswers = { ...session.answeredQuestions };
    }
    updatedSession.answeredQuestions = {};

    if (nextSectionIndex < currentSections.length) {
      onUpdateSession({
        ...updatedSession,
        currentSectionIndex: nextSectionIndex,
        currentQuestionIndex: 0,
        completedSectionIds: updatedCompletedSectionIds,
      });
      setShowSectionTransition(false);
      setIsSectionTransitionTriggeredByTimer(false);
      // Restart timer for next section if it was running
      if (session.phase === 'timed') {
        resetTimer();  
        setIsTimerRunning(true);
      }
    } else {
      const updatedCompletedPhases = [...session.completedPhases, session.phase];
      onUpdateSession({
        ...updatedSession,
        endTime: new Date(),
        completedSectionIds: updatedCompletedSectionIds,
        completedPhases: updatedCompletedPhases,
      });
      setShowSectionTransition(false);
      setIsSectionTransitionTriggeredByTimer(false);
      onExitSession();
    }
  };

  const isLastSection = session.currentSectionIndex === currentSections.length - 1;

const handleIntermissionEnd = () => {
  setIsIntermissionMode(false);

  // Advance the section index + reset timer and session states exactly like normal section submit

  const nextSectionIndex = session.currentSectionIndex + 1;
  const updatedCompletedSectionIds = [...session.completedSectionIds, currentSectionData.id];
  let updatedSession = { ...session };
  if (session.phase === 'timed') {
    updatedSession.timedAnswers = { ...session.answeredQuestions };
    // Clear timer state for completed section
    const sectionTimerKey = `section-${session.currentSectionIndex}`;
    const updatedTimerStates = { ...session.timerStates };
    delete updatedTimerStates[sectionTimerKey];
    updatedSession.timerStates = updatedTimerStates;
  } else if (session.phase === 'blind-review') {
    updatedSession.blindReviewAnswers = { ...session.answeredQuestions };
  }
  updatedSession.answeredQuestions = {};

  if (nextSectionIndex < currentSections.length) {
    onUpdateSession({
      ...updatedSession,
      currentSectionIndex: nextSectionIndex,
      currentQuestionIndex: 0,
      completedSectionIds: updatedCompletedSectionIds,
    });
    resetTimer();
    setIsTimerRunning(true);
  } else {
    const updatedCompletedPhases = [...session.completedPhases, session.phase];
    onUpdateSession({
      ...updatedSession,
      endTime: new Date(),
      completedSectionIds: updatedCompletedSectionIds,
      completedPhases: updatedCompletedPhases,
    });
    onExitSession();
  }
};

  
  if (!currentQuestionData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-40">
        <p className="text-lg text-slate-700">Loading section data...</p>
      </div>
    );
  }

  const selectedAnswerIndex = session.answeredQuestions[currentQuestionData.id];
  const selectedAnswerText = selectedAnswerIndex !== undefined
    ? currentQuestionData.options[selectedAnswerIndex]
    : null;

  const formattedSectionDisplay = `${processedPrepTest.name} - Section ${session.currentSectionIndex + 1}`;

  if (session.phase === 'strategy-review' && showStrategySummary) {
    return (
      <StrategySummary
        session={session}
        processedPrepTest={processedPrepTest}
        currentSections={currentSections}
        onClose={() => setShowStrategySummary(false)}
      />
    );
   }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 z-40">
      <Header
        session={session}
        currentQuestionData={currentQuestionData}
        questionsInCurrentSection={questionsInCurrentSection}
        formattedSectionDisplay={formattedSectionDisplay}
        isTimerRunning={isTimerRunning}
        timeDisplay={session.timeMode === 'untimed' ? '∞' : getTimeDisplay()}
        timerColor={getTimerColor()}
        timerBgColor={getTimerBgColor()}
        timeRemaining={timeRemaining}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onToggleFlag={() => handleToggleFlag(currentQuestionData.id)}
        onExitSession={handlePauseReview}
        onShowStrategySummary={() => setShowStrategySummary(true)}
        onEndSection={handleSubmitSection}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onSubmitSection={handleSubmitSection}
        isLastQuestionOfSection={isLastQuestionOfSection}
        isLastSection={isLastSection}
        // Add formatting toolbar props
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        onClearFormatting={handleClearFormatting}
        textSize={textSize}
        onTextSizeChange={handleTextSizeChange}
        lineSpacing={lineSpacing}
        onLineSpacingChange={handleLineSpacingChange}
      />


        <div ref={mainContentRef} className="flex-1 p-6 overflow-y-auto">
       

        {session.phase === 'timed' && !isTimerRunning && !showSectionTransition && (
          <PausedOverlay
            onResume={() => setIsTimerRunning(true)}
            onExit={handleImmediateExit}
          />
        )}

        {showCircuitBuilder && session.phase !== 'timed' ? (
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            <PassagePanel
              currentQuestionData={currentQuestionData}
              session={session}
              selectedAnswerText={selectedAnswerText}
              selectedAnswerIndex={selectedAnswerIndex}
              existingCircuitForQuestion={existingCircuitForQuestion}
              onShowCircuitBuilder={() => setShowCircuitBuilder(true)}
              isCircuitBuilderOpen={showCircuitBuilder}
              // Add formatting props
              selectedTool={selectedTool}
              onClearPassageFormatting={clearPassageFormattingRef}
              textSize={textSize}
              lineSpacing={lineSpacing}
            />
            <div className="lg:col-span-2 h-full">
              <CircuitBuilder
                onBack={() => setShowCircuitBuilder(false)}
                onSaveCircuit={handleSaveCircuitFromBuilder}
                questionData={currentQuestionData}
                session={session}
                existingCircuit={existingCircuitForQuestion}
                containerHeight="calc(100vh - 180px)" // Adjust based on your measurements

              />
            </div>
          </div>
        ) : (
          <div className={session.phase === 'timed' ? "grid lg:grid-cols-2 gap-6 h-full" : "grid lg:grid-cols-3 gap-6 h-full"}>
            <PassagePanel
              currentQuestionData={currentQuestionData}
              session={session}
              selectedAnswerText={selectedAnswerText}
              selectedAnswerIndex={selectedAnswerIndex}
              existingCircuitForQuestion={existingCircuitForQuestion}
              onShowCircuitBuilder={() => setShowCircuitBuilder(true)}
              isCircuitBuilderOpen={showCircuitBuilder}
              // Add formatting props
              selectedTool={selectedTool}
              onClearPassageFormatting={clearPassageFormattingRef}
              textSize={textSize}
              lineSpacing={lineSpacing}
            />

           {session.phase !== 'timed' && (
              <AnalysisPanel
                isBlindReview={session.phase === 'blind-review'}
                isStrategyReview={session.phase === 'strategy-review'}  // ← NEW
                currentQuestion={currentQuestionData}                   // ← NEW
                analysisNotes={session.analysisNotes?.[currentQuestionData.id] || {}}
                onNoteChange={(noteType, value) => handleNoteChange(currentQuestionData.id, noteType, value)}
                focusRingColor={session.phase === 'blind-review' ? 'focus:ring-2 focus:ring-blue-500' : 'focus:ring-2 focus:ring-green-500'}
              />
            )}

            <QuestionPanel
              currentQuestionData={currentQuestionData}
              session={session}
              isTimerRunning={isTimerRunning}
              greyedOutOptions={greyedOutOptions}
              onAnswerSelection={(optionIndex) => handleAnswerSelection(currentQuestionData.id, optionIndex)}
              onToggleGreyOut={handleToggleGreyOut}
            />
          </div>
        )}
      </div>

      <QuestionTracker
        session={session}
        questionsInCurrentSection={questionsInCurrentSection}
        onQuestionJump={handleQuestionJump}
        onExitSession={handlePauseReview}
        onEndSection={handleSubmitSection}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onSubmitSection={handleSubmitSection}
        isLastQuestionOfSection={isLastQuestionOfSection}
        isLastSection={isLastSection}
      />

      {!currentSectionData.name.startsWith('RC') && (
        <FloatingCircuitBuilderButton
          session={session}
          isOpen={showCircuitBuilder}
          onToggle={() => setShowCircuitBuilder(prev => !prev)}
          showIntroTooltip={!hasDismissedTooltipForQuestion}
          onDismissIntroTooltip={() => setHasDismissedTooltipForQuestion(true)}
          showSuccessMessage={showSuccessMessage}
          analysisQualityScore={lastSavedScore}
        />
      )}
      {/* Portal the modal outside the container */}
      {showSectionTransition && (
        <Portal>
          <SectionTransition
            session={session}
            isLastSection={isLastSection}
            onCancel={() => {
              setShowSectionTransition(false);
              setIsSectionTransitionTriggeredByTimer(false);
            }}
            onConfirm={handleConfirmSectionSubmit}
            triggeredByTimer={isSectionTransitionTriggeredByTimer}
            isTimedSession={session.phase === 'timed'}
            isCompleteTest={!session.selectedSectionId}
            onResetTimer={resetTimer}   // <--- pass it down if you want
          />
        </Portal>
      )}

      {/* Also portal the pause popup */}
      {showPausePopup && (
        <Portal>
          <PauseReviewPopup
            isOpen={showPausePopup}
            reviewType={pauseReviewType}
            onReturnToDashboard={handleReturnToDashboard}
            onContinueReviewing={handleContinueReviewing}
            onClose={() => setShowPausePopup(false)}
          />
        </Portal>
      )}
      {/* Add the pause popup */}
      <PauseReviewPopup
        isOpen={showPausePopup}
        reviewType={pauseReviewType}
        onReturnToDashboard={handleReturnToDashboard}
        onContinueReviewing={handleContinueReviewing}
        onClose={() => setShowPausePopup(false)}
      />
    </div>
  );
};

export default TripleReview;
