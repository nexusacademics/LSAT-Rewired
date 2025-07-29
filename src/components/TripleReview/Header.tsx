// components/TripleReview/Header.tsx
import React from 'react';
import { Timer, Play, Pause, Flag, ChevronRight, Brain, BookOpen, Target } from 'lucide-react';
import { TestSession, ProcessedQuestion } from '../../App';

interface HeaderProps {
  session: TestSession;
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
  onSubmitSection: (isTimerTriggered: boolean) => void; // <--- CRITICAL: Ensure this accepts a boolean
  isLastQuestionOfSection: boolean;
  isLastSection: boolean;
}

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

const getPhaseTitle = (phase: string) => {
  switch (phase) {
    case 'timed': return 'Timed Test';
    case 'blind-review': return 'Blind Review';
    case 'strategy-review': return 'Strategy Review & Action Plan';
    default: return 'Test Session';
  }
};

export const Header: React.FC<HeaderProps> = ({
  session,
  currentQuestionData,
  questionsInCurrentSection,
  formattedSectionDisplay,
  isTimerRunning,
  timeDisplay,
  timerColor,
  timerBgColor,
  timeRemaining,
  onToggleTimer,
  onToggleFlag,
  onExitSession,
  onShowStrategySummary,
  onEndSection,
  onPreviousQuestion,
  onNextQuestion,
  onSubmitSection,
  isLastQuestionOfSection,
  isLastSection
}) => {
  const PhaseIcon = getPhaseIcon(session.phase);
  const phaseColor = getPhaseColor(session.phase);

  // Helper function to check if current question is flagged based on phase
  const isCurrentQuestionFlagged = () => {
    const currentFlags = currentQuestionData.flags || {};
    switch (session.phase) {
      case 'timed':
        return currentFlags.timedSection || session.flaggedQuestions?.includes(currentQuestionData.id) || false;
      case 'blind-review':
        return currentFlags.blindReview || false;
      case 'strategy-review':
        return currentFlags.strategyPlanning || false;
      default:
        return session.flaggedQuestions?.includes(currentQuestionData.id) || false;
    }
  };

  // Get the appropriate flag color based on phase
  const getFlagButtonColor = () => {
    if (!isCurrentQuestionFlagged()) {
      return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
    }
    
    switch (session.phase) {
      case 'timed':
        return 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200';
      case 'blind-review':
        return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
      case 'strategy-review':
        return 'bg-red-100 text-red-600 hover:bg-red-200';
      default:
        return 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-slate-200 py-4 px-6 rounded-b-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4 md:mb-0 mb-2">
          <div className={`p-3 bg-${phaseColor}-100 rounded-xl`}>
            <PhaseIcon className={`h-6 w-6 text-${phaseColor}-600`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {getPhaseTitle(session.phase)}
            </h1>
            <p className="text-slate-600">
              {formattedSectionDisplay} • Question {session.currentQuestionIndex + 1} of {questionsInCurrentSection.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {session.phase === 'timed' && (
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-mono font-bold transition-all ${timerColor} ${timerBgColor} ${timeRemaining <= 60 ? 'animate-pulse' : ''} px-2 py-1 rounded`}>
                {timeDisplay}
              </div>
              <button
                onClick={onToggleTimer}
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
            onClick={onToggleFlag}
            className={`p-2 rounded-lg transition-colors ${getFlagButtonColor()}`}
            title={isCurrentQuestionFlagged() ? "Unflag Question" : "Flag Question"}
          >
            <Flag className="h-5 w-5" />
          </button>

          {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
            <button
              onClick={onExitSession}
              className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
            >
              {session.phase === 'blind-review' ? 'Pause Blind Review' : 'Pause Strategy Review'}
            </button>
          )}

          {session.phase === 'strategy-review' && (
            <button
              onClick={onShowStrategySummary}
              className="px-3 py-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors text-sm font-medium"
            >
              View Summary
            </button>
          )}

          <button
            onClick={() => onSubmitSection(false)}
            className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
          >
            End Section
          </button>

          <div className="flex space-x-1">
            <button
              onClick={onPreviousQuestion}
              disabled={session.currentQuestionIndex === 0}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {isLastQuestionOfSection ? (
              <button
                onClick={onSubmitSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {isLastSection ? 'Finish Test' : (session.selectedSectionId ? 'Finish Section' : 'Next Section')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={onNextQuestion}
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
  );
};