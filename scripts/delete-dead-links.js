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

const dryRun = args.includes("--dry-run") || !args.includes("--apply");
const deleteUncertain = args.includes("--delete-uncertain");
const timeoutMs = Number.parseInt(getArgValue("--timeout-ms", "12000"), 10);
const concurrency = Number.parseInt(getArgValue("--concurrency", "24"), 10);
const retries = Number.parseInt(getArgValue("--retries", "1"), 10);
const batchSize = Number.parseInt(getArgValue("--batch-size", "500"), 10);
const backupDirArg = getArgValue("--backup-dir", "backups");

const finalTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 12000;
const finalConcurrency = Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 24;
const finalRetries = Number.isFinite(retries) && retries >= 0 ? retries : 1;
const finalBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 500;

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
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Required for deletion apply mode.");
  process.exit(1);
}

if (!serviceRoleKey && !anonKey) {
  console.error("Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeJsonFile = (filePath, data) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const getTimestampLabel = () => new Date().toISOString().replace(/[:.]/g, "-");

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isValidHttpUrl = (value) => {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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

const runWithConcurrency = async (items, workerCount, iterator) => {
  const outputs = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;

      outputs[current] = await iterator(items[current], current);
      if ((current + 1) % 100 === 0 || current + 1 === items.length) {
        console.log(`Checked ${current + 1}/${items.length} URLs`);
      }
    }
  };

  const workers = Array.from({ length: Math.min(workerCount, items.length) }, () => worker());
  await Promise.all(workers);
  return outputs;
};

const fetchWithTimeout = async (url, method, timeout) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToolscapeLinkChecker/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
};

const isReachableStatus = (status) => {
  if (status >= 200 && status < 400) return true;
  return [401, 403, 406, 407, 408, 409, 412, 415, 429].includes(status);
};

const shouldRetryStatus = (status) => status >= 500 || status === 408 || status === 429;

const shouldFallbackToGet = (status) => status >= 400 || status === 405 || status === 501;

const toErrorText = (error) => {
  if (!error) return "Unknown error";
  if (error.name === "AbortError") return "Request timeout";
  return error.message || String(error);
};

const classifyNetworkError = (error) => {
  const code = error?.cause?.code || "";
  if (error?.name === "AbortError") {
    return { reason: "TIMEOUT", confirmed_dead: false, error_code: "ABORT_ERR" };
  }
  if (code === "ENOTFOUND") {
    return { reason: "DNS_NOT_FOUND", confirmed_dead: true, error_code: code };
  }
  if (code === "ECONNREFUSED") {
    return { reason: "CONNECTION_REFUSED", confirmed_dead: true, error_code: code };
  }
  if (code === "ECONNRESET") {
    return { reason: "CONNECTION_RESET", confirmed_dead: false, error_code: code };
  }
  if (code === "ETIMEDOUT" || code === "UND_ERR_CONNECT_TIMEOUT") {
    return { reason: "NETWORK_TIMEOUT", confirmed_dead: false, error_code: code };
  }
  if (code === "EAI_AGAIN") {
    return { reason: "DNS_TEMPORARY_FAILURE", confirmed_dead: false, error_code: code };
  }
  return { reason: "NETWORK_ERROR", confirmed_dead: false, error_code: code || null };
};

const isDefinitiveDeadHttpStatus = (status) => [404, 410, 451].includes(status);

const checkUrl = async (url, maxRetries, timeout) => {
  let attempt = 0;
  let lastFailure = null;

  while (attempt <= maxRetries) {
    try {
      const headResponse = await fetchWithTimeout(url, "HEAD", timeout);

      if (!shouldFallbackToGet(headResponse.status) && isReachableStatus(headResponse.status)) {
        return {
          alive: true,
          status: headResponse.status,
          method: "HEAD",
          finalUrl: headResponse.url || url,
        };
      }

      const getResponse = await fetchWithTimeout(url, "GET", timeout);
      if (isReachableStatus(getResponse.status)) {
        return {
          alive: true,
          status: getResponse.status,
          method: "GET",
          finalUrl: getResponse.url || url,
        };
      }

      lastFailure = {
        reason: "HTTP_STATUS",
        status: getResponse.status,
        method: "GET",
        finalUrl: getResponse.url || url,
        confirmed_dead: isDefinitiveDeadHttpStatus(getResponse.status),
      };

      if (attempt < maxRetries && shouldRetryStatus(getResponse.status)) {
        await sleep(300 * (attempt + 1));
        attempt += 1;
        continue;
      }

      return {
        alive: false,
        ...lastFailure,
      };
    } catch (error) {
      const classification = classifyNetworkError(error);
      lastFailure = {
        reason: classification.reason,
        confirmed_dead: classification.confirmed_dead,
        error_code: classification.error_code,
        error: toErrorText(error),
      };
      if (attempt < maxRetries) {
        await sleep(300 * (attempt + 1));
        attempt += 1;
        continue;
      }
      return {
        alive: false,
        ...lastFailure,
      };
    }
  }

  return {
    alive: false,
    ...(lastFailure || { reason: "UNKNOWN" }),
  };
};

