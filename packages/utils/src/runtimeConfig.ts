type RuntimeConfigKey = "supabaseUrl" | "supabasePublishableKey";

type RuntimeConfig = Partial<Record<RuntimeConfigKey, string>>;

declare global {
  interface Window {
    __NABD_RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

const unresolvedEnvPattern = /^%VITE_[A-Z0-9_]+%$/;

const normalizeRuntimeValue = (value?: string | null): string => {
  if (!value) return "";

  const trimmedValue = value.trim();
  return unresolvedEnvPattern.test(trimmedValue) ? "" : trimmedValue;
};

const getRuntimeMetaName = (key: RuntimeConfigKey): string => {
  if (key === "supabaseUrl") {
    return "nabd:supabase-url";
  }

  return "nabd:supabase-publishable-key";
};

const readWindowRuntimeConfig = (key: RuntimeConfigKey): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeRuntimeValue(window.__NABD_RUNTIME_CONFIG__?.[key]);
};

const readMetaRuntimeConfig = (key: RuntimeConfigKey): string => {
  if (typeof document === "undefined") {
    return "";
  }

  const metaElement = document.querySelector(`meta[name="${getRuntimeMetaName(key)}"]`);
  return normalizeRuntimeValue(metaElement?.getAttribute("content"));
};

export const getRuntimeConfigValue = (key: RuntimeConfigKey, fallback = ""): string => {
  return (
    readWindowRuntimeConfig(key) ||
    readMetaRuntimeConfig(key) ||
    normalizeRuntimeValue(fallback)
  );
};

export type { RuntimeConfig, RuntimeConfigKey };
