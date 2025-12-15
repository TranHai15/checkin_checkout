import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables
const getEnv = (key: string) => {
  // Try import.meta.env (Vite standard)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  
  // Try process.env (legacy/compatibility) safely
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  
  return '';
};

export const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://your-project.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLE_EMPLOYEES = 'employees';
export const TABLE_ATTENDANCE = 'attendance';