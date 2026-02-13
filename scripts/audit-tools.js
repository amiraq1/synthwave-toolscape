import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

const getArgValue = (name, fallback) => {
  const arg = args.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : fallback;
};

const apply = args.includes("--apply");
const strictness = getArgValue("--strictness", "balanced");
const sourceFile = getArgValue("--source", "public/data/tools.json");
const cleanedOutFile = getArgValue("--cleaned-out", "public/data/tools.cleaned.json");
const reportOutFile = getArgValue("--report-out", "reports/tools-audit-report.md");
const metricsOutFile = getArgValue("--metrics-out", "reports/tools-audit-metrics.json");
const removedOutFile = getArgValue("--removed-out", "reports/tools-removed.jsonl");

const sourcePath = path.resolve(process.cwd(), sourceFile);
const cleanedOutPath = path.resolve(process.cwd(), cleanedOutFile);
const reportOutPath = path.resolve(process.cwd(), reportOutFile);
const metricsOutPath = path.resolve(process.cwd(), metricsOutFile);
const removedOutPath = path.resolve(process.cwd(), removedOutFile);

const ALLOWED_STRICTNESS = new Set(["balanced", "strict", "conservative"]);
if (!ALLOWED_STRICTNESS.has(strictness)) {
  console.error("Invalid --strictness value. Allowed: balanced, strict, conservative");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const FAKE_TITLE_REGEX = /^[A-Z][a-zA-Z]+\s+\d+$/;
const FAKE_URL_REGEX_1 = /^https?:\/\/[a-z]+-[a-z0-9]+-\d+\.com\/?$/i;
const FAKE_URL_REGEX_2 = /^https?:\/\/[a-z]+-\d+\.com\/?$/i;

const REASONS = {
  FAKE_GENERATED_PATTERN: "FAKE_GENERATED_PATTERN",
  MISSING_REQUIRED: "MISSING_REQUIRED",
  INVALID_URL: "INVALID_URL",
  DUPLICATE_URL: "DUPLICATE_URL",
  DUPLICATE_TITLE: "DUPLICATE_TITLE",
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidHttpUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeArrayOfStrings = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const getDescriptionLength = (tool) => {
  if (!isNonEmptyString(tool?.description)) return 0;
  return tool.description.trim().length;
};

const getQualityScore = (tool) => {
  let score = 0;
  const descriptionLength = getDescriptionLength(tool);
  const featuresCount = normalizeArrayOfStrings(tool?.features).length;
  const screenshotsCount = normalizeArrayOfStrings(tool?.screenshots).length;

  if (descriptionLength >= 80) score += 3;
  if (featuresCount >= 2) score += 2;
  if (screenshotsCount > 0) score += 1;
  if (isValidHttpUrl(tool?.image_url)) score += 1;

  const reviewsCount =
    typeof tool?.reviews_count === "number"
      ? tool.reviews_count
      : Number.parseInt(String(tool?.reviews_count ?? ""), 10);
  if (Number.isFinite(reviewsCount) && reviewsCount > 0) score += 1;

  if (tool?.supports_arabic === true) score += 1;
  return score;
};

const compareEntries = (left, right) => {
  if (left.score !== right.score) return left.score - right.score;
  if (left.descriptionLength !== right.descriptionLength) {
    return left.descriptionLength - right.descriptionLength;
  }
  return right.index - left.index;
};

const pickBestEntry = (entries) => {
  let best = entries[0];
  for (let i = 1; i < entries.length; i += 1) {
    const candidate = entries[i];
    if (compareEntries(candidate, best) > 0) {
      best = candidate;
    }
  }
  return best;
};

const isFakeGeneratedPattern = (tool, mode) => {
  const title = isNonEmptyString(tool?.title) ? tool.title.trim() : "";
  const url = isNonEmptyString(tool?.url) ? tool.url.trim() : "";
  const titleMatches = FAKE_TITLE_REGEX.test(title);
  const urlMatches = FAKE_URL_REGEX_1.test(url) || FAKE_URL_REGEX_2.test(url);

  if (mode === "strict") {
    return titleMatches || urlMatches;
  }

  if (mode === "conservative") {
    const hasRealSignals =
      normalizeArrayOfStrings(tool?.features).length >= 2 ||
      (typeof tool?.reviews_count === "number" && tool.reviews_count > 0);
    return titleMatches && urlMatches && !hasRealSignals;
  }

  return titleMatches && urlMatches;
};

const ensureParentDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const toJsonLine = (value) => `${JSON.stringify(value)}\n`;

const loadSource = () => {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Source JSON must be an array.");
  }
  return parsed;
};

const removedItems = [];
const removedByReason = {
  [REASONS.FAKE_GENERATED_PATTERN]: 0,
  [REASONS.MISSING_REQUIRED]: 0,
  [REASONS.INVALID_URL]: 0,
  [REASONS.DUPLICATE_URL]: 0,
  [REASONS.DUPLICATE_TITLE]: 0,
};

const pushRemoved = (entry, reason, details = {}) => {
  removedByReason[reason] += 1;
  removedItems.push({
    reason,
    index: entry.index,
    score: entry.score,
    description_length: entry.descriptionLength,
    id: entry.tool.id ?? null,
    title: entry.tool.title ?? null,
    url: entry.tool.url ?? null,
    details,
  });
};

const source = loadSource();

const prepared = source.map((tool, index) => ({
  tool,
  index,
  score: getQualityScore(tool),
  descriptionLength: getDescriptionLength(tool),
}));

const stageOneKept = [];
for (const entry of prepared) {
  const hasMissingRequired =
    !isNonEmptyString(entry.tool?.title) ||
    !isNonEmptyString(entry.tool?.description) ||
    !isNonEmptyString(entry.tool?.category) ||
    !isNonEmptyString(entry.tool?.url);

  if (isFakeGeneratedPattern(entry.tool, strictness)) {
    pushRemoved(entry, REASONS.FAKE_GENERATED_PATTERN);
    continue;
  }

  if (hasMissingRequired) {
    pushRemoved(entry, REASONS.MISSING_REQUIRED);
    continue;
  }

  if (!isValidHttpUrl(entry.tool.url)) {
    pushRemoved(entry, REASONS.INVALID_URL);
    continue;
  }

  stageOneKept.push(entry);
}

const dedupeByKey = (items, keySelector, reason) => {
  const groups = new Map();
  for (const entry of items) {
    const key = keySelector(entry);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }

  const kept = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      kept.push(group[0]);
      continue;
    }

    const best = pickBestEntry(group);
    kept.push(best);
    for (const candidate of group) {
      if (candidate === best) continue;
      pushRemoved(candidate, reason, {
        kept_index: best.index,
        kept_id: best.tool.id ?? null,
        kept_title: best.tool.title ?? null,
        kept_url: best.tool.url ?? null,
      });
    }
  }

  return kept;
};

