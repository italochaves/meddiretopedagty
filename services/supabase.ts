import { createClient } from '@supabase/supabase-js';

// Usando import.meta.env para compatibilidade com Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://wustcwgspjgbcjvozlhn.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c3Rjd2dzcGpnYmNqdm96bGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjc5ODAsImV4cCI6MjA3OTAwMzk4MH0.dL3Bn4x8kVFa5GTrE_uGO6M5q1TQDbXOzoUB0ERbXsA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);