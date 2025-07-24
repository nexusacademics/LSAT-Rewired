import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);