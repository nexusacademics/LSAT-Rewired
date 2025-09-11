// components/TripleReview/QuestionPanel.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { TestSession, ProcessedQuestion } from '../../App';

interface QuestionPanelProps {
  currentQuestionData: ProcessedQuestion;
  session: TestSession;
  isTimerRunning: boolean;
  greyedOutOptions: { [questionId: string]: number[] };
  onAnswerSelection: (optionIndex: number) => void;
  onToggleGreyOut: (questionId: string, optionIndex: number) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentQuestionData,
  session,
  isTimerRunning,
  greyedOutOptions,
  onAnswerSelection,
  onToggleGreyOut
}) => {
  const [showAnswerChoices, setShowAnswerChoices] = useState(false);

  // Reset overlay when question changes during blind review
  React.useEffect(() => {
    if (session.phase === 'blind-review') {
      setShowAnswerChoices(false);
    }
  }, [currentQuestionData.id, session.phase]);

  return (
    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
      {/* Question Stem */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-serif font-semibold text-slate-900">
            <div className="whitespace-pre-line">{currentQuestionData.question}</div>
          </h3>
        </div>
      </div>

      {/* Answer Choices */}
      <div className="bg-white font-serif rounded-2xl shadow-sm border border-slate-200 p-6 relative">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Answer Choices</h3>
        
        {/* Overlay for Blind Review */}
        {session.phase === 'blind-review' && !showAnswerChoices && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
            <div className="text-center p-8 max-w-sm">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Stimulus Analysis First
              </h4>
              <p className="text-slate-600 mb-6 text-md leading-relaxed">
                We suggest completing your stimulus analysis before looking at the answer choices. 
                This helps you form your own understanding first.
              </p>
              <button
                onClick={() => setShowAnswerChoices(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reveal Answer Choices
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => {
            const isGreyedOut = greyedOutOptions[currentQuestionData.id]?.includes(index);
            const isCorrect = index === currentQuestionData.correctAnswer;
            const timedAnswerChosen = session.timedAnswers[currentQuestionData.id];
            const blindReviewAnswerChosen = session.blindReviewAnswers[currentQuestionData.id];

            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 border rounded-xl transition-colors ${
                  isCorrect && session.phase === 'strategy-review' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start space-x-3 flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={
                      session.phase === 'strategy-review' 
                        ? false 
                        : session.answeredQuestions[currentQuestionData.id] === index
                    }
                    onChange={() => onAnswerSelection(index)}
                    className="mt-1 text-blue-600"
                    disabled={
                      (session.phase === 'timed' && !isTimerRunning) || 
                      session.phase === 'strategy-review'
                    }
                  />
                  <span className="font-medium text-slate-700 mr-3">
                    ({String.fromCharCode(65 + index)})
                  </span>
                  <span className={`text-slate-700 flex-1 ${
                    isGreyedOut ? 'opacity-50 text-slate-400 line-through' : ''
                  }`}>
                    {option}
                  </span>
                </label>

                {session.phase === 'strategy-review' && (
                  <div className="flex items-center space-x-2 text-sm">
                    {isCorrect && <span className="text-green-600 font-medium">Correct</span>}
                    {timedAnswerChosen === index && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        Timed {isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                    {blindReviewAnswerChosen === index && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        Blind {isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                    {timedAnswerChosen === undefined && index === currentQuestionData.correctAnswer && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Timed Ø
                      </span>
                    )}
                    {blindReviewAnswerChosen === undefined && index === currentQuestionData.correctAnswer && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Blind Ø
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onToggleGreyOut(currentQuestionData.id, index)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title={isGreyedOut ? "Show option" : "Grey out option"}
                >
                  {isGreyedOut ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};