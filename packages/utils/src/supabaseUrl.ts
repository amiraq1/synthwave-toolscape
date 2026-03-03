const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseUrl = rawSupabaseUrl.replace(/\/+$/, "");

export const getSupabaseUrl = (): string => supabaseUrl;

export const getSupabaseFunctionsBaseUrl = (): string => {
  if (!supabaseUrl) return "";
  return `${supabaseUrl}/functions/v1`;
};

export const getSupabaseStorageBaseUrl = (): string => {
  if (!supabaseUrl) return "";
  return `${supabaseUrl}/storage/v1`;
};

export const getSupabaseProjectRef = (): string => {
  if (!supabaseUrl) return "";
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
};
