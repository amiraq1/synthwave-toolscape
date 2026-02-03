import { useEffect, useMemo, useState } from "react";

const faviconCache = new Map<string, string | null>();
const faviconInFlight = new Map<string, Promise<string | null>>();

const getHostname = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const buildFaviconUrl = (hostname: string, size: number) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`;

const fetchFavicon = async (hostname: string, size: number): Promise<string | null> => {
  const requestUrl = buildFaviconUrl(hostname, size);
  try {
    const response = await fetch(requestUrl, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob || blob.size === 0) return null;
    if (blob.type && !blob.type.startsWith("image/")) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

export const useFavicon = (toolUrl?: string | null, size = 128) => {
  const hostname = useMemo(() => getHostname(toolUrl), [toolUrl]);
  const cacheKey = hostname ? `${hostname}:${size}` : null;
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!cacheKey || !hostname) {
      setFaviconSrc(null);
      return;
    }

    if (faviconCache.has(cacheKey)) {
      setFaviconSrc(faviconCache.get(cacheKey) ?? null);
      return;
    }

    const inFlight = faviconInFlight.get(cacheKey) ?? fetchFavicon(hostname, size);
    faviconInFlight.set(cacheKey, inFlight);

    inFlight
      .then((src) => {
        faviconCache.set(cacheKey, src);
        faviconInFlight.delete(cacheKey);
        if (!cancelled) {
          setFaviconSrc(src);
        }
      })
      .catch(() => {
        faviconCache.set(cacheKey, null);
        faviconInFlight.delete(cacheKey);
        if (!cancelled) {
          setFaviconSrc(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, hostname, size]);

  return faviconSrc;
};
