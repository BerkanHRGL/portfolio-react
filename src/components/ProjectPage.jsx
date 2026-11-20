import { useEffect, useMemo, useRef, useState } from 'react';
import AsciiImage from './AsciiImage';
import { projectData } from '../data/projectData';
import { showcaseProjects } from '../data/showcaseProjects';

// Buttons inside the case-study HTML are matched to their destination by class name.
const LINKS = {
  'gitlab-repo-button': 'https://git.fhict.nl/I463567/cardandev',
  'github-repo-button': 'https://github.com/BerkanHRGL/portfolio',
  'github-repo-petchi-button': 'https://github.com/BerkanHRGL/pet-chi',
  'dashboard-link-button': 'https://i554530.hera.fontysict.net',
  'version-control-button': 'https://github.com/BerkanHRGL?tab=repositories',
  'live-demo-button': 'https://pet-chi-mu.vercel.app/',
  'github-repo-overruled-button': 'https://github.com/BerkanHRGL/overruled',
  'petchi-research-button': 'pdfs/field-research-petchi.pdf',
  'design-process-button': 'pdfs/design-process.pdf',
  'user-test-button': 'pdfs/usertest_blurredgame.pdf',
  'project-plan-button': 'pdfs/projectplan.pdf',
  'five-second-test-button': 'pdfs/5sectest.pdf',
  'ab-test-button': 'pdfs/abtest.pdf',
  'user-testing-button': 'pdfs/petchi-user-test.pdf',
};

// Words that must keep their casing when an ALL-CAPS heading is turned into sentence case.
const KEEP_CASE = {
  ai: 'AI', 'a/b': 'A/B', pdf: 'PDF', ux: 'UX', ui: 'UI', gitlab: 'GitLab', github: 'GitHub',
  petchi: 'Petchi', sophie: 'Sophie', i: 'I',
};

