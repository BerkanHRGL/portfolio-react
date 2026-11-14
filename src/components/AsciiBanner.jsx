import { useLayoutEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

// Block-letter banner built from 5x7 bitmaps, so any word in GLYPHS can be drawn.
const GLYPHS = {
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
};

// Characters shown while a cell is still "decoding"
const NOISE_SOLID = '█▓▒#@%';
const NOISE_SHADOW = '░▒:.';

function buildBanner(word) {
  const letters = [...word].map(ch => GLYPHS[ch]);
  const height = 7;
  // One bitmap row per line, letters separated by an empty column.
  const grid = Array.from({ length: height }, (_, y) =>
    letters.map(glyph => glyph[y]).join('.').split('').map(c => c === '#')
  );
  const width = grid[0].length;
  const lines = [];
  for (let y = 0; y <= height; y++) {
    let line = '';
    for (let x = 0; x <= width; x++) {
      const on = grid[y]?.[x];
      const shadow = y > 0 && x > 0 && grid[y - 1][x - 1];
      // Each pixel is two characters wide so it comes out roughly square.
      line += on ? '██' : shadow ? '░░' : '  ';
    }
    lines.push(line);
  }
  const text = lines.join('\n');

  // Split into runs of shadow / non-shadow characters so shadows can take the accent colour.
  const runs = [];
  let offset = 0;
  for (const part of text.split(/(░+)/)) {
    if (!part) continue;
    runs.push({ start: offset, end: offset + part.length, shadow: part.startsWith('░') });
    offset += part.length;
  }
  return { text, runs, cols: (width + 1) * 2, rows: lines.length };
}

const banner = buildBanner('BERKAN');

export default function AsciiBanner() {
  const preRef = useRef(null);

  // Decodes the banner on load, and scrambles the cells under the pointer.
  // Writes straight to the DOM: this runs every frame and never needs a re-render.
  useLayoutEffect(() => {
    const pre = preRef.current;
    if (!pre || reducedMotion()) return;

    const { text, runs, cols, rows } = banner;
    const spans = [...pre.children];
    const lineLength = cols + 1; // + the newline
    const noisyUntil = new Float64Array(text.length);
    let raf = 0;
    let lastDraw = 0;

    const draw = now => {
      raf = 0;
      if (now - lastDraw < 33) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      let active = false;
      runs.forEach((run, r) => {
        let out = '';
        for (let i = run.start; i < run.end; i++) {
          const ch = text[i];
          if (noisyUntil[i] > now && ch !== ' ' && ch !== '\n') {
            active = true;
            const set = ch === '█' ? NOISE_SOLID : NOISE_SHADOW;
            out += set[(Math.random() * set.length) | 0];
          } else {
            out += ch;
          }
        }
        if (spans[r].textContent !== out) spans[r].textContent = out;
      });
      if (active) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    // Intro: cells settle from left to right.
    const start = performance.now();
    for (let i = 0; i < text.length; i++) {
      const x = i % lineLength;
      noisyUntil[i] = start + 150 + (x / cols) * 800 + Math.random() * 300;
    }
    draw(start);
    kick();

    const onMove = event => {
      const rect = pre.getBoundingClientRect();
      const cx = Math.floor(((event.clientX - rect.left) / rect.width) * cols);
      const cy = Math.floor(((event.clientY - rect.top) / rect.height) * rows);
      const now = performance.now();
      for (let y = Math.max(0, cy - 2); y <= Math.min(rows - 1, cy + 2); y++) {
        for (let x = Math.max(0, cx - 5); x <= Math.min(cols - 1, cx + 5); x++) {
          noisyUntil[y * lineLength + x] = now + 120 + Math.random() * 380;
        }
      }
      kick();
    };
    pre.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      pre.removeEventListener('pointermove', onMove);
      runs.forEach((run, r) => { spans[r].textContent = text.slice(run.start, run.end); });
    };
  }, []);

  return (
    <div className="banner-wrap" aria-hidden="true">
      <pre className="banner" style={{ '--cols': banner.cols }} ref={preRef}>
        {banner.runs.map(run => (
          <span key={run.start} className={run.shadow ? 'banner-shadow' : undefined}>
            {banner.text.slice(run.start, run.end)}
          </span>
        ))}
      </pre>
    </div>
  );
}
