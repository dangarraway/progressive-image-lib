import type { TransformFn } from '../core';

/**
 * imgix image transform adapter.
 *
 * Appends `?w=<width>&q=<quality>&auto=format` to the URL.
 * Merges with any existing query string.
 */
export const imgixTransform: TransformFn = (src, width, quality) => {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality));
  url.searchParams.set('auto', 'format');
  return url.toString();
};
