// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  lawhubCredentials?: {
    username: string;
    verified: boolean;
  };
  stats: {
    circuitsCreated: number;
    testsCompleted: number;
    averageAnalysisScore: number;
    rank: number;
  };
}

export interface QuestionAnalysisNotes {
  questionTypeAnalysis: string;
  argumentStructure: string;
  answerChoiceAnalysis: string;
}

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  phase: 'timed' | 'blind-review' | 'strategy-review';
  timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed';
  customTimeMinutes?: number;
  startTime: Date;
  endTime?: Date;
  circuits: Circuit[];
  flaggedQuestions: string[];
  answeredQuestions: { [questionId: string]: number };
  timedAnswers: { [questionId: string]: number };
  blindReviewAnswers: { [questionId: string]: number };
  analysisNotes: { [questionId: string]: QuestionAnalysisNotes };
  currentSectionIndex: number;
  selectedSectionId?: string;
  completedSectionIds: string[];
  completedPhases: ('timed' | 'blind-review' | 'strategy-review')[];
}

export interface Circuit {
  id: string;
  questionId: string;
  diagram: DiagramNode[];
  annotations: string[];
  analysisQuality: number;
  createdAt: Date;
}

export interface DiagramNode {
  id: string;
  type: 'premise' | 'conclusion' | 'assumption' | 'counterexample' | 'connector' | 'assumed-valid' | 'assumed-invalid' | 'implied-correct' | 'conclusion-subject' | 'conclusion-predicate' | 'minor-premise' | 'major-premise' | 'backing-premise' | 'counterclaim' | 'correct-answer';
  shape: 'rectangle' | 'rounded-rectangle' | 'ellipse';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  connections: { targetId: string; style: 'solid' | 'dashed' }[];
}