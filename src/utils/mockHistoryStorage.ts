import type { QuestionAttemptData, SectionCompletionData, TestCompletionData } from './testHistoryService';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

const STORAGE_KEYS = {
  QUESTION_ATTEMPTS: 'lsat-rewired-mock-question-attempts',
  SECTION_COMPLETIONS: 'lsat-rewired-mock-section-completions',
  TEST_COMPLETIONS: 'lsat-rewired-mock-test-completions',
};

export class MockHistoryStorage {
  isMockUser(userId: string | undefined): boolean {
    return userId === MOCK_USER_ID || !userId;
  }

  private getStorageData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private setStorageData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider clearing old data.');
      }
    }
  }

  insertQuestionAttempt(data: QuestionAttemptData): { success: boolean; error?: string } {
    try {
      const attempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      attempts.push(data);
      this.setStorageData(STORAGE_KEYS.QUESTION_ATTEMPTS, attempts);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  insertQuestionAttemptsBatch(attempts: QuestionAttemptData[]): { success: boolean; error?: string; insertedCount?: number } {
    try {
      const existingAttempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      const updatedAttempts = [...existingAttempts, ...attempts];
      this.setStorageData(STORAGE_KEYS.QUESTION_ATTEMPTS, updatedAttempts);
      return { success: true, insertedCount: attempts.length };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  insertSectionCompletion(data: SectionCompletionData): { success: boolean; error?: string } {
    try {
      const completions = this.getStorageData<SectionCompletionData>(STORAGE_KEYS.SECTION_COMPLETIONS);
      completions.push(data);
      this.setStorageData(STORAGE_KEYS.SECTION_COMPLETIONS, completions);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  insertTestCompletion(data: TestCompletionData): { success: boolean; error?: string } {
    try {
      const completions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS);
      completions.push(data);
      this.setStorageData(STORAGE_KEYS.TEST_COMPLETIONS, completions);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  getAllQuestionAttempts(limit?: number): { data: any[] | null; error?: string } {
    try {
      let attempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      attempts.sort((a, b) => new Date(b.attempt_timestamp).getTime() - new Date(a.attempt_timestamp).getTime());

      if (limit) {
        attempts = attempts.slice(0, limit);
      }

      return { data: attempts };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getQuestionAttemptsByTest(testId: string, phase?: string): { data: any[] | null; error?: string } {
    try {
      let attempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      attempts = attempts.filter(a => a.test_id === testId);

      if (phase) {
        attempts = attempts.filter(a => a.phase === phase);
      }

      attempts.sort((a, b) => new Date(b.attempt_timestamp).getTime() - new Date(a.attempt_timestamp).getTime());

      return { data: attempts };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getQuestionAttemptsByType(questionType: string, phase?: string): { data: any[] | null; error?: string } {
    try {
      let attempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      attempts = attempts.filter(a => a.question_type === questionType);

      if (phase) {
        attempts = attempts.filter(a => a.phase === phase);
      }

      attempts.sort((a, b) => new Date(b.attempt_timestamp).getTime() - new Date(a.attempt_timestamp).getTime());

      return { data: attempts };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getSectionCompletions(limit?: number): { data: any[] | null; error?: string } {
    try {
      let completions = this.getStorageData<SectionCompletionData>(STORAGE_KEYS.SECTION_COMPLETIONS);
      completions.sort((a, b) => new Date(b.completion_timestamp).getTime() - new Date(a.completion_timestamp).getTime());

      if (limit) {
        completions = completions.slice(0, limit);
      }

      return { data: completions };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getSectionCompletionsByTest(testId: string, phase?: string): { data: any[] | null; error?: string } {
    try {
      let completions = this.getStorageData<SectionCompletionData>(STORAGE_KEYS.SECTION_COMPLETIONS);
      completions = completions.filter(c => c.test_id === testId);

      if (phase) {
        completions = completions.filter(c => c.phase === phase);
      }

      completions.sort((a, b) => new Date(b.completion_timestamp).getTime() - new Date(a.completion_timestamp).getTime());

      return { data: completions };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getTestCompletions(limit?: number): { data: any[] | null; error?: string } {
    try {
      let completions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS);
      completions.sort((a, b) => new Date(b.completion_timestamp).getTime() - new Date(a.completion_timestamp).getTime());

      if (limit) {
        completions = completions.slice(0, limit);
      }

      return { data: completions };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getTestCompletionsByTestId(testId: string): { data: any[] | null; error?: string } {
    try {
      let completions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS);
      completions = completions.filter(c => c.test_id === testId);
      completions.sort((a, b) => new Date(b.completion_timestamp).getTime() - new Date(a.completion_timestamp).getTime());

      return { data: completions };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getPerformanceByQuestionType(phase?: string): { data: any[] | null; error?: string } {
    try {
      let attempts = this.getStorageData<QuestionAttemptData>(STORAGE_KEYS.QUESTION_ATTEMPTS);
      attempts = attempts.filter(a => a.question_type !== null);

      if (phase) {
        attempts = attempts.filter(a => a.phase === phase);
      }

      const aggregated = attempts.reduce((acc: any, attempt: QuestionAttemptData) => {
        const key = `${attempt.question_type}-${attempt.phase}`;
        if (!acc[key]) {
          acc[key] = {
            question_type: attempt.question_type,
            phase: attempt.phase,
            total: 0,
            correct: 0,
            accuracy: 0
          };
        }
        acc[key].total++;
        if (attempt.is_correct) {
          acc[key].correct++;
        }
        acc[key].accuracy = (acc[key].correct / acc[key].total) * 100;
        return acc;
      }, {});

      return { data: Object.values(aggregated) };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getRecentActivity(limit: number = 10): { data: any[] | null; error?: string } {
    try {
      let completions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS);
      completions.sort((a, b) => new Date(b.completion_timestamp).getTime() - new Date(a.completion_timestamp).getTime());
      completions = completions.slice(0, limit);

      return { data: completions };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getAllActivity(limit?: number): { data: any[] | null; error?: string } {
    try {
      const testCompletions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS)
        .map(item => ({ ...item, activity_type: 'test_completion' }));

      const sectionCompletions = this.getStorageData<SectionCompletionData>(STORAGE_KEYS.SECTION_COMPLETIONS)
        .map(item => ({ ...item, activity_type: 'section_completion' }));

      const allActivity = [...testCompletions, ...sectionCompletions];

      allActivity.sort((a, b) => {
        const aTime = new Date(a.completion_timestamp).getTime();
        const bTime = new Date(b.completion_timestamp).getTime();
        return bTime - aTime;
      });

      const limitedActivity = limit ? allActivity.slice(0, limit) : allActivity;

      return { data: limitedActivity };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  getActivityByPhase(phase: 'timed' | 'blind-review' | 'strategy-review', limit?: number): { data: any[] | null; error?: string } {
    try {
      const testCompletions = this.getStorageData<TestCompletionData>(STORAGE_KEYS.TEST_COMPLETIONS)
        .filter(item => item.phase === phase)
        .map(item => ({ ...item, activity_type: 'test_completion' }));

      const sectionCompletions = this.getStorageData<SectionCompletionData>(STORAGE_KEYS.SECTION_COMPLETIONS)
        .filter(item => item.phase === phase)
        .map(item => ({ ...item, activity_type: 'section_completion' }));

      const allActivity = [...testCompletions, ...sectionCompletions];

      allActivity.sort((a, b) => {
        const aTime = new Date(a.completion_timestamp).getTime();
        const bTime = new Date(b.completion_timestamp).getTime();
        return bTime - aTime;
      });

      const limitedActivity = limit ? allActivity.slice(0, limit) : allActivity;

      return { data: limitedActivity };
    } catch (error) {
      return { data: null, error: String(error) };
    }
  }

  clearAllMockData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTION_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.SECTION_COMPLETIONS);
      localStorage.removeItem(STORAGE_KEYS.TEST_COMPLETIONS);
      console.log('✅ Cleared all mock history data from localStorage');
    } catch (error) {
      console.error('Error clearing mock history data:', error);
    }
  }
}

export const mockHistoryStorage = new MockHistoryStorage();
