import React from 'react';
import { TestSession, ProcessedQuestion } from '../../App';
import { useMediaQuery } from 'react-responsive';

interface QuestionTrackerProps {
  session: TestSession;
  questionsInCurrentSection: ProcessedQuestion[];
  onQuestionJump: (index: number) => void;
}

export const QuestionTracker: React.FC<QuestionTrackerProps> = ({
  session,
  questionsInCurrentSection,
  onQuestionJump
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const renderStatus = (index: number) => {
    const q = questionsInCurrentSection[index];
    const isCurrent = index === session.currentQuestionIndex;
    const isAnswered = session.answeredQuestions.hasOwnProperty(q.id);
    const isFlagged = session.flaggedQuestions.includes(q.id);

    let label = `Question ${index + 1}`;
    if (isFlagged) label += ' (Flagged)';
    if (isAnswered) label += ' (Answered)';
    if (isCurrent) label += ' (Current)';
    return label;
  };

  if (isMobile) {
    return (
      <div className="bg-white shadow-lg border-t border-slate-200 p-4">
        <div className="max-w-md mx-auto text-center">
          <label htmlFor="question-select" className="block text-sm font-medium text-slate-700 mb-1">
            Jump to a Question
          </label>
          <select
            id="question-select"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm"
            value={session.currentQuestionIndex}
            onChange={(e) => onQuestionJump(parseInt(e.target.value))}
          >
            {questionsInCurrentSection.map((q, index) => (
              <option key={q.id} value={index}>
                {renderStatus(index)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Desktop: Original grid
  return (
    <div className="bg-white shadow-lg border-t border-slate-200 p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2">
        {questionsInCurrentSection.map((q, index) => {
          const isCurrent = index === session.currentQuestionIndex;
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
              onClick={() => onQuestionJump(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${bgColor} ${textColor}`}
              title={renderStatus(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
