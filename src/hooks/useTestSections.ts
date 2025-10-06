// src/hooks/useTestSections.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SectionMetadata {
  id: string;
  test_id: string;
  name: string;
  section_type: string;
  section_order: number;
  question_count?: number;
}

export function useTestSections() {
  const [sections, setSections] = useState<SectionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSectionsForTest = useCallback(async (testId: string) => {
    console.log('Fetching sections for test:', testId);
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('id, test_id, name, section_type, section_order')
        .eq('test_id', testId)
        .order('section_order', { ascending: true });

      if (sectionsError) throw sectionsError;

      // Optionally fetch question counts for each section
      const sectionsWithCounts = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('section_id', section.id);
          
          return {
            ...section,
            question_count: count || 0
          };
        })
      );

      const count = sectionsWithCounts.length;
      console.log('Fetched ' + count + ' sections for test ' + testId);
      setSections(sectionsWithCounts);
      return sectionsWithCounts;
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSections = useCallback(() => {
    setSections([]);
    setError(null);
  }, []);

  return {
    sections,
    isLoading,
    error,
    fetchSectionsForTest,
    clearSections
  };
}
