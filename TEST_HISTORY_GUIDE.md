# Test History System - Testing Guide

## Overview
The Test History system is now fully implemented and ready for testing. It tracks every question attempt, section completion, and test completion across all three phases (timed, blind review, and strategy review).

**NEW: Demo Mode Support** - The system now works seamlessly in demo mode (without authentication), storing all history data in localStorage. When you log out in demo mode, all local history data is automatically cleared.

## What's Been Implemented

### Database Schema (Step 1)
- **question_attempts** - Records every individual question attempt with complete metadata
- **section_completions** - Aggregates section-level performance data
- **test_completions** - Tracks full test or partial test session completions

All tables have proper indexes, RLS policies, and foreign key constraints.

### Data Capture Service (Step 2)
- Automatic data recording when sections are completed
- Automatic data recording when tests are completed
- Batch insertion for efficiency
- Error handling and logging

### Query API (Step 3)
- 10 query methods to fetch different types of history data
- Filters by test ID, question type, phase, and more
- Performance aggregation by question type
- Recent activity tracking

## How to Test

### Prerequisites
1. You can test in either authenticated mode OR demo mode (no login required)
2. For authenticated testing: Make sure you're logged in and Supabase database is configured
3. For demo mode testing: Just use the application without logging in - data will be stored locally

### Testing Steps

#### 1. Test Data Recording (During Test Taking)
1. Start a new test session (any PrepTest, any phase)
2. Complete at least one section by:
   - Answering some questions
   - Optionally creating circuits
   - Optionally flagging questions
   - Optionally adding analysis notes
   - Submitting the section
3. The system will automatically record:
   - All question attempts from that section
   - Section completion summary
   - Test completion (if it was the last section)

#### 2. Test Data Retrieval (On Dashboard)
1. Go to the Dashboard
2. Look for the "Test History (Debug)" card in the right column (below Item Search)
3. Click the "Fetch Test History" button
4. View the results showing:
   - Number of test completions
   - Number of section completions
   - Recent activity count
   - Performance by question type count
5. Click "View Raw Data" to see the complete JSON response

#### 3. Check the Browser Console
- Open Developer Tools (F12)
- Check the Console tab for:
  - "Test History Results:" log with all fetched data
  - In demo mode, look for logs like "📝 Saving section completion to localStorage (demo mode)"
  - Any errors during insertion or retrieval

#### 4. Test Demo Mode Data Persistence
1. Complete a section while in demo mode
2. Refresh the browser page
3. Go to Test History page - your completed sections should still be there
4. Log out (click "Log Out" in the user dropdown)
5. Log back in - Test History should now be empty (data was cleared on logout)
6. Check browser localStorage (Developer Tools > Application > Local Storage):
   - Look for keys starting with "lsat-rewired-mock-"
   - After logout, these keys should be gone

#### 5. Verify in Supabase Dashboard (Optional - Authenticated Mode Only)
1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Check these tables for new records:
   - `question_attempts`
   - `section_completions`
   - `test_completions`

## What Gets Recorded

### For Each Question Attempt
- Session ID, Question ID, Test ID, Section ID
- Question metadata (type, order, section order)
- Answer data (selected answer, correct answer, correctness)
- Time spent on the question
- Whether a circuit was created and its quality score
- Whether the question was flagged
- Any analysis notes (Conclusion, Premises, Assumption, Answers)
- Timestamp of the attempt
- Current phase (timed, blind-review, or strategy-review)

### For Each Section Completion
- Session ID, Test ID, Section ID
- Section metadata (name, order, type LR/RC)
- Total questions in section
- Questions answered and questions correct
- Accuracy percentage
- Total time spent and average time per question
- Completion timestamp
- Current phase

### For Each Test Completion
- Session ID, Test ID
- Completion timestamp
- Current phase
- Time mode (for timed phase)
- Whether it was a full test (all 4 sections)
- Number of sections completed
- Total questions and questions correct
- Overall accuracy percentage
- Total time in minutes

## Expected Results

### After Completing Your First Section
- You should see 1 section completion record
- You should see 20-26 question attempt records (depending on section type)
- All records should be linked to your user ID
- All records should show the correct phase you were in

### After Completing Multiple Sections
- Section completions count should increase
- Question attempts count should grow
- Performance by question type should show aggregated stats

### After Completing a Full Test or Phase
- You should see a test completion record
- The test completion should show overall stats across all sections

## Troubleshooting

### No Data Shows Up
1. **Demo Mode:** Data should appear immediately - check localStorage in DevTools
2. **Authenticated Mode:** Check that you're logged in
3. Check the browser console for errors
4. Verify your Supabase connection in .env file
5. Make sure you actually completed a section (pressed Submit)
6. Try refreshing the Test History page

### Errors in Console
- "User not authenticated" - You need to log in
- "Error inserting..." - Check Supabase connection and RLS policies
- Any other errors - Check the console logs for details

## Next Steps

After testing confirms the system is working:
1. The debug card can be removed or hidden
2. A proper History/Analytics UI can be built using the query API
3. Additional analytics features can be added (charts, trends, etc.)
4. The system is ready for production use

## Available Query Methods

From `testHistoryService`:

- `getAllQuestionAttempts(limit?)` - Get all question attempts
- `getQuestionAttemptsByTest(testId, phase?)` - Get attempts for a specific test
- `getQuestionAttemptsByType(questionType, phase?)` - Get attempts by question type
- `getSectionCompletions(limit?)` - Get all section completions
- `getSectionCompletionsByTest(testId, phase?)` - Get section completions for a test
- `getTestCompletions(limit?)` - Get all test completions
- `getTestCompletionsByTestId(testId)` - Get completions for a specific test
- `getPerformanceByQuestionType(phase?)` - Get aggregated performance stats
- `getRecentActivity(limit)` - Get recent test completions

All methods return `{ data: any[] | null; error?: string }`.
