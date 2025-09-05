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
  question_type: string;
  // Add other fields you want to show in search results
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
          sections!inner(
            id,
            name,
            tests!inner(
              id,
              name
            )
          )
        `)
        .or(`question_stem.ilike.%${searchTerm}%,passage.ilike.%${searchTerm}%`)
        .limit(50); // Limit results to manage data usage

      if (error) throw error;

      // Transform the nested data structure
      const transformedResults: SearchResult[] = data.map(question => ({
        id: question.id,
        question_stem: question.question_stem,
        passage: question.passage,
        test_id: question.sections.tests.id,
        test_name: question.sections.tests.name,
        section_id: question.sections.id,
        section_name: question.sections.name,
        question_type: question.question_type
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

  const clearSearch = () => {
    setSearchResults([]);
    setSearchError(null);
  };

  return {
    searchResults,
    isSearching,
    searchError,
    searchQuestions,
    clearSearch
  };
}