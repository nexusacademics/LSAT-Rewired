import React, { useState } from 'react';
import { TestSession, ProcessedQuestion } from '../../App';
import { ChevronRight } from 'lucide-react';
// Enhanced flag system to track multiple phases
interface QuestionFlags {
  timedSection?: boolean;
  blindReview?: boolean;
  strategyPlanning?: boolean;
}

interface Question {
  id: string;
  // flags property no longer needed - stored in session
}

interface Session {
  currentQuestionIndex: number;
  answeredQuestions: Record<string, any>;
  phase: 'timed' | 'blindReview' | 'strategyReview' | 'strategyPlanning' | 'archive';
  flaggedQuestions?: string[]; // Legacy support for old flag system
  questionFlags?: {
    [questionId: string]: QuestionFlags;
  };
}

interface QuestionTrackerProps {
  session: Session;
  questionsInCurrentSection: Question[];
  onQuestionJump: (index: number) => void;
  currentQuestionData: ProcessedQuestion;
  questionsInCurrentSection: ProcessedQuestion[];
  formattedSectionDisplay: string;
  isTimerRunning: boolean;
  timeDisplay: string;
  timerColor: string;
  timerBgColor: string;
  timeRemaining: number;
  onToggleTimer: () => void;
  onToggleFlag: () => void;
  onExitSession: () => void;
  onShowStrategySummary: () => void;
  onEndSection: () => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitSection: (isTimerTriggered: boolean) => void;
  isLastQuestionOfSection: boolean;
  isLastSection: boolean;
}

// Flag visualization component
const FlagIndicator: React.FC<{ flags: QuestionFlags; isAnswered: boolean; isCurrent: boolean }> = ({ 
  flags = {}, 
  isAnswered, 
  isCurrent 
}) => {
  const hasTimedFlag = flags?.timedSection || false;
  const hasBlindReviewFlag = flags?.blindReview || false;
  const hasStrategyFlag = flags?.strategyPlanning || false;
  
  const flagCount = [hasTimedFlag, hasBlindReviewFlag, hasStrategyFlag].filter(Boolean).length;
  
  if (flagCount === 0) {
    // No flags - show answered/current state
    if (isCurrent) return 'bg-purple-600 ring-2 ring-purple-300 text-white';
    if (isAnswered) return 'bg-blue-500 text-white';
    return 'bg-slate-200 text-slate-600';
  }
  
  // Single flag
  if (flagCount === 1) {
    let baseClasses = 'text-white ';
    if (hasTimedFlag) baseClasses += 'bg-yellow-500';
    else if (hasBlindReviewFlag) baseClasses += 'bg-orange-500';
    else if (hasStrategyFlag) baseClasses += 'bg-red-500';
    
    if (isCurrent) baseClasses += ' ring-2 ring-white';
    return baseClasses;
  }
  
  // Multiple flags - use gradient or special styling
  let gradientClass = 'text-white ';
  if (hasTimedFlag && hasBlindReviewFlag && hasStrategyFlag) {
    gradientClass += 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500';
  } else if (hasTimedFlag && hasBlindReviewFlag) {
    gradientClass += 'bg-gradient-to-br from-yellow-500 to-orange-500';
  } else if (hasTimedFlag && hasStrategyFlag) {
    gradientClass += 'bg-gradient-to-br from-yellow-500 to-red-500';
  } else if (hasBlindReviewFlag && hasStrategyFlag) {
    gradientClass += 'bg-gradient-to-br from-orange-500 to-red-500';
  }
  
  if (isCurrent) gradientClass += ' ring-2 ring-white';
  return gradientClass;
};

// Enhanced concentric circles approach for multiple flags
const ConcentricFlagIndicator: React.FC<{ flags: QuestionFlags; isAnswered: boolean; isCurrent: boolean; questionNumber: number }> = ({ 
  flags = {}, 
  isAnswered, 
  isCurrent,
  questionNumber 
}) => {
  const hasTimedFlag = flags?.timedSection || false;
  const hasBlindReviewFlag = flags?.blindReview || false;
  const hasStrategyFlag = flags?.strategyPlanning || false;

  const hasFlagsCount = [hasTimedFlag, hasBlindReviewFlag, hasStrategyFlag].filter(Boolean).length;

  if (hasFlagsCount === 0) {
    // No flags - standard button
    let classes = 'min-w-[36px] h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ';
    if (isCurrent) classes += 'bg-purple-600 ring-2 ring-purple-800 text-white'; // ← changed from ring-purple-300
    else if (isAnswered) classes += 'bg-blue-500 text-white';
    else classes += 'bg-slate-200 text-slate-600';

    return (
      <div className={classes}>
        {questionNumber}
      </div>
    );
  }

  // Multiple flags - concentric circles
  return (
    <div className={`relative min-w-[36px] h-11 flex items-center justify-center rounded-full ${isCurrent ? 'ring-1 ring-purple-800' : ''}`}> {/* ← NEW: outer ring for active */}
      {/* Outermost circle - Strategy Planning (Red) */}
      {hasStrategyFlag && (
        <div className="absolute inset-0 rounded-full bg-red-500" />
      )}

      {/* Middle circle - Blind Review (Orange) */}
      {hasBlindReviewFlag && (
        <div className="absolute inset-[4px] rounded-full bg-orange-500" />
      )}

      {/* Inner circle - Timed Section (Yellow) */}
      {hasTimedFlag && (
        <div className="absolute inset-[8px] rounded-full bg-yellow-500" />
      )}

      {/* Center content */}
      <div className="relative z-10 text-white text-sm font-semibold">
        {questionNumber}
      </div>
    </div>
  );
};

