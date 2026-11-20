import { useEffect, useRef } from 'react';
import { GREETINGS } from '../data/greetings';
import { reducedMotion } from '../utils/motion';


const HOLD = 2900; // ms each greeting stays before morphing into the next
const DUST = 260; // loose characters floating around the word
const FILL = '#%@&';
const EDGE = '*+=:';
const FLIGHT = '.:-=+*';

const rand = (a, b) => a + Math.random() * (b - a);

/**
 * The hero: a cloud of characters that assembles into "Hello", then morphs through
 * greetings in other languages. The pointer pushes characters away, and scrolling
 * down blows the word apart as the page continues underneath.
 */
export default function Greeting({ onChange }) {
  const canvasRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const still = reducedMotion();
    const html = document.documentElement;
    let width = 0, height = 0, font = 11, cellW = 6.6, cellH = 11;
    let words = []; // per greeting: [{ x, y, ch }]
    let particles = [];
    let current = -1;
    let nextSwitch = 0;
    let raf = 0, lastDraw = 0, frame = 0, draws = 0, visible = true;
    let ink = '#111', accent = '#c2410c';
    const pointer = { x: -9999, y: -9999, active: false };
    let disposed = false;

    // Text -> character targets: draw the word big, then sample it on the character grid.
    const sampleWord = word => {
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const octx = off.getContext('2d', { willReadFrequently: true });
      const family = '"Inter Tight", system-ui, sans-serif';
      octx.font = `700 100px ${family}`;
      const measured = octx.measureText(word).width || 1;
      const size = Math.min(100 * ((width * 0.86) / measured), height * 0.42);
      octx.font = `700 ${size}px ${family}`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = '#000';
      octx.fillText(word, width / 2, height * 0.47);

      const { data } = octx.getImageData(0, 0, width, height);
      const on = (x, y) => {
        const px = Math.round(x), py = Math.round(y);
        if (px < 0 || py < 0 || px >= width || py >= height) return false;
        return data[(py * width + px) * 4 + 3] > 110;
      };
      const points = [];
      for (let y = cellH / 2; y < height; y += cellH) {
        for (let x = cellW / 2; x < width; x += cellW) {
          if (!on(x, y)) continue;
          const inside = on(x - cellW, y) && on(x + cellW, y) && on(x, y - cellH) && on(x, y + cellH);
          const set = inside ? FILL : EDGE;
          points.push({ x: x - cellW / 2, y: y - cellH / 2, ch: set[(points.length * 7 + (x | 0)) % set.length] });
        }
      }
      return points;
    };

    const dustTarget = p => {
      p.tx = rand(0, width);
      p.ty = rand(0, height);
      p.ch = '.';
      p.home = false;
    };

    // Hand every particle a spot in the new word; the rest become drifting dust.
    const showWord = index => {
      current = index;
      const targets = words[index]
        .map(t => ({ ...t, k: t.x + rand(0, cellW * 10) }))
        .sort((a, b) => a.k - b.k);
      const order = [...particles].sort((a, b) => a.x - b.x);
      order.forEach((p, i) => {
        const target = targets[i];
        if (target) {
          p.tx = target.x;
          p.ty = target.y;
          p.ch = target.ch;
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
      font = Math.max(8, Math.min(13, width / 120));
      cellW = font * 0.62;
      cellH = font;

      words = GREETINGS.map(g => sampleWord(g.word));
      const needed = Math.max(...words.map(w => w.length)) + DUST;
      while (particles.length < needed) {
        const p = { x: rand(0, width), y: rand(0, height), vx: 0, vy: 0, seed: Math.random() };
        const angle = rand(0, Math.PI * 2);
        p.dx = Math.cos(angle);
        p.dy = Math.sin(angle);
        dustTarget(p);
        particles.push(p);
      }
      particles.length = needed;
      if (current >= 0) showWord(current);
      if (still) {
        showWord(0);
        particles.forEach(p => { p.x = p.tx; p.y = p.ty; });
        draw();
      }
    };

    const step = () => {
      const r = Math.max(90, width * 0.08);
      for (const p of particles) {
        if (p.home) {
          p.vx += (p.tx - p.x) * 0.07;
          p.vy += (p.ty - p.y) * 0.07;
        } else {
          // Dust wanders slowly towards a target that keeps moving.
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
      }
      // Scrolling past the hero scatters the word and fades it out.
      const scatter = Math.min(1, Math.max(0, window.scrollY / (height * 0.85)));
      const spread = scatter * scatter * Math.max(width, height) * 0.7;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `500 ${font}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      const passes = [[], [], []]; // dust, settled, moving
      for (const p of particles) {
        const speed = Math.abs(p.vx) + Math.abs(p.vy);
        if (!p.home) passes[0].push(p);
        else if (speed > 3) passes[2].push(p);
        else passes[1].push(p);
      }
      const paint = (list, colour, alpha, flying) => {
        ctx.fillStyle = colour;
        ctx.globalAlpha = alpha * (1 - scatter);
        for (const p of list) {
          const ch = flying ? FLIGHT[((p.seed * 97 + frame) | 0) % FLIGHT.length] : p.ch;
          ctx.fillText(ch, p.x + p.dx * spread * (0.4 + p.seed), p.y + p.dy * spread * (0.4 + p.seed));
        }
      };
      paint(passes[0], ink, 0.32, false);
      paint(passes[1], ink, 1, false);
      paint(passes[2], accent, 1, true);
      ctx.globalAlpha = 1;
    }

    const loop = now => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - lastDraw;
      if (elapsed < 30) return;
      // Fixed 30 ms physics steps, so the letters form just as fast on a slow device.
      const steps = lastDraw ? Math.min(12, Math.round(elapsed / 30)) : 1;
      lastDraw = now;
      // The word assembles once the loader has lifted.
      if (current < 0 && html.classList.contains('loaded')) {
        showWord(0);
        nextSwitch = now + HOLD + 600;
      } else if (current >= 0 && now > nextSwitch) {
        showWord((current + 1) % words.length);
        nextSwitch = now + HOLD;
      }
      for (let i = 0; i < steps; i++) {
        frame++;
        step();
      }
      draw();
    };

    const sync = () => {
      const run = visible && !document.hidden && !still;
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
      pointer.active = pointer.y > 0 && pointer.y < rect.height;
    };
    const onLeave = () => { pointer.active = false; };

    // The sampled letters must use the real font, so wait for it before the first layout.
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 150);
    };
    const start = () => {
      if (disposed) return;
      setup();
      sync();
    };
    Promise.race([
      document.fonts?.load('700 100px "Inter Tight"') ?? Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 1500)),
    ]).then(start, start);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    const themeWatcher = new MutationObserver(() => { draws = 0; if (still) draw(); });
    themeWatcher.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', sync);
    if (!still) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
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
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas className="greeting" ref={canvasRef} aria-hidden="true" />;
}
