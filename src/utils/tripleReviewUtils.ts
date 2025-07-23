// utils/tripleReviewUtils.ts
import { ProcessedSection } from '../App';

export const calculateScore = (
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

export const getInitialTime = (timeMode: string, customTimeMinutes?: number) => {
  const baseTime = 35 * 60; // 35 minutes in seconds
  switch (timeMode) {
    case '1.5x': return Math.floor(baseTime * 1.5);
    case '2x': return baseTime * 2;
    case 'custom': return (customTimeMinutes || 35) * 60;
    case 'untimed': return Infinity;
    default: return baseTime;
  }
};

export const formatSectionDisplayName = (section: ProcessedSection, index: number) => {
  return `Section ${index + 1}`;
};

export const getPhaseColor = (phase: string) => {
  switch (phase) {
    case 'timed': return 'blue';
    case 'blind-review': return 'teal';
    case 'strategy-review': return 'orange';
    default: return 'slate';
  }
};

export const getPhaseTitle = (phase: string) => {
  switch (phase) {
    case 'timed': return 'Timed Test';
    case 'blind-review': return 'Blind Review';
    case 'strategy-review': return 'Strategy Review & Action Plan';
    default: return 'Test Session';
  }
};

export const getTimeDisplay = (timeRemaining: number) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getTimerColor = (timeRemaining: number) => {
  if (timeRemaining <= 60) return 'text-red-600';
  if (timeRemaining <= 300) return 'text-orange-600';
  return 'text-slate-900';
};

export const getTimerBgColor = (timeRemaining: number) => {
  if (timeRemaining <= 60) return 'bg-red-100';
  if (timeRemaining <= 300) return 'bg-orange-100';
  return '';
};