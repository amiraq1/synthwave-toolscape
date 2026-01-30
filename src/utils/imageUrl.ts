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
