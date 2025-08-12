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
  AlignLeft,
  RotateCcw,
  Eraser
} from 'lucide-react';
import { TestSession, ProcessedQuestion } from '../../App';

// Custom icon for text resize (double A)
const TextResizeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <text x="2" y="12" fontSize="8" fontWeight="bold">A</text>
    <text x="12" y="18" fontSize="12" fontWeight="bold">A</text>
  </svg>
);

// Custom icon for line spacing
const LineSpacingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
    <path d="M8 3v3M16 3v3M8 18v3M16 18v3"/>
  </svg>
);

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
  // New props for text sizing and line spacing
  textSize: 'small' | 'medium' | 'large';
  onTextSizeChange: (size: 'small' | 'medium' | 'large') => void;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  onLineSpacingChange: (spacing: 'normal' | 'relaxed' | 'loose') => void;
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
  onClearFormatting,
  textSize,
  onTextSizeChange,
  lineSpacing,
  onLineSpacingChange
}) => {
  const [showTextSizeDropdown, setShowTextSizeDropdown] = useState(false);
  const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);

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
      id: 'eraser', 
      icon: Eraser, 
      label: 'Eraser - Remove Formatting',
      bgColor: 'hover:bg-orange-100'
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

  const handleTextSizeClick = () => {
    setShowTextSizeDropdown(!showTextSizeDropdown);
    setShowLineSpacingDropdown(false);
  };

  const handleLineSpacingClick = () => {
    setShowLineSpacingDropdown(!showLineSpacingDropdown);
    setShowTextSizeDropdown(false);
  };

  const handleTextSizeChange = (size: 'small' | 'medium' | 'large') => {
    onTextSizeChange(size);
    setShowTextSizeDropdown(false);
  };

  const handleLineSpacingChange = (spacing: 'normal' | 'relaxed' | 'loose') => {
    onLineSpacingChange(spacing);
    setShowLineSpacingDropdown(false);
  };

  return (
    <div className="bg-white shadow-sm border-b border-slate-200 rounded-b-2xl">
      {/* Main Header */}
      <div className="py-4 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4 md:mb-0 mb-2">
            <div className="p-3 bg-${phaseColor}-100 rounded-xl">
              <PhaseIcon className={h-6 w-6 text-${phaseColor}-600} />
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
                <div className={text-2xl font-mono font-bold transition-all ${timerColor} ${timerBgColor} ${timeRemaining <= 60 ? 'animate-pulse' : ''} px-2 py-1 rounded}>
                  {timeDisplay}
                </div>
                <button
                  onClick={onToggleTimer}
                  className={p-2 rounded-lg ${
                    isTimerRunning
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }}
                >
                  {isTimerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
            )}

            <button
              onClick={onToggleFlag}
              className={p-2 rounded-lg transition-colors ${getFlagButtonColor()}}
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
                  className={p-2 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm' 
                      : bg-white border-slate-200 text-slate-600 ${tool.bgColor}
                  }}
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
            
            {/* Text Size Dropdown */}
            <div className="relative">
              <button
                onClick={handleTextSizeClick}
                className={p-2 rounded-lg border transition-all ${
                  showTextSizeDropdown
                    ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }}
                title="Text Size"
              >
                <TextResizeIcon className="h-4 w-4" />
              </button>
              
              {showTextSizeDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-32">
                  <button
                    onClick={() => handleTextSizeChange('small')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg ${
                      textSize === 'small' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Small
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('medium')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      textSize === 'medium' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handleTextSizeChange('large')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 last:rounded-b-lg ${
                      textSize === 'large' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Large
                  </button>
                </div>
              )}
            </div>

            {/* Line Spacing Dropdown */}
            <div className="relative">
              <button
                onClick={handleLineSpacingClick}
                className={p-2 rounded-lg border transition-all ${
                  showLineSpacingDropdown
                    ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }}
                title="Line Spacing"
              >
                <LineSpacingIcon className="h-4 w-4" />
              </button>
              
              {showLineSpacingDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-32">
                  <button
                    onClick={() => handleLineSpacingChange('normal')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg ${
                      lineSpacing === 'normal' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => handleLineSpacingChange('relaxed')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      lineSpacing === 'relaxed' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Relaxed
                  </button>
                  <button
                    onClick={() => handleLineSpacingChange('loose')}
                    className={w-full px-3 py-2 text-left text-sm hover:bg-slate-50 last:rounded-b-lg ${
                      lineSpacing === 'loose' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                    }}
                  >
                    Loose
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onClearFormatting}
              className="p-2 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear Formatting"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-sm text-slate-500">
            {selectedTool === 'eraser' ? (
              <span>Select formatted text to remove highlighting or underlining</span>
            ) : selectedTool ? (
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