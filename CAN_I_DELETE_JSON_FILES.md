# Can I Delete JSON Files After Upload?

## Short Answer

**YES** - Once tests are uploaded to Supabase, the JSON files in `src/data/` are no longer needed by the running application.

## Why You Can Delete Them

### App Doesn't Use Local JSON Files

✅ **All data now comes from Supabase:**
- `useTestMetadata` → Loads test list from database
- `useTestSections` → Loads sections from database  
- `useTestDetails` → Loads questions from database
- `useTestData` → Only used for search (legacy, will be replaced)

✅ **No code imports JSON files directly:**
- Checked all `.ts`, `.tsx`, `.js`, `.jsx` files
- No `import ... from './data/...'` statements found
- No `require('./data/...')` statements found

✅ **JSON files are only used by the upload script:**
- `scripts/migrateTestData.mjs` reads them
- Only needed during initial upload or re-upload
- Not needed for app to run

## What You Lose If You Delete Them

### 1. Backup/Recovery
- If database gets corrupted, you'd need to re-obtain JSON files
- Can't easily re-upload tests without source files

### 2. Re-Upload Capability
- Can't run migration script again
- Can't fix data issues by re-uploading

### 3. Adding New Tests
- If you get new PrepTest JSON files, having examples helps maintain format consistency

### 4. Reference/Documentation
- JSON files show original data structure
- Useful for debugging or understanding data format

## Recommendation

### Option 1: Archive (Recommended)
**Move files instead of deleting:**

```bash
# Create archive directory outside src/
mkdir -p archive/test-data
mv src/data/*.json archive/test-data/

# Or compress them
tar -czf test-data-backup.tar.gz src/data/*.json
rm src/data/*.json
```

**Benefits:**
- ✅ Reduces bundle size (if files are being bundled)
- ✅ Keeps backup for emergencies
- ✅ Can re-upload if needed
- ✅ Easy to restore

### Option 2: Keep Them (Also Fine)
**Leave files in `src/data/`:**

**Benefits:**
- ✅ Always available for re-upload
- ✅ Reference for data structure
- ✅ No risk of losing source data

**Drawbacks:**
- ❌ ~13MB of JSON files in repository
- ❌ May increase bundle size (check your build config)

### Option 3: Delete (Not Recommended)
**Only if you're confident:**
- You have backups elsewhere
- You won't need to re-upload
- You trust your database won't have issues

## Check If Files Are Being Bundled

Before deleting, verify they're not being bundled:

```bash
# Build the production app
npm run build

# Check if JSON files are in the build
ls -lh dist/assets/ | grep -i json

# Check bundle size before and after
```

If JSON files appear in `dist/`, your build configuration might be including them. In that case, deleting will reduce bundle size.

## Current File Count

You have **58 JSON files** (discovered more than originally counted!):

### LSAC Format (45 files)
- LSAC110.json through LSAC156.json

### fullPrepTest Format (13 files)
- fullPrepTest101-109, 140-141, 157-158

**Total size:** ~13-15MB

## My Recommendation

**Archive them after successful upload:**

1. Upload all tests: `node scripts/migrateTestData.mjs`
2. Verify in app (all tests work)
3. Create archive: `mkdir archive && mv src/data/*.json archive/`
4. Keep archive folder in your project root (git-ignored if you want)

This way:
- App stays clean
- You have backups
- Can re-upload if needed
- Easy to restore

## Impact on Development

### If You Keep Them
- No impact on functionality
- Possible impact on bundle size (check build)
- Easy to re-upload data

### If You Archive/Delete Them
- No impact on functionality
- Cleaner src directory
- Potentially smaller bundle
- Need to restore archive to re-upload

## Summary

**Safe to remove:** ✅ Yes  
**Should you remove:** 🤔 Up to you  
**Best practice:** 📦 Archive, don't delete  
**Impact on app:** 📱 None (app uses database)

The choice is yours! The app will work either way since it loads all data from Supabase now.
