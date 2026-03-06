import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pzpplippcdmkmwnzmdbr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LrMo9PCEEA3mhoJiHfySQA_H3fAylDZ';

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
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
