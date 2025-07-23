// components/TripleReview/StrategySummary.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { TestSession, ProcessedPrepTest, ProcessedSection } from '../../App';

interface StrategySummaryProps {
  session: TestSession;
  processedPrepTest: ProcessedPrepTest;
  currentSections: ProcessedSection[];
  onClose: () => void;
}

const calculateScore = (
  answers: { [questionId: string]: number }, 
  targetSections: ProcessedSection[]
) => {
  let correctCount = 0;
  let totalQuestionsInScope = 0;

  for (const section of targetSections) {
    totalQuestionsInScope += section.questions.length;
    for (const question of section.questions) {
      if (answers.hasOwnProperty(question.id)) {
        if (answers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      }
    }
  }
  return { correct: correctCount, total: totalQuestionsInScope };
};

export const StrategySummary: React.FC<StrategySummaryProps> = ({
  session,
  processedPrepTest,
  currentSections,
  onClose
}) => {
  const timedScore = calculateScore(session.timedAnswers, currentSections);
  const blindReviewScore = calculateScore(session.blindReviewAnswers, currentSections);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full text-center my-4 max-h-[90vh] overflow-y-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
          Strategy Review: Performance Summary
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8">
          Review your performance across different phases for {processedPrepTest.name}
          {session.selectedSectionId ? ` - Section ${session.currentSectionIndex + 1}` : ''}.
        </p>

        {session.selectedSectionId ? (
          // Single section summary
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">Timed Phase</h2>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600">
                {timedScore.correct}/{timedScore.total}
              </p>
              <p className="text-sm sm:text-base text-blue-700 mt-2">Correct</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-teal-800 mb-2">Blind Review Phase</h2>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-600">
                {blindReviewScore.correct}/{blindReviewScore.total}
              </p>
              <p className="text-sm sm:text-base text-teal-700 mt-2">Correct</p>
            </div>
          </div>
        ) : (
          // Whole test summary - display per section
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10 max-h-96 overflow-y-auto">
            {processedPrepTest.sections.map((section, index) => {
              const sectionTimedAnswers: { [key: string]: number } = {};
              const sectionBlindReviewAnswers: { [key: string]: number } = {};

              // Filter answers relevant to this section
              section.questions.forEach(q => {
                if (session.timedAnswers.hasOwnProperty(q.id)) {
                  sectionTimedAnswers[q.id] = session