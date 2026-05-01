import { useState, useEffect, useRef } from 'react';
import Window from '../Window';
import { projectData } from '../../data/projectData';

const MENU_ITEMS = [
  { key: 'branding', label: ['PROJECT 1', 'Branding'] },
  { key: 'ux', label: ['PROJECT 2', 'UX'] },
  { key: 'development', label: ['PROJECT 3', 'DEVELOPMENT'] },
  { key: 'portfolio', label: ['PROJECT 4', 'PORTFOLIO'] },
  { key: 'projectx', label: ['PROJECT 5', 'PROJECT X'] },
];

export default function ProjectsWindow({ active, onClose, onFocus }) {
  const [activeKey, setActiveKey] = useState('branding');
  const contentRef = useRef(null);
  const project = projectData[activeKey];

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = 0;

    const linkMap = {
      'gitlab-repo-button': 'https://git.fhict.nl/I463567/cardandev',
      'github-repo-button': 'https://github.com/BerkanHRGL/portfolio',
      'github-repo-petchi-button': 'https://github.com/BerkanHRGL/pet-chi',
      'dashboard-link-button': 'https://i554530.hera.fontysict.net',
      'version-control-button': 'https://github.com/BerkanHRGL?tab=repositories',
      'live-demo-button': 'https://i554530.hera.fontysict.net/pet-chi/',
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

    function handleClick(e) {
      const toggleBtn = e.target.closest('.accordion-toggle');
      if (toggleBtn) {
        const content = toggleBtn.nextElementSibling;
        if (content) {
          const isOpen = content.style.display === 'block';
          content.style.display = isOpen ? 'none' : 'block';
          toggleBtn.classList.toggle('open', !isOpen);
        }
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

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [activeKey]);

  return (
    <Window title="PROJECT" windowClassName="projects-window" active={active} onClose={onClose} onFocus={onFocus}>
      <div className="project-header">
        <div className="header-left"><h1>BERKAN<br />HERGUL</h1></div>
        <div className="header-right">
          <h2>{project.type}</h2>
          <h2>Client: {project.client}</h2>
        </div>
      </div>
      <div className="project-content-container">
        <div className="project-menu">
          {MENU_ITEMS.map(item => (
            <div
              key={item.key}
              className={`menu-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => setActiveKey(item.key)}
            >
              {item.label[0]}<br />{item.label[1]}
            </div>
          ))}
        </div>
        <div
          ref={contentRef}
          className="project-content"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      </div>
    </Window>
  );
}
