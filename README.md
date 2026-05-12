# @madeself/progressive-image

Connection-aware blur-up progressive image loader for React / Next.js.

**What it does:**

1. Fetches a 20 px thumbnail first → renders it blurred as a placeholder.
2. Reads `navigator.connection` to pick the right full-image width and quality tier.
3. Cross-fades: blur fades OUT (350 ms) as the sharp image fades IN (550 ms).
4. Falls back gracefully when the transform service is unavailable.

---

## Installation

```bash
npm install @madeself/progressive-image
# react and react-dom are peer dependencies — already installed in your app
```

---

## Quickstart

### 1. Import the CSS once at your app root

```tsx
// app/layout.tsx (Next.js App Router) or pages/_app.tsx
import '@madeself/progressive-image/css';
```

### 2. Use the component

```tsx
import { ProgressiveImage } from '@madeself/progressive-image';

export function PhotoCard({ url }: { url: string }) {
  return (
    <div style={{ position: 'relative', width: 340, height: 480 }}>
      <ProgressiveImage src={url} />
    </div>
  );
}
```

The parent **must** be `position: relative` (or any non-static position) — the component fills it with `position: absolute; inset: 0`.

---

## Usage with Supabase Storage (default)

No extra config needed. Any URL containing `/storage/v1/object/public/` is automatically rewritten to the Supabase image-transform endpoint.

```tsx
import { ProgressiveImage } from '@madeself/progressive-image';

const supabaseUrl =
  'https://xxxx.supabase.co/storage/v1/object/public/photos/dog.jpg';

<ProgressiveImage src={supabaseUrl} />
```

### nosaraphoto pattern — image inside a card with overlay opacity

```tsx
import { ProgressiveImage } from '@madeself/progressive-image';

<div className="photo-card" style={{ position: 'relative' }}>
  <ProgressiveImage src={photo.url} finalOpacity={0.42} />
  <div className="card-overlay">…</div>
</div>
```

---

## Usage with plain URLs (no transform service)

```tsx
import { ProgressiveImage, plainTransform } from '@madeself/progressive-image';

<ProgressiveImage src={url} transformFn={plainTransform} />
```

Both the thumbnail and the full image will use the original URL — no blur-up, but the component still handles loading states and the fade-in transition.

---

## Usage with Cloudinary

```tsx
import { ProgressiveImage, cloudinaryTransform } from '@madeself/progressive-image';

const cloudinaryUrl =
  'https://res.cloudinary.com/mycloud/image/upload/photos/dog.jpg';

<ProgressiveImage src={cloudinaryUrl} transformFn={cloudinaryTransform} />
```

Generates URLs like: `.../image/upload/f_auto,q_85,w_680/photos/dog.jpg`

---

## Usage with imgix

```tsx
import { ProgressiveImage, imgixTransform } from '@madeself/progressive-image';

<ProgressiveImage src="https://mysite.imgix.net/dog.jpg" transformFn={imgixTransform} />
```

---

## Custom transform function

Supply any function with the signature `(src, width, quality) => string`:

```tsx
import { ProgressiveImage } from '@madeself/progressive-image';
import type { TransformFn } from '@madeself/progressive-image';

const myTransform: TransformFn = (src, width, quality) =>
  `${src}?w=${width}&q=${quality}&fmt=webp`;

<ProgressiveImage src={url} transformFn={myTransform} />
```

---

## API reference

### `<ProgressiveImage>`

| Prop           | Type          | Default              | Description                                                       |
| -------------- | ------------- | -------------------- | ----------------------------------------------------------------- |
| `src`          | `string`      | —                    | Full-resolution source URL                                        |
| `transformFn`  | `TransformFn` | `supabaseTransform`  | URL builder for thumbnail + full images                           |
| `finalOpacity` | `number`      | `1`                  | Opacity of the loaded image. Use `< 1` for overlay-on-card cases. |
| `vignette`     | `boolean`     | `true`               | Render the built-in radial vignette div                           |
| `className`    | `string`      | —                    | Extra CSS class on the root `div`                                 |
| `style`        | `CSSProperties` | —                  | Inline styles on the root `div`                                   |

### `useConnectionQuality()`

React hook. Returns `'low' | 'medium' | 'high'` and re-renders when the connection changes.

```tsx
import { useConnectionQuality } from '@madeself/progressive-image';

function BandwidthBadge() {
  const q = useConnectionQuality();
  return <span>Connection: {q}</span>;
}
```

### `getConnectionQuality()`

Synchronous, SSR-safe version. Returns `'high'` on the server.

### Quality tiers

| Tier     | Effective connection  | Full width (× DPR, max 2×) | JPEG quality |
| -------- | --------------------- | -------------------------- | ------------ |
| `low`    | `slow-2g` / `2g`      | 240 px                     | 60           |
| `medium` | `3g`                  | 420 px                     | 72           |
| `high`   | `4g` / wifi / unknown | 680 px                     | 85           |

---

## CSS customisation

Override these custom properties on any ancestor:

```css
.my-card {
  /* Edge vignette colour — match your card/page background */
  --pi-vignette-color: rgba(255, 242, 212, 0.96);

  /* Blur strength for the thumbnail placeholder */
  --pi-blur-px: 14px;
}
```

Suppress the built-in vignette and use your own:

```tsx
<ProgressiveImage src={url} vignette={false} />
```

---

## Building from source

```bash
cd packages/progressive-image
npm install
npm run typecheck   # type-check only
npm run build       # emit to dist/
```

Requires TypeScript ≥ 5 and a bundler that supports `"exports"` in package.json (Next.js, Vite, etc.).
