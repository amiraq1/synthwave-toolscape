
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
// We use the ANON key just to create the client, but we'll use a custom header for auth
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("❌ Error: VITE_SUPABASE_PUBLISHABLE_KEY not found in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateEmbeddings() {
    console.log("🚀 Triggering embedding generation for ALL tools (Manual Override)...");

    // Using 'invoke' with custom headers to bypass standard auth
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { batch_all: true, force_regenerate: true },
        headers: {
            'x-admin-trigger': 'nabdh-ai-secret-trigger-2026'
        }
    });

    if (error) {
        console.error("❌ Function Invoke Error:", error);
        return;
    }

    if (data?.error) {
        console.error("❌ API Error:", data.error);
        return;
    }

    console.log("✅ Success!");
    console.log(JSON.stringify(data, null, 2));
}

generateEmbeddings();
