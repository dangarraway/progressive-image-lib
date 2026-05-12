import type { TransformFn } from '../core';

/**
 * Supabase Storage image transform adapter.
 *
 * Rewrites a public-object URL to the render/image endpoint and appends
 * `?width=` and `?quality=` query params.
 *
 * Input:  https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 * Output: https://<project>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=W&quality=Q
 */
export const supabaseTransform: TransformFn = (src, width, quality) => {
  const base = src.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/',
  );
  return `${base}?width=${width}&quality=${quality}`;
};
