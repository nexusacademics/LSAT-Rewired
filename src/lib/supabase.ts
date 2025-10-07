import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('[Supabase] Initializing client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'lsat-rewired-app',
    },
    fetch: (url, options = {}) => {
      // Add timeout to fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('[Supabase] Request timeout after 15s:', url);
        controller.abort();
      }, 15000); // 15 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});