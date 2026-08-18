import { supabase } from './supabase';

// ─── Cover Image Upload ───────────────────────────────────────────────────────
// Covers live in a public Supabase Storage bucket so they can be swapped from
// /admin without a redeploy. Read is public; writes are authenticated-only —
// the anon key ships in the client bundle, so a write-open bucket would let
// anyone upload. Policy SQL is in the comment block at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────

export const COVERS_BUCKET = 'covers';

const MAX_WIDTH = 2000;
const JPEG_QUALITY = 0.82;

/** True if the URL already points at our Storage bucket. */
export function isStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${COVERS_BUCKET}/`);
}

function slugify(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'cover';
}

/**
 * Downscale to MAX_WIDTH and re-encode as JPEG. Card covers are opaque
 * photography/UI, so dropping the alpha channel costs nothing and a 1.6MB PNG
 * screenshot becomes ~180KB.
 */
export async function compressImage(file: Blob, filename: string): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get a 2D canvas context.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );
  if (!blob) throw new Error('Could not encode the image.');

  return new File([blob], `${slugify(filename)}.jpg`, { type: 'image/jpeg' });
}

/**
 * Compress, upload to the covers bucket, and return the public URL.
 * Requires an authenticated Supabase session.
 */
export async function uploadCover(file: Blob, filename: string): Promise<string> {
  const compressed = await compressImage(file, filename);
  const path = `${Date.now()}-${compressed.name}`;

  const { error } = await supabase.storage
    .from(COVERS_BUCKET)
    .upload(path, compressed, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Fetch an image that lives elsewhere (a repo path, or another origin) so it can
 * be re-uploaded to Storage. Cross-origin hosts that send no CORS headers will
 * reject this — callers should surface that rather than swallow it.
 */
export async function fetchImageAsBlob(url: string): Promise<Blob> {
  const res = await window.fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

// ─── Storage Setup (run in Supabase SQL Editor) ───────────────────────────────
/*

-- Public bucket for case study cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone may read
CREATE POLICY "Public read covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- Only signed-in admins may write
CREATE POLICY "Authenticated upload covers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Authenticated update covers" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'covers');

CREATE POLICY "Authenticated delete covers" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'covers');

*/
