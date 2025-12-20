import { useEffect } from 'react';

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
}

const DEFAULT_TITLE = 'نبض - دليل أدوات الذكاء الاصطناعي';
const DEFAULT_DESCRIPTION = 'نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية';
const DEFAULT_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';

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
}: SEOProps = {}) => {
  useEffect(() => {
    // Set document title
    const fullTitle = title ? `${title} | نبض` : DEFAULT_TITLE;
    document.title = fullTitle;

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
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    setMetaTag('og:title', ogTitle || title || DEFAULT_TITLE, true);
    setMetaTag('og:description', ogDescription || description || DEFAULT_DESCRIPTION, true);
    setMetaTag('og:image', ogImage || DEFAULT_IMAGE, true);
    setMetaTag('og:type', ogType, true);

    // Twitter tags
    setMetaTag('twitter:title', ogTitle || title || DEFAULT_TITLE);
    setMetaTag('twitter:description', ogDescription || description || DEFAULT_DESCRIPTION);
    setMetaTag('twitter:image', ogImage || DEFAULT_IMAGE);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Cleanup function to reset to defaults when unmounting
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, canonical, noIndex]);
};

export default useSEO;
