// Supabase client — public anon key only, safe for browser
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[HireShield] Supabase env vars missing — auth and database features will not work yet.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
