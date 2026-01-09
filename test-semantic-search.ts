
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/std@0.168.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://iazvsdwkbfzjhscyfvec.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

if (!SUPABASE_ANON_KEY) {
    console.error("❌ Error: VITE_SUPABASE_PUBLISHABLE_KEY not found in .env");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSearch(query: string) {
    console.log(`\n🔍 Searching for: "${query}"...`);

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
        data.tools.forEach((tool: any, i: number) => {
            console.log(`   ${i + 1}. [${Math.round(tool.similarity * 100)}%] ${tool.title} - ${tool.role || tool.category}`);
        });
    } else {
        console.log("⚠️ No semantic results found. (Embeddings might be missing)");
    }
}

// Run verify
console.log("--- Semantic Search Test ---");
await testSearch("صناعة الصور");
await testSearch("كتابة المقالات");
await testSearch("coding assistant");
