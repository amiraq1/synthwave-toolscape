
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
// Note: We need the SERVICE_ROLE_KEY here to bypass RLS and Auth
// Check for common names in .env
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env");
    console.log("Please check your .env file and ensure you have the service role key.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateEmbeddings() {
    console.log("🚀 Triggering embedding generation for ALL tools...");

    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { batch_all: true, force_regenerate: true }
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
