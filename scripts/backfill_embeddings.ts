import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function triggerEmbeddingGeneration() {
    console.log("Starting full database re-indexing (generating OpenAI embeddings)...");

    // Call the Edge Function
    // Note: Adjust the URL if deploying to production vs local
    // For local development with 'supabase start', functions are usually at the project URL or localhost
    const functionUrl = `${supabaseUrl}/functions/v1/generate-embeddings`;

    console.log(`Invoking Edge Function at: ${functionUrl}`);

    try {
        const { data, error } = await supabase.functions.invoke('generate-embeddings', {
            body: { batch_all: true }
        });

        if (error) {
            console.error("Error invoking function:", error);
            return;
        }

        console.log("Success! Response:", data);
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

triggerEmbeddingGeneration();
