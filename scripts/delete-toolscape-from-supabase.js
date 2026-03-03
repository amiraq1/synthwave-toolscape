import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase URL or SERVICE_ROLE_KEY.");
    console.error("Please ensure .env.local has VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const main = async () => {
    console.log("🔍 Searching for Toolscape tools in Supabase...");

    // Search first to confirm
    const { count, error: countError } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true })
        .ilike("title", "Toolscape AI %");

    if (countError) {
        console.error("❌ Error counting tools:", countError.message);
        process.exit(1);
    }

    if (count === 0) {
        console.log("✨ No Toolscape tools found in Supabase.");
        return;
    }

    console.log(`⚠️ Found ${count} tools to delete.`);
    // Confirm deletion? This script is intended to run directly as requested.

    console.log("🗑️ Deleting tools...");

    // Batch delete or direct delete?
    // Direct delete by query is usually fine for 10k rows if db allows, otherwise we might need batching.
    // Supabase postgrest might timeout on huge deletes via single http request if not indexed well or triggers exist.
    // We can try to delete in one go first.

    const { error: deleteError, count: deletedCount } = await supabase
        .from("tools")
        .delete({ count: "exact" }) // request count of deleted rows
        .ilike("title", "Toolscape AI %");

    if (deleteError) {
        console.error("❌ Error deleting tools:", deleteError.message);
        // Fallback: Batch delete if timeout
        console.log("🔄 Trying batch delete...");
        await batchDelete();
    } else {
        console.log(`✅ Successfully deleted ${deletedCount} tools from Supabase.`);
    }
};

const batchDelete = async () => {
    let totalDeleted = 0;

    while (true) {
        // Select batch of IDs
        const { data: tools, error: selectError } = await supabase
            .from("tools")
            .select("id")
            .ilike("title", "Toolscape AI %")
            .limit(1000);

        if (selectError) {
            console.error("❌ Error selecting batch:", selectError.message);
            break;
        }

        if (!tools || tools.length === 0) {
            break;
        }

        const ids = tools.map(t => t.id);

        // Delete batch
        const { error: deleteError } = await supabase
            .from("tools")
            .delete()
            .in("id", ids);

        if (deleteError) {
            console.error("❌ Error deleting batch:", deleteError.message);
            break;
        }

        totalDeleted += ids.length;
        console.log(`🗑️ Deleted batch of ${ids.length} tools. Total: ${totalDeleted}`);
    }

    console.log(`✅ Finished batch deletion. Total deleted: ${totalDeleted}`);
};

main();
