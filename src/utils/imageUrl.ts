export const isValidImageUrl = (value?: string | null): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const getValidImageUrl = (value?: string | null): string | null => {
  return isValidImageUrl(value) ? value.trim() : null;
};

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

const INVALID_URL_TOKENS = [
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "---",
  "(no direct link",
  "no direct link",
  "open-source project",
  "research prototype",
  "via arxiv",
  "tied to",
];

const looksLikePlaceholder = (value: string): boolean => {
  const lower = value.toLowerCase();
  return INVALID_URL_TOKENS.some((token) => lower.includes(token));
};

const isLikelyPublicHostname = (hostname: string): boolean => {
  const h = hostname.trim().toLowerCase();
  if (!h || h.length > 253) return false;
  if (h.startsWith(".") || h.endsWith(".")) return false;
  if (h.includes("%") || /\s/.test(h)) return false;

  if (h === "localhost" || IPV4_REGEX.test(h)) return true;
  if (h.includes(":")) return true; // basic allowance for IPv6
  if (!h.includes(".")) return false;

  const labels = h.split(".");
  for (const label of labels) {
    if (!label) return false;
    if (!/^[a-z0-9-]+$/i.test(label)) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
  }

  const tld = labels[labels.length - 1];
  if (!/^([a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(tld)) return false;

  return true;
};

const getHostname = (toolUrl?: string | null): string | null => {
  if (!toolUrl) return null;
  const trimmed = toolUrl.trim();
  if (!trimmed || trimmed === "N/A") return null;
  if (looksLikePlaceholder(trimmed)) return null;

  const tryParse = (input: string): URL | null => {
    try {
      return new URL(input);
    } catch {
      return null;
    }
  };

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed);
  const parsed = hasProtocol ? tryParse(trimmed) : tryParse(`https://${trimmed}`);
  if (!parsed) return null;

  const hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  if (!isLikelyPublicHostname(hostname)) return null;
  return hostname;

  return null;
};

interface ToolImageUrlOptions {
  fallbackToFavicon?: boolean;
  faviconSize?: number;
}

export const getToolImageUrl = (
  imageUrl?: string | null,
  toolUrl?: string | null,
  options: ToolImageUrlOptions = {}
): string | null => {
  const valid = getValidImageUrl(imageUrl);
  if (valid) return valid;

  const { fallbackToFavicon = true, faviconSize = 64 } = options;
  if (!fallbackToFavicon) return null;

  const hostname = getHostname(toolUrl);
  if (!hostname) return null;

  // Fallback logo for tools that don't have an explicit image_url.
  return `https://www.google.com/s2/favicons?sz=${faviconSize}&domain_url=${encodeURIComponent(`https://${hostname}`)}`;
};
