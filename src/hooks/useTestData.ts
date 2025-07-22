// hooks/useTestData.ts
import { useMemo } from 'react';
import { processRawPrepTest } from '../utils/dataProcessing';
import rawPrepTest140 from '../data/fullPrepTest140.json';
import type { ProcessedPrepTest } from '../types/test-data';

export function useTestData() {
  const allProcessedTests = useMemo(() => {
    console.log('Processing test data...'); // Debug log to see when this runs
    
    const processed: { [key: string]: ProcessedPrepTest } = {};
    
    // Process all your raw test data here
    processed[LSAC140.moduleName] = processRawPrepTest(LSACTest140);
    
    // Add more tests as needed:
    // processed['PrepTest 141'] = processRawPrepTest(rawPrepTest141);
    // processed['PrepTest 142'] = processRawPrepTest(rawPrepTest142);
    
    console.log('Processed tests:', Object.keys(processed)); // Debug log
    
    return processed;
  }, []); // Empty dependency array since raw data doesn't change

  return {
    allProcessedTests,
    isLoading: false // Since processing is synchronous and cached
  };
}