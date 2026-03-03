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

const outFileArg = getArgValue("--out", "");
const sourceFileArg = getArgValue("--source", "public/data/tools.cleaned.json");
const failOnAcceptance = args.includes("--fail-on-acceptance");

const sourcePath = path.resolve(process.cwd(), sourceFileArg);

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

if (!serviceRoleKey && !anonKey) {
  console.error("Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FAKE_TITLE_REGEX = /^[A-Z][a-zA-Z]+\s+\d+$/;
const FAKE_URL_REGEX_1 = /^https?:\/\/[a-z]+-[a-z0-9]+-\d+\.com\/?$/i;
const FAKE_URL_REGEX_2 = /^https?:\/\/[a-z]+-\d+\.com\/?$/i;

const normalizeLower = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const isValidHttpUrl = (value) => {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isFakeGeneratedPattern = (title, url) => {
  const safeTitle = typeof title === "string" ? title.trim() : "";
  const safeUrl = typeof url === "string" ? url.trim() : "";
  return (
    FAKE_TITLE_REGEX.test(safeTitle) &&
    (FAKE_URL_REGEX_1.test(safeUrl) || FAKE_URL_REGEX_2.test(safeUrl))
  );
};

const getTimestampLabel = () => new Date().toISOString().replace(/[:.]/g, "-");

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeJsonFile = (filePath, data) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const fetchAllTools = async (selectColumns, pageSize = 1000) => {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("tools")
      .select(selectColumns)
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to read tools rows: ${error.message}`);
    }

    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += data.length;
  }

  return rows;
};

const getDuplicateStats = (values) => {
  const counts = new Map();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  let groups = 0;
  let extraRows = 0;
  for (const count of counts.values()) {
    if (count > 1) {
      groups += 1;
      extraRows += count - 1;
    }
  }

  return { groups, extraRows };
};

const tryLoadSource = () => {
  if (!fs.existsSync(sourcePath)) {
    return null;
  }
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : null;
};

const main = async () => {
  const rows = await fetchAllTools("id,title,url,description,category");
  const total = rows.length;

  const suspiciousCount = rows.filter((row) => isFakeGeneratedPattern(row.title, row.url)).length;
  const invalidUrlCount = rows.filter((row) => !isValidHttpUrl(row.url)).length;
  const missingRequiredCount = rows.filter((row) => {
    const hasTitle = typeof row.title === "string" && row.title.trim() !== "";
    const hasDesc = typeof row.description === "string" && row.description.trim() !== "";
    const hasCategory = typeof row.category === "string" && row.category.trim() !== "";
    const hasUrl = typeof row.url === "string" && row.url.trim() !== "";
    return !(hasTitle && hasDesc && hasCategory && hasUrl);
  }).length;

  const duplicateUrlStats = getDuplicateStats(rows.map((row) => normalizeLower(row.url)));
  const duplicateTitleStats = getDuplicateStats(rows.map((row) => normalizeLower(row.title)));

  const suspiciousRatio = total > 0 ? suspiciousCount / total : 0;
  const validUrlRatio = total > 0 ? (total - invalidUrlCount) / total : 1;

  const sourceData = tryLoadSource();
  let sourceCoverage = null;
  if (sourceData) {
    const sourceUrls = new Set(
      sourceData
        .map((item) => normalizeLower(item?.url))
        .filter(Boolean)
    );
    const dbUrls = new Set(
      rows
        .map((item) => normalizeLower(item?.url))
        .filter(Boolean)
    );

    let covered = 0;
    for (const url of sourceUrls) {
      if (dbUrls.has(url)) covered += 1;
    }

    sourceCoverage = {
      source_rows: sourceData.length,
      source_unique_urls: sourceUrls.size,
      covered_urls_in_db: covered,
      coverage_ratio: sourceUrls.size > 0 ? covered / sourceUrls.size : 1,
    };
  }

  const verification = {
    generated_at: new Date().toISOString(),
    db_total: total,
    source_file: sourceData ? sourceFileArg : null,
    source_coverage: sourceCoverage,
    quality: {
      suspicious_count: suspiciousCount,
      suspicious_ratio: suspiciousRatio,
      invalid_url_count: invalidUrlCount,
      valid_url_ratio: validUrlRatio,
      missing_required_count: missingRequiredCount,
      duplicate_url_groups: duplicateUrlStats.groups,
      duplicate_url_extra_rows: duplicateUrlStats.extraRows,
      duplicate_title_groups: duplicateTitleStats.groups,
      duplicate_title_extra_rows: duplicateTitleStats.extraRows,
    },
    acceptance: {
      suspicious_lt_1pct: suspiciousRatio < 0.01,
      valid_urls_100pct: validUrlRatio === 1,
      missing_required_eq_0: missingRequiredCount === 0,
      duplicate_url_extra_eq_0: duplicateUrlStats.extraRows === 0,
      duplicate_title_extra_eq_0: duplicateTitleStats.extraRows === 0,
    },
  };

  const defaultOut = path.join("backups", `supabase-verify-report-${getTimestampLabel()}.json`);
  const outPath = path.resolve(process.cwd(), outFileArg || defaultOut);
  writeJsonFile(outPath, verification);

  console.log("---- Verify Summary ----");
  console.log(`DB rows: ${verification.db_total}`);
  console.log(`Suspicious ratio: ${(suspiciousRatio * 100).toFixed(4)}%`);
  console.log(`Valid URL ratio: ${(validUrlRatio * 100).toFixed(2)}%`);
  console.log(`Missing required: ${missingRequiredCount}`);
  console.log(`Duplicate URL extra rows: ${duplicateUrlStats.extraRows}`);
  console.log(`Duplicate Title extra rows: ${duplicateTitleStats.extraRows}`);
  if (sourceCoverage) {
    console.log(
      `Source URL coverage: ${(sourceCoverage.coverage_ratio * 100).toFixed(2)}% (${sourceCoverage.covered_urls_in_db}/${sourceCoverage.source_unique_urls})`
    );
  }
  console.log(`Verify report written: ${outPath}`);

  if (failOnAcceptance) {
    const allAccepted = Object.values(verification.acceptance).every(Boolean);
    if (!allAccepted) {
      console.error("Acceptance check failed.");
      process.exit(2);
    }
  }
};

main().catch((err) => {
  console.error("Verify failed:", err?.message || err);
  process.exit(1);
});
