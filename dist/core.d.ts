export type Quality = 'low' | 'medium' | 'high';
export type Phase = 'blank' | 'placeholder' | 'full';
/** Signature for a URL transform function. Returns a resized/optimised URL. */
export type TransformFn = (src: string, width: number, quality: number) => string;
export interface LoadState {
    phase: Phase;
    thumbSrc: string;
    fullSrc: string;
}
/** Reads the current connection quality synchronously (SSR-safe, returns 'high'). */
export declare function getConnectionQuality(): Quality;
/** React hook that re-renders when the connection quality changes. */
export declare function useConnectionQuality(): Quality;
export declare const THUMB_WIDTH = 20;
export declare const THUMB_QUALITY = 20;
export declare const FULL_WIDTHS: Record<Quality, number>;
export declare const FULL_QUALITIES: Record<Quality, number>;
/**
 * Starts the two-phase progressive load sequence.
 * Phase 1: tiny thumbnail (blurred placeholder)
 * Phase 2: connection-aware full image
 *
 * Falls back to the original URL when the transform service returns an error.
 *
 * @returns cleanup function — call it to cancel in-flight loads (e.g. useEffect cleanup)
 */
export declare function startProgressiveLoad(src: string, transformFn: TransformFn, onUpdate: (state: LoadState) => void): () => void;
