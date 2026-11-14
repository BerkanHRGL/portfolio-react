// Block-letter banner built from 5x7 bitmaps, so any word in GLYPHS can be drawn.
const GLYPHS = {
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
};

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
  return { text: lines.join('\n'), cols: (width + 1) * 2 };
}

const banner = buildBanner('BERKAN');

export default function AsciiBanner() {
  return (
    <div className="banner-wrap" aria-hidden="true">
      <pre className="banner" style={{ '--cols': banner.cols }}>
        {/* Split on runs of shadow characters so they can take the accent colour */}
        {banner.text.split(/(░+)/).map((part, i) =>
          part.startsWith('░') ? <span key={i} className="banner-shadow">{part}</span> : part
        )}
      </pre>
    </div>
  );
}
