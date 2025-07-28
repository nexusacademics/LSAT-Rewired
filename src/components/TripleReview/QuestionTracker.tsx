import React from 'react';

export const QuestionTracker: React.FC<QuestionTrackerProps> = ({
  session,
  questionsInCurrentSection,
  onQuestionJump
}) => {
  return (
    <div className="bg-white shadow-lg border-t border-slate-200 p-2 overflow-x-auto">
      <div className="flex space-x-2 max-w-full">
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
              className={`min-w-[36px] h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${bgColor} ${textColor}`}
              title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
