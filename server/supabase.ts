import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/supabaseTypes.js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_KEY) {
  throw new Error('SUPABASE_KEY is not defined');
}

// Create a single supabase client for the entire server
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist session in server environment
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-application-name': 'rich-habits-server'
      }
    }
  }
);