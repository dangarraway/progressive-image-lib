'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { startProgressiveLoad } from './core';
import { supabaseTransform } from './adapters/supabase';
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
export function ProgressiveImage({ src, transformFn = supabaseTransform, finalOpacity = 1, vignette = true, className, style, }) {
    const [phase, setPhase] = useState('blank');
    const [thumbSrc, setThumb] = useState('');
    const [fullSrc, setFull] = useState('');
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
    return (_jsxs("div", { className: ['pi-root', className].filter(Boolean).join(' '), style: style, children: [_jsx("div", { className: `pi-blur${phase === 'placeholder' ? ' pi-on' : ''}`, style: thumbSrc ? { backgroundImage: `url(${thumbSrc})` } : undefined }), _jsx("img", { src: fullSrc || undefined, alt: "", className: "pi-full", style: { opacity: phase === 'full' ? finalOpacity : 0 } }), vignette && _jsx("div", { className: "pi-vignette" })] }));
}
