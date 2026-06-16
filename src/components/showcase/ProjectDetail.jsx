import { useEffect, useLayoutEffect, useRef } from 'react';
import { projectData } from '../../data/projectData';
import { showcaseProjects } from '../../data/showcaseProjects';
import { playGlitchTransition } from '../../utils/glitchTransition';
import { riseIn } from '../../motion/reveal';
import { batchReveal, parallaxImage, ScrollTrigger } from '../../motion/scroll';
import { magnetize } from '../../motion/magnetic';
import { attachLenis } from '../../motion/lenis';
import { prefersReducedMotion, isTouchDevice } from '../../motion/env';

export default function ProjectDetail({ projectKey, onBack }) {
  const scrollRef = useRef(null);
  const scrollInnerRef = useRef(null);
  const contentRef = useRef(null);
  const tabsRef = useRef(null);

  const project = projectData[projectKey];
  const meta = showcaseProjects.find(p => p.key === projectKey) || {};

  // Hero entrance — starts as the glitch transition clears.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll || prefersReducedMotion()) return;
    const hero = scroll.querySelectorAll(
      '.detail-category, .detail-title, .detail-desc, .detail-meta .meta-item'
    );
    riseIn(hero, { delay: 0.3, stagger: 0.09, duration: 0.85, y: 28 });

    // Long-form content streams in as you scroll the detail column.
    const batches = batchReveal(
      scroll.querySelectorAll('.detail-thumbnail-wrap, .detail-content > *'),
      { scroller: scroll, start: 'top 86%' }
    );

    // Gentle parallax on the hero thumbnail — desktop only (expensive on
    // touch). Content images are left alone to avoid clipping carousel /
    // accordion controls.
    const parallaxTriggers = [];
    if (!isTouchDevice()) {
      const thumb = scroll.querySelector('#detail-thumb');
      if (thumb) {
        const t = parallaxImage(thumb, { scroller: scroll, range: 9, scale: 1.16 });
        if (t) parallaxTriggers.push(t);
      }
    }

    ScrollTrigger.refresh();
    const cleanupMagnetic = magnetize(
      document.querySelector('.detail-topbar'),
      '.detail-back-btn',
      { strength: 0.3, max: 12 }
    );
    return () => {
      batches.forEach(t => t.kill());
      parallaxTriggers.forEach(t => t && t.kill());
      cleanupMagnetic();
    };
  }, [projectKey]);

  useEffect(() => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    const tabsEl = tabsRef.current;
    if (!scroll || !content || !tabsEl) return;

    scroll.scrollTop = 0;
    tabsEl.innerHTML = '';

    // Lenis smooth scrolling on the detail reading column (desktop / motion-ok).
    let lenis = null;
    let lenisCleanup = () => {};
    if (!prefersReducedMotion() && scrollInnerRef.current) {
      ({ lenis, cleanup: lenisCleanup } = attachLenis(scroll, scrollInnerRef.current));
    }

    const topbarH = document.querySelector('.detail-topbar')?.offsetHeight || 48;
    const tabMap = new Map();
    const allH2s = Array.from(content.querySelectorAll('h2'));

    allH2s.forEach((h2, i) => {
      const id = 'ds-' + h2.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      h2.id = id;
      const tab = document.createElement('button');
      tab.className = 'detail-tab' + (i === 0 ? ' active' : '');
      tab.textContent = h2.textContent.trim();
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(id);
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { offset: -(topbarH + 16) });
        else scroll.scrollTo({ top: target.offsetTop - topbarH - 16, behavior: 'smooth' });
      });
      tabsEl.appendChild(tab);
      tabMap.set(id, tab);
    });

    let rafPending = false;
    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const containerTop = scroll.getBoundingClientRect().top;
        let activeId = allH2s[0]?.id;
        for (const h2 of allH2s) {
          if (h2.getBoundingClientRect().top - containerTop <= 80) activeId = h2.id;
        }
        tabsEl.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        tabMap.get(activeId)?.classList.add('active');
      });
    }
    scroll.addEventListener('scroll', onScroll);

    const linkMap = {
      'gitlab-repo-button': 'https://git.fhict.nl/I463567/cardandev',
      'github-repo-button': 'https://github.com/BerkanHRGL/portfolio',
      'github-repo-petchi-button': 'https://github.com/BerkanHRGL/pet-chi',
      'dashboard-link-button': 'https://i554530.hera.fontysict.net',
      'version-control-button': 'https://github.com/BerkanHRGL?tab=repositories',
      'live-demo-button': 'https://pet-chi-mu.vercel.app/',
      'github-repo-overruled-button': 'https://github.com/BerkanHRGL/overruled',
    };
    const pdfMap = {
      'petchi-research-button': 'pdfs/field-research-petchi.pdf',
      'design-process-button': 'pdfs/design-process.pdf',
      'user-test-button': 'pdfs/usertest_blurredgame.pdf',
      'project-plan-button': 'pdfs/projectplan.pdf',
      'five-second-test-button': 'pdfs/5sectest.pdf',
      'ab-test-button': 'pdfs/abtest.pdf',
      'user-testing-button': 'pdfs/petchi-user-test.pdf',
    };

    function handleContentClick(e) {
      const toggleBtn = e.target.closest('.accordion-toggle');
      if (toggleBtn) {
        const c = toggleBtn.nextElementSibling;
        if (!c) return;
        const open = c.style.display === 'block';
        c.style.display = open ? 'none' : 'block';
        toggleBtn.classList.toggle('open', !open);
        return;
      }
      const btn = e.target.closest('button');
      if (!btn) return;
      for (const [cls, url] of Object.entries(linkMap)) {
        if (btn.classList.contains(cls)) { window.open(url, '_blank'); return; }
      }
      for (const [cls, pdf] of Object.entries(pdfMap)) {
        if (btn.classList.contains(cls)) { window.open(pdf, '_blank'); return; }
      }
    }
    content.addEventListener('click', handleContentClick);

    // Wire up image carousels
    const carouselCleanups = [];
    content.querySelectorAll('.image-carousel').forEach(carousel => {
      const img = carousel.querySelector('img');
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      const counterEl = carousel.parentElement?.querySelector('.carousel-counter');
      const currentSpan = counterEl?.querySelector('span:first-child');
      const totalSpan = counterEl?.querySelector('span:last-child');
      if (!img || !prevBtn || !nextBtn) return;

      const total = totalSpan ? parseInt(totalSpan.textContent, 10) : 1;
      const src = img.getAttribute('src');
      const match = src.match(/^(.*\D)(\d+)(\.[^.]+)$/);
      if (!match) return;

      const [, prefix, , ext] = match;
      let current = 0;

      const update = () => {
        img.setAttribute('src', `${prefix}${current + 1}${ext}`);
        if (currentSpan) currentSpan.textContent = String(current + 1);
      };

      const onPrev = e => { e.stopPropagation(); current = (current - 1 + total) % total; update(); };
      const onNext = e => { e.stopPropagation(); current = (current + 1) % total; update(); };

      prevBtn.addEventListener('click', onPrev);
      nextBtn.addEventListener('click', onNext);
      carouselCleanups.push(() => {
        prevBtn.removeEventListener('click', onPrev);
        nextBtn.removeEventListener('click', onNext);
      });
    });

    return () => {
      scroll.removeEventListener('scroll', onScroll);
      content.removeEventListener('click', handleContentClick);
      carouselCleanups.forEach(fn => fn());
      lenisCleanup();
    };
  }, [projectKey]);

  if (!project) return null;

  return (
    <div id="project-detail" style={{ display: 'flex' }}>
      <div className="detail-topbar">
        <button className="detail-back-btn" onClick={() => playGlitchTransition(onBack, () => {})}>&#x2190; BACK</button>
        <nav className="detail-tabs" id="detail-tabs" ref={tabsRef} />
      </div>
      <div className="detail-scroll" id="detail-scroll" ref={scrollRef}>
        <div className="detail-scroll-inner" ref={scrollInnerRef}>
        <div className="detail-hero">
          <div className="detail-hero-left">
            <div className="detail-category">{project.type}</div>
            <h1 className="detail-title">{meta.title || project.type}</h1>
            <p className="detail-desc">{meta.desc}</p>
          </div>
          <div className="detail-meta">
            <div className="meta-item"><div className="meta-label">ROLE</div><div className="meta-value">{project.role || '—'}</div></div>
            <div className="meta-item"><div className="meta-label">CLIENT</div><div className="meta-value">{project.client || '—'}</div></div>
            <div className="meta-item"><div className="meta-label">YEAR</div><div className="meta-value">{meta.year || '2025'}</div></div>
          </div>
        </div>
        <div className="detail-divider" />
        <div className="detail-thumbnail-wrap">
          <img id="detail-thumb" src={meta.thumbnail} alt="Project thumbnail" />
        </div>
        <div
          ref={contentRef}
          className="detail-content"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
        </div>
      </div>
    </div>
  );
}
