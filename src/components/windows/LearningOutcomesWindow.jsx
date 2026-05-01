import { useState, useEffect, useRef } from 'react';
import Window from '../Window';
import { learningOutcomeData } from '../../data/learningOutcomeData';

const MENU_ITEMS = [
  { key: 'interactive-media', label: 'Interactive Media' },
  { key: 'design', label: 'Design' },
  { key: 'development', label: 'Development' },
  { key: 'professional-standard', label: 'Professional Standard' },
  { key: 'personal-leadership', label: 'Personal Leadership' },
];

export default function LearningOutcomesWindow({ active, onClose, onFocus }) {
  const [activeKey, setActiveKey] = useState('interactive-media');
  const contentRef = useRef(null);
  const outcome = learningOutcomeData[activeKey];

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = 0;

    const linkMap = {
      'feedback-pdf-button': 'pdfs/feedpulses.pdf',
      'dashboard-link-button': 'https://i554530.hera.fontysict.net',
      'version-control-button': 'https://github.com/BerkanHRGL?tab=repositories',
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
    }

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [activeKey]);

  return (
    <Window title="LEARNING OUTCOMES" windowClassName="learning-outcomes-window" active={active} onClose={onClose} onFocus={onFocus}>
      <div className="project-header">
        <div className="header-left"><h1>BERKAN<br />HERGUL</h1></div>
        <div className="header-right">
          <h2>{outcome?.type || 'Interactive Media'}</h2>
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
              {item.label}
            </div>
          ))}
        </div>
        <div
          ref={contentRef}
          className="project-content"
          dangerouslySetInnerHTML={{ __html: outcome?.content || '' }}
        />
      </div>
    </Window>
  );
}
