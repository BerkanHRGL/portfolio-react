import { useRef, useEffect } from 'react';

export function useDraggable() {
  const elementRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    const header = headerRef.current;
    if (!el || !header) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function onMouseDown(e) {
      if (e.target.classList.contains('window-close')) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.right = 'auto';
      el.style.margin = '0';
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + 'px';
      el.style.left = (el.offsetLeft - pos1) + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    header.addEventListener('mousedown', onMouseDown);
    return () => header.removeEventListener('mousedown', onMouseDown);
  }, []);

  return { elementRef, headerRef };
}
