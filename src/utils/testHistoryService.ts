import { supabase } from '../lib/supabase';
import type { TestSession, Circuit } from '../types/user';
import type { ProcessedQuestion, ProcessedSection } from '../types/test-data';
import { mockHistoryStorage } from './mockHistoryStorage';

export interface QuestionAttemptData {
  session_id: string;
  question_id: string;
  test_id: string;
  test_name: string;
  section_id: string;
  section_name: string;
  section_order: number;
  question_order: number;
  question_type: string | null;
  attempt_timestamp: string;
  phase: 'timed' | 'blind-review' | 'strategy-review';
  selected_answer_index: number | null;
  correct_answer_index: number;
  is_correct: boolean;
  time_spent_seconds: number;
  has_circuit: boolean;
  circuit_quality_score: number | null;
  was_flagged: boolean;
  notes: string | null;
}

export interface SectionCompletionData {
  session_id: string;
  test_id: string;
  test_name: string;
  section_id: string;
  section_name: string;
  section_order: number;
  section_type: 'LR' | 'RC';
  completion_timestamp: string;
  phase: 'timed' | 'blind-review' | 'strategy-review';
  total_questions: number;
  questions_answered: number;
  questions_correct: number;
  accuracy_percentage: number;
  total_time_seconds: number;
  average_time_per_question: number;
}

export interface TestCompletionData {
  session_id: string;
  test_id: string;
  test_name: string;
  completion_timestamp: string;
  phase: 'timed' | 'blind-review' | 'strategy-review';
  time_mode: string | null;
  is_full_test: boolean;
  sections_completed: number;
  total_questions: number;
  questions_correct: number;
  overall_accuracy: number;
  total_time_minutes: number;
}

class TestHistoryService {
  async insertQuestionAttempt(data: QuestionAttemptData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        console.log('📝 Saving question attempt to localStorage (demo mode)');
        return mockHistoryStorage.insertQuestionAttempt(data);
      }

