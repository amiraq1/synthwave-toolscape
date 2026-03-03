import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: false });

const args = process.argv.slice(2);

const getArgValue = (name, fallback) => {
  const arg = args.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : fallback;
};

const sourceFile = getArgValue("--source", "public/data/public-apis-tools.json");
const dryRun = args.includes("--dry-run");
const sourcePath = path.resolve(process.cwd(), sourceFile);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase URL or Service Role key.");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const chunkArray = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const readSourceUrls = () => {
  const parsed = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error("Source JSON is not an array.");
  }

  const urls = parsed
    .map((item) => (isNonEmptyString(item?.url) ? item.url.trim() : ""))
    .filter(Boolean);

  return [...new Set(urls)];
};

const fetchMatchingRows = async (urls) => {
  const matched = [];

  for (const part of chunkArray(urls, 150)) {
    const { data, error } = await supabase
      .from("tools")
      .select("id,url,title,is_published")
      .in("url", part);

    if (error) {
      throw new Error(`Failed to read tools by URL: ${error.message}`);
    }

    matched.push(...(data || []));
  }

  return matched;
};

const publishRowsByIds = async (ids) => {
  let updated = 0;

  for (const part of chunkArray(ids, 150)) {
    if (part.length === 0) continue;

    const { data, error } = await supabase
      .from("tools")
      .update({ is_published: true })
      .in("id", part)
      .select("id");

    if (error) {
      throw new Error(`Failed to publish tools: ${error.message}`);
    }

    updated += (data || []).length;
  }

  return updated;
};

const run = async () => {
  const urls = readSourceUrls();
  const matchedRows = await fetchMatchingRows(urls);

  const unpublished = matchedRows.filter((row) => row.is_published !== true);
  const unpublishedIds = unpublished.map((row) => row.id);

  console.log(`Source file: ${sourcePath}`);
  console.log(`Source unique URLs: ${urls.length}`);
  console.log(`Matched tools in DB: ${matchedRows.length}`);
  console.log(`Already published: ${matchedRows.length - unpublished.length}`);
  console.log(`Need publishing: ${unpublished.length}`);

  if (dryRun) {
    console.log("Mode: DRY RUN");
    return;
  }

  const updated = await publishRowsByIds(unpublishedIds);
  console.log("Mode: WRITE");
  console.log(`Published now: ${updated}`);
};

run().catch((error) => {
  console.error("Publish failed:", error.message);
  process.exit(1);
});
