import { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../utils/motion';

const FILL = '#%@&';
const EDGE = '*+=:';
const FLIGHT = '.:-=+*';
const RAMP = ' .:-=+*#%@';
const STEP_MS = 30;

const rand = (a, b) => a + Math.random() * (b - a);
const clamp01 = n => Math.min(1, Math.max(0, n));

/**
 * A field of characters that flies together into shapes: words or an image.
 * The site's signature effect, used by the hero greeting, the About portrait and
 * the goodbye at the end.
 *
 * shapes   [{ text } | { image }]  cycled every `hold` ms when there is more than one
 * start    'loaded'  assemble once the intro loader has lifted
 *          'visible' assemble the first time the canvas scrolls into view
 * scatter  blow the shape apart while the canvas scrolls up out of view
 * fit      text box as fractions of the canvas: { w, h, y }
 * density  characters across the canvas width
 */
export default function ParticleCanvas({
  shapes,
  hold = 2900,
  start = 'visible',
  scatter = true,
  fit = { w: 0.86, h: 0.42, y: 0.47 },
  density = 120,
  minFont = 8,
  maxFont = 13,
  dust = 260,
  repel = 1,
  onChange,
  className = '',
}) {
  const canvasRef = useRef(null);
  const onChangeRef = useRef(onChange);
  // Read once: the effect sets everything up for the props the canvas mounted with.
  const [opts] = useState(() => ({ shapes, hold, start, scatter, fit, density, minFont, maxFont, dust, repel }));

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const still = reducedMotion();
    const html = document.documentElement;
    let width = 0, height = 0, font = 11, cellW = 6.6, cellH = 11;
    let targetsByShape = [];
    let particles = [];
    let current = -1;
    let nextSwitch = 0;
    let raf = 0, lastDraw = 0, frame = 0, draws = 0;
    let visible = false, seen = false, disposed = false;
    let ink = '#111', accent = '#c2410c', darkPage = false;
    const pointer = { x: -9999, y: -9999, active: false };

    const images = opts.shapes.map(shape => {
      if (!shape.image) return null;
      const img = new Image();
      img.decoding = 'async';
      img.src = shape.image;
      return img;
    });

    const gridPoints = test => {
      const points = [];
      for (let y = cellH / 2; y < height; y += cellH) {
        for (let x = cellW / 2; x < width; x += cellW) {
          const ch = test(x, y, points.length);
          if (ch) {
            const [light, dark] = Array.isArray(ch) ? ch : [ch, ch];
            points.push({ x: x - cellW / 2, y: y - cellH / 2, ch: light, chDark: dark });
          }
        }
      }
      return points;
    };

    const offscreen = () => {
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      return off.getContext('2d', { willReadFrequently: true });
    };

    // Word -> targets: draw it large, then sample it on the character grid.
    const sampleText = text => {
      const octx = offscreen();
      const family = '"Inter Tight", system-ui, sans-serif';
      octx.font = `700 100px ${family}`;
      const measured = octx.measureText(text).width || 1;
      const size = Math.min(100 * ((width * opts.fit.w) / measured), height * opts.fit.h);
      octx.font = `700 ${size}px ${family}`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText(text, width / 2, height * opts.fit.y);
      const { data } = octx.getImageData(0, 0, width, height);
      const on = (x, y) => {
        const px = Math.round(x), py = Math.round(y);
        if (px < 0 || py < 0 || px >= width || py >= height) return false;
        return data[(py * width + px) * 4 + 3] > 110;
      };
      return gridPoints((x, y, n) => {
        if (!on(x, y)) return null;
        const inside = on(x - cellW, y) && on(x + cellW, y) && on(x, y - cellH) && on(x, y + cellH);
        const set = inside ? FILL : EDGE;
        return set[(n * 7 + (x | 0)) % set.length];
      });
    };

    // Image -> targets: near-white is left empty. On a light page darker pixels get denser
    // characters; on a dark page lighter ones do, so the picture never turns into a negative.
    const sampleImage = img => {
      if (!img?.complete || !img.naturalWidth) return [];
      const octx = offscreen();
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      octx.fillStyle = '#fff';
      octx.fillRect(0, 0, width, height);
      octx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      const { data } = octx.getImageData(0, 0, width, height);
      return gridPoints((x, y) => {
        const i = (Math.round(y) * width + Math.round(x)) * 4;
        const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        const dark = Math.pow(1 - lum, 0.9);
        if (dark < 0.1) return null;
        const top = RAMP.length - 1;
        return [RAMP[Math.max(1, Math.round(dark * top))], RAMP[Math.max(1, Math.round(Math.pow(lum, 1.1) * top))]];
      });
    };

    const dustTarget = p => {
      p.tx = rand(0, width);
      p.ty = rand(0, height);
      p.ch = '.';
      p.chDark = '.';
      p.home = false;
    };

    // Hand every particle a spot in the shape; the rest drift around as dust.
    const showShape = index => {
      current = index;
      const targets = targetsByShape[index]
        .map(t => ({ ...t, k: t.x + rand(0, cellW * 10) }))
        .sort((a, b) => a.k - b.k);
      const order = [...particles].sort((a, b) => a.x - b.x);
      order.forEach((p, i) => {
        const target = targets[i];
        if (target) {
          p.tx = target.x;
          p.ty = target.y;
          p.ch = target.ch;
          p.chDark = target.chDark;
          p.home = true;
        } else {
          dustTarget(p);
        }
        if (!still) {
          p.vx += rand(-6, 6);
          p.vy += rand(-6, 6);
        }
      });
      onChangeRef.current?.(index);
    };

    const setup = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      font = Math.max(opts.minFont, Math.min(opts.maxFont, width / opts.density));
      cellW = font * 0.62;
      cellH = font;

      targetsByShape = opts.shapes.map((shape, i) => (shape.image ? sampleImage(images[i]) : sampleText(shape.text)));
      const needed = Math.max(1, ...targetsByShape.map(t => t.length)) + opts.dust;
      while (particles.length < needed) {
        const angle = rand(0, Math.PI * 2);
        const p = { x: rand(0, width), y: rand(0, height), vx: 0, vy: 0, seed: Math.random(), dx: Math.cos(angle), dy: Math.sin(angle) };
        dustTarget(p);
        particles.push(p);
      }
      particles.length = needed;
      if (still) {
        showShape(0);
        particles.forEach(p => { p.x = p.tx; p.y = p.ty; });
        draw();
      } else if (current >= 0) {
        showShape(current);
      }
    };

    const step = () => {
      const r = Math.max(70, Math.min(width, height) * 0.16) * opts.repel;
      for (const p of particles) {
        if (p.home) {
          p.vx += (p.tx - p.x) * 0.07;
          p.vy += (p.ty - p.y) * 0.07;
        } else {
          p.vx += (p.tx - p.x) * 0.0016 + Math.sin(frame * 0.02 + p.seed * 40) * 0.04;
          p.vy += (p.ty - p.y) * 0.0016 + Math.cos(frame * 0.017 + p.seed * 40) * 0.04;
          if (Math.random() < 0.002) dustTarget(p);
        }
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r * r && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / r) * 5;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }
        const drag = p.home ? 0.8 : 0.94;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
      }
    };

    function draw() {
      if (draws++ % 30 === 0) {
        const style = getComputedStyle(canvas);
        ink = style.color;
        accent = style.getPropertyValue('--accent').trim() || accent;
        darkPage = getComputedStyle(html).colorScheme.includes('dark');
      }
      // Leaving the viewport upwards scatters the shape and fades it out.
      let blown = 0;
      if (opts.scatter && !still) {
        const rect = canvas.getBoundingClientRect();
        blown = clamp01(-rect.top / (rect.height * 0.85));
      }
      const spread = blown * blown * Math.max(width, height) * 0.7;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `500 ${font}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      const passes = [[], [], []]; // dust, settled, moving
      for (const p of particles) {
        if (!p.home) passes[0].push(p);
        else if (Math.abs(p.vx) + Math.abs(p.vy) > 3) passes[2].push(p);
        else passes[1].push(p);
      }
      const paint = (list, colour, alpha, flying) => {
        ctx.fillStyle = colour;
        ctx.globalAlpha = alpha * (1 - blown);
        for (const p of list) {
          const ch = flying ? FLIGHT[((p.seed * 97 + frame) | 0) % FLIGHT.length] : darkPage ? p.chDark : p.ch;
          ctx.fillText(ch, p.x + p.dx * spread * (0.4 + p.seed), p.y + p.dy * spread * (0.4 + p.seed));
        }
      };
      paint(passes[0], ink, 0.32, false);
      paint(passes[1], ink, 1, false);
      paint(passes[2], accent, 1, true);
      ctx.globalAlpha = 1;
    }

    const ready = () => (opts.start === 'loaded' ? html.classList.contains('loaded') : seen);

    const loop = now => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - lastDraw;
      if (elapsed < STEP_MS) return;
      // Fixed-size physics steps, so shapes form just as fast on a slow device.
      const steps = lastDraw ? Math.min(12, Math.round(elapsed / STEP_MS)) : 1;
      lastDraw = now;
      if (current < 0 && ready()) {
        showShape(0);
        nextSwitch = now + opts.hold + 600;
      } else if (current >= 0 && opts.shapes.length > 1 && now > nextSwitch) {
        showShape((current + 1) % opts.shapes.length);
        nextSwitch = now + opts.hold;
      }
      for (let i = 0; i < steps; i++) {
        frame++;
        step();
      }
      draw();
    };

    const sync = () => {
      const run = visible && !document.hidden && !still && width > 0;
      if (run && !raf) {
        lastDraw = 0;
        nextSwitch = Math.max(nextSwitch, performance.now() + 800);
        raf = requestAnimationFrame(loop);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onMove = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x > -40 && pointer.y > -40 && pointer.x < rect.width + 40 && pointer.y < rect.height + 40;
    };
    const onLeave = () => { pointer.active = false; };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 150);
    };

    // Sampling needs the real font and the images, so wait for those (but not forever).
    const assets = [
      document.fonts?.load('700 100px "Inter Tight"'),
      ...images.filter(Boolean).map(img => img.decode().catch(() => {})),
    ];
    const begin = () => {
      if (disposed) return;
      setup();
      sync();
    };
    Promise.race([
      Promise.all(assets),
      new Promise(resolve => setTimeout(resolve, 2500)),
    ]).then(begin, begin);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio > 0.25) seen = true;
      sync();
    }, { threshold: [0, 0.25] });
    io.observe(canvas);
    const themeWatcher = new MutationObserver(() => { draws = 0; if (still) draw(); });
    themeWatcher.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', sync);
    if (!still) {
      window.addEventListener('pointermove', onMove, { passive: true });
      html.addEventListener('pointerleave', onLeave);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      themeWatcher.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', onMove);
      html.removeEventListener('pointerleave', onLeave);
    };
  }, [opts]);

  return <canvas className={`particles ${className}`} ref={canvasRef} aria-hidden="true" />;
}