      const { error } = await supabase
        .from('question_attempts')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) {
        console.error('Error inserting question attempt:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Exception inserting question attempt:', err);
      return { success: false, error: String(err) };
    }
  }

  async insertQuestionAttemptsBatch(attempts: QuestionAttemptData[]): Promise<{ success: boolean; error?: string; insertedCount?: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        console.log(`📝 Saving ${attempts.length} question attempts to localStorage (demo mode)`);
        return mockHistoryStorage.insertQuestionAttemptsBatch(attempts);
      }

      const attemptsWithUserId = attempts.map(attempt => ({
        user_id: user.id,
        ...attempt
      }));

      const { error, count } = await supabase
        .from('question_attempts')
        .insert(attemptsWithUserId);

      if (error) {
        console.error('Error batch inserting question attempts:', error);
        return { success: false, error: error.message };
      }

      return { success: true, insertedCount: count || attempts.length };
    } catch (err) {
      console.error('Exception batch inserting question attempts:', err);
      return { success: false, error: String(err) };
    }
  }

  async insertSectionCompletion(data: SectionCompletionData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        console.log('📝 Saving section completion to localStorage (demo mode)');
        return mockHistoryStorage.insertSectionCompletion(data);
      }

      const { error } = await supabase
        .from('section_completions')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) {
        console.error('Error inserting section completion:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Exception inserting section completion:', err);
      return { success: false, error: String(err) };
    }
  }

  async insertTestCompletion(data: TestCompletionData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        console.log('📝 Saving test completion to localStorage (demo mode)');
        return mockHistoryStorage.insertTestCompletion(data);
      }

      const { error } = await supabase
        .from('test_completions')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) {
        console.error('Error inserting test completion:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Exception inserting test completion:', err);
      return { success: false, error: String(err) };
    }
  }

  buildQuestionAttemptData(
    session: TestSession,
    question: ProcessedQuestion,
    questionIndex: number,
    sectionData: ProcessedSection,
    sectionIndex: number,
    testName: string,
    timeSpentSeconds: number = 0
  ): QuestionAttemptData {
    const selectedAnswerIndex = session.answeredQuestions[question.id];
    const isCorrect = selectedAnswerIndex === question.correctAnswer;
    const circuit = session.circuits.find(c => c.questionId === question.id);
    const isFlagged = session.flaggedQuestions.includes(question.id);
    const notes = session.analysisNotes[question.id];
    const notesText = notes
      ? `Conclusion: ${notes.Conclusion}\nPremises: ${notes.Premises}\nAssumption: ${notes.Assumption}\nAnswers: ${notes.Answers}`
      : null;

    return {
      session_id: session.id,
      question_id: question.id,
      test_id: session.testId,
      test_name: testName,
      section_id: sectionData.id,
      section_name: sectionData.name,
      section_order: sectionIndex + 1,
      question_order: questionIndex + 1,
      question_type: question.type || null,
      attempt_timestamp: new Date().toISOString(),
      phase: session.phase,
      selected_answer_index: selectedAnswerIndex !== undefined ? selectedAnswerIndex : null,
      correct_answer_index: question.correctAnswer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      has_circuit: !!circuit,
      circuit_quality_score: circuit?.analysisQuality || null,
      was_flagged: isFlagged,
      notes: notesText
    };
  }

  buildSectionCompletionData(
    session: TestSession,
    sectionData: ProcessedSection,
    sectionIndex: number,
    testName: string,
    totalTimeSeconds: number = 0
  ): SectionCompletionData {
    const sectionQuestions = sectionData.questions.filter(q => !q.isExcluded);
    const answeredQuestions = sectionQuestions.filter(q => session.answeredQuestions[q.id] !== undefined);
    const correctQuestions = answeredQuestions.filter(q => session.answeredQuestions[q.id] === q.correctAnswer);

    const totalQuestions = sectionQuestions.length;
    const questionsAnswered = answeredQuestions.length;
    const questionsCorrect = correctQuestions.length;
    const accuracyPercentage = questionsAnswered > 0
      ? (questionsCorrect / questionsAnswered) * 100
      : 0;
    const averageTimePerQuestion = questionsAnswered > 0
      ? totalTimeSeconds / questionsAnswered
      : 0;

    const sectionType = sectionData.name.includes('Logical Reasoning') ? 'LR' : 'RC';

    return {
      session_id: session.id,
      test_id: session.testId,
      test_name: testName,
      section_id: sectionData.id,
      section_name: sectionData.name,
      section_order: sectionIndex + 1,
      section_type: sectionType,
      completion_timestamp: new Date().toISOString(),
      phase: session.phase,
      total_questions: totalQuestions,
      questions_answered: questionsAnswered,
      questions_correct: questionsCorrect,
      accuracy_percentage: Math.round(accuracyPercentage * 100) / 100,
      total_time_seconds: totalTimeSeconds,
      average_time_per_question: Math.round(averageTimePerQuestion * 100) / 100
    };
  }

  buildTestCompletionData(
    session: TestSession,
    testName: string,
    allSections: ProcessedSection[],
    totalTimeMinutes: number = 0
  ): TestCompletionData {
    let totalQuestions = 0;
    let questionsCorrect = 0;
    let questionsAnswered = 0;

    for (const section of allSections) {
      const sectionQuestions = section.questions.filter(q => !q.isExcluded);
      totalQuestions += sectionQuestions.length;

      for (const question of sectionQuestions) {
        const answeredIndex = session.answeredQuestions[question.id];
        if (answeredIndex !== undefined) {
          questionsAnswered++;
          if (answeredIndex === question.correctAnswer) {
            questionsCorrect++;
          }
        }
      }
    }

    const overallAccuracy = questionsAnswered > 0
      ? (questionsCorrect / questionsAnswered) * 100
      : 0;

    const isFullTest = !session.selectedSectionId && allSections.length === 4;
    const sectionsCompleted = session.completedSectionIds.length + 1;

    return {
      session_id: session.id,
      test_id: session.testId,
      test_name: testName,
      completion_timestamp: new Date().toISOString(),
      phase: session.phase,
      time_mode: session.phase === 'timed' ? (session.timeMode || 'regular') : null,
      is_full_test: isFullTest,
      sections_completed: sectionsCompleted,
      total_questions: totalQuestions,
      questions_correct: questionsCorrect,
      overall_accuracy: Math.round(overallAccuracy * 100) / 100,
      total_time_minutes: totalTimeMinutes
    };
  }

  async recordSectionCompletion(
    session: TestSession,
    sectionData: ProcessedSection,
    sectionIndex: number,
    testName: string,
    totalTimeSeconds: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    const sectionCompletionData = this.buildSectionCompletionData(
      session,
      sectionData,
      sectionIndex,
      testName,
      totalTimeSeconds
    );

    const questionAttempts: QuestionAttemptData[] = [];
    const sectionQuestions = sectionData.questions.filter(q => !q.isExcluded);

    for (let i = 0; i < sectionQuestions.length; i++) {
      const question = sectionQuestions[i];
      const attemptData = this.buildQuestionAttemptData(
        session,
        question,
        i,
        sectionData,
        sectionIndex,
        testName,
        0
      );
      questionAttempts.push(attemptData);
    }

    const sectionResult = await this.insertSectionCompletion(sectionCompletionData);
    if (!sectionResult.success) {
      return sectionResult;
    }

    const attemptsResult = await this.insertQuestionAttemptsBatch(questionAttempts);
    return attemptsResult;
  }

  async recordTestCompletion(
    session: TestSession,
    testName: string,
    allSections: ProcessedSection[],
    totalTimeMinutes: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    const testCompletionData = this.buildTestCompletionData(
      session,
      testName,
      allSections,
      totalTimeMinutes
    );

    return await this.insertTestCompletion(testCompletionData);
  }

  async getAllQuestionAttempts(limit?: number): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getAllQuestionAttempts(limit);
      }

      let query = supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('attempt_timestamp', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching question attempts:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching question attempts:', err);
      return { data: null, error: String(err) };
    }
  }

  async getQuestionAttemptsByTest(testId: string, phase?: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getQuestionAttemptsByTest(testId, phase);
      }

      let query = supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .order('attempt_timestamp', { ascending: false });

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching question attempts by test:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching question attempts by test:', err);
      return { data: null, error: String(err) };
    }
  }

  async getQuestionAttemptsByType(questionType: string, phase?: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getQuestionAttemptsByType(questionType, phase);
      }

      let query = supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_type', questionType)
        .order('attempt_timestamp', { ascending: false });

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching question attempts by type:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching question attempts by type:', err);
      return { data: null, error: String(err) };
    }
  }

  async getSectionCompletions(limit?: number): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getSectionCompletions(limit);
      }

      let query = supabase
        .from('section_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_timestamp', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching section completions:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching section completions:', err);
      return { data: null, error: String(err) };
    }
  }

  async getSectionCompletionsByTest(testId: string, phase?: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getSectionCompletionsByTest(testId, phase);
      }

      let query = supabase
        .from('section_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .order('completion_timestamp', { ascending: false });

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching section completions by test:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching section completions by test:', err);
      return { data: null, error: String(err) };
    }
  }

  async getTestCompletions(limit?: number): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getTestCompletions(limit);
      }

      let query = supabase
        .from('test_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_timestamp', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching test completions:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching test completions:', err);
      return { data: null, error: String(err) };
    }
  }

  async getTestCompletionsByTestId(testId: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getTestCompletionsByTestId(testId);
      }

      const { data, error } = await supabase
        .from('test_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_id', testId)
        .order('completion_timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching test completions by test ID:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching test completions by test ID:', err);
      return { data: null, error: String(err) };
    }
  }

  async getPerformanceByQuestionType(phase?: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getPerformanceByQuestionType(phase);
      }

      let query = supabase
        .from('question_attempts')
        .select('question_type, is_correct, phase')
        .eq('user_id', user.id)
        .not('question_type', 'is', null);

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching performance by question type:', error);
        return { data: null, error: error.message };
      }

      const aggregated = data?.reduce((acc: any, attempt: any) => {
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

      return { data: Object.values(aggregated || {}) };
    } catch (err) {
      console.error('Exception fetching performance by question type:', err);
      return { data: null, error: String(err) };
    }
  }

  async getRecentActivity(limit: number = 10): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getRecentActivity(limit);
      }

      const { data, error } = await supabase
        .from('test_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent activity:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err) {
      console.error('Exception fetching recent activity:', err);
      return { data: null, error: String(err) };
    }
  }

  async getAllActivity(limit?: number): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getAllActivity(limit);
      }

      const [testCompletionsResult, sectionCompletionsResult] = await Promise.all([
        supabase
          .from('test_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completion_timestamp', { ascending: false }),
        supabase
          .from('section_completions')
          .select('*')
          .eq('user_id', user.id)
          .order('completion_timestamp', { ascending: false })
      ]);

      if (testCompletionsResult.error) {
        console.error('Error fetching test completions:', testCompletionsResult.error);
        return { data: null, error: testCompletionsResult.error.message };
      }

      if (sectionCompletionsResult.error) {
        console.error('Error fetching section completions:', sectionCompletionsResult.error);
        return { data: null, error: sectionCompletionsResult.error.message };
      }

      const allActivity = [
        ...(testCompletionsResult.data || []).map(item => ({ ...item, activity_type: 'test_completion' })),
        ...(sectionCompletionsResult.data || []).map(item => ({ ...item, activity_type: 'section_completion' }))
      ];

      allActivity.sort((a, b) => {
        const aTime = new Date(a.completion_timestamp).getTime();
        const bTime = new Date(b.completion_timestamp).getTime();
        return bTime - aTime;
      });

      const limitedActivity = limit ? allActivity.slice(0, limit) : allActivity;

      return { data: limitedActivity };
    } catch (err) {
      console.error('Exception fetching all activity:', err);
      return { data: null, error: String(err) };
    }
  }

  async getActivityByPhase(phase: 'timed' | 'blind-review' | 'strategy-review', limit?: number): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || mockHistoryStorage.isMockUser(user.id)) {
        return mockHistoryStorage.getActivityByPhase(phase, limit);
      }

      const [testCompletionsResult, sectionCompletionsResult] = await Promise.all([
        supabase
          .from('test_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('phase', phase)
          .order('completion_timestamp', { ascending: false }),
        supabase
          .from('section_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('phase', phase)
          .order('completion_timestamp', { ascending: false })
      ]);

      if (testCompletionsResult.error) {
        console.error('Error fetching test completions by phase:', testCompletionsResult.error);
        return { data: null, error: testCompletionsResult.error.message };
      }

      if (sectionCompletionsResult.error) {
        console.error('Error fetching section completions by phase:', sectionCompletionsResult.error);
        return { data: null, error: sectionCompletionsResult.error.message };
      }

      const allActivity = [
        ...(testCompletionsResult.data || []).map(item => ({ ...item, activity_type: 'test_completion' })),
        ...(sectionCompletionsResult.data || []).map(item => ({ ...item, activity_type: 'section_completion' }))
      ];

      allActivity.sort((a, b) => {
        const aTime = new Date(a.completion_timestamp).getTime();
        const bTime = new Date(b.completion_timestamp).getTime();
        return bTime - aTime;
      });

      const limitedActivity = limit ? allActivity.slice(0, limit) : allActivity;

      return { data: limitedActivity };
    } catch (err) {
      console.error('Exception fetching activity by phase:', err);
      return { data: null, error: String(err) };
    }
  }
}

export const testHistoryService = new TestHistoryService();
