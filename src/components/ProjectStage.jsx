import { useEffect, useRef } from 'react';

const RAMP = ' .:-=+*#%@';
const NOISE = '#@%&$*+=';
const COLS = 120;
const TRANSITION = 900; // ms for one project to dissolve into the next
const LENS = 150; // radius of the "real image" circle under the pointer

const clamp01 = n => Math.min(1, Math.max(0, n));

// Stand-in pattern for a project without an image (and for the very first dissolve).
function patternGrid(cols, rows) {
  const grid = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = Math.sin(x * 0.11 + Math.sin(y * 0.21) * 2) * Math.cos(y * 0.19 - x * 0.03);
      grid[y * cols + x] = clamp01((v - 0.2) * 0.9);
    }
  }
  return { light: grid, dark: grid };
}

// Image -> how dense the character in each cell should be, for a light and a dark page.
function imageGrid(img, cols, rows, width, height, contain) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cols, rows);
  const fit = fitRect(img, width, height, contain);
  ctx.drawImage(img, (fit.x / width) * cols, (fit.y / height) * rows, (fit.w / width) * cols, (fit.h / height) * rows);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  const lum = new Float32Array(cols * rows);
  let min = 255, max = 0;
  for (let i = 0; i < lum.length; i++) {
    const l = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
    lum[i] = l;
    if (l < min) min = l;
    if (l > max) max = l;
  }
  const range = max - min || 1;
  const light = new Float32Array(lum.length);
  const dark = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) {
    const t = clamp01((lum[i] - min) / range);
    light[i] = Math.pow(1 - t, 1.4);
    dark[i] = Math.pow(t, 2.2);
  }
  // Logos on white keep the same drawing in dark mode instead of becoming a solid block.
  return { light, dark: contain ? light : dark };
}

// Where an image lands inside a width x height box (cover or contain).
function fitRect(img, width, height, contain) {
  const scale = contain
    ? Math.min(width / img.naturalWidth, height / img.naturalHeight)
    : Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

/**
 * Draws the active project's image as animated ASCII on a canvas.
 * Changing `active` dissolves one image into the next through a band of noise,
 * and the area under the pointer shows the real image through a round lens.
 */
export default function ProjectStage({ projects, active }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ from: -1, to: -1, start: 0 });

  // A new active project starts a dissolve from whatever is on screen now.
  useEffect(() => {
    const state = stateRef.current;
    if (state.to === active) return;
    state.from = state.to;
    state.to = active;
    state.start = performance.now();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    const images = projects.map(project => {
      if (!project.thumbnail) return null;
      const img = new Image();
      img.decoding = 'async';
      img.src = project.thumbnail;
      return img;
    });

    let width = 0, height = 0, cols = COLS, rows = 0, fontSize = 10;
    let grids = [];
    let pattern = null;
    let sweep = new Float32Array(0);
    let raf = 0, lastDraw = 0, frame = 0;
    let visible = false;
    let ink = '#000', accent = '#c2410c', dark = false;
    const lens = { x: 0, y: 0, tx: 0, ty: 0, r: 0, on: false };

    const gridFor = index => {
      if (index < 0) return pattern;
      if (!grids[index]) {
        const img = images[index];
        if (!img) grids[index] = pattern;
        else if (img.complete && img.naturalWidth) {
          try {
            grids[index] = imageGrid(img, cols, rows, width, height, projects[index].fit === 'contain');
          } catch {
            grids[index] = pattern;
          }
        }
      }
      return grids[index] || pattern;
    };

    const draw = now => {
      if (frame++ % 30 === 0) {
        const style = getComputedStyle(canvas);
        ink = style.color;
        accent = style.getPropertyValue('--accent').trim() || accent;
        dark = getComputedStyle(document.documentElement).colorScheme.includes('dark');
      }
      const mode = dark ? 'dark' : 'light';
      const a = gridFor(state.from)[mode];
      const b = gridFor(state.to)[mode];
      const linear = clamp01((now - state.start) / TRANSITION);
      const progress = linear * linear * (3 - 2 * linear) * 1.12 - 0.06; // overshoot so every cell finishes
      const t = now / 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < rows; y++) {
        let line = '';
        let noise = '';
        let hasNoise = false;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const edge = progress - sweep[i];
          if (edge > -0.06 && edge < 0.06 && linear < 1) {
            line += ' ';
            noise += NOISE[(Math.random() * NOISE.length) | 0];
            hasNoise = true;
            continue;
          }
          let density = edge >= 0.06 || linear >= 1 ? b[i] : a[i];
          // A slow ripple keeps the picture alive while nothing else happens.
          if (density > 0.04) density = clamp01(density + Math.sin(x * 0.16 + y * 0.33 - t * 2.2) * 0.07);
          line += RAMP[Math.round(density * (RAMP.length - 1))];
          noise += ' ';
        }
        ctx.fillStyle = ink;
        ctx.fillText(line, 0, y * fontSize);
        if (hasNoise) {
          ctx.fillStyle = accent;
          ctx.fillText(noise, 0, y * fontSize);
        }
      }

      // Lens: the real image, clipped to a circle that follows the pointer.
      lens.x += (lens.tx - lens.x) * 0.2;
      lens.y += (lens.ty - lens.y) * 0.2;
      lens.r += ((lens.on ? LENS : 0) - lens.r) * 0.16;
      const img = images[state.to];
      if (lens.r > 2 && img && img.complete && img.naturalWidth) {
        const contain = projects[state.to].fit === 'contain';
        const fit = fitRect(img, width, height, contain);
        ctx.save();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, fit.x, fit.y, fit.w, fit.h);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < 33) return;
      lastDraw = now;
      draw(now);
    };
    const sync = () => {
      const run = visible && !document.hidden;
      if (run && !raf) raf = requestAnimationFrame(loop);
      if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      fontSize = width / (cols * 0.6);
      rows = Math.ceil(height / fontSize);
      pattern = patternGrid(cols, rows);
      grids = [];
      // Each cell switches at its own moment: a left-to-right sweep with a ragged edge.
      sweep = new Float32Array(cols * rows);
      for (let i = 0; i < sweep.length; i++) {
        sweep[i] = ((i % cols) / cols) * 0.7 + Math.random() * 0.3;
      }
      draw(performance.now());
    };

    const resizer = new ResizeObserver(resize);
    resizer.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    const onMove = event => {
      const rect = canvas.getBoundingClientRect();
      lens.tx = event.clientX - rect.left;
      lens.ty = event.clientY - rect.top;
      if (!lens.on) {
        lens.x = lens.tx;
        lens.y = lens.ty;
        lens.on = true;
      }
    };
    const onLeave = () => { lens.on = false; };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(raf);
      resizer.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [projects]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
