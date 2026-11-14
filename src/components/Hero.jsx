import WindowFrame from './WindowFrame';

export default function Hero() {
  return (
    <section className="hero container" id="top">
      <div className="hero-text">
        <p className="eyebrow">Media Design student · Fontys, the Netherlands</p>
        <h1>
          Design that looks good <em>and</em> works for the people using it.
        </h1>
        <p className="lead">
          I&apos;m Berkan Hergül. I combine UX/UI design, branding and front-end development,
          and I start every project by finding out what people actually need.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">View my work</a>
          <a className="btn" href="#contact">Get in touch</a>
        </div>
      </div>

      <div className="hero-side">
        <WindowFrame title="berkan.png" className="hero-portrait">
          <img src="imgs/portrait.png" alt="Pixel-art portrait of Berkan" width="441" height="441" />
        </WindowFrame>
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          Open to internships &amp; projects
        </p>
      </div>
    </section>
  );
}
