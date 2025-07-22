// utils/dataProcessing.ts
import type { 
  RawPrepTest, 
  ProcessedPrepTest, 
  ProcessedSection, 
  ProcessedQuestion 
} from '../types/test-data';

export function processRawPrepTest(rawData: RawPrepTest): ProcessedPrepTest {
  // Helper to strip HTML tags and convert escaped newlines
  const stripHtmlTags = (html: string): string => {
  // Replace </p> tags with double newlines to preserve paragraph breaks
  let cleaned = html.replace(/<\/p>/g, '\n\n');
  // Remove all other HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  // Convert any remaining escaped newlines (e.g., if they were in attributes)
  cleaned = cleaned.replace(/\\n/g, '\n');
  // Trim leading/trailing whitespace
  return cleaned.trim();
};


  // Helper to convert option letter to 0-indexed number
  const optionLetterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  const processedSections: ProcessedSection[] = rawData.sections.map(rawSection => {
    const sectionType = rawSection.sectionId.startsWith('LR') ? 'Logical Reasoning' :
                        rawSection.sectionId.startsWith('RC') ? 'Reading Comprehension' :
                        'Question'; // Default for other types

    const processedQuestions: ProcessedQuestion[] = rawSection.items.map(item => {
      const processedOptions = item.options.map(opt => stripHtmlTags(opt.optionContent));
      const processedCorrectAnswer = optionLetterToIndex(item.correctAnswer);

      return {
        id: item.itemId,
        passage: stripHtmlTags(item.stimulusText),
        question: stripHtmlTags(item.stemText),
        options: processedOptions,
        correctAnswer: processedCorrectAnswer,
        type: sectionType,
      };
    });

    return {
      id: rawSection.sectionId,
      name: rawSection.sectionName, // Use sectionName from JSON for display
      questions: processedQuestions,
    };
  });

  return {
    id: rawData.moduleName, // Use moduleName as the ID for the PrepTest
    name: rawData.moduleName,
    sections: processedSections,
  };
}