const afterUrlDedupe = dedupeByKey(
  stageOneKept,
  (entry) => entry.tool.url.trim().toLowerCase(),
  REASONS.DUPLICATE_URL
);

const afterTitleDedupe = dedupeByKey(
  afterUrlDedupe,
  (entry) => entry.tool.title.trim().toLowerCase(),
  REASONS.DUPLICATE_TITLE
);

afterTitleDedupe.sort((a, b) => a.index - b.index);
removedItems.sort((a, b) => a.index - b.index);

const cleanedTools = afterTitleDedupe.map((entry) => entry.tool);
const cleanedSuspiciousCount = cleanedTools.filter((tool) =>
  isFakeGeneratedPattern(tool, "balanced")
).length;
const cleanedInvalidUrlCount = cleanedTools.filter((tool) => !isValidHttpUrl(tool.url)).length;

const cleanedSuspiciousRatio = cleanedTools.length > 0 ? cleanedSuspiciousCount / cleanedTools.length : 0;
const cleanedValidUrlRatio =
  cleanedTools.length > 0 ? (cleanedTools.length - cleanedInvalidUrlCount) / cleanedTools.length : 1;

const acceptance = {
  suspicious_ratio_lt_1pct: cleanedSuspiciousRatio < 0.01,
  valid_urls_100pct: cleanedValidUrlRatio === 1,
};

