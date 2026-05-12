import type { TransformFn } from './core';
export interface ProgressiveImageProps {
    /** Full-resolution source URL. */
    src: string;
    /**
     * URL transform function. Receives (src, width, quality) and returns the
     * resized/optimised URL. Defaults to `supabaseTransform`.
     * Pass `plainTransform` if you have no image transform service.
     */
    transformFn?: TransformFn;
    /**
     * Final opacity of the loaded full image (0–1).
     * Default `1`. Use a lower value (e.g. `0.42`) when the image sits
     * beneath an overlay or card tint.
     */
    finalOpacity?: number;
    /**
     * Render the built-in radial vignette overlay. Default `true`.
     * Set `false` to suppress it and apply your own.
     */
    vignette?: boolean;
    /** Additional CSS class on the root element. */
    className?: string;
    style?: React.CSSProperties;
}
/**
 * Blur-up progressive image loader.
 *
 * 1. Fetches a 20 px thumbnail → renders it blurred as a placeholder.
 * 2. Reads connection quality (navigator.connection) to pick the right full-
 *    image width (240 / 420 / 680 px) and JPEG quality (60 / 72 / 85).
 * 3. Cross-fades: blur fades OUT (350 ms) as the sharp image fades IN (550 ms).
 * 4. Falls back to the original URL if the transform service returns an error.
 *
 * Import the CSS once at the app root:
 *   import '@madeself/progressive-image/css';
 */
export declare function ProgressiveImage({ src, transformFn, finalOpacity, vignette, className, style, }: ProgressiveImageProps): import("react/jsx-runtime").JSX.Element;
