
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Testing connection to:', supabaseUrl);

    const { data, error } = await supabase
        .from('tools')
        .select('*')
        .limit(1);

    if (error) {
        console.error('FATAL ERROR:', error);
    } else {
        console.log('SUCCESS! Data sample:', data);
    }
}

testFetch();
