import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Writes one static HTML file per route into dist/.
 *
 * The problem this solves: Vercel rewrites every path to index.html, so before
 * JavaScript runs, /hire and /about were byte-identical to the homepage —
 * same <title>, same description, same canonical pointing at "/". Googlebot
 * renders JS and recovers. Bing, LinkedIn, Slack, X and most LLM crawlers do
 * not, so every page of this site looked like the homepage to all of them.
 *
 * Each generated file carries that route's real title, description, canonical
 * and Open Graph tags in the static HTML. The body still renders client-side —
 * this buys correct metadata for every crawler, not prerendered body copy,
 * which would need a headless browser in the build.
 *
 * Copy comes from src/data/routeMeta.json, the same file usePageMeta reads, so
 * the static tags and the runtime tags cannot disagree.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.artagers.design';

const routeMeta = JSON.parse(readFileSync(join(ROOT, 'src/data/routeMeta.json'), 'utf8'));
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replaces a tag's content/href in place; appends before </head> if absent. */
function setTag(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function render(path, { title, description, preloadImage }) {
  const url = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
  const t = escape(title);
  const d = escape(description);

  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${t}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${d}" />`);

  // The LCP image, started at parse time. Without this the browser cannot even
  // begin the download until React has booted and created the <img> — 2.8s of
  // pure Load Delay on throttled mobile, and the reason fetchpriority on the
  // element alone did nothing: you cannot prioritise a node that isn't there.
  if (preloadImage) {
    const { href, srcset, sizes } = preloadImage;
    html = html.replace(
      '</head>',
      `    <link rel="preload" as="image" href="${href}" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />\n  </head>`
    );
  }

  // A 404 must never be indexed, whatever else it says.
  if (path === '/404') {
    html = setTag(html, /<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow" />');
  }
  return html;
}

let written = 0;
for (const [path, meta] of Object.entries(routeMeta)) {
  const html = render(path, meta);

  // "/" is dist/index.html; "/hire" is dist/hire/index.html, which Vercel
  // serves for /hire before any rewrite is considered.
  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  written++;
  console.log(`  ${path.padEnd(32)} -> ${out.replace(DIST, 'dist')}  (${(html.length / 1024).toFixed(0)} KB)`);
}
console.log(`prerendered ${written} routes`);
