// hooks/useQuestionNavigation.ts
import { useRef } from 'react';
import { TestSession, ProcessedQuestion } from '../App';

interface UseQuestionNavigationProps {
  session: TestSession;
  questionsInCurrentSection: ProcessedQuestion[];
  onUpdateSession: (session: TestSession) => void;
}

export const useQuestionNavigation = ({
  session,
  questionsInCurrentSection,
  onUpdateSession
}: UseQuestionNavigationProps) => {
  const mainContentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextQuestion = () => {
    if (session.currentQuestionIndex < questionsInCurrentSection.length - 1) {
      onUpdateSession({ 
        ...session, 
        currentQuestionIndex: session.currentQuestionIndex + 1 
      });
      scrollToTop();
    }
  };

  const handlePreviousQuestion = () => {
    if (session.currentQuestionIndex > 0) {
      onUpdateSession({ 
        ...session, 
        currentQuestionIndex: session.currentQuestionIndex - 1 
      });
      scrollToTop();
    }
  };

  const handleQuestionJump = (index: number) => {
    onUpdateSession({ 
      ...session, 
      currentQuestionIndex: index 
    });
    scrollToTop();
  };

  const isLastQuestionOfSection = session.currentQuestionIndex === questionsInCurrentSection.length - 1;

  return {
    mainContentRef,
    handleNextQuestion,
    handlePreviousQuestion,
    handleQuestionJump,
    isLastQuestionOfSection
  };
};