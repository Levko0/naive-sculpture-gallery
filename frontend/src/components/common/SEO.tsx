import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Рустам Жураєв | Галерея наївної кам'яної скульптури",
  description = "Онлайн-галерея оригінальних кам'яних скульптур Рустама Жураєва у традиції українського наїву. Пісковик, мармур, базальт, габро — унікальні екземпляри (1/1).",
  image = "/sculptures/anhelyk.webp",
  url,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update Title
    document.title = title;

    // Helper to create or update meta tag by name or property
    const setMeta = (attribute: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical Link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dwlekbm7g0cs5.cloudfront.net';
    const canonicalHref = url ? (url.startsWith('http') ? url : `${currentOrigin}${url}`) : (typeof window !== 'undefined' ? window.location.href : currentOrigin);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // 3. Open Graph
    const fullImageUrl = image.startsWith('http') ? image : `${currentOrigin}${image}`;
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', fullImageUrl);
    setMeta('property', 'og:url', canonicalHref);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', "Рустам Жураєв | Галерея наївного мистецтва");

    // 4. Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', fullImageUrl);

    // 5. JSON-LD Structured Data
    const SCRIPT_ID = 'seo-structured-data';
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, image, url, type, noindex, jsonLd]);

  return null;
};
