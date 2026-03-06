const BARE_DOMAIN_PATTERN =
  /^(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+(?::\d+)?(?:[/?#].*)?$/i;

const INVALID_PREFIXES = [
  "n/a",
  "na ",
  "---",
  "الرابط",
  "غير متاح",
  "لا يوجد",
  "undefined",
  "null",
];

const INVALID_SUBSTRINGS = [
  "embedded in",
  "part of",
  "mentioned as",
];

const normalizeCandidate = (value?: string | null): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (INVALID_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return null;
  }

  if (INVALID_SUBSTRINGS.some((fragment) => lower.includes(fragment))) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (!BARE_DOMAIN_PATTERN.test(trimmed)) {
    return null;
  }

  return `https://${trimmed}`;
};

export const getValidToolUrl = (value?: string | null): string | null => {
  const candidate = normalizeCandidate(value);
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};

export const isValidToolUrl = (value?: string | null): value is string => {
  return getValidToolUrl(value) !== null;
};
