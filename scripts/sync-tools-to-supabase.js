import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: false });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const batchArg = args.find((arg) => arg.startsWith("--batch-size="));
const batchSize = Number.parseInt(batchArg?.split("=")[1] || "250", 10);
const finalBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 250;

const sourceArg = args.find((arg) => arg.startsWith("--source="));
const sourceFile = sourceArg?.split("=")[1] || "public/data/tools.json";
const sourcePath = path.resolve(process.cwd(), sourceFile);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("Missing Supabase URL. Set VITE_SUPABASE_URL or SUPABASE_URL.");
  process.exit(1);
}

if (!dryRun && !serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Required for write sync.");
  process.exit(1);
}

if (!serviceRoleKey && !anonKey) {
  console.error("Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const toBooleanOrUndefined = (value) =>
  typeof value === "boolean" ? value : undefined;

const toNumberOrUndefined = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const toDateOrUndefined = (value) => {
  if (!isNonEmptyString(value)) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

const normalizeArrayOfStrings = (value) => {
  if (!Array.isArray(value)) return undefined;
  const arr = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return arr.length > 0 ? arr : [];
};

const isValidHttpUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const getSchemaColumns = async () => {
  const { data, error } = await supabase.from("tools").select("*").limit(1);
  if (error) {
    throw new Error(`Failed to read tools schema sample: ${error.message}`);
  }
  if (data && data.length > 0) {
    return new Set(Object.keys(data[0]));
  }

  // Fallback if table is empty. Keep to safest minimal columns.
  return new Set([
    "title",
    "description",
    "category",
    "url",
    "pricing_type",
    "image_url",
    "is_featured",
    "is_published",
    "features",
    "screenshots",
    "created_at",
  ]);
};

const buildRow = (tool, availableColumns) => {
  if (!isValidHttpUrl(tool?.url)) return null;
  if (!isNonEmptyString(tool?.title)) return null;
  if (!isNonEmptyString(tool?.description)) return null;
  if (!isNonEmptyString(tool?.category)) return null;

  const row = {};
  const setIfAllowed = (key, value) => {
    if (!availableColumns.has(key)) return;
    if (value === undefined) return;
    row[key] = value;
  };

  setIfAllowed("title", tool.title.trim());
  setIfAllowed("title_en", isNonEmptyString(tool.title_en) ? tool.title_en.trim() : undefined);
  setIfAllowed("description", tool.description.trim());
  setIfAllowed(
    "description_en",
    isNonEmptyString(tool.description_en) ? tool.description_en.trim() : undefined
  );
  setIfAllowed("category", tool.category.trim());
  setIfAllowed("url", tool.url.trim());
  setIfAllowed("image_url", isNonEmptyString(tool.image_url) ? tool.image_url.trim() : null);
  setIfAllowed(
    "pricing_type",
    isNonEmptyString(tool.pricing_type) ? tool.pricing_type.trim() : "مجاني"
  );
  setIfAllowed("is_featured", toBooleanOrUndefined(tool.is_featured) ?? false);
  setIfAllowed("is_published", toBooleanOrUndefined(tool.is_published) ?? true);
  setIfAllowed("created_at", toDateOrUndefined(tool.created_at));
  setIfAllowed("features", normalizeArrayOfStrings(tool.features));
  setIfAllowed("screenshots", normalizeArrayOfStrings(tool.screenshots) ?? []);
  setIfAllowed("is_sponsored", toBooleanOrUndefined(tool.is_sponsored));
  setIfAllowed("supports_arabic", toBooleanOrUndefined(tool.supports_arabic));
  setIfAllowed("average_rating", toNumberOrUndefined(tool.average_rating));
  setIfAllowed("reviews_count", toNumberOrUndefined(tool.reviews_count));
  setIfAllowed("views_count", toNumberOrUndefined(tool.views_count));

  return row;
};

const readSourceTools = () => {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Source JSON is not an array.");
  }
  return parsed;
};

const fetchExistingUrls = async () => {
  const all = new Set();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase.from("tools").select("url").range(from, to);
    if (error) {
      throw new Error(`Failed to read existing tools: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (isNonEmptyString(row.url)) {
        all.add(row.url.trim().toLowerCase());
      }
    }
    if (data.length < pageSize) break;
    from += data.length;
  }

  return all;
};

const insertBatchSafely = async (batch, startIndex) => {
  const { error } = await supabase.from("tools").insert(batch);
  if (!error) {
    return { inserted: batch.length, failed: 0, failures: [] };
  }

  const failures = [];
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < batch.length; i += 1) {
    const row = batch[i];
    const { error: singleError } = await supabase.from("tools").insert(row);
    if (singleError) {
      failed += 1;
      if (failures.length < 20) {
        failures.push({
          index: startIndex + i,
          url: row.url,
          error: singleError.message,
        });
      }
    } else {
      inserted += 1;
    }
  }

  return { inserted, failed, failures };
};

const main = async () => {
  console.log(`Source: ${sourcePath}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);
  console.log(`Batch size: ${finalBatchSize}`);

  const source = readSourceTools();
  const availableColumns = await getSchemaColumns();
  const existingUrls = await fetchExistingUrls();

  const dedupedByUrl = new Map();
  let invalidSourceCount = 0;
  let duplicateUrlCount = 0;

  for (const item of source) {
    const built = buildRow(item, availableColumns);
    if (!built) {
      invalidSourceCount += 1;
      continue;
    }
    const key = built.url.toLowerCase();
    if (!dedupedByUrl.has(key)) {
      dedupedByUrl.set(key, built);
    } else {
      duplicateUrlCount += 1;
    }
  }

  const normalizedTools = Array.from(dedupedByUrl.values());
  const toInsert = normalizedTools.filter((row) => !existingUrls.has(row.url.toLowerCase()));

  const { count: beforeCount } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true });

  console.log(`Source rows: ${source.length}`);
  console.log(`Valid rows after normalization: ${normalizedTools.length}`);
  console.log(`Invalid/ignored source rows: ${invalidSourceCount}`);
  console.log(`Duplicate URLs ignored: ${duplicateUrlCount}`);
  console.log(`Existing rows in DB: ${beforeCount ?? existingUrls.size}`);
  console.log(`Rows to insert: ${toInsert.length}`);

  if (dryRun) {
    return;
  }

  let insertedTotal = 0;
  let failedTotal = 0;
  const failures = [];

  for (let i = 0; i < toInsert.length; i += finalBatchSize) {
    const batch = toInsert.slice(i, i + finalBatchSize);
    const result = await insertBatchSafely(batch, i);
    insertedTotal += result.inserted;
    failedTotal += result.failed;
    failures.push(...result.failures);
    const done = Math.min(i + finalBatchSize, toInsert.length);
    console.log(`Progress: ${done}/${toInsert.length} inserted=${insertedTotal} failed=${failedTotal}`);
  }

  const { count: afterCount } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true });

  console.log("---- Sync Summary ----");
  console.log(`Inserted: ${insertedTotal}`);
  console.log(`Failed: ${failedTotal}`);
  console.log(`Before: ${beforeCount ?? "unknown"}`);
  console.log(`After: ${afterCount ?? "unknown"}`);

  if (failures.length > 0) {
    console.log("Sample failures (max 20):");
    for (const f of failures) {
      console.log(`- idx=${f.index} url=${f.url} error=${f.error}`);
    }
  }
};

main().catch((err) => {
  console.error("Sync failed:", err?.message || err);
  process.exit(1);
});
