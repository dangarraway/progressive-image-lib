import { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Quality = 'low' | 'medium' | 'high';
export type Phase   = 'blank' | 'placeholder' | 'full';

/** Signature for a URL transform function. Returns a resized/optimised URL. */
export type TransformFn = (src: string, width: number, quality: number) => string;

export interface LoadState {
  phase:    Phase;
  thumbSrc: string;
  fullSrc:  string;
}

// ── Connection quality ────────────────────────────────────────────────────────

interface NetworkInformation {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?:      boolean;
}

/** Reads the current connection quality synchronously (SSR-safe, returns 'high'). */
export function getConnectionQuality(): Quality {
  if (typeof navigator === 'undefined') return 'high';
  const conn = (navigator as unknown as { connection?: NetworkInformation }).connection;
  if (!conn)                                                          return 'high';
  if (conn.saveData)                                                  return 'low';
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 'low';
  if (conn.effectiveType === '3g')                                     return 'medium';
  return 'high';
}

/** React hook that re-renders when the connection quality changes. */
export function useConnectionQuality(): Quality {
  const [quality, setQuality] = useState<Quality>(getConnectionQuality);

  useEffect(() => {
    const conn = (navigator as unknown as { connection?: NetworkInformation & EventTarget }).connection;
    if (!conn) return;
    const handler = () => setQuality(getConnectionQuality());
    conn.addEventListener('change', handler);
    return () => conn.removeEventListener('change', handler);
  }, []);

  return quality;
}

// ── Width / quality tables ────────────────────────────────────────────────────

export const THUMB_WIDTH   = 20;
export const THUMB_QUALITY = 20;

export const FULL_WIDTHS: Record<Quality, number> = {
  low:    240,
  medium: 420,
  high:   680,
};

export const FULL_QUALITIES: Record<Quality, number> = {
  low:    60,
  medium: 72,
  high:   85,
};

// ── Core load sequencer ───────────────────────────────────────────────────────

/**
 * Starts the two-phase progressive load sequence.
 * Phase 1: tiny thumbnail (blurred placeholder)
 * Phase 2: connection-aware full image
 *
 * Falls back to the original URL when the transform service returns an error.
 *
 * @returns cleanup function — call it to cancel in-flight loads (e.g. useEffect cleanup)
 */
export function startProgressiveLoad(
  src:         string,
  transformFn: TransformFn,
  onUpdate:    (state: LoadState) => void,
): () => void {
  let live = true;

  const q        = getConnectionQuality();
  const dpr      = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio ?? 1, 2) : 1;
  const thumbUrl = transformFn(src, THUMB_WIDTH, THUMB_QUALITY);
  const fullUrl  = transformFn(src, Math.round(FULL_WIDTHS[q] * dpr), FULL_QUALITIES[q]);

  const thumbImg  = new Image();

  thumbImg.onload = () => {
    if (!live) return;
    onUpdate({ phase: 'placeholder', thumbSrc: thumbUrl, fullSrc: '' });

    const fullImg = new Image();
    fullImg.onload  = () => {
      if (live) onUpdate({ phase: 'full', thumbSrc: thumbUrl, fullSrc: fullUrl });
    };
    // Transform 404 / error → fall back to original URL
    fullImg.onerror = () => {
      if (live) onUpdate({ phase: 'full', thumbSrc: thumbUrl, fullSrc: src });
    };
    fullImg.src = fullUrl;
  };

  // Thumbnail transform unavailable → skip blur, load original at full quality
  thumbImg.onerror = () => {
    if (!live) return;
    onUpdate({ phase: 'placeholder', thumbSrc: src, fullSrc: '' });
    const fullImg = new Image();
    fullImg.onload = () => {
      if (live) onUpdate({ phase: 'full', thumbSrc: src, fullSrc: src });
    };
    fullImg.src = src;
  };

  thumbImg.src = thumbUrl;
  return () => { live = false; };
}
