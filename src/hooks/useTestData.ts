// src/hooks/useTestData.ts
// LEGACY HOOK - Only used for Dashboard search functionality
// This will be replaced with server-side search in Phase 4
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessedPrepTest, ProcessedSection, ProcessedQuestion } from '../types/test-data';

export function useTestData() {
  const [allProcessedTests, setAllProcessedTests] = useState<{ [key: string]: ProcessedPrepTest }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      console.log('[LEGACY] useTestData: Fetching all tests for search functionality...');
      setIsLoading(true);
      try {
        // Fetch all tests
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('id, name');
        if (testsError) throw testsError;

        // Fetch all sections, ordered by their section_order
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('id, test_id, name, section_type, section_order')
          .order('section_order', { ascending: true });
        if (sectionsError) throw sectionsError;
      
        // Fetch all questions with explanations using pagination
        const batchSize = 1000;
        let allQuestions: any[] = [];
        let from = 0;
        let to = batchSize - 1;
        let hasMoreQuestions = true;

        while (hasMoreQuestions) {
          const { data: questionsBatch, error: questionsError } = await supabase
            .from('questions')
            .select('id, section_id, passage, question_stem, correct_answer_index, question_order, question_type, conclusion_explanation, roles_explanation, assumption_explanation, prediction_explanation, correct_explanation, incorrect_explanation, is_excluded, excluded_reason')
            .order('question_order', { ascending: true })
            .range(from, to);

          if (questionsError) throw questionsError;
          allQuestions = allQuestions.concat(questionsBatch);

          if (questionsBatch.length < batchSize) {
            hasMoreQuestions = false;
          } else {
            from += batchSize;
            to += batchSize;
          }
        }

        console.log('[LEGACY] useTestData: Fetched ' + allQuestions.length + ' total questions');

        // Fetch all question options using pagination
        const batchSize2 = 1000;
        let allOptions: any[] = [];
        let from2 = 0;
        let to2 = batchSize2 - 1;
        let hasMoreOptions = true;

        while (hasMoreOptions) {
          const { data: optionsBatch, error: optionsError } = await supabase
            .from('question_options')
            .select('id, question_id, option_letter, option_text, option_order')
            .order('id', { ascending: true })
            .range(from2, to2);

          if (optionsError) throw optionsError;
          allOptions = allOptions.concat(optionsBatch);

          if (optionsBatch.length < batchSize2) {
            hasMoreOptions = false;
          } else {
            from2 += batchSize2;
            to2 += batchSize2;
          }
        }

        // Map options to questions
        const optionsMap = new Map<string, { optionLetter: string; optionText: string; optionOrder: number }[]>();
        allOptions.forEach(opt => {
          const questionIdString = String(opt.question_id);
          if (!optionsMap.has(questionIdString)) {
            optionsMap.set(questionIdString, []);
          }
          optionsMap.get(questionIdString)?.push({
            optionLetter: opt.option_letter,
            optionText: opt.option_text,
            optionOrder: opt.option_order
          });
        });

        // Map questions to sections
        const questionsMap = new Map<string, ProcessedQuestion[]>();
        allQuestions.forEach(q => {
          const questionIdString = String(q.id);
          const rawOptionsForQuestion = optionsMap.get(questionIdString) || [];
          
          const processedOptions = rawOptionsForQuestion
            .sort((a, b) => a.optionOrder - b.optionOrder)
            .map(opt => opt.optionText);

          const processedQuestion: ProcessedQuestion = {
            id: q.id,
            passage: q.passage,
            question: q.question_stem,
            options: processedOptions,
            correctAnswer: q.correct_answer_index,
            type: q.question_type,
            question_order: q.question_order,
            isExcluded: q.is_excluded || false,
            excludedReason: q.excluded_reason || undefined,
            explanations: {
              conclusion: q.conclusion_explanation,
              roles: q.roles_explanation,
              assumption: q.assumption_explanation,
              prediction: q.prediction_explanation,
              correct: q.correct_explanation,
              incorrect: q.incorrect_explanation
            }
          };

          if (!questionsMap.has(q.section_id)) {
            questionsMap.set(q.section_id, []);
          }
          questionsMap.get(q.section_id)?.push(processedQuestion);
        });

        // Map sections to tests
        const sectionsMap = new Map<string, ProcessedSection[]>();
        sections.forEach(s => {
          const questionsForSection = questionsMap.get(s.id) || [];

          const processedSection: ProcessedSection = {
            id: s.id,
            name: s.name,
            questions: questionsForSection,
          };
          if (!sectionsMap.has(s.test_id)) {
            sectionsMap.set(s.test_id, []);
          }
          sectionsMap.get(s.test_id)?.push(processedSection);
        });

        // Assemble final processed tests
        const processed: { [key: string]: ProcessedPrepTest } = {};
        tests.forEach(t => {
          const processedSections = (sectionsMap.get(t.id) || []);

          processed[t.id] = {
            id: t.id,
            name: t.name,
            sections: processedSections,
          };
        });

        setAllProcessedTests(processed);
        console.log('[LEGACY] useTestData: Processed ' + Object.keys(processed).length + ' tests');
      } catch (error) {
        console.error('[LEGACY] useTestData: Error fetching test data:', error);
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
