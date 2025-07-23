// scripts/migrateTestData.mjs
import dotenv from 'dotenv';
const dotenvResult = dotenv.config(); // Capture the result of dotenv.config()
console.log('DEBUG: dotenv.config() result:', dotenvResult); // NEW DEBUG LINE

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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; // Also check anon key
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('DEBUG: Supabase URL (first 5 chars):', supabaseUrl ? supabaseUrl.substring(0, 5) + '...' : 'NOT LOADED'); // NEW DEBUG LINE
console.log('DEBUG: Supabase Anon Key (first 5 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'NOT LOADED'); // NEW DEBUG LINE
console.log('DEBUG: Supabase Service Role Key (first 5 chars):', supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 5) + '...' : 'NOT LOADED');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// ... rest of your script



// Path to your raw test data JSON file
const dataDirectory = path.resolve(__dirname, '../src/data');
const testFiles = fs.readdirSync(dataDirectory).filter(file => file.endsWith('.json'));

// Modify the main function call to accept testData as an argument
async function migrateTestData(testData) {
  console.log(`Starting data migration for ${testData.moduleName} to Supabase...`);
  // ... rest of your existing migrateTestData function logic ...
  // Make sure all references to `testData` inside this function are changed to `testData`
}

// Loop through each test file and call the migration function
(async () => {
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

