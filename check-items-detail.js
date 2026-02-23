const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://udzrvxwjakgwfbnatnbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkenJ2eHdqYWtnd2ZibmF0bmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgxNTEsImV4cCI6MjA4NzI1NDE1MX0.JjXfqKrf8UFshA1_QuCgqEbJQ8FsjTk6HBnCznZTdo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAll() {
    const { data: all, error: e1 } = await supabase.from('items').select('id, name, category, is_available, image').limit(30);
    if (e1) { console.error('Error:', e1); return; }
    console.log('Total items in DB:', all.length);
    const cats = [...new Set(all.map(i => i.category))];
    console.log('Categories in DB:', JSON.stringify(cats));
    const available = all.filter(i => i.is_available);
    console.log('Available items:', available.length);
    console.log('\nAll items:');
    all.forEach(i => console.log(` - [${i.is_available ? '✓' : '✗'}] ${i.category} | ${i.name} | img: ${i.image ? 'YES' : 'NO'}`));
}
checkAll();
