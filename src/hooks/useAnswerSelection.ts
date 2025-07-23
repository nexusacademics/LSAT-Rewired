// hooks/useAnswerSelection.ts
import { useState } from 'react';
import { TestSession, ProcessedQuestion, QuestionAnalysisNotes } from '../App';

interface UseAnswerSelectionProps {
  session: TestSession;
  onUpdateSession: (session: TestSession) => void;
}

export const useAnswerSelection = ({
  session,
  onUpdateSession
}: UseAnswerSelectionProps) => {
  const [greyedOutOptions, setGreyedOutOptions] = useState<{[questionId: string]: number[]}>({});

  const handleAnswerSelection = (questionId: string, optionIndex: number) => {
    onUpdateSession({
      ...session,
      answeredQuestions: {
        ...session.answeredQuestions,
        [questionId]: optionIndex,
      },
    });

    setGreyedOutOptions(prev => {
      const currentGreyed = prev[questionId] || [];
      const newGreyed = currentGreyed.filter(idx => idx !== optionIndex);
      return { ...prev, [questionId]: newGreyed };
    });
  };

  const handleToggleGreyOut = (questionId: string, optionIndex: number) => {
    setGreyedOutOptions(prev => {
      const currentGreyed = prev[questionId] || [];
      let newGreyed;
      if (currentGreyed.includes(optionIndex)) {
        newGreyed = currentGreyed.filter(idx => idx !== optionIndex);
      } else {
        newGreyed = [...currentGreyed, optionIndex];
      }

      if (session.answeredQuestions[questionId] === optionIndex) {
        const newAnsweredQuestions = { ...session.answeredQuestions };
        delete newAnsweredQuestions[questionId];
        onUpdateSession({ ...session, answeredQuestions: newAnsweredQuestions });
      }

      return { ...prev, [questionId]: newGreyed };
    });
  };

  const handleToggleFlag = (questionId: string) => {
    const newFlaggedQuestions = session.flaggedQuestions.includes(questionId)
      ? session.flaggedQuestions.filter(id => id !== questionId)
      : [...session.flaggedQuestions, questionId];

    onUpdateSession({ ...session, flaggedQuestions: newFlaggedQuestions });
  };

  const handleNoteChange = (questionId: string, noteType: keyof QuestionAnalysisNotes, value: string) => {
    onUpdateSession({
      ...session,
      analysisNotes: {
        ...session.analysisNotes,
        [questionId]: {
          ...(session.analysisNotes[questionId] || { 
            questionTypeAnalysis: '', 
            argumentStructure: '', 
            answerChoiceAnalysis: '' 
          }),
          [noteType]: value,
        },
      },
    });
  };

  return {
    greyedOutOptions,
    handleAnswerSelection,
    handleToggleGreyOut,
    handleToggleFlag,
    handleNoteChange
  };
};