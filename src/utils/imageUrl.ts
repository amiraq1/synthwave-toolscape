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

export const getFaviconUrl = (toolUrl?: string | null): string | null => {
  if (!toolUrl) return null;
  try {
    const parsed = new URL(toolUrl);
    const hostname = parsed.hostname.replace(/^www\./, "");
    if (!hostname) return null;
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`;
  } catch {
    return null;
  }
};

export const getToolImageUrl = (imageUrl?: string | null, toolUrl?: string | null): string | null => {
  const valid = getValidImageUrl(imageUrl);
  if (valid) return valid;
  return getFaviconUrl(toolUrl);
};
