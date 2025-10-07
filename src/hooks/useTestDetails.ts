// src/hooks/useTestDetails.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProcessedPrepTest, ProcessedSection, ProcessedQuestion } from '../types/test-data';

export function useTestDetails() {
  const [testData, setTestData] = useState<ProcessedPrepTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestById = useCallback(async (testId: string, sectionId?: string) => {
    console.log('[useTestDetails] Fetching full test data for:', testId, sectionId ? 'section: ' + sectionId : '(all sections)');
    console.log('[useTestDetails] Start time:', new Date().toISOString());
    setIsLoading(true);
    setError(null);

    try {
      // Fetch test metadata
      console.log('[useTestDetails] Step 1: Fetching test metadata...');
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('id, name')
        .eq('id', testId)
        .single();

      if (testError) {
        console.error('[useTestDetails] Test query error:', testError);
        throw testError;
      }
      console.log('[useTestDetails] Test found:', test.name);

      // Fetch sections (all or specific one)
      console.log('[useTestDetails] Step 2: Fetching sections...');
      let sectionsQuery = supabase
        .from('sections')
        .select('id, test_id, name, section_type, section_order')
        .eq('test_id', testId)
        .order('section_order', { ascending: true });

      if (sectionId) {
        sectionsQuery = sectionsQuery.eq('id', sectionId);
      }

      const { data: sections, error: sectionsError } = await sectionsQuery;
      if (sectionsError) {
        console.error('[useTestDetails] Sections query error:', sectionsError);
        throw sectionsError;
      }

      console.log('[useTestDetails] Fetched ' + (sections?.length || 0) + ' sections');

      // Fetch questions for these sections
      console.log('[useTestDetails] Step 3: Fetching questions...');
      const sectionIds = (sections || []).map(s => s.id);
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, section_id, passage, question_stem, correct_answer_index, question_order, question_type, conclusion_explanation, roles_explanation, assumption_explanation, prediction_explanation, correct_explanation, incorrect_explanation')
        .in('section_id', sectionIds)
        .order('question_order', { ascending: true });

      if (questionsError) {
        console.error('[useTestDetails] Questions query error:', questionsError);
        throw questionsError;
      }

      console.log('[useTestDetails] Fetched ' + (questions?.length || 0) + ' questions');

      // Fetch options for all questions in batches
      console.log('[useTestDetails] Step 4: Fetching options...');
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

        if (optionsError) {
          console.error('[useTestDetails] Options query error:', optionsError);
          throw optionsError;
        }
        allOptions = allOptions.concat(optionsBatch || []);
      }

      console.log('[useTestDetails] Fetched ' + allOptions.length + ' options');

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

      console.log('[useTestDetails] Successfully processed test:', test.name);
      console.log('[useTestDetails] Sections count:', processedSections.length);
      console.log('[useTestDetails] Total questions:', processedSections.reduce((sum, s) => sum + s.questions.length, 0));
      console.log('[useTestDetails] End time:', new Date().toISOString());
      setTestData(processedTest);
      return processedTest;

    } catch (err) {
      console.error('[useTestDetails] ERROR - Failed to fetch test details:', err);
      console.error('[useTestDetails] Error type:', typeof err);
      console.error('[useTestDetails] Error details:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
      console.log('[useTestDetails] Loading complete. IsLoading:', false);
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
