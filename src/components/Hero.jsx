import { useEffect, useRef, useState } from 'react';
import Clock from './Clock';
import ParticleCanvas from './ParticleCanvas';
import { GREETINGS } from '../data/greetings';

const HELLO_SHAPES = GREETINGS.map(g => ({ text: g.word }));

export default function Hero() {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const greeting = GREETINGS[index];

  // The page-wide ASCII background stays hidden while the greeting has the stage.
  useEffect(() => {
    const html = document.documentElement;
    // Set straight away too: the observer only reports after the first frame.
    html.classList.toggle('at-hero', ref.current.getBoundingClientRect().bottom > window.innerHeight * 0.35);
    const io = new IntersectionObserver(
      ([entry]) => html.classList.toggle('at-hero', entry.intersectionRatio >= 0.35),
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      html.classList.remove('at-hero');
    };
  }, []);

  return (
    <section className="hero" id="top" ref={ref}>
      <ParticleCanvas
        className="greeting"
        shapes={HELLO_SHAPES}
        start="loaded"
        repel={0.75}
        onChange={setIndex}
      />

      <div className="hero-layer container">
        <div className="hero-top label">
          <span>Berkan Hergül</span>
          <span className="hero-top-mid">Portfolio / {new Date().getFullYear()}</span>
          <Clock />
        </div>

        <h1 className="sr-only">Berkan Hergül, designer and front-end developer</h1>

        <p className="hero-lang label" aria-hidden="true">
          <span key={greeting.word} className="hero-lang-text">
            &ldquo;{greeting.word}&rdquo; in {greeting.lang}
          </span>
          <span className="hero-play">move your cursor through the letters</span>
        </p>

        <div className="hero-bottom">
          <p className="hero-welcome">
            Welcome in. I&apos;m <strong>Berkan</strong>, a designer who also builds things for the web.
          </p>
          <a className="hero-scroll label" href="#intro">
            Scroll to enter
            <span className="hero-scroll-line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
