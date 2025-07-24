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
  // ... your existing state and hooks ...

  // The rest of your existing code remains unchanged...

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

      {/* Floating Circuit Builder Button shown only during blind-review and strategy-review */}
      {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
        <FloatingCircuitBuilderButton session={session} />
      )}
    </div>
  );
};

export default TripleReview;
