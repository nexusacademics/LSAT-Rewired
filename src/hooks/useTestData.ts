// src/hooks/useTestData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessedPrepTest, ProcessedSection, ProcessedQuestion } from '../types/test-data';

export function useTestData() {
  const [allProcessedTests, setAllProcessedTests] = useState<{ [key: string]: ProcessedPrepTest }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      console.log('fetchTestData function is executing!');
      setIsLoading(true);
      try {
        // Fetch all tests
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('id, name');
        console.log('Supabase tests data:', tests);
        console.log('Supabase tests error:', testsError);
        if (testsError) throw testsError;

        // Fetch all sections, ordered by their section_order
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('id, test_id, name, section_type, section_order')
          .order('section_order', { ascending: true });
        console.log('Supabase sections data:', sections);
        console.log('Supabase sections error:', sectionsError);
        if (sectionsError) throw sectionsError;

        // Fetch all questions, ordered by their question_order
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id, section_id, passage, question_stem, correct_answer_index, question_order, question_type')
          .order('question_order', { ascending: true });
        console.log('Supabase questions data:', questions);
        console.log('Supabase questions error:', questionsError);
        if (questionsError) throw questionsError;

        // Fetch all question options, ordered by their option_order
        const batchSize = 1000;
let allOptions: any[] = [];
let from = 0;
let to = batchSize - 1;
let hasMoreOptions = true;

while (hasMoreOptions) {
  const { data: optionsBatch, error: optionsError } = await supabase
    .from('question_options')
    .select('id, question_id, option_letter, option_text, option_order')
    .order('option_order', { ascending: true })
    .range(from, to);

  if (optionsError) throw optionsError;

  allOptions = allOptions.concat(optionsBatch);

console.log(`Fetched options ${from} to ${to}:`, optionsBatch.length);
if (optionsBatch.length < batchSize) {
  hasMoreOptions = false; // Last batch
} else {
  from += batchSize;
  to += batchSize;
}

}

console.log('DEBUG: allOptions array after fetch:', allOptions); // ADD THIS LINE

       // Step 1: Map options to questions
      const optionsMap = new Map<string, { optionLetter: string; optionText: string; optionOrder: number }[]>();
      allOptions.forEach(opt => {
        const questionIdString = String(opt.question_id); // Convert to string for map key
        if (!optionsMap.has(questionIdString)) {
          optionsMap.set(questionIdString, []);
        }
        optionsMap.get(questionIdString)?.push({
          optionLetter: opt.option_letter,
          optionText: opt.option_text,
          optionOrder: opt.option_order
        });
        console.log(`Option added to map for question ${questionIdString}:`, opt.option_letter, opt.option_text);
      });
      console.log('Final optionsMap:', optionsMap);

     // Step 2: Map questions to sections
      const questionsMap = new Map<string, ProcessedQuestion[]>();
      questions.forEach(q => {
        const questionIdString = String(q.id); // Convert to string for map lookup
        const rawOptionsForQuestion = optionsMap.get(questionIdString) || []; // Get the array of options for this question
        console.log(`Raw options array length for question ${questionIdString}:`, rawOptionsForQuestion.length); // ADD THIS LOG

      // MODIFIED BLOCK: Detailed log for any problematic question (not exactly 5 options)
        if (rawOptionsForQuestion.length !== 5) { // Trigger if not exactly 5 options
          console.log(`DEBUG: Problematic question ${questionIdString} has ${rawOptionsForQuestion.length} options.`);
          console.log(`DEBUG: Raw options for question ${questionIdString}:`, rawOptionsForQuestion);
        }
        // END MODIFIED BLOCK
        
        const processedOptions = rawOptionsForQuestion
          .sort((a, b) => a.optionOrder - b.optionOrder) // Ensure options are sorted
          .map(opt => opt.optionText);
        console.log(`Processed options for question ${questionIdString}:`, processedOptions);

        const processedQuestion: ProcessedQuestion = {
          id: q.id,
          passage: q.passage,
          question: q.question_stem,
          options: processedOptions,
          correctAnswer: q.correct_answer_index,
          type: q.question_type,
        };
        console.log(`Processed question object for ${q.id}:`, processedQuestion);

        if (!questionsMap.has(q.section_id)) {
          questionsMap.set(q.section_id, []);
        }
        questionsMap.get(q.section_id)?.push(processedQuestion);
      });

        // Step 3: Map sections to tests
        const sectionsMap = new Map<string, ProcessedSection[]>();
        sections.forEach(s => {
          const processedQuestions = (questionsMap.get(s.id) || [])
            .sort((a, b) => a.question_order - b.question_order); // Ensure questions are sorted

          const processedSection: ProcessedSection = {
            id: s.id,
            name: s.name,
            questions: processedQuestions,
          };
          if (!sectionsMap.has(s.test_id)) {
            sectionsMap.set(s.test_id, []);
          }
          sectionsMap.get(s.test_id)?.push(processedSection);
        });

        // Step 4: Assemble final processed tests
       const processed: { [key: string]: ProcessedPrepTest } = {};
        tests.forEach(t => {
          const processedSections = (sectionsMap.get(t.id) || []); // Removed sort here as per previous plan

          processed[t.id] = {
            id: t.id,
            name: t.name,
            sections: processedSections,
          };
        });

        setAllProcessedTests(processed);
        console.log('Final processed tests:', processed);
      } catch (error) {
        console.error('Error fetching test data from Supabase:', error);
        // You might want to set an error state here to display to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, []);

  return {
    allProcessedTests,
    isLoading
  };
}
