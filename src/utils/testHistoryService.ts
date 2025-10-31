import { supabase } from '../lib/supabase';
import type { TestSession, Circuit } from '../types/user';
import type { ProcessedQuestion, ProcessedSection } from '../types/test-data';

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

      if (!user) {
        return { success: false, error: 'User not authenticated' };
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

      if (!user) {
        return { success: false, error: 'User not authenticated' };
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

      if (!user) {
        return { success: false, error: 'User not authenticated' };
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

      if (!user) {
        return { success: false, error: 'User not authenticated' };
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
}

export const testHistoryService = new TestHistoryService();
