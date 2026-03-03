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

const apply = args.includes("--apply");
const batchArg = getArgValue("--batch-size", "250");
const batchSize = Number.parseInt(batchArg, 10);
const finalBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 250;

const backupDirArg = getArgValue("--backup-dir", "backups");
const backupDirPath = path.resolve(process.cwd(), backupDirArg);
const backupFileArg = getArgValue("--backup-file", "");

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

if (apply && !serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Required for restore writes.");
  process.exit(1);
}

if (!serviceRoleKey && !anonKey) {
  console.error("Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const normalizeLower = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const chunkArray = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

const getTimestampLabel = () => new Date().toISOString().replace(/[:.]/g, "-");

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeJsonFile = (filePath, data) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const findLatestBackupFile = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    return null;
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((name) => name.startsWith("supabase-tools-before-") && name.endsWith(".json"))
    .map((name) => path.join(dirPath, name))
    .sort();

  if (files.length === 0) return null;
  return files[files.length - 1];
};

const resolveBackupPath = () => {
  if (backupFileArg) {
    const explicit = path.resolve(process.cwd(), backupFileArg);
    if (!fs.existsSync(explicit)) {
      throw new Error(`Backup file not found: ${explicit}`);
    }
    return explicit;
  }

  const latest = findLatestBackupFile(backupDirPath);
  if (!latest) {
    throw new Error(
      `No backup snapshot found in ${backupDirPath}. Pass --backup-file=<path> or create a backup first.`
    );
  }
  return latest;
};

const loadBackupRows = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Backup JSON must be an array of rows.");
  }
  if (parsed.length === 0) {
    throw new Error("Backup JSON is empty. Refusing restore.");
  }
  return parsed;
};

const validateBackupRows = (rows) => {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const id = Number(row?.id);
    if (!Number.isFinite(id)) {
      throw new Error(`Backup row ${i} has invalid id`);
    }
  }
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

const deleteIdsInBatches = async (ids, label) => {
  let deleted = 0;
  let failed = 0;
  const failures = [];

  const batches = chunkArray(ids, 500);
  for (const batch of batches) {
    const { error } = await supabase.from("tools").delete().in("id", batch);
    if (!error) {
      deleted += batch.length;
      continue;
    }

    for (const id of batch) {
      const { error: singleError } = await supabase.from("tools").delete().eq("id", Number(id));
      if (singleError) {
        failed += 1;
        if (failures.length < 20) {
          failures.push({
            operation: `${label}-delete`,
            id,
            error: singleError.message,
          });
        }
      } else {
        deleted += 1;
      }
    }
  }

  return { deleted, failed, failures };
};

const upsertBackupInBatches = async (rows, batchSizeValue) => {
  let upserted = 0;
  let failed = 0;
  const failures = [];

  const batches = chunkArray(rows, batchSizeValue);
  for (const batch of batches) {
    const { error } = await supabase.from("tools").upsert(batch, { onConflict: "id" });
    if (!error) {
      upserted += batch.length;
      continue;
    }

    for (const row of batch) {
      const { error: singleError } = await supabase
        .from("tools")
        .upsert(row, { onConflict: "id" });
      if (singleError) {
        failed += 1;
        if (failures.length < 20) {
          failures.push({
            operation: "upsert",
            id: row.id,
            title: row.title,
            error: singleError.message,
          });
        }
      } else {
        upserted += 1;
      }
    }
  }

  return { upserted, failed, failures };
};

