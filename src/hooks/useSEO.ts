import { useEffect } from 'react';
import { getSupabaseFunctionsBaseUrl, getSupabaseStorageBaseUrl } from '@/utils/supabaseUrl';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
  lang?: 'ar' | 'en';
  toolName?: string; // For dynamic OG image generation
}

const SITE_URL = "https://amiraq.org";
const FUNCTIONS_BASE_URL = getSupabaseFunctionsBaseUrl();
const STORAGE_BASE_URL = getSupabaseStorageBaseUrl();

const DEFAULT_TITLE = 'نبض - دليل أدوات الذكاء الاصطناعي';
const DEFAULT_DESCRIPTION = 'نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية. اكتشف أفضل أدوات AI لعام 2026.';

// Generate dynamic OG image URL from Supabase Edge Function
const generateOgImage = (title?: string, category?: string): string => {
  if (!FUNCTIONS_BASE_URL) return "/placeholder.svg";
  if (title) {
    return `${FUNCTIONS_BASE_URL}/og-image?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category || 'نبض AI')}`;
  }
  // Fallback to a default branded image (should be uploaded to Supabase Storage)
  return STORAGE_BASE_URL
    ? `${STORAGE_BASE_URL}/object/public/assets/og-nabdh-default.png`
    : "/placeholder.svg";
};

export const useSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  canonical,
  noIndex = false,
  lang = 'ar',
  toolName,
}: SEOProps = {}) => {
  useEffect(() => {
    // Set document title
    const fullTitle = title ? `${title} | نبض AI` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Set document language attribute
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Helper to set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let link = document.querySelector(selector) as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (hreflang) link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Set description
    setMetaTag('description', description || DEFAULT_DESCRIPTION);

    // Set keywords if provided
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Set robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Determine OG image - prioritize provided, then dynamic, then default
    const finalOgImage = ogImage || generateOgImage(toolName || title);

    // Open Graph tags
    setMetaTag('og:title', ogTitle || fullTitle, true);
    setMetaTag('og:description', ogDescription || description || DEFAULT_DESCRIPTION, true);
    setMetaTag('og:image', finalOgImage, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:site_name', 'نبض AI', true);
    setMetaTag('og:locale', lang === 'ar' ? 'ar_SA' : 'en_US', true);

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@NabdAI');
    setMetaTag('twitter:title', ogTitle || fullTitle);
    setMetaTag('twitter:description', ogDescription || description || DEFAULT_DESCRIPTION);
    setMetaTag('twitter:image', finalOgImage);

    // Canonical URL
    const canonicalUrl = canonical || window.location.origin + window.location.pathname;
    setLinkTag('canonical', canonicalUrl);

    // Hreflang tags for language alternatives
    const currentPath = window.location.pathname;
    setLinkTag('alternate', `${SITE_URL}${currentPath}`, 'ar');
    setLinkTag('alternate', `${SITE_URL}${currentPath}`, 'en');
    setLinkTag('alternate', `${SITE_URL}${currentPath}`, 'x-default');

    // Cleanup function to reset to defaults when unmounting
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, canonical, noIndex, lang, toolName]);
};

export default useSEO;
