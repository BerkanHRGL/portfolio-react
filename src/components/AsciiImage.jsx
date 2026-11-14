import { useEffect, useRef, useState } from 'react';

const RAMP = ' .:-=+*#%@';
const CHAR_ASPECT = 0.6; // width / height of one monospace cell at line-height 1

// Turn a loaded image into rows of characters, darkest pixels = densest characters.
function toAscii(img, cols, rows, fit) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cols, rows);

  const targetAspect = (cols * CHAR_ASPECT) / rows;
  const imageAspect = img.naturalWidth / img.naturalHeight;
  if (fit === 'contain') {
    const w = imageAspect > targetAspect ? cols : cols * (imageAspect / targetAspect);
    const h = imageAspect > targetAspect ? rows * (targetAspect / imageAspect) : rows;
    ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
  } else {
    const sw = imageAspect > targetAspect ? img.naturalHeight * targetAspect : img.naturalWidth;
    const sh = imageAspect > targetAspect ? img.naturalHeight : img.naturalWidth / targetAspect;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, cols, rows);
  }

  const { data } = ctx.getImageData(0, 0, cols, rows);
  const lum = new Float32Array(cols * rows);
  let min = 255;
  let max = 0;
  for (let i = 0; i < lum.length; i++) {
    const l = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
    lum[i] = l;
    if (l < min) min = l;
    if (l > max) max = l;
  }
  const range = max - min || 1;

  let onLight = ''; // dark ink on a light page
  let onDark = '';  // light characters on a dark page
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Clamped: rounding can push t a hair outside 0..1, and pow() of a negative is NaN.
      const t = Math.min(1, Math.max(0, (lum[y * cols + x] - min) / range));
      // The curves keep mid-tones from filling up with the densest characters.
      onLight += RAMP[Math.round(Math.pow(1 - t, 1.4) * (RAMP.length - 1))];
      onDark += RAMP[Math.round(Math.pow(t, 2.2) * (RAMP.length - 1))];
    }
    if (y < rows - 1) { onLight += '\n'; onDark += '\n'; }
  }
  return { onLight, onDark };
}

/**
 * Shows an image as ASCII art with the real image layered on top.
 * The real image appears on hover/focus of the nearest `.reveal-host`,
 * or by itself after a moment when `auto` is set.
 * `flat` is for graphics on a white background (logos, pixel art): they keep
 * the same character mapping in dark mode instead of being inverted.
 */
export default function AsciiImage({ src, alt = '', cols = 96, ratio = 0.625, fit = 'cover', flat = false, auto = false, eager = false }) {
  const imgRef = useRef(null);
  const [art, setArt] = useState(null);
  const rows = Math.round(cols * CHAR_ASPECT * ratio);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const convert = () => {
      try { setArt(toAscii(img, cols, rows, fit)); } catch { /* keep the plain image */ }
    };
    if (img.complete && img.naturalWidth) convert();
    else img.addEventListener('load', convert, { once: true });
    return () => img.removeEventListener('load', convert);
  }, [src, cols, rows, fit]);

  const classes = ['ascii-img'];
  if (art) classes.push('has-art');
  if (auto) classes.push('auto');
  if (fit === 'contain') classes.push('contain');

  return (
    <div className={classes.join(' ')} style={{ aspectRatio: `1 / ${ratio}`, '--cols': cols }}>
      {art && (
        <>
          <pre className="ascii ascii-on-light" aria-hidden="true">{art.onLight}</pre>
          <pre className="ascii ascii-on-dark" aria-hidden="true">{flat ? art.onLight : art.onDark}</pre>
        </>
      )}
      <img
        ref={imgRef}
        className="ascii-real"
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