const main = async () => {
  const backupPath = resolveBackupPath();
  const backupRows = loadBackupRows(backupPath);
  validateBackupRows(backupRows);

  const backupIdSet = new Set(backupRows.map((row) => Number(row.id)));
  const backupTitleSet = new Set(backupRows.map((row) => normalizeLower(row.title)));

  const currentRows = await fetchAllTools("id,title,url");
  const beforeCount = currentRows.length;

  const conflictingRows = currentRows.filter(
    (row) => !backupIdSet.has(Number(row.id)) && backupTitleSet.has(normalizeLower(row.title))
  );
  const extraRows = currentRows.filter((row) => !backupIdSet.has(Number(row.id)));

  console.log(`Backup file: ${backupPath}`);
  console.log(`Mode: ${apply ? "WRITE" : "DRY RUN"}`);
  console.log(`Batch size: ${finalBatchSize}`);
  console.log(`Backup rows: ${backupRows.length}`);
  console.log(`Current DB rows: ${beforeCount}`);
  console.log(`Conflict rows to delete first (title clash): ${conflictingRows.length}`);
  console.log(`Extra rows to delete after upsert: ${extraRows.length}`);

  let conflictDeleted = 0;
  let extraDeleted = 0;
  let upserted = 0;
  let failed = 0;
  const failures = [];

  if (apply) {
    ensureDir(backupDirPath);

    if (conflictingRows.length > 0) {
      const conflictResult = await deleteIdsInBatches(
        conflictingRows.map((row) => row.id),
        "conflict"
      );
      conflictDeleted = conflictResult.deleted;
      failed += conflictResult.failed;
      failures.push(...conflictResult.failures);
    }

    const upsertResult = await upsertBackupInBatches(backupRows, finalBatchSize);
    upserted = upsertResult.upserted;
    failed += upsertResult.failed;
    failures.push(...upsertResult.failures);

    const remainingRows = await fetchAllTools("id,title,url");
    const remainingExtraIds = remainingRows
      .filter((row) => !backupIdSet.has(Number(row.id)))
      .map((row) => row.id);

    if (remainingExtraIds.length > 0) {
      const extraResult = await deleteIdsInBatches(remainingExtraIds, "extra");
      extraDeleted = extraResult.deleted;
      failed += extraResult.failed;
      failures.push(...extraResult.failures);
    }
  } else {
    conflictDeleted = conflictingRows.length;
    upserted = backupRows.length;
    extraDeleted = extraRows.length;
  }

  const afterRows = apply ? await fetchAllTools("id,title,url") : currentRows;
  const afterCount = afterRows.length;

  const afterIdSet = new Set(afterRows.map((row) => Number(row.id)));
  const missingBackupRowsCurrent = backupRows.filter((row) => !afterIdSet.has(Number(row.id))).length;

  const expectedAfterCount = apply ? afterCount : backupRows.length;
  const expectedMissingBackupRows = apply ? missingBackupRowsCurrent : 0;

  const report = {
    generated_at: new Date().toISOString(),
    mode: apply ? "write" : "dry-run",
    backup_file: backupPath,
    batch_size: finalBatchSize,
    counts: {
      backup_rows: backupRows.length,
      before: beforeCount,
      after: afterCount,
      expected_after_if_apply: expectedAfterCount,
      conflict_deleted: conflictDeleted,
      upserted,
      extra_deleted: extraDeleted,
      failed,
      missing_backup_rows_after_restore: missingBackupRowsCurrent,
      expected_missing_backup_rows_if_apply: expectedMissingBackupRows,
    },
    acceptance: {
      restored_count_matches_backup: expectedAfterCount === backupRows.length,
      all_backup_ids_present: expectedMissingBackupRows === 0,
    },
    failures_sample: failures.slice(0, 20),
  };

  console.log("---- Restore Summary ----");
  console.log(`Before: ${beforeCount}`);
  console.log(`After (current): ${afterCount}`);
  if (!apply) {
    console.log(`After (expected if apply): ${expectedAfterCount}`);
  }
  console.log(`Conflict deleted: ${conflictDeleted}`);
  console.log(`Upserted: ${upserted}`);
  console.log(`Extra deleted: ${extraDeleted}`);
  console.log(`Failed: ${failed}`);
  console.log(
    `Acceptance restored_count_matches_backup: ${
      report.acceptance.restored_count_matches_backup ? "PASS" : "FAIL"
    }`
  );
  console.log(
    `Acceptance all_backup_ids_present: ${
      report.acceptance.all_backup_ids_present ? "PASS" : "FAIL"
    }`
  );

  if (failures.length > 0) {
    console.log("Sample failures (max 20):");
    for (const item of failures.slice(0, 20)) {
      console.log(`- op=${item.operation} id=${item.id} error=${item.error}`);
    }
  }

  if (apply) {
    const reportPath = path.join(backupDirPath, `supabase-restore-report-${getTimestampLabel()}.json`);
    writeJsonFile(reportPath, report);
    console.log(`Restore report written: ${reportPath}`);
  }
};

main().catch((err) => {
  console.error("Restore failed:", err?.message || err);
  process.exit(1);
});
