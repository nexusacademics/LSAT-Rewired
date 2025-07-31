// components/ResultsPage.tsx
import React, { useState, useEffect } from 'react';
import PassagePanel from './TripleReview/PassagePanel';
import QuestionPanel from './TripleReview/QuestionPanel';
import AnalysisPanel from './TripleReview/AnalysisPanel';
import { ProcessedPrepTest, ProcessedQuestion, QuestionAnalysisNotes } from '../types/user';
import { TestSession } from '../App'; // You may need to adjust import path
import { useParams } from 'react-router-dom'; // optional if using route param
import { supabase } from '../lib/supabase';

interface ResultsPageProps {
  testId?: string;
  questionId?: string;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ testId, questionId }) => {
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ProcessedQuestion | null>(null);
  const [notes, setNotes] = useState<QuestionAnalysisNotes>({
    prediction: '',
    reasoning: '',
    answerExplained: '',
    tags: '',
  });

  const { id: routeQuestionId } = useParams(); // if you're using route like /results/:id
  const resolvedQuestionId = questionId ?? routeQuestionId;

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId || !resolvedQuestionId) return;

      const { data, error } = await supabase
        .from('ProcessedPrepTests') // your actual Supabase table name
        .select('*')
        .eq('id', testId)
        .single();

      if (error) {
        console.error('Failed to fetch PrepTest:', error);
        return;
      }

      const testData: ProcessedPrepTest = data;
      const foundSection = testData.sections.find(section =>
        section.questions.some(q => q.id === resolvedQuestionId)
      );
      const foundQuestion = foundSection?.questions.find(q => q.id === resolvedQuestionId);

      if (foundQuestion) {
        setCurrentQuestion(foundQuestion);
        setSession({
          phase: 'blindReview', // or 'answerExplanation' if preferred
          testData,
          answeredQuestions: {},
          currentSectionId: foundSection?.id || '',
        });
      }
    };

    fetchTestData();
  }, [testId, resolvedQuestionId]);

  const handleNoteChange = (type: keyof QuestionAnalysisNotes, value: string) => {
    setNotes(prev => ({ ...prev, [type]: value }));
  };

  if (!session || !currentQuestion) {
    return <div className="p-8 text-center text-gray-500">Loading question...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4">
      <div className="md:w-1/2 w-full">
        <PassagePanel
          currentQuestionData={currentQuestion}
          session={session}
          selectedAnswerText={null}
          selectedAnswerIndex={undefined}
        />
      </div>
      <div className="md:w-1/2 w-full space-y-4">
        <QuestionPanel
          currentQuestionData={currentQuestion}
          session={session}
          selectedAnswerIndex={undefined}
          setSelectedAnswerIndex={() => {}} // no selection in view mode
          showBlindOverlay={true}
        />
        <AnalysisPanel
          currentQuestionData={currentQuestion}
          session={session}
          onNoteChange={handleNoteChange}
        />
      </div>
    </div>
  );
};

export default ResultsPage;
