import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute path, e.g. "/hire". Used for og:url and canonical. */
  path: string;
}

/* The apex 308-redirects to www, so canonicals must name www — a canonical
   pointing at a redirect is a signal that argues with itself. */
const ORIGIN = 'https://www.artagers.design';

/** Creates the tag if absent, updates it if present, and leaves it in place on
 *  unmount — the next route's call overwrites it, so there is nothing to clean up. */
function setTag(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function usePageMeta({ title, description, path }: PageMeta): void {
  useEffect(() => {
    document.title = title;
    const url = `${ORIGIN}${path}`;

    setTag('meta[name="description"]', { name: 'description', content: description });
    setTag('link[rel="canonical"]', { rel: 'canonical', href: url });
    setTag('meta[property="og:title"]', { property: 'og:title', content: title });
    setTag('meta[property="og:description"]', { property: 'og:description', content: description });
    setTag('meta[property="og:url"]', { property: 'og:url', content: url });
    setTag('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setTag('meta[property="twitter:title"]', { property: 'twitter:title', content: title });
    setTag('meta[property="twitter:description"]', { property: 'twitter:description', content: description });
  }, [title, description, path]);
}
