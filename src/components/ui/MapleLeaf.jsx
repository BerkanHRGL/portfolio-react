import { useRef } from 'react';

function createLeaf(container) {
  const leaf = document.createElement('div');
  leaf.className = 'falling-leaf';
  const sizes = ['small', 'medium', 'large'];
  leaf.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);
  leaf.style.cssText = `
    position: absolute;
    left: ${Math.random() * 90}vw;
    top: -100px;
    z-index: 9999;
    background-image: url('imgs/maple-leaf.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  `;
  const dur = Math.random() * 3 + 4;
  leaf.style.animationDuration = dur + 's';
  leaf.style.animationName = 'fall';
  leaf.style.animationTimingFunction = 'linear';
  leaf.style.animationFillMode = 'forwards';
  container.appendChild(leaf);
  setTimeout(() => leaf.parentNode?.removeChild(leaf), (dur + 1) * 1000);
}

export default function MapleLeaf() {
  const containerRef = useRef(null);
  const btnRef = useRef(null);

  function startLeafFall() {
    const container = containerRef.current;
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createLeaf(container), i * 150);
    }
    if (btnRef.current) {
      btnRef.current.style.transform = 'scale(0.9)';
      setTimeout(() => { if (btnRef.current) btnRef.current.style.transform = 'scale(1)'; }, 100);
    }
  }

  return (
    <>
      <div className="maple-icon" id="maple-icon" ref={btnRef} onClick={startLeafFall}>
        <div className="maple-container">
          <img src="imgs/maple-leaf.png" alt="Maple Leaf" className="maple-image" />
        </div>
        <div className="maple-label">MAPLE</div>
      </div>
      <div className="falling-leaves-container" id="falling-leaves-container" ref={containerRef} />
    </>
  );
}
