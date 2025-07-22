// types/test-data.ts
export interface RawPrepTest {
  sections: RawSection[];
  moduleName: string;
}

export interface RawSection {
  sectionId: string;
  sectionName: string;
  items: RawQuestionItem[];
}

export interface RawQuestionItem {
  itemId: string;
  stimulusText: string;
  stemText: string;
  options: { optionLetter: string; optionContent: string }[];
  correctAnswer: string;
}

export interface ProcessedQuestion {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: string;
}

export interface ProcessedSection {
  id: string;
  name: string;
  questions: ProcessedQuestion[];
}

export interface ProcessedPrepTest {
  id: string;
  name: string;
  sections: ProcessedSection[];
}