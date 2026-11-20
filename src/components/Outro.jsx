import { useEffect, useRef, useState } from 'react';
import ParticleCanvas from './ParticleCanvas';
import { GOODBYES } from '../data/greetings';

const BYE_SHAPES = GOODBYES.map(g => ({ text: g.word }));

// The page ends the way it started: the characters wave goodbye in the same six languages.
export default function Outro() {
  const [index, setIndex] = useState(0);
  const bye = GOODBYES[index];
  const ref = useRef(null);

  // Like the hero, the goodbye gets the screen to itself: the page background steps aside.
  useEffect(() => {
    const html = document.documentElement;
    const io = new IntersectionObserver(
      ([entry]) => html.classList.toggle('at-outro', entry.intersectionRatio >= 0.35),
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      html.classList.remove('at-outro');
    };
  }, []);

  return (
    <section className="outro" aria-label="Goodbye" ref={ref}>
      <ParticleCanvas
        className="outro-canvas"
        shapes={BYE_SHAPES}
        scatter={false}
        fit={{ w: 0.8, h: 0.5, y: 0.5 }}
        dust={220}
        repel={0.75}
        onChange={setIndex}
      />
      <div className="outro-layer container">
        <p className="label">Thank you for visiting the exhibition</p>
        <p className="label outro-lang" aria-hidden="true">
          <span key={bye.word}>&ldquo;{bye.word}&rdquo; in {bye.lang}</span>
        </p>
      </div>
    </section>
  );
}
