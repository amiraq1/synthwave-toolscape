import fs from "fs";
import path from "path";

const DEFAULT_SOURCE_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";
const DEFAULT_OUTPUT = "public/data/public-apis-tools.json";
const DEFAULT_LIMIT = 250;
const DEFAULT_CATEGORIES = [
  "Machine Learning",
  "Development",
  "Programming",
  "Documents & Productivity",
  "Data Validation",
  "Security",
  "Science & Math",
  "Open Source Projects",
];

const args = process.argv.slice(2);

const getArgValue = (name, fallback) => {
  const arg = args.find((item) => item.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : fallback;
};

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
};

const sourceUrl = getArgValue("--source-url", DEFAULT_SOURCE_URL);
const outputFile = getArgValue("--out", DEFAULT_OUTPUT);
const limitArg = Number.parseInt(getArgValue("--limit", String(DEFAULT_LIMIT)), 10);
const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : DEFAULT_LIMIT;
const httpsOnly = parseBoolean(getArgValue("--https-only", "true"), true);
const publish = parseBoolean(getArgValue("--publish", "false"), false);
const allCategories = args.includes("--all-categories");

const categoryArg = getArgValue("--categories", "");
const selectedCategories = allCategories
  ? null
  : (categoryArg
      ? categoryArg.split(",").map((item) => item.trim()).filter(Boolean)
      : DEFAULT_CATEGORIES);

const parseMarkdownLink = (value) => {
  const match = value.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (!match) return null;
  return {
    name: match[1].trim(),
    url: match[2].trim(),
  };
};

const cleanCell = (value) =>
  String(value || "")
    .replace(/`/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const mapCategoryToNabd = (category) => {
  const map = {
    "Machine Learning": "برمجة",
    Development: "برمجة",
    Programming: "برمجة",
    "Open Source Projects": "برمجة",
    Security: "برمجة",
    "Documents & Productivity": "إنتاجية",
    "Data Validation": "إنتاجية",
    "Cloud Storage & File Sharing": "إنتاجية",
    Finance: "إنتاجية",
    Calendar: "إنتاجية",
    Email: "إنتاجية",
    "Science & Math": "دراسة وطلاب",
    Books: "دراسة وطلاب",
    Dictionaries: "نصوص",
    News: "نصوص",
    "Open Data": "إنتاجية",
    Geocoding: "إنتاجية",
    Music: "صوت",
    "Food & Drink": "إنتاجية",
  };

  return map[category] || "إنتاجية";
};

const mapAuthToPricing = (auth) => {
  const normalized = cleanCell(auth).toLowerCase();
  if (!normalized || normalized === "no") return "مجاني";
  return "Freemium";
};

const toToolRecord = (entry) => {
  const nabdCategory = mapCategoryToNabd(entry.category);
  const auth = cleanCell(entry.auth || "No");
  const https = cleanCell(entry.https || "Unknown");
  const cors = cleanCell(entry.cors || "Unknown");
  const descriptionEn = cleanCell(entry.description);
  const descriptionAr = `واجهة برمجة تطبيقات عامة (${entry.category}): ${descriptionEn}`;

  return {
    title: entry.name,
    title_en: entry.name,
    description: descriptionAr,
    description_en: descriptionEn,
    category: nabdCategory,
    url: entry.url,
    pricing_type: mapAuthToPricing(auth),
    features: [
      `Public API`,
      `Category: ${entry.category}`,
      `Auth: ${auth}`,
      `HTTPS: ${https}`,
      `CORS: ${cors}`,
    ],
    supports_arabic: false,
    is_featured: false,
    is_published: publish,
    image_url: null,
    source: "public-apis",
    created_at: new Date().toISOString(),
  };
};

const parseEntriesFromMarkdown = (markdownText) => {
  const lines = markdownText.split(/\r?\n/);
  const entries = [];
  let currentCategory = "";
  let inApiTable = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("### ")) {
      currentCategory = line.replace(/^###\s+/, "").trim();
      inApiTable = false;
      continue;
    }

    if (line === "API | Description | Auth | HTTPS | CORS |") {
      inApiTable = true;
      continue;
    }

    if (!inApiTable) continue;
    if (line.startsWith("|:---|")) continue;
    if (!line.startsWith("|")) {
      inApiTable = false;
      continue;
    }

    const rawCells = line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cleanCell(cell));

    while (rawCells.length > 0 && rawCells[rawCells.length - 1] === "") {
      rawCells.pop();
    }

    if (rawCells.length < 5) continue;

    const apiCell = rawCells[0];
    const auth = rawCells[rawCells.length - 3];
    const https = rawCells[rawCells.length - 2];
    const cors = rawCells[rawCells.length - 1];
    const description = cleanCell(rawCells.slice(1, rawCells.length - 3).join(" | "));
    const parsedLink = parseMarkdownLink(apiCell);
    if (!parsedLink) continue;

    entries.push({
      category: currentCategory,
      name: parsedLink.name,
      url: parsedLink.url,
      description,
      auth,
      https,
      cors,
    });
  }

  return entries;
};

const shouldKeepEntry = (entry) => {
  if (!entry?.name || !entry?.url || !entry?.description) return false;
  if (selectedCategories && !selectedCategories.includes(entry.category)) return false;
  if (httpsOnly && cleanCell(entry.https).toLowerCase() !== "yes") return false;
  return true;
};

const dedupeEntries = (entries) => {
  const seenUrl = new Set();
  const seenTitle = new Set();
  const out = [];

  for (const entry of entries) {
    const urlKey = entry.url.trim().toLowerCase();
    const titleKey = entry.name.trim().toLowerCase();
    if (seenUrl.has(urlKey) || seenTitle.has(titleKey)) continue;
    seenUrl.add(urlKey);
    seenTitle.add(titleKey);
    out.push(entry);
  }

  return out;
};

const run = async () => {
  console.log("Fetching Public APIs source...");
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch source (${response.status} ${response.statusText})`);
  }

  const markdown = await response.text();
  const parsed = parseEntriesFromMarkdown(markdown);
  const filtered = parsed.filter(shouldKeepEntry);
  const deduped = dedupeEntries(filtered).slice(0, limit);
  const tools = deduped.map(toToolRecord);

  const outputPath = path.resolve(process.cwd(), outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(tools, null, 2), "utf8");

  console.log("Done.");
  console.log(`Source entries parsed: ${parsed.length}`);
  console.log(`Entries after filters: ${filtered.length}`);
  console.log(`Exported tools: ${tools.length}`);
  console.log(`Output: ${outputPath}`);
  if (selectedCategories) {
    console.log(`Categories: ${selectedCategories.join(", ")}`);
  } else {
    console.log("Categories: all");
  }
  console.log(`HTTPS only: ${httpsOnly ? "yes" : "no"}`);
  console.log(`Publish flag: ${publish ? "true" : "false"}`);
};

run().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
