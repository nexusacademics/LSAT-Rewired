import React, { useState } from 'react';

export const QuestionTracker: React.FC<QuestionTrackerProps> = ({
  session,
  questionsInCurrentSection,
  onQuestionJump
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold"
      >
        Questions ({questionsInCurrentSection.length})
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 overflow-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select a Question</h2>
              <button onClick={handleClose} className="text-gray-600 hover:text-gray-900">
                Close
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {questionsInCurrentSection.map((q, index) => {
                const isCurrent = index === session.currentQuestionIndex;
                const isAnswered = session.answeredQuestions.hasOwnProperty(q.id);
                const isFlagged = session.flaggedQuestions.includes(q.id);

                let bgColor = 'bg-slate-200';
                let textColor = 'text-slate-600';

                if (isAnswered) {
                  bgColor = 'bg-blue-500';
                  textColor = 'white';
                }
                if (isFlagged) {
                  bgColor = 'bg-yellow-500';
                  textColor = 'white';
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
                      handleClose();
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${bgColor} ${textColor}`}
                    title={`Question ${index + 1}${isFlagged ? ' (Flagged)' : ''}${isAnswered ? ' (Answered)' : ''}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
