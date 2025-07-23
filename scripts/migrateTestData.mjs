// scripts/migrateTestData.mjs
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// ADD THIS LINE FOR DEBUGGING
console.log('DEBUG: Supabase Service Role Key (first 5 chars):', supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 5) + '...' : 'NOT LOADED');
// END DEBUG LINE

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// ... rest of your script


// Path to your raw test data JSON file
const rawTestDataPath = path.resolve(__dirname, '../src/data/fullPrepTest140.json');
const rawPrepTest140 = JSON.parse(fs.readFileSync(rawTestDataPath, 'utf8'));

// Helper function to strip HTML tags and convert escaped newlines
const stripHtmlTags = (html) => {
  let cleaned = html.replace(/<\/p>/g, '\n\n');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\\n/g, '\n');
  return cleaned.trim();
};

// Helper function to convert option letter to 0-indexed number
const optionLetterToIndex = (letter) => {
  return letter.charCodeAt(0) - 'A'.charCodeAt(0);
};

async function migrateTestData() {
  console.log('Starting data migration to Supabase...');

  try {
    const testName = rawPrepTest140.moduleName;

    // 1. Insert into 'tests' table
    console.log(`Inserting test: "${testName}"`);
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .insert({ name: testName })
      .select('id'); // Select the generated ID to use as foreign key

    if (testError) {
      console.error('Error inserting test:', testError);
      throw testError;
    }
    const testId = testData[0].id;
    console.log(`Successfully inserted test "${testName}" with ID: ${testId}`);

    // 2. Insert sections
    for (const [sectionIndex, rawSection] of rawPrepTest140.sections.entries()) {
      const sectionName = rawSection.sectionName;
      console.log(`  Inserting section: "${sectionName}" for test "${testName}"`);
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          test_id: testId,
          name: sectionName,
          section_order: sectionIndex,
        })
        .select('id');

      if (sectionError) {
        console.error('  Error inserting section:', sectionError);
        throw sectionError;
      }
      const sectionId = sectionData[0].id;
      console.log(`  Successfully inserted section "${sectionName}" with ID: ${sectionId}`);

      // 3. Insert questions
      for (const [questionIndex, rawQuestionItem] of rawSection.items.entries()) {
        const passage = stripHtmlTags(rawQuestionItem.stimulusText);
        const questionStem = stripHtmlTags(rawQuestionItem.stemText);
        const correctAnswerIndex = optionLetterToIndex(rawQuestionItem.correctAnswer);
        const questionType = rawSection.sectionId.startsWith('LR') ? 'Logical Reasoning' :
                             rawSection.sectionId.startsWith('RC') ? 'Reading Comprehension' :
                             'Question'; // Default for other types

        console.log(`    Inserting question: "${rawQuestionItem.itemId}" for section "${sectionName}"`);
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            section_id: sectionId,
            passage: passage,
            question_stem: questionStem,
            correct_answer_index: correctAnswerIndex,
            question_type: questionType,
            question_order: questionIndex,
          })
          .select('id');

        if (questionError) {
          console.error('    Error inserting question:', questionError);
          throw questionError;
        }
        const questionId = questionData[0].id;
        console.log(`    Successfully inserted question "${rawQuestionItem.itemId}" with ID: ${questionId}`);

        // 4. Insert question options
        for (const [optionIndex, option] of rawQuestionItem.options.entries()) {
          const optionText = stripHtmlTags(option.optionContent);
          console.log(`      Inserting option "${option.optionLetter}" for question "${rawQuestionItem.itemId}"`);
          const { error: optionError } = await supabase
            .from('question_options')
            .insert({
              question_id: questionId,
              option_text: optionText,
              option_order: optionIndex,
            });

          if (optionError) {
            console.error('      Error inserting option:', optionError);
            throw optionError;
          }
        }
      }
    }

    console.log('\nData migration completed successfully!');
  } catch (error) {
    console.error('\nAn error occurred during data migration:');
    console.error(error.message);
    process.exit(1);
  }
}

migrateTestData();
