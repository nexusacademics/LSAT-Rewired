# How to Upload New PrepTests to Database

## Overview

You have a working script (`scripts/migrateTestData.mjs`) that automatically uploads PrepTest JSON files to your Supabase database.

## Quick Start

### 1. Add Your JSON File

Place your new PrepTest JSON file in the `src/data/` directory:

```bash
src/data/fullPrepTest110.json  # Example new test
```

### 2. Run the Migration Script

From the project root directory:

```bash
node scripts/migrateTestData.mjs
```

That's it! The script will:
- Read all JSON files in `src/data/`
- Check if each test already exists (by name)
- Insert new tests, sections, questions, and options
- Skip duplicates automatically
- Show progress in console

## Expected JSON Structure

Your JSON files should have this structure:

```json
{
  "moduleName": "The Official LSAT PrepTest 110",
  "sections": [
    {
      "sectionId": "LR110A-1",
      "sectionOrder": 1,
      "sectionName": "Section 1: Logical Reasoning",
      "items": [
        {
          "itemId": "XG123456",
          "itemPosition": 1,
          "stimulusText": "<p>Passage text here...</p>",
          "stemText": "<p>Question text here...</p>",
          "correctAnswer": "A",
          "options": [
            {
              "optionLetter": "A",
              "optionContent": "<p>Option A text...</p>"
            },
            ...
          ]
        },
        ...
      ]
    },
    ...
  ]
}
```

## What the Script Does

### 1. Tests Table
- Inserts test name (e.g., "The Official LSAT PrepTest 110")
- Checks for duplicates by name
- Generates UUID automatically

### 2. Sections Table
- Inserts sections with:
  - `test_id` (links to test)
  - `name` (section name)
  - `section_type` (derived from sectionId: LR/RC)
  - `section_order` (position in test)
- Checks for duplicates by test_id + name

### 3. Questions Table
- Inserts questions with:
  - `section_id` (links to section)
  - `item_id` (unique identifier)
  - `passage` (cleaned HTML from stimulusText)
  - `question_stem` (cleaned HTML from stemText)
  - `correct_answer_index` (0-4, converted from A-E)
  - `question_order` (position in section)
  - `question_type` (LR or RC)
- Strips HTML tags automatically
- Converts escaped newlines
- Checks for duplicates by section_id + item_id

### 4. Question Options Table
- Inserts options (A-E) for each question
- Cleans HTML from option text
- Orders options properly
- Checks for duplicates by question_id + option_letter

## Environment Variables Required

The script needs these in your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** The script uses the SERVICE_ROLE_KEY (not anon key) to bypass Row Level Security and directly insert data.

## Console Output

You'll see output like this:

```
Starting data migration for The Official LSAT PrepTest 110 to Supabase...
Inserted test: The Official LSAT PrepTest 110 (ID: abc123...)
  Inserted section: Section 1: Logical Reasoning (ID: def456...)
    Inserted question: XG123456 (ID: ghi789...)
  Inserted section: Section 2: Reading Comprehension (ID: jkl012...)
    Inserted question: XG123457 (ID: mno345...)
...
Data migration for The Official LSAT PrepTest 110 completed.
```

## Error Handling

The script:
- Gracefully skips duplicates (won't fail if test already exists)
- Shows detailed error messages if something fails
- Processes each file independently (one failure won't stop others)
- Validates environment variables before starting

## Checking Upload Success

After running the script, verify in your app:

1. Reload dashboard
2. New test should appear in test list
3. Click "Start New Test Session"
4. Select the new test
5. Sections should appear with question counts
6. Start a session and verify all questions load

## Troubleshooting

### "Missing Supabase environment variables"
- Check your `.env` file exists in project root
- Ensure `VITE_SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

### "Test already exists"
- This is normal! Script skips duplicates
- If you want to re-upload, delete from database first

### "Error inserting question"
- Check JSON structure matches expected format
- Ensure all required fields are present
- Check console for specific error message

### HTML not cleaned properly
- Script uses `stripHtmlTags()` function
- Removes all HTML tags and converts `\n` to newlines
- If issues persist, check the JSON source data

## Current Tests

As of now, you have these tests in `src/data/`:

- fullPrepTest101.json
- fullPrepTest102.json
- fullPrepTest103.json
- fullPrepTest104.json
- fullPrepTest105.json
- fullPrepTest106.json
- fullPrepTest107.json
- fullPrepTest108.json
- fullPrepTest109.json
- fullPrepTest140.json
- fullPrepTest141.json
- fullPrepTest157.json
- fullPrepTest158.json

## Adding Explanations (Future)

The script currently inserts:
- `conclusion_explanation` (NULL)
- `roles_explanation` (NULL)
- `assumption_explanation` (NULL)
- `prediction_explanation` (NULL)
- `correct_explanation` (NULL)
- `incorrect_explanation` (NULL)

If your JSON includes explanation fields, you can modify the script to map them.

## Performance

- Uploads ~26 questions in ~10-15 seconds
- Full 4-section test (~104 questions) in ~45-60 seconds
- Uses batched inserts for efficiency
- Network speed dependent

## Best Practices

1. **Test with one file first** - Verify format before bulk upload
2. **Backup your database** - Before large uploads
3. **Check duplicates** - Script won't overwrite existing data
4. **Validate JSON** - Ensure proper structure before running
5. **Monitor console** - Watch for errors during upload

## Need Help?

If you encounter issues:
1. Check console output for specific errors
2. Verify JSON structure matches expected format
3. Confirm environment variables are set
4. Test with a smaller JSON file first
5. Check Supabase dashboard for partial uploads
