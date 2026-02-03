import { useMemo } from "react";

const getHostname = (url?: string | null): string | null => {
  if (!url || url === 'N/A') return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

/**
 * استخدام Google Favicon API بشكل مباشر.
 * يتم تمرير الرابط مباشرة للوسم <img> مما يسمح للمتصفح بالتعامل مع الأخطاء
 * وتجنب مشاكل CORS التي تحدث عند استخدام fetch.
 */
export const useFavicon = (toolUrl?: string | null, size = 128) => {
  const hostname = useMemo(() => getHostname(toolUrl), [toolUrl]);

  return useMemo(() => {
    if (!hostname) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`;
  }, [hostname, size]);
};
