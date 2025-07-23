// components/TripleReview/PassagePanel.tsx
import React from 'react';
import { Target } from 'lucide-react';
import { TestSession, ProcessedQuestion, Circuit } from '../../App';

interface PassagePanelProps {
  currentQuestionData: ProcessedQuestion;
  session: TestSession;
  selectedAnswerText: string | null;
  selectedAnswerIndex: number | undefined;
  existingCircuitForQuestion: Circuit | undefined;
  onShowCircuitBuilder: () => void;
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  currentQuestionData,
  session,
  selectedAnswerText,
  selectedAnswerIndex,
  existingCircuitForQuestion,
  onShowCircuitBuilder
}) => {
  return (
    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
      {/* Passage */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="prose max-w-none">
          <div className="text-slate-700 leading-relaxed">
            <div className="whitespace-pre-line">{currentQuestionData.passage}</div>
          </div>
        </div>
      </div>

      {/* Conditional Answer Display */}
      {session.phase === 'blind-review' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Selected Answer</h3>
          {selectedAnswerText ? (
            <p className="text-slate-700 font-medium">
              ({String.fromCharCode(65 + selectedAnswerIndex!)}) {selectedAnswerText}
            </p>
          ) : (
            <p className="text-slate-500 italic">
              No answer selected yet. Your choice will appear here.
            </p>
          )}
        </div>
      )}

      {session.phase === 'strategy-review' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Correct Answer</h3>
          <p className="text-slate-700 font-medium">
            ({String.fromCharCode(65 + currentQuestionData.correctAnswer)}) {currentQuestionData.options[currentQuestionData.correctAnswer]}
          </p>
        </div>
      )}

      {/* Circuit Builder */}
      {(session.phase === 'blind-review' || session.phase === 'strategy-review') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Circuit Builder</h3>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-teal-600 mr-2" />
              <span className="font-medium text-teal-800">Build Your Circuit</span>
            </div>
            <p className="text-sm text-teal-700">
              Map out the logical structure of this argument to earn circuit points.
            </p>
          </div>

          <button
            onClick={onShowCircuitBuilder}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            Open Circuit Builder
          </button>

          {existingCircuitForQuestion && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 font-medium">
                Circuit Created ✓
              </div>
              <div className="text-green-700 text-sm">
                Quality Score: {existingCircuitForQuestion.analysisQuality}/100
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};