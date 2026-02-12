import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const testStats = async () => {
    console.log("📊 Running Database Stats Test...");

    // 1. Get Total Count
    const { count: total, error: err1 } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true });

    if (err1) {
        console.error("❌ Error fetching total:", err1.message);
        return;
    }

    // 2. Get Potential Fakes Count (Title contains pattern like "Name 123", URL contains "-number.com")
    // Note: This is an approximation using ILIKE
    const { count: fakes, error: err2 } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true })
        .ilike("url", "%-%.com"); // Simple heuristic for generated URLs

    if (err2) {
        console.error("❌ Error fetching fakes:", err2.message);
        return;
    }

    console.log("------------------------------------------------");
    console.log(`🔢 Total Tools in DB:    ${total}`);
    console.log(`🤖 Potential Fake Tools: ${fakes}`);
    console.log("------------------------------------------------");

    if (fakes === 0) {
        console.log("✅ Database looks clean! No obvious generated tools found.");
    } else {
        console.log("⚠️ Database still contains generated tools.");
        console.log("👉 Run 'node scripts/clean-fake-tools.js' to clean them.");
    }
};

testStats();
