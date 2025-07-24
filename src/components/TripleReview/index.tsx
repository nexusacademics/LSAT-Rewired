// components/TripleReview/index.tsx
import React, { useState, useEffect } from 'react';
import { TestSession, ProcessedPrepTest, ProcessedSection, ProcessedQuestion, Circuit } from '../../App';
import CircuitBuilder from '../CircuitBuilder';
import { Header } from './Header';
import { PassagePanel } from './PassagePanel';
import { QuestionPanel } from './QuestionPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { QuestionTracker } from './QuestionTracker';
import { StrategySummary } from './StrategySummary';
import { SectionTransition } from './SectionTransition';
import { PausedOverlay } from './PausedOverlay';
import { useTimer } from '../../hooks/useTimer';
import { useQuestionNavigation } from '../../hooks/useQuestionNavigation';
import { useAnswerSelection } from '../../hooks/useAnswerSelection';
import FloatingCircuitBuilderButton from '../FloatingCircuitBuilderButton';

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

  // Determine the sections and questions relevant to the current session
  const currentSections: ProcessedSection[] = session.selectedSectionId
    ? processedPrepTest.sections.filter(sec => sec.id === session.selectedSectionId)
    : processedPrepTest.sections;

  const currentSectionData = currentSections[session.currentSectionIndex];
  const questionsInCurrentSection = currentSectionData?.questions || [];
  const currentQuestionData = questionsInCurrentSection[session.currentQuestionIndex];

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

  const handleSubmitSection = () => {
    setShowSectionTransition(true);
  };

  // Custom hooks
  const {
    timeRemaining,
    getTimeDisplay,
    getTimerColor,
    getTimerBgColor
  } = useTimer({
    initialTime: getInitialTime(),
    isRunning: isTimerRunning,
    onTimeUp: () => {
      setIsTimerRunning(false);
      handleSubmitSection();
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

  // Find the existing circuit for the current question, if any
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

    if (nextSectionIndex < currentSections.length) {
      onUpdateSession({
        ...updatedSession,
        currentSectionIndex: nextSectionIndex,
        currentQuestionIndex: 0,
        completedSectionIds: updatedCompletedSectionIds,
      });
      setShowSectionTransition(false);
    } else {
      // All sections completed for the current phase
      const updatedCompletedPhases = [...session.completedPhases, session.phase];
      onUpdateSession({
        ...updatedSession,
        endTime: new Date(),
        completedSectionIds: updatedCompletedSectionIds,
        completedPhases: updatedCompletedPhases,
      });
      setShowSectionTransition(false);
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

  // Define selected answer for display
  const selectedAnswerIndex = session.answeredQuestions[currentQuestionData.id];
  const selectedAnswerText = selectedAnswerIndex !== undefined
    ? currentQuestionData.options[selectedAnswerIndex]
    : null;

  // Construct the formatted section name for the header
  const formattedSectionDisplay = `${processedPrepTest.name} - Section ${session.currentSectionIndex + 1}`;

  // Strategy Review Summary Screen
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
      {/* Header */}
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
        onExitSession={onExitSession}
        onShowStrategySummary={() => setShowStrategySummary(true)}
        onEndSection={handleSubmitSection}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onSubmitSection={handleSubmitSection}
        isLastQuestionOfSection={isLastQuestionOfSection}
        isLastSection={isLastSection}
      />

      {/* Main Content Wrapper */}
      <div ref={mainContentRef} className="flex-1 p-6 overflow-y-auto">
        {/* Modals */}
        {showSectionTransition && (
          <SectionTransition
            session={session}
            isLastSection={isLastSection}
            onCancel={() => setShowSectionTransition(false)}
            onConfirm={handleConfirmSectionSubmit}
          />
        )}

        {/* Paused Overlay */}
        {session.phase === 'timed' && !isTimerRunning && (
          <PausedOverlay
            onResume={() => setIsTimerRunning(true)}
            onExit={onExitSession}
          />
        )}

        {/* Main Layout */}
        {showCircuitBuilder && session.phase !== 'timed' ? (
          <div className="grid lg:grid-cols-3 gap-6 h-full">
            <PassagePanel
              currentQuestionData={currentQuestionData}
              session={session}
              selectedAnswerText={selectedAnswerText}
              selectedAnswerIndex={selectedAnswerIndex}
              existingCircuitForQuestion={existingCircuitForQuestion}
              onShowCircuitBuilder={() => setShowCircuitBuilder(true)}
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

      {/* Footer - Question Tracker */}
      <QuestionTracker
        session={session}
        questionsInCurrentSection={questionsInCurrentSection}
        onQuestionJump={handleQuestionJump}
      />
       {/* Floating Circuit Builder Button (only in blind-review and strategy-review) */}
      {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
        <FloatingCircuitBuilderButton session={session} />
    </div>
      );
};

export default TripleReview;