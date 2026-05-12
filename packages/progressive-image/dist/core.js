import { useState, useEffect } from 'react';
/** Reads the current connection quality synchronously (SSR-safe, returns 'high'). */
export function getConnectionQuality() {
    if (typeof navigator === 'undefined')
        return 'high';
    const conn = navigator.connection;
    if (!conn)
        return 'high';
    if (conn.saveData)
        return 'low';
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')
        return 'low';
    if (conn.effectiveType === '3g')
        return 'medium';
    return 'high';
}
/** React hook that re-renders when the connection quality changes. */
export function useConnectionQuality() {
    const [quality, setQuality] = useState(getConnectionQuality);
    useEffect(() => {
        const conn = navigator.connection;
        if (!conn)
            return;
        const handler = () => setQuality(getConnectionQuality());
        conn.addEventListener('change', handler);
        return () => conn.removeEventListener('change', handler);
    }, []);
    return quality;
}
// ── Width / quality tables ────────────────────────────────────────────────────
export const THUMB_WIDTH = 20;
export const THUMB_QUALITY = 20;
export const FULL_WIDTHS = {
    low: 240,
    medium: 420,
    high: 680,
};
export const FULL_QUALITIES = {
    low: 60,
    medium: 72,
    high: 85,
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
export function startProgressiveLoad(src, transformFn, onUpdate) {
    let live = true;
    const q = getConnectionQuality();
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio ?? 1, 2) : 1;
    const thumbUrl = transformFn(src, THUMB_WIDTH, THUMB_QUALITY);
    const fullUrl = transformFn(src, Math.round(FULL_WIDTHS[q] * dpr), FULL_QUALITIES[q]);
    const thumbImg = new Image();
    thumbImg.onload = () => {
        if (!live)
            return;
        onUpdate({ phase: 'placeholder', thumbSrc: thumbUrl, fullSrc: '' });
        const fullImg = new Image();
        fullImg.onload = () => {
            if (live)
                onUpdate({ phase: 'full', thumbSrc: thumbUrl, fullSrc: fullUrl });
        };
        // Transform 404 / error → fall back to original URL
        fullImg.onerror = () => {
            if (live)
                onUpdate({ phase: 'full', thumbSrc: thumbUrl, fullSrc: src });
        };
        fullImg.src = fullUrl;
    };
    // Thumbnail transform unavailable → skip blur, load original at full quality
    thumbImg.onerror = () => {
        if (!live)
            return;
        onUpdate({ phase: 'placeholder', thumbSrc: src, fullSrc: '' });
        const fullImg = new Image();
        fullImg.onload = () => {
            if (live)
                onUpdate({ phase: 'full', thumbSrc: src, fullSrc: src });
        };
        fullImg.src = src;
    };
    thumbImg.src = thumbUrl;
    return () => { live = false; };
}
