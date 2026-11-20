import { useEffect, useRef } from 'react';
import { BADGES } from '../data/badges';
import { showcaseProjects } from '../data/showcaseProjects';
import { reducedMotion } from '../utils/motion';

const GLYPHS = '#@$%&*+=?/\\<>01';
const FRONT = 7; // characters that are still "decoding" at the edge of the typed text

// The sentence, with badges and linked keywords between plain words.
const PARTS = [
  'I design things that',
  { badge: 'eye' },
  { key: 'look good', project: 'branding' },
  'and',
  { badge: 'build' },
  { key: 'work', project: 'development' },
  'for the',
  { badge: 'crowd' },
  { key: 'people', project: 'ux' },
  'using them.',
];

const projectByKey = Object.fromEntries(showcaseProjects.map(p => [p.key, p]));

// Give every character a running number, so scroll progress can type them in order.
function layout() {
  let n = 0;
  const words = text => text.split(' ').map(word => ({ chars: [...word].map(ch => ({ ch, i: n++ })) }));
  return PARTS.map(part => {
    if (typeof part === 'string') return { type: 'text', words: words(part) };
    if (part.badge) return { type: 'badge', name: part.badge, at: n };
    return { type: 'key', project: projectByKey[part.project], words: words(part.key) };
  });
}
const PIECES = layout();
const TOTAL = PIECES.reduce((sum, piece) => sum + (piece.words ? piece.words.reduce((s, w) => s + w.chars.length, 0) : 0), 0);

function Word({ word }) {
  return (
    <span className="w">
      {word.chars.map(c => <span key={c.i} className="c" data-i={c.i}>{c.ch}</span>)}
    </span>
  );
}

function Badge({ name, at }) {
  const frame = BADGES[name].frames[0];
  return (
    <span className="badge" data-badge={name} data-i={at} aria-hidden="true">
      <pre style={{ '--rows': frame.length }}>{frame.join('\n')}</pre>
    </span>
  );
}

/**
 * The statement after the greeting. The section pins while you scroll, and the
 * sentence types itself in: each character decodes from noise as you go. Small ASCII
 * animations sit between the words, and the orange words open a preview of the
 * project that shows what they mean.
 */
export default function Intro() {
  const trackRef = useRef(null);
  const sentenceRef = useRef(null);
  const meterRef = useRef(null);
  const stageRef = useRef(null);
  const cardRef = useRef(null);

  // Scroll-driven typing, plus the badge animations.
  useEffect(() => {
    const track = trackRef.current;
    const sentence = sentenceRef.current;
    const still = reducedMotion();
    const chars = [...sentence.querySelectorAll('.c')];
    const badges = [...sentence.querySelectorAll('.badge')];
    const states = new Array(chars.length).fill('');
    let raf = 0, ticker = 0, lit = 0, visible = false;

    const apply = () => {
      chars.forEach((el, i) => {
        const state = i < lit - FRONT ? 'on' : i < lit ? 'scr' : 'off';
        if (state !== states[i]) {
          el.className = `c ${state}`;
          states[i] = state;
        }
        if (state === 'scr') el.dataset.g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      });
      badges.forEach(badge => badge.classList.toggle('on', lit - FRONT > Number(badge.dataset.i)));
    };

    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      // Typing finishes at 75% of the pinned scroll; the rest is a pause to read.
      const progress = still || span <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / (span * 0.75)));
      lit = progress * (TOTAL + FRONT);
      apply();
      const filled = Math.round(progress * 12);
      meterRef.current.textContent = `[${'█'.repeat(filled)}${'░'.repeat(12 - filled)}] ${String(Math.round(progress * 100)).padStart(3, '0')}%`;
      stageRef.current.classList.toggle('done', progress > 0.92);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    // One timer drives the badges and keeps the decoding edge flickering while you pause.
    let frame = 0;
    const tick = () => {
      frame++;
      badges.forEach(badge => {
        const { frames, speed } = BADGES[badge.dataset.badge];
        const text = frames[Math.floor((frame * 80) / speed) % frames.length].join('\n');
        const pre = badge.firstChild;
        if (pre.textContent !== text) pre.textContent = text;
      });
      if (lit < TOTAL + FRONT) apply();
    };
    const sync = () => {
      const run = visible && !document.hidden && !still;
      if (run && !ticker) ticker = setInterval(tick, 80);
      if (!run && ticker) {
        clearInterval(ticker);
        ticker = 0;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(track);

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(ticker);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Hovering an orange word shows a preview card next to the pointer (mouse only).
  useEffect(() => {
    const sentence = sentenceRef.current;
    const card = cardRef.current;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const items = [...card.children];
    let active = null;

    const hide = () => {
      active = null;
      card.classList.remove('on');
    };
    const onMove = event => {
      const key = event.target.closest('.key');
      if (!key) return hide();
      if (key !== active) {
        active = key;
        items.forEach(item => item.classList.toggle('on', item.dataset.project === key.dataset.project));
        card.classList.add('on');
      }
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const x = Math.min(event.clientX + 24, window.innerWidth - w - 16);
      const y = Math.max(16, Math.min(event.clientY - h - 24, window.innerHeight - h - 16));
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    sentence.addEventListener('pointermove', onMove);
    sentence.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      sentence.removeEventListener('pointermove', onMove);
      sentence.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, []);

  const keyed = PIECES.filter(piece => piece.type === 'key');

  return (
    <section className="intro" id="intro" aria-label="Introduction">
      <div className="intro-track" ref={trackRef}>
        <div className="intro-stage container" ref={stageRef}>
          <div className="intro-top label">
            <p className="section-label">
              <span className="section-number">00</span>
              <span>Nice to meet you</span>
            </p>
            <p className="intro-meter" ref={meterRef} aria-hidden="true">[░░░░░░░░░░░░] 000%</p>
          </div>

          <p className="intro-sentence" ref={sentenceRef}>
            {PIECES.flatMap((piece, p) => {
              if (piece.type === 'badge') return [<Badge key={p} name={piece.name} at={piece.at} />, ' '];
              const words = piece.words.flatMap((word, w) => [<Word key={`${p}-${w}`} word={word} />, ' ']);
              if (piece.type === 'text') return words;
              return [
                <a
                  key={p}
                  className="key"
                  href={`#/work/${piece.project.key}`}
                  data-project={piece.project.key}
                  title={`See ${piece.project.title}`}
                >
                  {words.slice(0, -1)}
                </a>,
                ' ',
              ];
            })}
          </p>

          <div className="intro-foot">
            <p className="intro-lead">
              I combine UX/UI design, branding and front-end development, and every project
              starts with finding out what people actually need.
            </p>
            <div className="intro-actions">
              <div className="hero-actions">
                <a className="btn btn-primary" href="#work" data-magnetic>View my work</a>
                <a className="btn" href="#contact" data-magnetic>Get in touch</a>
              </div>
              <p className="status label">
                <span className="status-dot" aria-hidden="true" />
                Open to internships &amp; projects
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="intro-card" ref={cardRef} aria-hidden="true">
        {keyed.map(piece => (
          <div className="intro-card-item" key={piece.project.key} data-project={piece.project.key}>
            <img
              src={piece.project.thumbnail}
              alt=""
              loading="lazy"
              className={piece.project.fit === 'contain' ? 'contain' : undefined}
            />
            <p className="label">
              <span>{piece.project.type}</span>
              <strong>{piece.project.title} →</strong>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