export const QuestionTracker: React.FC<QuestionTrackerProps> = ({
  session,
  questionsInCurrentSection,
  onQuestionJump,
  onExitSession,
  onEndSection,
  onPreviousQuestion,
  onNextQuestion,
  onSubmitSection,
  isLastQuestionOfSection,
  isLastSection
}) => {
  return (
   <div className="bg-white shadow-lg border-t border-slate-200 p-2">
  {/* Phase + Buttons */}
  <div className="flex items-center justify-between mb-3">
    {/* Phase indicator */}
    <div className="text-small text-slate-600 flex items-center space-x-6 whitespace-nowrap">
      <span>
        <strong>Phase:</strong> {session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}
      </span>
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Timed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>BR</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Strategy</span>
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex space-x-1 shrink-0">
      <button
        onClick={onPreviousQuestion}
        disabled={session.currentQuestionIndex === 0}
        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {isLastQuestionOfSection ? (
        <button
          onClick={() => onSubmitSection(false)}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs flex items-center"
        >
          {isLastSection ? 'Finish Test' : (session.selectedSectionId ? 'Finish Section' : 'Next Section')}
          <ChevronRight className="h-3 w-3 ml-1" />
        </button>
      ) : (
        <button
          onClick={onNextQuestion}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs flex items-center"
        >
          Next
          <ChevronRight className="h-3 w-3 ml-1" />
        </button>
      )}
    </div>
  </div>

  {/* Question circles */}
  <div className="flex space-x-4 overflow-x-auto pb-4">
    {questionsInCurrentSection.map((q, index) => {
      const isCurrent = index === session.currentQuestionIndex;
      const isAnswered = session.answeredQuestions.hasOwnProperty(q.id);
      const flags = session.questionFlags?.[q.id] || {};

      // Check both new flag system and legacy flaggedQuestions array
      const isLegacyFlagged = session.flaggedQuestions?.includes(q.id) || false;
      const effectiveFlags = {
        ...flags,
        // If using legacy system in timed phase, treat as timed flag
        timedSection: flags.timedSection || (session.phase === 'timed' && isLegacyFlagged)
      };

      const flagTooltip = [];
      if (effectiveFlags.timedSection) flagTooltip.push('Flagged in Timed Section');
      if (effectiveFlags.blindReview) flagTooltip.push('Flagged in Blind Review');
      if (effectiveFlags.strategyPlanning) flagTooltip.push('Flagged in Strategy Planning');

      const tooltipText = `Question ${index + 1}${isAnswered ? ' (Answered)' : ''}${flagTooltip.length > 0 ? '\n' + flagTooltip.join('\n') : ''}`;

      return (
        <button
          key={q.id}
          onClick={() => onQuestionJump(index)}
          className="transition-all hover:scale-105"
          title={tooltipText}
        >
          <ConcentricFlagIndicator
            flags={effectiveFlags}
            isAnswered={isAnswered}
            isCurrent={isCurrent}
            questionNumber={index + 1}
          />
        </button>
      );
    })}
  </div>
</div>
  );
};

// Demo component to show the system in action
const QuestionTrackerDemo: React.FC = () => {
  const [currentPhase, setCurrentPhase] = React.useState<'timed' | 'blindReview' | 'strategyReview' | 'strategyPlanning' | 'archive'>('timed');
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  
  // Sample questions with different flag combinations
  const sampleQuestions: Question[] = [
    { id: '1' }, // No flags
    { id: '2' }, // Timed only
    { id: '3' }, // BR only  
    { id: '4' }, // Both timed and BR
    { id: '5' }, // Strategy only
    { id: '6' }, // Timed and Strategy
    { id: '7' }, // BR and Strategy
    { id: '8' }, // All three
    { id: '9' }, // No flags
    { id: '10' }, // Timed only
  ];
  
  const sampleSession: Session = {
    currentQuestionIndex: currentQuestion,
    answeredQuestions: { '1': 'A', '3': 'B', '5': 'C', '8': 'D' },
    phase: currentPhase,
    questionFlags: {
      '2': { timedSection: true },
      '3': { blindReview: true },
      '4': { timedSection: true, blindReview: true },
      '5': { strategyPlanning: true },
      '6': { timedSection: true, strategyPlanning: true },
      '7': { blindReview: true, strategyPlanning: true },
      '8': { timedSection: true, blindReview: true, strategyPlanning: true },
      '10': { timedSection: true }
    }
  };
  
  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Multi-Phase Question Tracker</h1>
        
        {/* Phase controls */}
        <div className="mb-4 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-2">Current Phase:</h3>
          <div className="flex space-x-2">
            {(['timed', 'blindReview', 'strategyReview', 'strategyPlanning', 'archive'] as const).map(phase => (
              <button
                key={phase}
                onClick={() => setCurrentPhase(phase)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPhase === phase 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Question tracker */}
        <QuestionTracker
          session={sampleSession}
          questionsInCurrentSection={sampleQuestions}
          onQuestionJump={setCurrentQuestion}
        />
        
        {/* Legend */}
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h3 className="font-semibold mb-2">Flag Legend:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Single Flags:</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                  <span>Timed Section Flag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                  <span>Blind Review Flag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                  <span>Strategy Planning Flag</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multiple Flags (Concentric):</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full bg-orange-500"></div>
                    <div className="absolute inset-[3px] rounded-full bg-yellow-500"></div>
                  </div>
                  <span>Timed + BR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full bg-red-500"></div>
                    <div className="absolute inset-[2px] rounded-full bg-orange-500"></div>
                    <div className="absolute inset-[4px] rounded-full bg-yellow-500"></div>
                  </div>
                  <span>All Three Flags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTrackerDemo;