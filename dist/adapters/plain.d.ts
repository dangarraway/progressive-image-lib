import type { TransformFn } from '../core';
/**
 * No-op adapter — returns the original URL unchanged.
 * Use when you have no image transform service; both thumbnail and full image
 * will use the same source URL (no blur-up, but graceful degradation still works).
 */
export declare const plainTransform: TransformFn;
