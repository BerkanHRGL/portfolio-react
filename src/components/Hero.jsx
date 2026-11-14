import Clock from './Clock';

// Each word sits in a clipped box so it can slide up into place on load.
function words(text, offset = 0) {
  return text.split(' ').flatMap((word, i) => [
    <span className="word" key={word + i}><span style={{ '--i': offset + i }}>{word}</span></span>,
    ' ',
  ]);
}

export default function Hero() {
  return (
    <section className="hero container" id="top">
      <div className="hero-top label">
        <span>Berkan Hergül</span>
        <span className="hero-top-mid">Portfolio / {new Date().getFullYear()}</span>
        <Clock />
      </div>

      <div className="hero-main">
        <p className="label hero-eyebrow">Media Design student @ Fontys, the Netherlands</p>
        <h1>
          {words('Design that looks good')}
          <em className="word"><span style={{ '--i': 4 }}>and</span></em>{' '}
          {words('works for the people using', 5)}
          <span className="word"><span style={{ '--i': 10 }}>it.</span></span>
        </h1>
      </div>

      <div className="hero-foot">
        <p className="lead">
          I&apos;m Berkan Hergül. I combine UX/UI design, branding and front-end development,
          and I start every project by finding out what people actually need.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">View my work</a>
          <a className="btn" href="#contact">Get in touch</a>
        </div>
        <p className="status label">
          <span className="status-dot" aria-hidden="true" />
          Open to internships &amp; projects
        </p>
      </div>
    </section>
  );
}
