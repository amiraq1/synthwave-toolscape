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

const dryRun = args.includes("--dry-run");
const upsertMode = args.includes("--upsert");
const deleteSuspicious = args.includes("--delete-suspicious");
const deleteInvalidUrl = args.includes("--delete-invalid-url");
const pruneNonSource = args.includes("--prune-non-source");

const batchArg = getArgValue("--batch-size", "250");
const batchSize = Number.parseInt(batchArg, 10);
const finalBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 250;

const sourceFile = getArgValue("--source", "public/data/tools.json");
const backupDirArg = getArgValue("--backup-dir", "backups");
const sourcePath = path.resolve(process.cwd(), sourceFile);
const backupDirPath = path.resolve(process.cwd(), backupDirArg);

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

const FAKE_TITLE_REGEX = /^[A-Z][a-zA-Z]+\s+\d+$/;
const FAKE_URL_REGEX_1 = /^https?:\/\/[a-z]+-[a-z0-9]+-\d+\.com\/?$/i;
const FAKE_URL_REGEX_2 = /^https?:\/\/[a-z]+-\d+\.com\/?$/i;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeLower = (value) => (isNonEmptyString(value) ? value.trim().toLowerCase() : "");

const isValidHttpUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isFakeGeneratedPattern = (title, url) => {
  const safeTitle = isNonEmptyString(title) ? title.trim() : "";
  const safeUrl = isNonEmptyString(url) ? url.trim() : "";
  return (
    FAKE_TITLE_REGEX.test(safeTitle) &&
    (FAKE_URL_REGEX_1.test(safeUrl) || FAKE_URL_REGEX_2.test(safeUrl))
  );
};

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

const getTimestampLabel = () => new Date().toISOString().replace(/[:.]/g, "-");

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeJsonFile = (filePath, data) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const readSourceTools = () => {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Source JSON is not an array.");
  }
  return parsed;
};

