const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://udzrvxwjakgwfbnatnbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenJ2eHdqYWtnd2ZibmF0bmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgxNTEsImV4cCI6MjA4NzI1NDE1MX0.JjXfqKrf8UFshA1_QuCgqEbJQ8FsjTk6HBnCznZTdo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkItems() {
    console.log('Fetching items from Supabase...');
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
        console.error('Error fetching items:', error);
    } else {
        console.log('Items found:', data.length);
        if (data.length > 0) {
            console.log('Sample item:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Items table is empty.');
        }
    }
}

checkItems();
