// components/TripleReview/AnalysisPanel.tsx
import React from 'react';
import { TestSession, ProcessedQuestion, QuestionAnalysisNotes } from '../../App';

interface AnalysisPanelProps {
  session: TestSession;
  currentQuestionData: ProcessedQuestion;
  onNoteChange: (noteType: keyof QuestionAnalysisNotes, value: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  session,
  currentQuestionData,
  onNoteChange
}) => {
  if (session.phase === 'timed') {
    return null;
  }

  const analysisNotes = session.analysisNotes[currentQuestionData.id] || {
    questionTypeAnalysis: '',
    argumentStructure: '',
    answerChoiceAnalysis: ''
  };

  const isBlindReview = session.phase === 'blind-review';
  const focusRingColor = isBlindReview ? 'focus:ring-teal-500 focus:border-teal-500' : 'focus:ring-orange-500 focus:border-orange-500';

  return (
    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
      {/* Analysis Template / Answer Explanations */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {isBlindReview ? 'Analysis Template' : 'Answer Explanations'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Question Type Analysis
            </label>
            <textarea
              rows={3}
              className={`w-full border border-slate-300 rounded-lg p-3 text-sm ${focusRingColor}`}
              placeholder="Identify the question type and what it's asking for..."
              value={analysisNotes.questionTypeAnalysis}
              onChange={(e) => onNoteChange('questionTypeAnalysis', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Argument Structure
            </label>
            <textarea
              rows={3}
              className={`w-full border border-slate-300 rounded-lg p-3 text-sm ${focusRingColor}`}
              placeholder="Break down the premises and conclusion..."
              value={analysisNotes.argumentStructure}
              onChange={(e) => onNoteChange('argumentStructure', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Answer Choice Analysis
            </label>
            <textarea
              rows={4}
              className={`w-full border border-slate-300 rounded-lg p-3 text-sm ${focusRingColor}`}
              placeholder="Evaluate each answer choice and explain why the correct answer works..."
              value={analysisNotes.answerChoiceAnalysis}
              onChange={(e) => onNoteChange('answerChoiceAnalysis', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Notes</h3>
        <textarea
          rows={4}
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Jot down thoughts, patterns, or insights..."
        />
      </div>
    </div>
  );
};