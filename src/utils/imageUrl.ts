export const isValidImageUrl = (value?: string | null): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // Ignore Google faviconV2 endpoints. They are often stale for this dataset and
    // produce noisy 404s in the browser console.
    if (hostname.endsWith("gstatic.com") && pathname.includes("faviconv2")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const getValidImageUrl = (value?: string | null): string | null => {
  return isValidImageUrl(value) ? value.trim() : null;
};

// Deprecated ToolImageUrlOptions interface, kept only for backwards compatibility with imports
export interface ToolImageUrlOptions {
  fallbackToFavicon?: boolean;
  faviconSize?: number;
}

export const getToolImageUrl = (
  imageUrl?: string | null,
  _toolUrl?: string | null, // Kept for consumer compatibility but unused
  _options: ToolImageUrlOptions = {} // Kept for consumer compatibility but unused
): string | null => {
  const valid = getValidImageUrl(imageUrl);
  if (valid) return valid;

  // We explicitly disable external favicon fallback services (Google/DuckDuckGo)
  // to prevent noisy 404 console errors caused by offline or un-indexed domains.
  // Instead, the frontend relies on elegant CSS fallbacks (Initial Letter, Category Icon).
  return null;
};
