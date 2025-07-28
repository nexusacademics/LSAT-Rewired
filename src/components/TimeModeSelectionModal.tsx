import React from 'react';
import { TestSession, ProcessedQuestion, Circuit } from '../../App';

interface PassagePanelProps {
  currentQuestionData: ProcessedQuestion;
  session: TestSession;
  selectedAnswerText: string | null;
  selectedAnswerIndex: number | undefined;
  existingCircuitForQuestion: Circuit | undefined;
  onShowCircuitBuilder: () => void;
  isCircuitBuilderOpen: boolean; // Add this prop
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  currentQuestionData,
  session,
  selectedAnswerText,
  selectedAnswerIndex,
  isCircuitBuilderOpen // Add this to destructuring
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
      
      {/* Conditional Answer Display - Only show when circuit builder is open */}
      {isCircuitBuilderOpen && session.phase === 'blind-review' && (
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
      
      {isCircuitBuilderOpen && session.phase === 'strategy-review' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibent text-slate-900 mb-4">Correct Answer</h3>
          <p className="text-slate-700 font-medium">
            ({String.fromCharCode(65 + currentQuestionData.correctAnswer)}) {currentQuestionData.options[currentQuestionData.correctAnswer]}
          </p>
        </div>
      )}
    </div>
  );
};