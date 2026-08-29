import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

/**
 * Renders each route in a real browser and inlines the resulting body into its
 * static HTML file.
 *
 * scripts/prerender.mjs already gives every route its own <head>. This adds the
 * body, which is what actually moves the needle: on a phone the visitor was
 * waiting ~1.5s for React to boot before anything appeared, and First
 * Contentful Paint, Largest Contentful Paint and Speed Index are all just
 * different ways of measuring that wait.
 *
 * FAIL-SOFT BY DESIGN. If the browser cannot start — no download in the build
 * image, a sandbox, a CI quirk — this logs and exits 0, leaving the head-only
 * files in place. A deploy that ships a slower site is a bad day; a deploy that
 * fails because a browser would not launch is a worse one.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const routeMeta = JSON.parse(readFileSync(join(ROOT, 'src/data/routeMeta.json'), 'utf8'));

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain',
  '.xml': 'application/xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

/** Serves dist/ the way Vercel does: real files first, 404 shell otherwise. */
function serveDist() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const candidates = [join(DIST, path), join(DIST, path, 'index.html'), join(DIST, '404/index.html')];
    for (const file of candidates) {
      if (existsSync(file) && statSync(file).isFile()) {
        res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
        res.end(readFileSync(file));
        return;
      }
    }
    res.writeHead(404).end('not found');
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, port: server.address().port })));
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('  playwright not installed — keeping head-only shells');
  process.exit(0);
}

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  console.log(`  browser would not launch (${String(err).split('\n')[0].slice(0, 80)}) — keeping head-only shells`);
  process.exit(0);
}

const { server, port } = await serveDist();
let done = 0;

for (const path of Object.keys(routeMeta)) {
  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html');
  if (!existsSync(out)) continue;

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    // Let the entrance timelines finish so nothing is captured mid-fade.
    await page.waitForTimeout(2500);

    const body = await page.evaluate(() => {
      // Whatever state the animations happen to be in, the snapshot must be
      // the finished one: a captured `opacity: 0` would ship invisible content
      // to every crawler that does not run JavaScript.
      document.querySelectorAll('[style]').forEach((el) => {
        const s = el.style;
        if (s.opacity && parseFloat(s.opacity) < 1) s.opacity = '1';
        if (s.transform && s.transform !== 'none') s.removeProperty('transform');
        s.removeProperty('visibility');
      });
      // The floating work-list cover follows the cursor; there is no cursor.
      document.querySelectorAll('.work-preview').forEach((el) => el.remove());
      return document.getElementById('root')?.innerHTML ?? '';
    });

    if (!body || body.length < 500) {
      console.log(`  ${path.padEnd(32)} body too small (${body.length}), left as-is`);
      await page.close();
      continue;
    }

    let html = readFileSync(out, 'utf8');
    html = html.replace('<html lang="en">', '<html lang="en" data-prerendered="true">');
    html = html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
    writeFileSync(out, html);
    done++;
    console.log(`  ${path.padEnd(32)} +${(body.length / 1024).toFixed(0)} KB body`);
  } catch (err) {
    console.log(`  ${path.padEnd(32)} skipped (${String(err).split('\n')[0].slice(0, 60)})`);
  }
  await page.close();
}

await browser.close();
server.close();
console.log(`prerendered ${done} bodies`);