const getSchemaColumns = async () => {
  const { data, error } = await supabase.from("tools").select("*").limit(1);
  if (error) {
    throw new Error(`Failed to read tools schema sample: ${error.message}`);
  }
  if (data && data.length > 0) {
    return new Set(Object.keys(data[0]));
  }

  return new Set([
    "title",
    "title_en",
    "description",
    "description_en",
    "category",
    "url",
    "image_url",
    "pricing_type",
    "is_featured",
    "is_published",
    "features",
    "screenshots",
    "is_sponsored",
    "supports_arabic",
    "average_rating",
    "reviews_count",
    "views_count",
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

const fetchAllTools = async (selectColumns, pageSize = 1000) => {
  const allRows = [];
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
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += data.length;
  }

  return allRows;
};

const buildLookupMaps = (rows) => {
  const byUrl = new Map();
  const byTitle = new Map();

  for (const row of rows) {
    const urlKey = normalizeLower(row.url);
    const titleKey = normalizeLower(row.title);

    if (urlKey) {
      const existing = byUrl.get(urlKey);
      if (!existing || Number(row.id) > Number(existing.id)) {
        byUrl.set(urlKey, row);
      }
    }

    if (titleKey) {
      const existing = byTitle.get(titleKey);
      if (!existing || Number(row.id) > Number(existing.id)) {
        byTitle.set(titleKey, row);
      }
    }
  }

  return { byUrl, byTitle };
};

const normalizeSourceRows = (source, availableColumns) => {
  const normalizedRows = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  let invalidSourceCount = 0;
  let duplicateSourceCount = 0;

  for (const item of source) {
    const row = buildRow(item, availableColumns);
    if (!row) {
      invalidSourceCount += 1;
      continue;
    }

    const urlKey = normalizeLower(row.url);
    const titleKey = normalizeLower(row.title);

    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) {
      duplicateSourceCount += 1;
      continue;
    }

    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    normalizedRows.push(row);
  }

  return { normalizedRows, invalidSourceCount, duplicateSourceCount };
};

const chunkArray = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const tryResolveTitleConflict = async (title) => {
  const { data, error } = await supabase.from("tools").select("id,title,url").ilike("title", title).limit(10);
  if (error || !data) return null;
  const targetKey = normalizeLower(title);
  return data.find((row) => normalizeLower(row.title) === targetKey) || data[0] || null;
};

const isUniqueConflictError = (message) => {
  const lowered = String(message || "").toLowerCase();
  return (
    lowered.includes("duplicate key") ||
    lowered.includes("unique") ||
    lowered.includes("idx_tools_unique_title")
  );
};

const applyUpdatePlan = async (plan, pushFailure) => {
  let updated = 0;
  let failed = 0;

  const batches = chunkArray(plan, finalBatchSize);
  for (const batch of batches) {
    const payload = batch.map((item) => ({ id: Number(item.id), ...item.row }));
    const { error } = await supabase.from("tools").upsert(payload, { onConflict: "id" });
    if (!error) {
      updated += batch.length;
      continue;
    }

    for (const item of batch) {
      const { error: singleError } = await supabase
        .from("tools")
        .update(item.row)
        .eq("id", Number(item.id));

      if (singleError) {
        failed += 1;
        pushFailure({
          operation: "update",
          index: item.index,
          id: item.id,
          title: item.row.title,
          url: item.row.url,
          error: singleError.message,
        });
      } else {
        updated += 1;
      }
    }
  }

  return { updated, failed };
};

const applyInsertPlan = async (plan, upsertEnabled, pushFailure) => {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  const batches = chunkArray(plan, finalBatchSize);
  for (const batch of batches) {
    const payload = batch.map((item) => item.row);
    const { error } = await supabase.from("tools").insert(payload);
    if (!error) {
      inserted += batch.length;
      continue;
    }

    for (const item of batch) {
      const { error: singleInsertError } = await supabase.from("tools").insert(item.row);
      if (!singleInsertError) {
        inserted += 1;
        continue;
      }

      if (upsertEnabled && isUniqueConflictError(singleInsertError.message)) {
        const conflictRow = await tryResolveTitleConflict(item.row.title);
        if (conflictRow) {
          const { error: conflictUpdateError } = await supabase
            .from("tools")
            .update(item.row)
            .eq("id", Number(conflictRow.id));
          if (!conflictUpdateError) {
            updated += 1;
            continue;
          }
          failed += 1;
          pushFailure({
            operation: "conflict-update",
            index: item.index,
            title: item.row.title,
            url: item.row.url,
            error: conflictUpdateError.message,
          });
          continue;
        }
      }

      failed += 1;
      pushFailure({
        operation: "insert",
        index: item.index,
        title: item.row.title,
        url: item.row.url,
        error: singleInsertError.message,
      });
    }
  }

  return { inserted, updated, failed };
};

const main = async () => {
  const timestampLabel = getTimestampLabel();
  const source = readSourceTools();
  const availableColumns = await getSchemaColumns();
  const { normalizedRows, invalidSourceCount, duplicateSourceCount } = normalizeSourceRows(
    source,
    availableColumns
  );

  if (normalizedRows.length === 0) {
    throw new Error("No valid source rows to sync after normalization.");
  }

  const initialRows = await fetchAllTools("id,title,url");
  const beforeCount = initialRows.length;

  console.log(`Source: ${sourcePath}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);
  console.log(`Sync behavior: ${upsertMode ? "UPSERT (update + insert)" : "INSERT ONLY"}`);
  console.log(`Delete suspicious: ${deleteSuspicious ? "yes" : "no"}`);
  console.log(`Delete invalid URLs: ${deleteInvalidUrl ? "yes" : "no"}`);
  console.log(`Prune non-source rows: ${pruneNonSource ? "yes" : "no"}`);
  console.log(`Batch size: ${finalBatchSize}`);
  console.log(`Source rows: ${source.length}`);
  console.log(`Valid source rows: ${normalizedRows.length}`);
  console.log(`Invalid source rows ignored: ${invalidSourceCount}`);
  console.log(`Duplicate source rows ignored: ${duplicateSourceCount}`);
  console.log(`Rows in DB before sync: ${beforeCount}`);

  let backupFilePath = null;
  let deletedLogPath = null;
  let invalidDeletedLogPath = null;

  if (!dryRun) {
    ensureDir(backupDirPath);
    const snapshotRows = await fetchAllTools("*");
    backupFilePath = path.join(backupDirPath, `supabase-tools-before-${timestampLabel}.json`);
    writeJsonFile(backupFilePath, snapshotRows);
    console.log(`Backup snapshot written: ${backupFilePath}`);
  }

  let workingRows = initialRows;
  let suspiciousCandidates = [];
  let deletedCount = 0;
  let deleteFailures = 0;
  let invalidUrlCandidates = [];
  let invalidDeletedCount = 0;
  let invalidDeleteFailures = 0;
  let pruneCandidates = [];
  let pruneDeletedCount = 0;
  let pruneDeleteFailures = 0;

  if (deleteSuspicious) {
    suspiciousCandidates = initialRows.filter((row) => isFakeGeneratedPattern(row.title, row.url));
    console.log(`Suspicious rows detected in DB: ${suspiciousCandidates.length}`);

    if (!dryRun && suspiciousCandidates.length > 0) {
      deletedLogPath = path.join(backupDirPath, `supabase-tools-deleted-${timestampLabel}.json`);
      writeJsonFile(deletedLogPath, suspiciousCandidates);

      const idBatches = chunkArray(suspiciousCandidates.map((row) => row.id), 500);
      for (const idBatch of idBatches) {
        const { error } = await supabase.from("tools").delete().in("id", idBatch);
        if (error) {
          deleteFailures += idBatch.length;
          console.error(`Delete batch failed: ${error.message}`);
          continue;
        }
        deletedCount += idBatch.length;
      }
      console.log(`Deleted suspicious rows: ${deletedCount}`);
      if (deleteFailures > 0) {
        console.log(`Suspicious rows failed to delete: ${deleteFailures}`);
      }
      workingRows = await fetchAllTools("id,title,url");
    } else if (dryRun && suspiciousCandidates.length > 0) {
      const candidateIds = new Set(suspiciousCandidates.map((row) => row.id));
      workingRows = initialRows.filter((row) => !candidateIds.has(row.id));
    }
  }

  if (deleteInvalidUrl) {
    invalidUrlCandidates = workingRows.filter((row) => !isValidHttpUrl(row.url));
    console.log(`Invalid-URL rows detected in DB: ${invalidUrlCandidates.length}`);

    if (!dryRun && invalidUrlCandidates.length > 0) {
      invalidDeletedLogPath = path.join(
        backupDirPath,
        `supabase-tools-deleted-invalid-url-${timestampLabel}.json`
      );
      writeJsonFile(invalidDeletedLogPath, invalidUrlCandidates);

      const idBatches = chunkArray(
        invalidUrlCandidates.map((row) => row.id),
        500
      );
      for (const idBatch of idBatches) {
        const { error } = await supabase.from("tools").delete().in("id", idBatch);
        if (error) {
          invalidDeleteFailures += idBatch.length;
          console.error(`Delete invalid-url batch failed: ${error.message}`);
          continue;
        }
        invalidDeletedCount += idBatch.length;
      }
      console.log(`Deleted invalid-url rows: ${invalidDeletedCount}`);
      if (invalidDeleteFailures > 0) {
        console.log(`Invalid-url rows failed to delete: ${invalidDeleteFailures}`);
      }
      workingRows = await fetchAllTools("id,title,url");
    } else if (dryRun && invalidUrlCandidates.length > 0) {
      const invalidIds = new Set(invalidUrlCandidates.map((row) => row.id));
      workingRows = workingRows.filter((row) => !invalidIds.has(row.id));
    }
  }

  const { byUrl, byTitle } = buildLookupMaps(workingRows);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  const pushFailure = (payload) => {
    if (failures.length < 20) failures.push(payload);
  };

  const updatePlan = [];
  const insertPlan = [];

  for (let index = 0; index < normalizedRows.length; index += 1) {
    const row = normalizedRows[index];
    const urlKey = normalizeLower(row.url);
    const titleKey = normalizeLower(row.title);
    const matched = byUrl.get(urlKey) || byTitle.get(titleKey);

    if (matched && !upsertMode) {
      skipped += 1;
      continue;
    }

    if (matched && upsertMode) {
      updatePlan.push({
        index,
        id: Number(matched.id),
        row,
      });
      continue;
    }

    insertPlan.push({
      index,
      row,
    });
  }

  if (dryRun) {
    updated += updatePlan.length;
    inserted += insertPlan.length;
  } else {
    if (updatePlan.length > 0) {
      const updateResult = await applyUpdatePlan(updatePlan, pushFailure);
      updated += updateResult.updated;
      failed += updateResult.failed;
    }

    if (insertPlan.length > 0) {
      const insertResult = await applyInsertPlan(insertPlan, upsertMode, pushFailure);
      inserted += insertResult.inserted;
      updated += insertResult.updated;
      failed += insertResult.failed;
    }
  }

  if (pruneNonSource) {
    const sourceUrlSet = new Set(normalizedRows.map((row) => normalizeLower(row.url)).filter(Boolean));
    const rowsForPrune = await fetchAllTools("id,title,url");
    pruneCandidates = rowsForPrune.filter((row) => !sourceUrlSet.has(normalizeLower(row.url)));
    console.log(`Non-source rows detected for prune: ${pruneCandidates.length}`);

    if (!dryRun && pruneCandidates.length > 0) {
      const pruneLogPath = path.join(
        backupDirPath,
        `supabase-tools-pruned-non-source-${timestampLabel}.json`
      );
      writeJsonFile(pruneLogPath, pruneCandidates);

      const idBatches = chunkArray(
        pruneCandidates.map((row) => row.id),
        500
      );
      for (const idBatch of idBatches) {
        const { error } = await supabase.from("tools").delete().in("id", idBatch);
        if (error) {
          pruneDeleteFailures += idBatch.length;
          console.error(`Prune batch failed: ${error.message}`);
          continue;
        }
        pruneDeletedCount += idBatch.length;
      }
      console.log(`Pruned non-source rows: ${pruneDeletedCount}`);
      if (pruneDeleteFailures > 0) {
        console.log(`Non-source rows failed to prune: ${pruneDeleteFailures}`);
      }
    }
  }

  const afterRows = await fetchAllTools("id,title,url");
  const afterCount = afterRows.length;
  const suspiciousAfter = afterRows.filter((row) => isFakeGeneratedPattern(row.title, row.url)).length;
  const invalidUrlAfter = afterRows.filter((row) => !isValidHttpUrl(row.url)).length;

  const suspiciousRatio = afterCount > 0 ? suspiciousAfter / afterCount : 0;
  const validUrlRatio = afterCount > 0 ? (afterCount - invalidUrlAfter) / afterCount : 1;

  const syncReport = {
    generated_at: new Date().toISOString(),
    mode: dryRun ? "dry-run" : "write",
    source_path: sourceFile,
    options: {
      upsert: upsertMode,
      delete_suspicious: deleteSuspicious,
      delete_invalid_url: deleteInvalidUrl,
      prune_non_source: pruneNonSource,
      batch_size: finalBatchSize,
      backup_dir: backupDirArg,
    },
    counts: {
      before: beforeCount,
      after: afterCount,
      source_total: source.length,
      source_valid: normalizedRows.length,
      source_invalid_ignored: invalidSourceCount,
      source_duplicates_ignored: duplicateSourceCount,
      suspicious_detected_for_delete: suspiciousCandidates.length,
      suspicious_deleted: deletedCount,
      suspicious_delete_failures: deleteFailures,
      invalid_url_detected_for_delete: invalidUrlCandidates.length,
      invalid_url_deleted: invalidDeletedCount,
      invalid_url_delete_failures: invalidDeleteFailures,
      non_source_detected_for_prune: pruneCandidates.length,
      non_source_pruned: pruneDeletedCount,
      non_source_prune_failures: pruneDeleteFailures,
      inserted,
      updated,
      skipped,
      failed,
    },
    verification: {
      suspicious_count: suspiciousAfter,
      suspicious_ratio: suspiciousRatio,
      invalid_url_count: invalidUrlAfter,
      valid_url_ratio: validUrlRatio,
      pass_suspicious_lt_1pct: suspiciousRatio < 0.01,
      pass_valid_urls_100pct: validUrlRatio === 1,
    },
    artifacts: {
      backup_snapshot: backupFilePath,
      deleted_log: deletedLogPath,
      deleted_invalid_url_log: invalidDeletedLogPath,
    },
    failures_sample: failures,
  };

  console.log("---- Sync Summary ----");
  console.log(`Before: ${beforeCount}`);
  console.log(`After: ${afterCount}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Deleted suspicious: ${deletedCount}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Post-check suspicious ratio: ${(suspiciousRatio * 100).toFixed(4)}%`);
  console.log(`Post-check valid URL ratio: ${(validUrlRatio * 100).toFixed(2)}%`);
  console.log(`Acceptance suspicious<1%: ${syncReport.verification.pass_suspicious_lt_1pct ? "PASS" : "FAIL"}`);
  console.log(`Acceptance valid URLs=100%: ${syncReport.verification.pass_valid_urls_100pct ? "PASS" : "FAIL"}`);

  if (failures.length > 0) {
    console.log("Sample failures (max 20):");
    for (const entry of failures) {
      console.log(`- op=${entry.operation} idx=${entry.index} title=${entry.title || ""} error=${entry.error}`);
    }
  }

  if (!dryRun) {
    const reportPath = path.join(backupDirPath, `supabase-sync-report-${timestampLabel}.json`);
    writeJsonFile(reportPath, syncReport);
    console.log(`Sync report written: ${reportPath}`);
  }
};

main().catch((err) => {
  console.error("Sync failed:", err?.message || err);
  process.exit(1);
});
