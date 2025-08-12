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
  console.log('🔵 handleToggleFlag called with questionId:', questionId);
  console.log('🔵 Current session.phase:', session.phase);
  console.log('🔵 Current session.questionFlags:', session.questionFlags);
  
  const currentFlags = session.questionFlags?.[questionId] || {};
  console.log('🔵 Current flags for this question:', currentFlags);
  
  const updatedFlags = { ...currentFlags };
  
  // Toggle the appropriate flag based on current phase
  switch (session.phase) {
    case 'timed':
      updatedFlags.timedSection = !currentFlags.timedSection;
      console.log('🔵 Toggling timedSection to:', updatedFlags.timedSection);
      break;
    case 'blind-review':
      updatedFlags.blindReview = !currentFlags.blindReview;
      console.log('🔵 Toggling blindReview to:', updatedFlags.blindReview);
      break;
    case 'strategy-review':
      updatedFlags.strategyPlanning = !currentFlags.strategyPlanning;
      console.log('🔵 Toggling strategyPlanning to:', updatedFlags.strategyPlanning);
      break;
  }
  
  console.log('🔵 Final updatedFlags:', updatedFlags);
  
  // Update session with new flags - handle undefined questionFlags
  const updatedSession = {
    ...session,
    questionFlags: {
      ...(session.questionFlags || {}), // Handle undefined case
      [questionId]: updatedFlags
    }
  };
  
  console.log('🔵 Updated session being sent:', updatedSession);
  onUpdateSession(updatedSession);
};

  const handleNoteChange = (questionId: string, noteType: 'Conclusion' | 'Premises' | 'Assumption' | 'Answers', value: string) => {
  onUpdateSession({
    ...session,
    analysisNotes: {
      ...session.analysisNotes,
      [questionId]: {
        ...(session.analysisNotes[questionId] || { 
          Conclusion: '', 
          Premises: '', 
          Assumption: '',
          Answers: ''
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