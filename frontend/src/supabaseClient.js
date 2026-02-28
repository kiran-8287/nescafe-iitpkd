import { createClient } from '@supabase/supabase-js';

// In production, route ALL Supabase traffic through our backend proxy.
// This fixes mobile carrier DNS blocking of supabase.co.
// In local dev, connect directly for speed (no proxy round-trip).
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168');

const SUPABASE_PROJECT_URL = 'https://udzrvxwjakgwfbnatnbt.supabase.co';
const SUPABASE_URL = IS_LOCAL
    ? SUPABASE_PROJECT_URL
    : 'https://nescafe-iitpkd.vercel.app/supabase';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenJ2eHdqYWtnd2ZibmF0bmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgxNTEsImV4cCI6MjA4NzI1NDE1MX0.JjXfqKrf8UFshA1_QuCgqEbJQ8FsjTk6HBnCznZTdo8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Expose for console testing
if (typeof window !== 'undefined') {
    window.supabase = supabase;
}
