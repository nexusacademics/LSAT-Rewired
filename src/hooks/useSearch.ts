// src/hooks/useSearch.ts
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SearchResult {
  id: string;
  question_stem: string;
  passage?: string;
  test_id: string;
  test_name: string;
  section_id: string;
  section_name: string;
  section_order: number;
  question_type: string;
  question_order: number;
  correct_answer_index: number;
  options: string[];
  explanations?: {
    conclusion?: string;
    roles?: string;
    assumption?: string;
    prediction?: string;
    correct?: string;
    incorrect?: string;
  };
}

export function useSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchQuestions = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Search across questions with joins to get test and section info
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_stem,
          passage,
          question_type,
          question_order,
          correct_answer_index,
          conclusion_explanation,
          roles_explanation,
          assumption_explanation,
          prediction_explanation,
          correct_explanation,
          incorrect_explanation,
          sections!inner(
            id,
            name,
            section_order,
            tests!inner(
              id,
              name
            )
          )
        `)
        .or(`question_stem.ilike.%${searchTerm}%,passage.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) throw error;

      // Fetch options for all questions
      const questionIds = data.map(q => q.id);
      const { data: optionsData, error: optionsError } = await supabase
        .from('question_options')
        .select('question_id, option_text, option_order')
        .in('question_id', questionIds)
        .order('option_order', { ascending: true });

      if (optionsError) throw optionsError;

      // Group options by question_id
      const optionsMap = new Map<string, string[]>();
      optionsData.forEach(opt => {
        if (!optionsMap.has(opt.question_id)) {
          optionsMap.set(opt.question_id, []);
        }
        optionsMap.get(opt.question_id)?.push(opt.option_text);
      });

      // Transform the nested data structure
      const transformedResults: SearchResult[] = data.map(question => ({
        id: question.id,
        question_stem: question.question_stem,
        passage: question.passage,
        test_id: question.sections.tests.id,
        test_name: question.sections.tests.name,
        section_id: question.sections.id,
        section_name: question.sections.name,
        section_order: question.sections.section_order,
        question_type: question.question_type,
        question_order: question.question_order,
        correct_answer_index: question.correct_answer_index,
        options: optionsMap.get(question.id) || [],
        explanations: {
          conclusion: question.conclusion_explanation,
          roles: question.roles_explanation,
          assumption: question.assumption_explanation,
          prediction: question.prediction_explanation,
          correct: question.correct_explanation,
          incorrect: question.incorrect_explanation
        }
      }));

      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search questions. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchDirectQuestion = async (testNumber: string, sectionNumber: string, questionNumber: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const testNum = parseInt(testNumber, 10);
      const sectionOrder = parseInt(sectionNumber, 10);
      const questionOrder = parseInt(questionNumber, 10);

      if (isNaN(testNum) || isNaN(sectionOrder) || isNaN(questionOrder)) {
        throw new Error('Invalid number format');
      }

      // First, find the test by test_number
      const { data: tests, error: testError } = await supabase
        .from('tests')
        .select('id, name')
        .eq('test_number', testNum)
        .maybeSingle();

      if (testError) throw testError;
      if (!tests) {
        setSearchError(`PrepTest ${testNum} not found. Please check the test number.`);
        setSearchResults([]);
        return;
      }

      // Find the section by section_order
      const { data: sections, error: sectionError } = await supabase
        .from('sections')
        .select('id, name')
        .eq('test_id', tests.id)
        .eq('section_order', sectionOrder)
        .maybeSingle();

      if (sectionError) throw sectionError;
      if (!sections) {
        setSearchError(`Section ${sectionOrder} not found in PrepTest ${testNum}.`);
        setSearchResults([]);
        return;
      }

      // Find the question by question_order
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select(`
          id,
          question_stem,
          passage,
          question_type,
          question_order,
          correct_answer_index,
          conclusion_explanation,
          roles_explanation,
          assumption_explanation,
          prediction_explanation,
          correct_explanation,
          incorrect_explanation
        `)
        .eq('section_id', sections.id)
        .eq('question_order', questionOrder)
        .maybeSingle();

      if (questionError) throw questionError;
      if (!question) {
        setSearchError(`Question ${questionOrder} not found in Section ${sectionOrder} of PrepTest ${testNum}.`);
        setSearchResults([]);
        return;
      }

      // Fetch options for the question
      const { data: optionsData, error: optionsError } = await supabase
        .from('question_options')
        .select('option_text, option_order')
        .eq('question_id', question.id)
        .order('option_order', { ascending: true });

      if (optionsError) throw optionsError;

      const result: SearchResult = {
        id: question.id,
        question_stem: question.question_stem,
        passage: question.passage,
        test_id: tests.id,
        test_name: tests.name,
        section_id: sections.id,
        section_name: sections.name,
        section_order: sectionOrder,
        question_type: question.question_type,
        question_order: question.question_order,
        correct_answer_index: question.correct_answer_index,
        options: optionsData.map(opt => opt.option_text),
        explanations: {
          conclusion: question.conclusion_explanation,
          roles: question.roles_explanation,
          assumption: question.assumption_explanation,
          prediction: question.prediction_explanation,
          correct: question.correct_explanation,
          incorrect: question.incorrect_explanation
        }
      };

      setSearchResults([result]);
    } catch (error) {
      console.error('Direct search error:', error);
      setSearchError('Failed to find question. Please check your input and try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    searchResults,
    isSearching,
    searchError,
    searchQuestions,
    searchDirectQuestion,
    clearSearch
  };
}