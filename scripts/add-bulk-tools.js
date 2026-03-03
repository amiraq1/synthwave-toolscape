import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to the REAL tools JSON file
const TOOLS_FILE_PATH = path.resolve(__dirname, "../public/data/real_tools.json");

const addRealTools = async () => {
  console.log("🚀 Starting Smart Bulk Import of REAL AI Tools...");

  if (!fs.existsSync(TOOLS_FILE_PATH)) {
    console.error(`❌ File not found: ${TOOLS_FILE_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(TOOLS_FILE_PATH, "utf-8");
  const tools = JSON.parse(rawData);

  // Pre-process: Remove duplicates from the source JSON itself!
  const uniqueToolsMap = new Map();

  for (const tool of tools) {
    const titleKey = (tool.title || "").trim().toLowerCase();
    // Only keep the first occurrence of a title
    if (!uniqueToolsMap.has(titleKey)) {
      uniqueToolsMap.set(titleKey, tool);
    }
  }

  const uniqueTools = Array.from(uniqueToolsMap.values());
  console.log(`🧹 Deduplicated source data: ${tools.length} -> ${uniqueTools.length} tools.`);

  let totalInserted = 0;
  let totalSkipped = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < uniqueTools.length; i += BATCH_SIZE) {
    const batch = uniqueTools.slice(i, i + BATCH_SIZE);

    // 1. Extract titles from current batch
    // 2. Check which titles OR urls already exist in DB
    const titles = batch.map(t => t.title || "Untitled Tool");
    const urls = batch.filter(t => t.url).map(t => t.url);

    // Parallel checks for Titles and URLs
    const [titleRes, urlRes] = await Promise.all([
      supabase.from("tools").select("title").in("title", titles),
      supabase.from("tools").select("url").in("url", urls)
    ]);

    if (titleRes.error || urlRes.error) {
      console.error(`❌ Error checking existance for batch ${i}:`, titleRes.error?.message || urlRes.error?.message);
      continue;
    }

    const existingTitleSet = new Set(titleRes.data?.map(t => t.title));
    const existingUrlSet = new Set(urlRes.data?.map(t => t.url));

    // 3. Filter out existing tools (if title OR url exists)
    const newTools = batch
      .filter(t => !existingTitleSet.has(t.title) && !existingUrlSet.has(t.url))
      .map(({ id, ...rest }) => ({
        ...rest,
        // Ensure required fields
        title: rest.title || "Untitled Tool",
        description: rest.description || "",
        category: rest.category || "Uncategorized",
        url: rest.url || "",
        is_published: true
      }));

    if (newTools.length === 0) {
      totalSkipped += batch.length;
      process.stdout.write(`⏩ Skipped batch ${Math.floor(i / BATCH_SIZE) + 1} (All exist). Total skipped: ${totalSkipped}\r`);
      continue;
    }

    // 4. Insert only NEW tools
    const { error } = await supabase.from("tools").insert(newTools);

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
    } else {
      totalInserted += newTools.length;
      totalSkipped += (batch.length - newTools.length);
      process.stdout.write(`✅ Inserted ${totalInserted} / Skipped ${totalSkipped} ...\r`);
    }
  }

  console.log(`\n🎉 Import Complete!`);
  console.log(`✅ Newly Inserted: ${totalInserted}`);
  console.log(`⏩ Skipped (Already Existed): ${totalSkipped}`);
};

addRealTools();
