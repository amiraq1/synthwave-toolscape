
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env file
const envConfig = dotenv.parse(fs.readFileSync(path.resolve('.env')));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://iazvsdwkbfzjhscyfvec.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("❌ Error: VITE_SUPABASE_PUBLISHABLE_KEY not found in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSearch(query) {
    console.log(`\n🔍 Searching for: "${query}"...`);

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('search', {
        body: { query, limit: 3 }
    });

    if (error) {
        console.error("❌ Function Invoke Error:", error);
        return;
    }

    if (data?.error) {
        console.error("❌ API Error:", data.error);
        return;
    }

    if (data?.tools && data.tools.length > 0) {
        console.log(`✅ Found ${data.tools.length} results:`);
        data.tools.forEach((tool, i) => {
            console.log(`   ${i + 1}. [${Math.round(tool.similarity * 100)}%] ${tool.title} - ${tool.role || tool.category}`);
        });
    } else {
        console.log("⚠️ No semantic results found. (Embeddings might be missing)");
    }
}

// Run verify
async function run() {
    console.log("--- Semantic Search Test (Node.js) ---");
    await testSearch("صناعة الصور");
    await testSearch("كتابة المقالات");
    await testSearch("coding assistant");
}

run();
