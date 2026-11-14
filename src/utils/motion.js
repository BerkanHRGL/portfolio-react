export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Characters without line-break opportunities, so scrambled text wraps like the real text.
const GLYPHS = '#@$&*=01XZ';
const running = new WeakSet();

/**
 * Decode effect: the element's text starts as random characters and resolves
 * left to right. Works on the element's own text node, so the width never changes
 * in a monospace font.
 */
export function scramble(el, duration = 550) {
  if (!el || running.has(el) || reducedMotion()) return;
  const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
  if (!node) return;

  const final = node.nodeValue;
  const start = performance.now();
  let lastDraw = 0;
  running.add(el);

  const tick = now => {
    const progress = Math.min(1, (now - start) / duration);
    if (progress === 1 || !node.isConnected) {
      node.nodeValue = final;
      running.delete(el);
      return;
    }
    if (now - lastDraw > 40) {
      lastDraw = now;
      const done = Math.floor(progress * final.length);
      let out = final.slice(0, done);
      for (let i = done; i < final.length; i++) {
        out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.nodeValue = out;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
