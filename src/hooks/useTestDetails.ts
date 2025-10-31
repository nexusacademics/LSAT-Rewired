// src/hooks/useTestDetails.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessedPrepTest, ProcessedSection, ProcessedQuestion } from '../types/test-data';

export function useTestDetails() {
  const [testData, setTestData] = useState<ProcessedPrepTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestById = useCallback(async (testId: string, sectionId?: string) => {
    console.log('Fetching full test data for:', testId, sectionId ? 'section: ' + sectionId : '(all sections)');
    setIsLoading(true);
    setError(null);

    try {
      // Fetch test metadata
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('id, name')
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      // Fetch sections (all or specific one)
      let sectionsQuery = supabase
        .from('sections')
        .select('id, test_id, name, section_type, section_order')
        .eq('test_id', testId)
        .order('section_order', { ascending: true });

      if (sectionId) {
        sectionsQuery = sectionsQuery.eq('id', sectionId);
      }

      const { data: sections, error: sectionsError } = await sectionsQuery;
      if (sectionsError) throw sectionsError;

      console.log('Fetched ' + (sections?.length || 0) + ' sections');

      // Fetch questions for these sections
      const sectionIds = (sections || []).map(s => s.id);
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, section_id, passage, question_stem, correct_answer_index, question_order, question_type, conclusion_explanation, roles_explanation, assumption_explanation, prediction_explanation, correct_explanation, incorrect_explanation, is_excluded, excluded_reason')
        .in('section_id', sectionIds)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;

      console.log('Fetched ' + (questions?.length || 0) + ' questions');

      // Fetch options for all questions in batches
      const questionIds = (questions || []).map(q => q.id);
      const batchSize = 1000;
      let allOptions: any[] = [];

      for (let i = 0; i < questionIds.length; i += batchSize) {
        const batchIds = questionIds.slice(i, i + batchSize);
        const { data: optionsBatch, error: optionsError } = await supabase
          .from('question_options')
          .select('id, question_id, option_letter, option_text, option_order')
          .in('question_id', batchIds)
          .order('option_order', { ascending: true });

        if (optionsError) throw optionsError;
        allOptions = allOptions.concat(optionsBatch || []);
      }

      console.log('Fetched ' + allOptions.length + ' options');

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
      (questions || []).forEach(q => {
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

      // Assemble sections with questions
      const processedSections: ProcessedSection[] = (sections || []).map(s => ({
        id: s.id,
        name: s.name,
        questions: questionsMap.get(s.id) || []
      }));

      const processedTest: ProcessedPrepTest = {
        id: test.id,
        name: test.name,
        sections: processedSections
      };

      console.log('Successfully processed test:', test.name);
      setTestData(processedTest);
      return processedTest;

    } catch (err) {
      console.error('Error fetching test details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearTestData = useCallback(() => {
    setTestData(null);
    setError(null);
  }, []);

  return {
    testData,
    isLoading,
    error,
    fetchTestById,
    clearTestData
  };
}