function sentenceCase(text) {
  const clean = text.replace(/\s*↓\s*$/, '').trim();
  if (clean !== clean.toUpperCase()) return clean; // already mixed case: leave as written
  return clean
    .toLowerCase()
    .replace(/[a-z/]+/g, word => KEEP_CASE[word] || word)
    .replace(/(^|[:—.]\s+)([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase());
}

function slugify(text) {
  return 'section-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Tidy the stored HTML: readable headings, anchor ids on each chapter, lazy images.
function prepareContent(html) {
  const sections = [];
  const content = html
    .replace(/<h2>([^<]*)<\/h2>/g, (_, raw) => {
      const title = sentenceCase(raw);
      let id = slugify(title);
      while (sections.some(s => s.id === id)) id += '-2';
      sections.push({ id, title });
      return `<h2 id="${id}">${title}</h2>`;
    })
    .replace(/<h3>([^<]*)<\/h3>/g, (_, raw) => `<h3>${sentenceCase(raw)}</h3>`)
    .replace(/(<button[^>]*class="([^"]*)"[^>]*>)([^<]*)(<\/button>)/g, (match, open, cls, raw, close) => {
      if (cls.includes('carousel-arrow')) return match;
      const tag = cls.includes('accordion-toggle')
        ? open.replace('<button', '<button type="button" aria-expanded="false"')
        : open.replace('<button', '<button type="button"');
      return tag + sentenceCase(raw) + close;
    })
    .replace(/class="carousel-arrow carousel-prev"/g, '$& type="button" aria-label="Previous image"')
    .replace(/class="carousel-arrow carousel-next"/g, '$& type="button" aria-label="Next image"')
    .replace(/<img /g, '<img loading="lazy" decoding="async" ');
  return { content, sections };
}

export default function ProjectPage({ projectKey, onImage }) {
  const project = projectData[projectKey];
  const index = showcaseProjects.findIndex(p => p.key === projectKey);
  const meta = showcaseProjects[index];
  const contentRef = useRef(null);
  const { content, sections } = useMemo(() => prepareContent(project.content), [project]);
  const [activeId, setActiveId] = useState(sections[0]?.id);

  // Next case study that can actually be opened.
  const next = useMemo(() => {
    for (let step = 1; step < showcaseProjects.length; step++) {
      const candidate = showcaseProjects[(index + step) % showcaseProjects.length];
      if (!candidate.comingSoon) return candidate;
    }
    return null;
  }, [index]);

  useEffect(() => {
    document.title = `${meta.title} – Berkan Hergül`;
    return () => { document.title = 'Berkan Hergül – Designer & Front-End Developer'; };
  }, [meta.title]);

  // Clicks inside the case-study HTML: accordions, link buttons, zoomable images.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    function onClick(e) {
      const img = e.target.closest('img.clickable-image');
      if (img) {
        onImage({ src: img.getAttribute('src'), alt: img.getAttribute('alt') });
        return;
      }
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('accordion-toggle')) {
        const open = btn.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        return;
      }
      const cls = Object.keys(LINKS).find(name => btn.classList.contains(name));
      if (cls) window.open(LINKS[cls], '_blank', 'noopener');
    }
    root.addEventListener('click', onClick);

    // Carousels: images are numbered files (name-1.png, name-2.png, ...).
    const cleanups = [];
    root.querySelectorAll('.image-carousel').forEach(carousel => {
      const img = carousel.querySelector('img');
      const prev = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      const counter = carousel.parentElement?.querySelector('.carousel-counter');
      const currentEl = counter?.querySelector('span:first-child');
      const totalEl = counter?.querySelector('span:last-child');
      const match = img?.getAttribute('src').match(/^(.*\D)(\d+)(\.[^.]+)$/);
      if (!img || !prev || !nextBtn || !match) return;

      const total = totalEl ? parseInt(totalEl.textContent, 10) : 1;
      const [, prefix, , ext] = match;
      let current = 0;
      const show = () => {
        img.setAttribute('src', `${prefix}${current + 1}${ext}`);
        if (currentEl) currentEl.textContent = String(current + 1);
      };
      const onPrev = () => { current = (current - 1 + total) % total; show(); };
      const onNext = () => { current = (current + 1) % total; show(); };
      prev.addEventListener('click', onPrev);
      nextBtn.addEventListener('click', onNext);
      cleanups.push(() => {
        prev.removeEventListener('click', onPrev);
        nextBtn.removeEventListener('click', onNext);
      });
    });

    return () => {
      root.removeEventListener('click', onClick);
      cleanups.forEach(fn => fn());
    };
  }, [content, onImage]);

  // Highlight the chapter currently being read.
  useEffect(() => {
    let pending = false;
    function update() {
      pending = false;
      let current = sections[0]?.id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= 140) current = section.id;
      }
      setActiveId(current);
    }
    function onScroll() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  function jumpTo(e, id) {
    e.preventDefault(); // keep the "#/work/..." route in the address bar
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <article className="project container">
      <a className="back-link label" href="#work">← All work</a>

      <header className="project-head">
        <p className="label section-label">
          <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
          <span>{project.type}</span>
        </p>
        <h1>{meta.title}</h1>
        <p className="lead">{meta.desc}</p>
        <dl className="project-meta">
          <div><dt>Role</dt><dd>{project.role || '—'}</dd></div>
          <div><dt>Client</dt><dd>{project.client || '—'}</dd></div>
          <div><dt>Year</dt><dd>{meta.year}</dd></div>
        </dl>
      </header>

      {meta.thumbnail && (
        <figure className="project-cover">
          <div className="artwork">
          <AsciiImage
            src={meta.thumbnail}
            alt={`${meta.title} cover image`}
            cols={120}
            ratio={0.5}
            fit={meta.fit}
            flat={meta.fit === 'contain'}
            auto
            eager
          />
          </div>
          <figcaption className="label stage-caption">
            <span><em className="serif">{meta.title}</em>, {meta.year}</span>
            <span>Medium: {meta.medium}</span>
          </figcaption>
        </figure>
      )}

      <div className="project-layout">
        <nav className="toc" aria-label="Case study chapters">
          <p className="toc-title">Contents</p>
          <ol>
            {sections.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={section.id === activeId ? 'active' : undefined}
                  aria-current={section.id === activeId ? 'true' : undefined}
                  onClick={e => jumpTo(e, section.id)}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div
          ref={contentRef}
          className="cs"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {next && (
        <a className="next-project" href={`#/work/${next.key}`}>
          <span className="eyebrow">Next project</span>
          <span className="next-title">{next.title} <span aria-hidden="true">→</span></span>
        </a>
      )}
    </article>
  );
}
