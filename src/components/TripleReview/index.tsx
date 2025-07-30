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
  console.log('Current section data:', currentSectionData);
  const questionsInCurrentSection = currentSectionData?.questions || [];
  const currentQuestionData = questionsInCurrentSection[session.currentQuestionIndex];
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [lineSpacing, setLineSpacing] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const handleTextSizeChange = (size: 'small' | 'medium' | 'large') => {
  setTextSize(size);
};

const handleLineSpacingChange = (spacing: 'normal' | 'relaxed' | 'loose') => {
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
    const baseTime = 35 * 60;
    switch (session.timeMode) {
      case '1.5x': return Math.floor(baseTime * 1.5);
      case '2x': return baseTime * 2;
      case 'custom': return (session.customTimeMinutes || 35) * 60;
      case 'untimed': return Infinity;
      default: return baseTime;
    }
  };

  const handleSubmitSection = (triggeredByTimer: boolean = false) => {
    if (triggeredByTimer) {
      setIsSectionTransitionTriggeredByTimer(true);
    } else {
      setIsSectionTransitionTriggeredByTimer(false);
    }
    setShowSectionTransition(true);
  };

  // Handle pause button clicks - show popup instead of immediately exiting
  const handlePauseReview = () => {
    const reviewType = session.phase === 'blind-review' ? 'Blind Review' : 'Strategy Review';
    setPauseReviewType(reviewType);
    setShowPausePopup(true);
  };

  // Handle popup actions
  const handleReturnToDashboard = () => {
    setShowPausePopup(false);
    onExitSession(); // This will return to dashboard
  };

  const handleContinueReviewing = () => {
    setShowPausePopup(false);
    // Simply close popup to continue reviewing
  };

  const {
    timeRemaining,
    getTimeDisplay,
    getTimerColor,
    getTimerBgColor
  } = useTimer({
    initialTime: getInitialTime(),
    isRunning: isTimerRunning,
    onTimeUp: () => {
      setIsSectionTransitionTriggeredByTimer(true);
      handleSubmitSection(true);
    },
    phase: session.phase
  });

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

    let updatedSession = { ...session };
    if (session.phase === 'timed') {
      updatedSession.timedAnswers = { ...session.answeredQuestions };
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
        {showSectionTransition && (
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
          />
        )}

        {session.phase === 'timed' && !isTimerRunning && !showSectionTransition && (
          <PausedOverlay
            onResume={() => setIsTimerRunning(true)}
            onExit={onExitSession}
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
                session={session}
                currentQuestionData={currentQuestionData}
                onNoteChange={(noteType, value) => handleNoteChange(currentQuestionData.id, noteType, value)}
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