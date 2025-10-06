# PrepTest Upload Status

## Current Files Ready to Upload

You have **43 PrepTest JSON files** ready for upload:

### LSAC Format (30 files)
- LSAC110.json through LSAC139.json
- PrepTests 110-139

### fullPrepTest Format (13 files)  
- fullPrepTest101.json through fullPrepTest109.json (PrepTests 101-109)
- fullPrepTest140.json, fullPrepTest141.json (PrepTests 140-141)
- fullPrepTest157.json, fullPrepTest158.json (PrepTests 157-158)

## Good News!

**The migration script works with BOTH filename formats!** 

The script doesn't care about the filename - it only checks that:
1. File ends with `.json`
2. File contains `moduleName` field
3. File has proper `sections` structure

Both your LSAC### and fullPrepTest### files meet these requirements.

## How to Upload All Tests

Simply run:

```bash
node scripts/migrateTestData.mjs
```

This will:
- Process all 43 JSON files
- Check for duplicates (skip if already uploaded)
- Insert new tests into Supabase
- Show progress for each test

## What Happens

The script will process files in alphabetical order:
1. LSAC110.json → The Official LSAT PrepTest 110
2. LSAC111.json → The Official LSAT PrepTest 111
3. ... (continues through all files)
4. fullPrepTest101.json → The Official LSAT PrepTest 101
5. ... (continues through remaining files)

## Expected Output

```
Starting data migration for The Official LSAT PrepTest 110 to Supabase...
Inserted test: The Official LSAT PrepTest 110 (ID: ...)
  Inserted section: Section 1: Reading Comprehension (ID: ...)
    Inserted question: 09100-01 (ID: ...)
    Inserted question: 09100-09 (ID: ...)
    ... (continues for all questions)
  Inserted section: Section 2: Logical Reasoning (ID: ...)
    ... (continues for all sections)
Data migration for The Official LSAT PrepTest 110 completed.

Starting data migration for The Official LSAT PrepTest 111 to Supabase...
... (continues for all 43 tests)

All specified data migrations attempted.
```

## Handling Duplicates

If some tests already exist in the database:

```
Test The Official LSAT PrepTest 101 already exists (ID: ...), skipping insertion.
  Section Section 1: Logical Reasoning already exists (ID: ...), skipping insertion.
    Question XG002495 already exists (ID: ...), skipping insertion.
```

This is normal and safe - the script won't create duplicates.

## Verification After Upload

1. **Check the app dashboard** - All 43 tests should appear
2. **Try starting a session** - Pick any test and verify it loads
3. **Check question counts** - Each section should have 25-27 questions
4. **Look for console errors** - Should see no errors in browser

## Database Structure

Each test will create:
- **1 test record** (tests table)
- **4 section records** (sections table)  
- **~100-130 question records** (questions table)
- **~500-650 option records** (question_options table)

For 43 tests, that's approximately:
- 43 tests
- 172 sections (43 × 4)
- 4,500 questions (43 × ~105)
- 22,500 options (4,500 × 5)

## Time Estimate

- Per test: ~45-60 seconds
- All 43 tests: ~30-45 minutes

## What If Upload Fails?

The script handles errors gracefully:
- If one test fails, others continue
- Check console for specific error message
- Re-run script - it will skip successfully uploaded tests
- Verify environment variables are set

## Files You Can Delete After Upload (Optional)

Once tests are in Supabase, you technically don't need the JSON files anymore, but it's recommended to keep them as:
- Backup in case of database issues
- Source for re-uploading if needed
- Reference for data structure

## Summary

✅ Script works with both LSAC### and fullPrepTest### formats
✅ No modifications needed
✅ Ready to upload all 43 tests
✅ Safe to re-run (handles duplicates)
✅ Takes ~30-45 minutes for all tests

**Just run:** `node scripts/migrateTestData.mjs`
