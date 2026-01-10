
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

async function testSearch(query) {
    console.log(`\n🔍 Searching for: "${query}"...`);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, limit: 3 })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ HTTP Error ${response.status}:`, data.error);
            if (data.details) console.error("📝 Details:", data.details);
            return;
        }

        if (data.error) {
            console.error("❌ API Error:", data.error);
            if (data.details) console.error("📝 Details:", data.details);
            return;
        }

        if (data.tools && data.tools.length > 0) {
            console.log(`✅ Found ${data.tools.length} results:`);
            data.tools.forEach((tool, i) => {
                console.log(`   ${i + 1}. [${Math.round(tool.similarity * 100)}%] ${tool.title} - ${tool.role || tool.category}`);
            });
        } else {
            console.log("⚠️ No semantic results found.");
        }

    } catch (err) {
        console.error("❌ Network Error:", err);
    }
}

// Run verify
async function run() {
    console.log("--- Semantic Search Test (Raw Fetch) ---");
    await testSearch("صناعة الصور");
    await testSearch("coding assistant");
}

run();
