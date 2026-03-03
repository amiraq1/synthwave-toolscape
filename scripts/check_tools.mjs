import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    "https://iazvsdwkbfzjhscyfvec.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhenZzZHdrYmZ6amhzY3lmdmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODE1MTgsImV4cCI6MjA4MjU1NzUxOH0.Hgcu4o9btWdxkhnA4BhQYpal_uoJ5gQn0dHYQoX4yyM"
);

async function main() {
    const { data, error } = await supabase
        .from('tools')
        .select('id, title, description, category, pricing_type, features')
        .eq('is_published', true)
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach(tool => {
        console.log(`\n--- Tool ID: ${tool.id} ---`);
        console.log(`Title: ${tool.title}`);
        console.log(`Desc: ${tool.description?.substring(0, 100)}...`);
        console.log(`Category: ${tool.category}`);
        console.log(`Pricing: ${tool.pricing_type}`);
        console.log(`Features[0]: ${tool.features?.[0]}`);
    });

    const { count } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

    console.log(`\nTotal published tools: ${count}`);
}

main();
