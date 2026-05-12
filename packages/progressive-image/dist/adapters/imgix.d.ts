import type { TransformFn } from '../core';
/**
 * imgix image transform adapter.
 *
 * Appends `?w=<width>&q=<quality>&auto=format` to the URL.
 * Merges with any existing query string.
 */
export declare const imgixTransform: TransformFn;
