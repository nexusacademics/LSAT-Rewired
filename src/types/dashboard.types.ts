// src/types/dashboard.types.ts

// This interface should match the structure of your ProcessedQuestion
// as defined in src/types/test-data.ts, but include any additional
// fields you're adding for search results (like test_name, section_order, etc.)
export interface ProcessedQuestion {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: string;
  explanations?: {
    conclusion?: string;
    roles?: string;
    assumption?: string;
    prediction?: string;
    correct?: string;
    incorrect?: string;
  };
  // Fields added for search results
  test_name?: string;
  test_id?: string;
  section_name?: string;
  section_id?: string;
  section_order?: number;
  section_type?: string;
  question_order?: number;
  testName?: string; // Fallback for older data
  question_stem?: string; // Fallback for older data
  correct_answer_index?: number; // Fallback for older data
  order?: number; // Fallback for older data
}

export interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ProcessedQuestion[];
  onSelect: (question: ProcessedQuestion) => void;
  initialSelectedQuestion?: ProcessedQuestion | null;
  disableBackToResults?: boolean;
  searchTerm?: string; // Add this new property
}
