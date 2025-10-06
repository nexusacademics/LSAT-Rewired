// src/hooks/useTestMetadata.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TestMetadata {
  id: string;
  name: string;
}

export function useTestMetadata() {
  const [testMetadata, setTestMetadata] = useState<TestMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestMetadata = async () => {
      console.log('Fetching lightweight test metadata only...');
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('id, name')
          .order('name', { ascending: true });

        if (testsError) throw testsError;

        const count = tests ? tests.length : 0;
        console.log('Fetched metadata for ' + count + ' tests');
        setTestMetadata(tests || []);
      } catch (err) {
        console.error('Error fetching test metadata:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestMetadata();
  }, []);

  return {
    testMetadata,
    isLoading,
    error
  };
}
