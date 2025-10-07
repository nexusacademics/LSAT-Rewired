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
      console.log('[useTestMetadata] Starting fetch...');
      console.log('[useTestMetadata] Supabase URL:', supabase.supabaseUrl);
      setIsLoading(true);
      setError(null);

      try {
        console.log('[useTestMetadata] Querying tests table...');
        const startTime = Date.now();
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('id, name')
          .order('name', { ascending: true });

        const elapsed = Date.now() - startTime;
        console.log('[useTestMetadata] Query completed in ' + elapsed + 'ms');

        if (testsError) {
          console.error('[useTestMetadata] Query error:', testsError);
          console.error('[useTestMetadata] Error details:', JSON.stringify(testsError));
          throw testsError;
        }

        const count = tests ? tests.length : 0;
        console.log('[useTestMetadata] Successfully fetched ' + count + ' tests');

        if (count === 0) {
          console.warn('[useTestMetadata] No tests found in database');
        } else {
          console.log('[useTestMetadata] First 3 tests:', tests.slice(0, 3).map(t => t.name));
        }

        setTestMetadata(tests || []);
      } catch (err) {
        console.error('[useTestMetadata] Fetch failed:', err);
        console.error('[useTestMetadata] Error type:', typeof err);
        console.error('[useTestMetadata] Error object:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setTestMetadata([]);
      } finally {
        setIsLoading(false);
        console.log('[useTestMetadata] Fetch complete. Loading:', false, 'Error:', error);
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
