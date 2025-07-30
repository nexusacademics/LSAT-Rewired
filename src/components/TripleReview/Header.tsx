// components/TripleReview/Header.tsx
import React, { useState } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  Flag, 
  ChevronRight, 
  Brain, 
  BookOpen, 
  Target,
  Underline,
  Highlighter,
  Palette,
  Type,
  AlignLeft,
  RotateCcw
} from 'lucide-react';
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
  onSubmitSection: (isTimerTriggered: boolean) => void;
  isLastQuestionOfSection: boolean;
  isLastSection: boolean;
  // New props for formatting toolbar
  selectedTool: string | null;
  onToolSelect: (toolId: string | null) => void;
  onClearFormatting: () => void;
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
  isLastSection,
  selectedTool,
  onToolSelect,
  onClearFormatting
}) => {
  const PhaseIcon = getPhaseIcon(session.phase);
  const phaseColor = getPhaseColor(session.phase);

  const formattingTools = [
    { 
      id: 'underline', 
      icon: Underline, 
      label: 'Underline', 
      color: '#000000',
      bgColor: 'hover:bg-slate-100'
    },
    { 
      id: 'highlight-yellow', 
      icon: Highlighter, 
      label: 'Yellow Highlight', 
      color: '#ffff00',
      bgColor: 'hover:bg-yellow-100'
    },
    { 
      id: 'highlight-pink', 
      icon: Highlighter, 
      label: 'Pink Highlight', 
      color: '#ffb3d9',
      bgColor: 'hover:bg-pink-100'
    },
    { 
      id: 'highlight-red', 
      icon: Highlighter, 
      label: 'Red Highlight', 
      color: '#ff6b6b',
      bgColor: 'hover:bg-red-100'
    },
    { 
      id: 'text-size', 
      icon: Type, 
      label: 'Text Size',
      bgColor: 'hover:bg-slate-100'
    },
    { 
      id: 'paragraph', 
      icon: AlignLeft, 
      label: 'Paragraph',
      bgColor: 'hover:bg-slate-100'
    }
  ];

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

  const handleToolClick = (toolId: string) => {
    onToolSelect(selectedTool === toolId ? null : toolId);
  };

  return (
    <div className="bg-white shadow-sm border-b border-slate-200 rounded-b-2xl">
      {/* Main Header */}
      <div className="py-4 px-6">
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
                 onClick={() => onSubmitSection(false)}
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

      {/* Formatting Toolbar */}
      <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {formattingTools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm' 
                      : `bg-white border-slate-200 text-slate-600 ${tool.bgColor}`
                  }`}
                  title={tool.label}
                >
                  {tool.id.startsWith('highlight-') ? (
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                        style={{ backgroundColor: tool.color }}
                      />
                    </div>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </button>
              );
            })}
            
            <div className="w-px h-6 bg-slate-300 mx-2" />
            
            <button
              onClick={onClearFormatting}
              className="p-2 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear Formatting"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-sm text-slate-500">
            {selectedTool ? (
              <span>Select text in the passage to apply formatting</span>
            ) : (
              <span>Choose a formatting tool, then select text in the passage</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};