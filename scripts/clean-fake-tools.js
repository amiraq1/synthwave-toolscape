import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const cleanAllFakeTools = async () => {
    console.log("🚀 Starting FULL cleanup of fake tools...");
    let totalDeleted = 0;
    let keepGoing = true;
    let batchNum = 1;

    while (keepGoing) {
        // 1. Fetch a batch of potential fakes
        const { data: tools, error } = await supabase
            .from("tools")
            .select("id, title, url")
            .ilike("title", "% %") // Optimization: Fakes always have a space "Name 123"
            .limit(1000);

        if (error) {
            console.error("❌ Error fetching:", error.message);
            break;
        }

        if (!tools || tools.length === 0) {
            keepGoing = false;
            console.log("✅ No more tools found matching criteria.");
            break;
        }

        // 2. Filter strictly using Regex
        const fakes = tools.filter(t => {
            const titleRegex = /^[A-Z][a-zA-Z]+\s+\d+$/; // e.g. "PaperEngine 61"
            const urlRegex = /^https:\/\/[a-z]+-[a-z0-9]+-\d+\.com$/i; // e.g. "paperengine-61.com"
            const urlRegex2 = /^https:\/\/[a-z]+-\d+\.com$/i; // e.g. "wordspark-1.com"

            return titleRegex.test(t.title || "") && (urlRegex.test(t.url || "") || urlRegex2.test(t.url || ""));
        });

        if (fakes.length === 0) {
            // If we fetched 1000 items and NONE were fakes, we might need to look deeper or we are done.
            // But since we use .ilike('% %'), we might be fetching real tools too.
            // To avoid infinite loop if we can't delete real tools, we should stop if all 1000 are real.
            console.log(`⚠️ Batch ${batchNum}: 0 fakes found in ${tools.length} items. Stopping to avoid infinite loop.`);
            keepGoing = false;
            break;
        }

        const ids = fakes.map(t => t.id);
        console.log(`�️ Batch ${batchNum}: Deleting ${ids.length} fake tools...`);

        // 3. Delete
        const { error: deleteError } = await supabase
            .from("tools")
            .delete()
            .in("id", ids);

        if (deleteError) {
            console.error("❌ Delete failed:", deleteError.message);
            keepGoing = false;
        } else {
            totalDeleted += ids.length;
            console.log(`✅ Deleted batch ${batchNum}. Total so far: ${totalDeleted}`);
        }

        batchNum++;

        // Safety brake
        if (totalDeleted > 15000) {
            console.log("⚠️ Reached safety limit of 15,000 deletions. Stopping.");
            keepGoing = false;
        }
    }

    console.log(`\n🎉 Cleanup Complete! Total tools deleted: ${totalDeleted}`);
};

cleanAllFakeTools();
