import { useEffect, useState } from 'react';

export default function BootScreen({ onEnter }) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [info1Visible, setInfo1Visible] = useState(false);
  const [info2Visible, setInfo2Visible] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);

    const t1 = setTimeout(() => setHeaderVisible(true), 500);
    const t2 = setTimeout(() => setInfo1Visible(true), 1500);
    const t3 = setTimeout(() => setInfo2Visible(true), 2500);
    const t4 = setTimeout(() => setPromptVisible(true), 3500);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handler = e => { if (e.key === 'Enter') onEnter(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onEnter]);

  return (
    <div id="boot-screen" onClick={onEnter}>
      <div id="header-container" className={headerVisible ? 'visible' : ''}>
        <div id="computer-icon">
          <img src="imgs/retro_pc.png" alt="Computer Icon" />
        </div>
        <div className="welcome-text">
          Welcome to my portfolio website<br />
          For a better experience use the desktop version
        </div>
      </div>

      <div className={`info-section ${info1Visible ? 'visible' : ''}`}>
        <div className="info-row">
          <div className="info-label">File</div>
          <div className="info-value">:Portfolio website</div>
        </div>
        <div className="info-row">
          <div className="info-label">Built with</div>
          <div className="info-value">:HTML, CSS, React</div>
        </div>
      </div>

      <div className={`info-section ${info2Visible ? 'visible' : ''}`}>
        <div className="info-row">
          <div className="info-label">Specialist</div>
          <div className="info-value">:UX/UI Designer, Front-End Developer</div>
        </div>
        <div className="info-row">
          <div className="info-label">Education</div>
          <div className="info-value">:Fontys University of Applied Sciences</div>
        </div>
        <div className="info-row">
          <div className="info-label">Tools</div>
          <div className="info-value">:Figma, Illustrator, VS Code</div>
        </div>
      </div>

      <div className={`enter-prompt ${promptVisible ? 'visible' : ''}`}>
        <span className="enter-text">
          {isMobile ? 'Tap to load the website' : 'Press Enter to load the website'}
        </span>
        <span id="cursor"></span>
      </div>
    </div>
  );
}
