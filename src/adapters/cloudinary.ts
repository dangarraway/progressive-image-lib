import type { TransformFn } from '../core';

/**
 * Cloudinary image transform adapter.
 *
 * Inserts `f_auto,q_<quality>,w_<width>` into the Cloudinary upload path.
 *
 * Input:  https://res.cloudinary.com/<cloud>/image/upload/<path>
 * Output: https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_<Q>,w_<W>/<path>
 */
export const cloudinaryTransform: TransformFn = (src, width, quality) =>
  src.replace('/image/upload/', `/image/upload/f_auto,q_${quality},w_${width}/`);
