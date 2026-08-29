import { useEffect } from 'react';
import routeMeta from '../data/routeMeta.json';

export type RoutePath = keyof typeof routeMeta;

/* The apex 308-redirects to www, so canonicals must name www — a canonical
   pointing at a redirect is a signal that argues with itself. */
export const ORIGIN = 'https://www.artagers.design';

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

/**
 * Sets the head tags for a route.
 *
 * The copy lives in `src/data/routeMeta.json` rather than here, because
 * `scripts/prerender.mjs` writes the same values into a static HTML file per
 * route at build time. Two sources would drift, and the drift would be
 * invisible — the static tags are the ones crawlers read, and the ones you
 * never see in a browser.
 */
export function usePageMeta(path: RoutePath): void {
  const { title, description } = routeMeta[path];

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
    setTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  }, [title, description, path]);
}
