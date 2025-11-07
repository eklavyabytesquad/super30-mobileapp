import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ncbcmcvsntrtzpaanjds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYmNtY3ZzbnRydHpwYWFuamRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjkwMTUsImV4cCI6MjA3ODAwNTAxNX0.QDYi6vsczpyXwC7jfpoADNss0I6tU1xY6apUQXPHtt0';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
