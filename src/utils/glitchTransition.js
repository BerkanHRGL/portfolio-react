export function playGlitchTransition(onMidpoint, onComplete) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const DURATION = 650;

  const neonColors = [
    [0, 255, 255],
    [255, 0, 180],
    [140, 0, 255],
    [0, 255, 140],
    [255, 220, 0],
  ];

  let startTime = null;
  let midpointFired = false;
  let lastSliceUpdate = 0;
  let slices = [];

  function genSlices(intensity) {
    slices = [];
    const count = Math.floor(intensity * 14) + 1;
    for (let i = 0; i < count; i++) {
      const [r, g, b] = neonColors[Math.floor(Math.random() * neonColors.length)];
      slices.push({
        y: Math.random() * H,
        h: Math.random() * 28 + 3,
        dx: (Math.random() - 0.5) * 90 * intensity,
        bend: (Math.random() - 0.5) * 50,
        wave: (Math.random() - 0.5) * 30,
        r, g, b,
        a: Math.random() * 0.55 + 0.2,
      });
    }
  }

  function drawBentBar(s, alpha) {
    const x0 = s.dx, x1 = s.dx + W, xMid = s.dx + W * 0.5;
    ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x0, s.y);
    ctx.quadraticCurveTo(xMid, s.y + s.wave, x1, s.y + s.bend);
    ctx.lineTo(x1, s.y + s.bend + s.h);
    ctx.quadraticCurveTo(xMid, s.y + s.wave + s.h, x0, s.y + s.h);
    ctx.closePath();
    ctx.fill();
  }

  function render(t, ts) {
    ctx.clearRect(0, 0, W, H);
    const intensity = t < 0.5 ? t * 2 : (1 - t) * 2;

    if (ts - lastSliceUpdate > 55) {
      lastSliceUpdate = ts;
      genSlices(intensity);
    }

    ctx.fillStyle = `rgba(5, 0, 20, ${intensity * 0.78})`;
    ctx.fillRect(0, 0, W, H);

    slices.forEach(s => drawBentBar(s, s.a * intensity));

    if (Math.random() > 0.55 && intensity > 0.25) {
      const [r, g, b] = neonColors[Math.floor(Math.random() * neonColors.length)];
      ctx.fillStyle = `rgba(${r},${g},${b},${0.18 * intensity})`;
      ctx.fillRect(Math.random() * W, 0, Math.random() * 3 + 1, H);
    }

    ctx.fillStyle = `rgba(0,0,0,${0.22 * intensity})`;
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  }

  function loop(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / DURATION, 1);
    render(t, ts);

    if (t >= 0.45 && !midpointFired) {
      midpointFired = true;
      onMidpoint();
    }

    if (t < 1) {
      requestAnimationFrame(loop);
    } else {
      canvas.remove();
      onComplete();
    }
  }

  requestAnimationFrame(loop);
}
