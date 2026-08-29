import { useEffect } from 'react';

/**
 * Keeps a page out of the index for as long as it is mounted.
 *
 * The SPA serves every route from one index.html, so `robots` has to be
 * written at runtime and put back on the way out — otherwise visiting /admin
 * and then navigating home would leave the whole site noindexed.
 */
export function useNoIndex(): void {
  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !tag;
    if (created) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      document.head.appendChild(tag);
    }
    tag!.content = 'noindex, nofollow';

    return () => {
      if (created) tag!.remove();
      else tag!.content = 'index, follow';
    };
  }, []);
}
