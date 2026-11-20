import { useEffect, useRef } from 'react';
import { reducedMotion } from '../utils/motion';

// *word* = accent colour
const TEXT =
  'I design things that *look* *good* and *work* for the people using them. ' +
  'I combine UX/UI design, branding and front-end development, ' +
  'and every project starts with finding out what people actually need.';

const words = TEXT.split(' ').map(raw => ({
  text: raw.replace(/\*/g, ''),
  accent: raw.startsWith('*'),
}));

/**
 * The statement after the greeting. Its words light up one by one as you scroll,
 * so the page reads itself to you at your own pace.
 */
export default function Intro() {
  const textRef = useRef(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text || reducedMotion()) return;
    const spans = [...text.children];
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = text.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.3);
      const lit = Math.min(1, Math.max(0, progress)) * spans.length;
      spans.forEach((span, i) => {
        const amount = Math.min(1, Math.max(0, lit - i));
        span.style.opacity = (0.14 + amount * 0.86).toFixed(3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="intro container" id="intro" aria-label="Introduction">
      <p className="label section-label">
        <span className="section-number">00</span>
        <span>Nice to meet you</span>
      </p>

      <p className="intro-text" ref={textRef}>
        {words.flatMap((word, i) => [
          <span key={i} className={word.accent ? 'accent' : undefined}>{word.text}</span>,
          ' ',
        ])}
      </p>

      <div className="intro-foot" data-reveal>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#work" data-magnetic>View my work</a>
          <a className="btn" href="#contact" data-magnetic>Get in touch</a>
        </div>
        <p className="status label">
          <span className="status-dot" aria-hidden="true" />
          Open to internships &amp; projects
        </p>
      </div>
    </section>
  );
}
