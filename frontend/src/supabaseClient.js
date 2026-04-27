import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://udzrvxwjakgwfbnatnbt.supabase.co';
const SUPABASE_URL = SUPABASE_PROJECT_URL;

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenJ2eHdqYWtnd2ZibmF0bmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgxNTEsImV4cCI6MjA4NzI1NDE1MX0.JjXfqKrf8UFshA1_QuCgqEbJQ8FsjTk6HBnCznZTdo8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Note: window.supabase removed — never expose authenticated clients globally.
