import React, { useState } from 'react';

export const QuestionTracker: React.FC<QuestionTrackerProps> = ({
  session,
  questionsInCurrentSection,
  onQuestionJump
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="relative bg-white border-t border-slate-200 p-2">
      <button
        onClick={handleToggle}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold"
      >
        Questions ({questionsInCurrentSection.length})
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 bg-white shadow-lg p-4 grid grid-cols-5 gap-2 max-h-48 overflow-y-auto rounded-b-md">
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
              textColor = 'white';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  onQuestionJump(index);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${bgColor} ${textColor}`}
                title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