const deleteByIds = async (ids, size) => {
  let deleted = 0;
  let failures = 0;
  for (let i = 0; i < ids.length; i += size) {
    const batch = ids.slice(i, i + size);
    const { error } = await supabase.from("tools").delete().in("id", batch);
    if (error) {
      failures += batch.length;
      console.error(`Delete batch failed (${i}-${i + batch.length - 1}): ${error.message}`);
      continue;
    }
    deleted += batch.length;
  }
  return { deleted, failures };
};

const main = async () => {
  const timestamp = getTimestampLabel();
  ensureDir(backupDirPath);

  const rows = await fetchAllTools("id,title,url");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Rows loaded from DB: ${rows.length}`);
  console.log(`Concurrency: ${finalConcurrency}, timeout: ${finalTimeoutMs}ms, retries: ${finalRetries}`);

  const checks = await runWithConcurrency(rows, finalConcurrency, async (row) => {
    if (!isValidHttpUrl(row.url)) {
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        alive: false,
        reason: "INVALID_URL",
        confirmed_dead: true,
      };
    }

    const result = await checkUrl(row.url.trim(), finalRetries, finalTimeoutMs);
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      ...result,
    };
  });

  const dead = checks.filter((item) => !item.alive);
  const confirmedDead = dead.filter((item) => item.confirmed_dead === true);
  const uncertainDead = dead.filter((item) => item.confirmed_dead !== true);
  const aliveCount = checks.length - dead.length;

  const deadByReason = dead.reduce((acc, item) => {
    const key = item.reason || "UNKNOWN";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const deadLogPath = path.join(backupDirPath, `supabase-dead-links-${timestamp}.json`);
  writeJsonFile(deadLogPath, dead);

  let snapshotPath = null;
  let deleted = 0;
  let deleteFailures = 0;

  const deleteTarget = deleteUncertain ? dead : confirmedDead;

  if (!dryRun && deleteTarget.length > 0) {
    const snapshot = await fetchAllTools("*");
    snapshotPath = path.join(backupDirPath, `supabase-tools-before-dead-links-${timestamp}.json`);
    writeJsonFile(snapshotPath, snapshot);

    const deleteResult = await deleteByIds(
      deleteTarget.map((item) => Number(item.id)),
      finalBatchSize
    );
    deleted = deleteResult.deleted;
    deleteFailures = deleteResult.failures;
  }

  const afterCount = dryRun ? rows.length : (await fetchAllTools("id")).length;

  const report = {
    generated_at: new Date().toISOString(),
    mode: dryRun ? "dry-run" : "apply",
    options: {
      timeout_ms: finalTimeoutMs,
      concurrency: finalConcurrency,
      retries: finalRetries,
      batch_size: finalBatchSize,
      backup_dir: backupDirArg,
      delete_uncertain: deleteUncertain,
    },
    counts: {
      before: rows.length,
      checked: checks.length,
      alive: aliveCount,
      dead: dead.length,
      confirmed_dead: confirmedDead.length,
      uncertain_dead: uncertainDead.length,
      deleted,
      delete_failures: deleteFailures,
      after: afterCount,
    },
    dead_by_reason: deadByReason,
    artifacts: {
      dead_links: deadLogPath,
      backup_snapshot: snapshotPath,
    },
    dead_sample: dead.slice(0, 20),
  };

  const reportPath = path.join(backupDirPath, `supabase-dead-links-report-${timestamp}.json`);
  writeJsonFile(reportPath, report);

  console.log("---- Dead Links Summary ----");
  console.log(`Checked: ${checks.length}`);
  console.log(`Alive: ${aliveCount}`);
  console.log(`Dead: ${dead.length}`);
  console.log(`Confirmed dead: ${confirmedDead.length}`);
  console.log(`Uncertain dead: ${uncertainDead.length}`);
  console.log(`Delete scope: ${deleteUncertain ? "all dead" : "confirmed dead only"}`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Delete failures: ${deleteFailures}`);
  console.log(`DB rows after: ${afterCount}`);
  console.log(`Dead links log: ${deadLogPath}`);
  console.log(`Report: ${reportPath}`);
  if (snapshotPath) {
    console.log(`Backup snapshot: ${snapshotPath}`);
  }
};

main().catch((err) => {
  console.error("Dead links cleanup failed:", err?.message || err);
  process.exit(1);
});