const metrics = {
  generated_at: new Date().toISOString(),
  mode: apply ? "apply" : "dry-run",
  strictness,
  source_path: sourceFile,
  outputs: {
    cleaned_out: cleanedOutFile,
    report_out: reportOutFile,
    metrics_out: metricsOutFile,
    removed_out: removedOutFile,
  },
  counts: {
    source_total: source.length,
    kept_after_validation: stageOneKept.length,
    cleaned_total: cleanedTools.length,
    removed_total: removedItems.length,
  },
  removed_by_reason: removedByReason,
  post_clean_quality: {
    suspicious_pattern_count: cleanedSuspiciousCount,
    suspicious_ratio: cleanedSuspiciousRatio,
    invalid_url_count: cleanedInvalidUrlCount,
    valid_url_ratio: cleanedValidUrlRatio,
  },
  acceptance,
};

const summaryTableRows = [
  ["Source Total", String(metrics.counts.source_total)],
  ["Cleaned Total", String(metrics.counts.cleaned_total)],
  ["Removed Total", String(metrics.counts.removed_total)],
  ["Removed Fake", String(removedByReason[REASONS.FAKE_GENERATED_PATTERN])],
  ["Removed Missing", String(removedByReason[REASONS.MISSING_REQUIRED])],
  ["Removed Invalid URL", String(removedByReason[REASONS.INVALID_URL])],
  ["Removed Duplicate URL", String(removedByReason[REASONS.DUPLICATE_URL])],
  ["Removed Duplicate Title", String(removedByReason[REASONS.DUPLICATE_TITLE])],
  ["Suspicious Ratio", `${(cleanedSuspiciousRatio * 100).toFixed(4)}%`],
  ["Valid URL Ratio", `${(cleanedValidUrlRatio * 100).toFixed(2)}%`],
];

const reportLines = [
  "# Tools Audit Report",
  "",
  `- Generated At: ${metrics.generated_at}`,
  `- Mode: ${metrics.mode}`,
  `- Strictness: ${metrics.strictness}`,
  `- Source: \`${metrics.source_path}\``,
  "",
  "## Executive Summary",
  "",
  "| Metric | Value |",
  "| --- | ---: |",
  ...summaryTableRows.map(([metric, value]) => `| ${metric} | ${value} |`),
  "",
  "## Acceptance Checks",
  "",
  `- Suspicious ratio < 1%: ${acceptance.suspicious_ratio_lt_1pct ? "PASS" : "FAIL"}`,
  `- Valid URLs = 100%: ${acceptance.valid_urls_100pct ? "PASS" : "FAIL"}`,
  "",
  "## Output Targets",
  "",
  `- Cleaned JSON: \`${cleanedOutFile}\``,
  `- Metrics JSON: \`${metricsOutFile}\``,
  `- Removed JSONL: \`${removedOutFile}\``,
];

const report = reportLines.join("\n");

console.log("---- Audit Summary ----");
console.log(`Mode: ${metrics.mode}`);
console.log(`Strictness: ${strictness}`);
console.log(`Source rows: ${source.length}`);
console.log(`Cleaned rows: ${cleanedTools.length}`);
console.log(`Removed rows: ${removedItems.length}`);
console.log(`Removed fake: ${removedByReason[REASONS.FAKE_GENERATED_PATTERN]}`);
console.log(`Removed missing: ${removedByReason[REASONS.MISSING_REQUIRED]}`);
console.log(`Removed invalid URL: ${removedByReason[REASONS.INVALID_URL]}`);
console.log(`Removed duplicate URL: ${removedByReason[REASONS.DUPLICATE_URL]}`);
console.log(`Removed duplicate title: ${removedByReason[REASONS.DUPLICATE_TITLE]}`);
console.log(`Suspicious ratio: ${(cleanedSuspiciousRatio * 100).toFixed(4)}%`);
console.log(`Valid URL ratio: ${(cleanedValidUrlRatio * 100).toFixed(2)}%`);

if (!apply) {
  console.log("Dry-run mode: no files were written. Use --apply to write outputs.");
  process.exit(0);
}

ensureParentDir(cleanedOutPath);
ensureParentDir(reportOutPath);
ensureParentDir(metricsOutPath);
ensureParentDir(removedOutPath);

fs.writeFileSync(cleanedOutPath, JSON.stringify(cleanedTools, null, 2), "utf8");
fs.writeFileSync(reportOutPath, report, "utf8");
fs.writeFileSync(metricsOutPath, JSON.stringify(metrics, null, 2), "utf8");
fs.writeFileSync(removedOutPath, removedItems.map((item) => toJsonLine(item)).join(""), "utf8");

console.log("Wrote cleaned JSON, report, metrics, and removed log.");
