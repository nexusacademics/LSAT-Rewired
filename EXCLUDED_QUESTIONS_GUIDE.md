# Excluded Questions Guide

## Overview

Some PrepTests have questions that were removed by LSAC after publication (usually due to copyright issues or errors). These questions should be excluded from scoring but remain in the test for proper question numbering.

## How It Works

### 1. Data Structure

Each PrepTest JSON file can include an `excludedQuestions` array at the root level:

```json
{
  "moduleName": "PrepTest 139",
  "sections": [...],
  "excludedQuestions": [
    {
      "sectionOrder": 4,
      "questionNumber": 19,
      "reason": "Question removed by LSAC"
    }
  ]
}
```

### 2. Question Properties

When a question is marked as excluded:
- `isExcluded`: boolean flag set to true
- `excludedReason`: optional explanation string
- `question_order`: uses the actual position from the JSON (e.g., 19)

### 3. Scoring

Excluded questions are automatically filtered out when calculating scores:
- They don't count toward the total number of questions
- They don't affect the user's score whether answered correctly or not
- Example: PrepTest 139 Section 4 has 25 questions total, but only 24 count for scoring

### 4. Display

Excluded questions are shown with:
- Dimmed appearance in the question tracker (60% opacity)
- "(Excluded from scoring)" label in the header
- Tooltip indicating exclusion status
- Original question number preserved (e.g., question 19 is still shown as 19, not renumbered)

## Adding Excluded Questions to a PrepTest

### Step 1: Identify the Excluded Question

Determine which section and question number should be excluded. For example:
- PrepTest: 139
- Section: 4
- Question: 19

### Step 2: Update the JSON File

Add or update the `excludedQuestions` array in the PrepTest JSON:

```json
{
  "moduleName": "PrepTest 139",
  "sections": [...],
  "excludedQuestions": [
    {
      "sectionOrder": 4,
      "questionNumber": 19,
      "reason": "Question removed by LSAC"
    }
  ]
}
```

### Step 3: Verify

1. The question will still appear in the test
2. It will show as "Excluded from scoring" in the UI
3. The score calculation will automatically exclude it
4. Question numbers will display correctly (18, 19 [excluded], 20, etc.)

## Implementation Details

### Files Affected

- `src/types/test-data.ts` - Type definitions for excluded questions
- `src/utils/dataProcessing.ts` - Processes exclusion metadata
- `src/components/TripleReview/Header.tsx` - Displays exclusion status
- `src/components/TripleReview/QuestionTracker.tsx` - Shows question numbers and dimming
- `src/components/TripleReview/StrategySummary.tsx` - Filters excluded questions from scoring

### Key Functions

**`processRawPrepTest()`** - Marks questions as excluded based on the excludedQuestions array

**`calculateScore()`** - Filters out excluded questions before counting:
```typescript
const scorableQuestions = section.questions.filter(q => !q.isExcluded);
```

## Example: PrepTest 139

PrepTest 139, Section 4 originally had question 19 removed by LSAC:
- Total questions in JSON: 25 (numbered 1-25)
- Question at position 19 is excluded
- Total scorable questions: 24
- Question numbering shown to user: 1-18, 19 (excluded), 20-25

## Future Enhancements

Potential improvements:
1. Show excluded questions with a different background color
2. Add statistics showing how many questions were excluded
3. Allow filtering out excluded questions from search results
4. Add admin panel to manage exclusions
