'use client';

import { useState, useEffect } from 'react';
import type { Phase, TransformFn } from './core';
import { startProgressiveLoad } from './core';
import { supabaseTransform } from './adapters/supabase';

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
export function ProgressiveImage({
  src,
  transformFn = supabaseTransform,
  finalOpacity = 1,
  vignette = true,
  className,
  style,
}: ProgressiveImageProps) {
  const [phase,    setPhase]  = useState<Phase>('blank');
  const [thumbSrc, setThumb]  = useState('');
  const [fullSrc,  setFull]   = useState('');

  useEffect(() => {
    // Reset on src / transformFn change
    setPhase('blank');
    setThumb('');
    setFull('');

    return startProgressiveLoad(src, transformFn, ({ phase, thumbSrc, fullSrc }) => {
      setThumb(thumbSrc);
      setFull(fullSrc);
      setPhase(phase);
    });
  }, [src, transformFn]);

  return (
    <div className={['pi-root', className].filter(Boolean).join(' ')} style={style}>
      <div
        className={`pi-blur${phase === 'placeholder' ? ' pi-on' : ''}`}
        style={thumbSrc ? { backgroundImage: `url(${thumbSrc})` } : undefined}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fullSrc || undefined}
        alt=""
        className="pi-full"
        style={{ opacity: phase === 'full' ? finalOpacity : 0 }}
      />
      {vignette && <div className="pi-vignette" />}
    </div>
  );
}
