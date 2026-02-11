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

const getHostname = (toolUrl?: string | null): string | null => {
  if (!toolUrl) return null;
  const trimmed = toolUrl.trim();
  if (!trimmed || trimmed === "N/A") return null;

  const tryParse = (input: string): string | null => {
    try {
      return new URL(input).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  };

  const parsedDirect = tryParse(trimmed);
  if (parsedDirect) return parsedDirect;

  const parsedWithProtocol = tryParse(`https://${trimmed}`);
  if (parsedWithProtocol) return parsedWithProtocol;

  return null;
};

export const getToolImageUrl = (imageUrl?: string | null, toolUrl?: string | null): string | null => {
  const valid = getValidImageUrl(imageUrl);
  if (valid) return valid;

  const hostname = getHostname(toolUrl);
  if (!hostname) return null;

  // Fallback logo for tools that don't have an explicit image_url.
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(hostname)}`;
};
