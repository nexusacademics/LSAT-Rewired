// scripts/migrateTestData.mjs
import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
console.log('DEBUG: dotenv.config() result:', dotenvResult);

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('DEBUG: Supabase URL (first 5 chars):', supabaseUrl ? supabaseUrl.substring(0, 5) + '...' : 'NOT LOADED');
console.log('DEBUG: Supabase Anon Key (first 5 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'NOT LOADED');
console.log('DEBUG: Supabase Service Role Key (first 5 chars):', supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 5) + '...' : 'NOT LOADED');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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

// Main migration function, now accepting testData as an argument
async function migrateTestData(testData) {
  console.log(`Starting data migration for ${testData.moduleName} to Supabase...`);

  const testName = testData.moduleName;

  // 1. Insert Test (or find existing)
  let { data: test, error: testError } = await supabase
    .from('tests')
    .select('id')
    .eq('name', testName)
    .maybeSingle();

  if (testError) {
    console.error(`Error checking for existing test ${testName}:`, testError);
    throw testError;
  }

  if (!test) {
    const { data, error } = await supabase
      .from('tests')
      .insert({ name: testName })
      .select('id')
      .single();

    if (error) {
      console.error(`Error inserting test ${testName}:`, error);
      throw error;
    }
    test = data;
    console.log(`Inserted test: ${testName} (ID: ${test.id})`);
  } else {
    console.log(`Test ${testName} already exists (ID: ${test.id}), skipping insertion.`);
  }

  const testId = test.id;

  // 2. Insert Sections
  for (const rawSection of testData.sections) {
    let { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('test_id', testId)
      .eq('name', rawSection.sectionName)
      .maybeSingle();

    if (sectionError) {
      console.error(`Error checking for existing section ${rawSection.sectionName}:`, sectionError);
      throw sectionError;
    }

    if (!section) {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          test_id: testId,
          name: rawSection.sectionName,
          section_type: rawSection.sectionId.startsWith('LR') ? 'Logical Reasoning' :
                        rawSection.sectionId.startsWith('RC') ? 'Reading Comprehension' :
                        'Question' // Default for other types
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Error inserting section ${rawSection.sectionName}:`, error);
        throw error;
      }
      section = data;
      console.log(`  Inserted section: ${rawSection.sectionName} (ID: ${section.id})`);
    } else {
      console.log(`  Section ${rawSection.sectionName} already exists (ID: ${section.id}), skipping insertion.`);
    }

    const sectionId = section.id;

    // 3. Insert Questions and Options
    for (const [qIndex, rawQuestion] of rawSection.items.entries()) {
      let { data: question, error: questionError } = await supabase
        .from('questions')
        .select('id')
        .eq('section_id', sectionId)
        .eq('item_id', rawQuestion.itemId)
        .maybeSingle();

      if (questionError) {
        console.error(`Error checking for existing question ${rawQuestion.itemId}:`, questionError);
        throw questionError;
      }

      if (!question) {
        const { data, error } = await supabase
          .from('questions')
          .insert({
            section_id: sectionId,
            item_id: rawQuestion.itemId,
            stimulus_text: stripHtmlTags(rawQuestion.stimulusText),
            stem_text: stripHtmlTags(rawQuestion.stemText),
            correct_answer_index: optionLetterToIndex(rawQuestion.correctAnswer),
            question_order: qIndex + 1 // 1-indexed order
          })
          .select('id')
          .single();

        if (error) {
          console.error(`Error inserting question ${rawQuestion.itemId}:`, error);
          throw error;
        }
        question = data;
        console.log(`    Inserted question: ${rawQuestion.itemId} (ID: ${question.id})`);
      } else {
        console.log(`    Question ${rawQuestion.itemId} already exists (ID: ${question.id}), skipping insertion.`);
      }

      const questionId = question.id;

      // Insert Options for the question
      for (const [oIndex, rawOption] of rawQuestion.options.entries()) {
        let { data: option, error: optionError } = await supabase
          .from('question_options')
          .select('id')
          .eq('question_id', questionId)
          .eq('option_letter', rawOption.optionLetter)
          .maybeSingle();

        if (optionError) {
          console.error(`Error checking for existing option ${rawOption.optionLetter} for question ${questionId}:`, optionError);
          throw optionError;
        }

        if (!option) {
          const { error } = await supabase
            .from('question_options')
            .insert({
              question_id: questionId,
              option_letter: rawOption.optionLetter,
              option_content: stripHtmlTags(rawOption.optionContent),
              option_order: oIndex + 1 // 1-indexed order
            });

          if (error) {
            console.error(`Error inserting option ${rawOption.optionLetter} for question ${questionId}:`, error);
            throw error;
          }
          // console.log(`      Inserted option: ${rawOption.optionLetter}`);
        } else {
          // console.log(`      Option ${rawOption.optionLetter} for question ${questionId} already exists, skipping insertion.`);
        }
      }
    }
  }
  console.log(`Data migration for ${testData.moduleName} completed.`);
}

// Loop through each test file and call the migration function
(async () => {
  const dataDirectory = path.resolve(__dirname, '../src/data');
  const testFiles = fs.readdirSync(dataDirectory).filter(file => file.endsWith('.json'));

  for (const fileName of testFiles) {
    const filePath = path.join(dataDirectory, fileName);
    try {
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await migrateTestData(rawData);
    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
    }
  }
  console.log('\nAll specified data migrations attempted.');
})();
