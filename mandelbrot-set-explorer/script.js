const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
const W = canvas.width;
const H = canvas.height;

const DEFAULT_VIEW = { cx: -0.5, cy: 0, span: 3.2 };
let view = { ...DEFAULT_VIEW };

const pointers = new Map(); // pointerId -> {x, y} in canvas-internal pixels
let pinchStartDist = null;
let renderScheduled = false;

function toCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

function maxIterForSpan(span) {
  const iter = 80 + Math.round(60 * Math.log2(3.2 / span + 1e-9));
  return Math.max(50, Math.min(600, iter));
}

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    render();
  });
}

function render() {
  const spanY = view.span * (H / W);
  const maxIter = maxIterForSpan(view.span);
  const image = ctx.createImageData(W, H);
  const data = image.data;

  for (let py = 0; py < H; py++) {
    const im0 = view.cy - spanY / 2 + (py / H) * spanY;
    for (let px = 0; px < W; px++) {
      const re0 = view.cx - view.span / 2 + (px / W) * view.span;
      let re = re0;
      let im = im0;
      let n = 0;
      let re2 = re * re;
      let im2 = im * im;
      while (n < maxIter && re2 + im2 <= 4) {
        im = 2 * re * im + im0;
        re = re2 - im2 + re0;
        re2 = re * re;
        im2 = im * im;
        n++;
      }

      const idx = (py * W + px) * 4;
      if (n >= maxIter) {
        data[idx] = 5;
        data[idx + 1] = 5;
        data[idx + 2] = 15;
      } else {
        // Smooth coloring via normalized escape count.
        const logZn = Math.log(re2 + im2) / 2;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        const smooth = n + 1 - nu;
        const hue = (smooth * 10) % 360;
        const [r, g, b] = hslToRgb(hue / 360, 0.65, 0.5);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  info.textContent = `Ausschnittbreite: ${view.span.toExponential(2)} · Iterationen: ${maxIter}`;
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

function panBy(dpx, dpy) {
  const spanY = view.span * (H / W);
  view.cx -= (dpx / W) * view.span;
  view.cy -= (dpy / H) * spanY;
  scheduleRender();
}

function zoomAt(fx, fy, factor) {
  const spanY = view.span * (H / W);
  const reF = view.cx + view.span * (fx / W - 0.5);
  const imF = view.cy + spanY * (fy / H - 0.5);
  const newSpan = Math.max(1e-10, Math.min(8, view.span * factor));
  const newSpanY = newSpan * (H / W);
  view.cx = reF - newSpan * (fx / W - 0.5);
  view.cy = imF - newSpanY * (fy / H - 0.5);
  view.span = newSpan;
  scheduleRender();
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, toCanvasPoint(e.clientX, e.clientY));
  canvas.style.cursor = "grabbing";
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  const next = toCanvasPoint(e.clientX, e.clientY);
  pointers.set(e.pointerId, next);

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchStartDist && dist > 0) {
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      // Fingers moving apart (dist grows) should zoom in, i.e. shrink span.
      zoomAt(mid.x, mid.y, pinchStartDist / dist);
      pinchStartDist = dist;
    }
  } else if (pointers.size === 1) {
    panBy(next.x - prev.x, next.y - prev.y);
  }
});

function releasePointer(e) {
  pointers.delete(e.pointerId);
  pinchStartDist = null;
  if (pointers.size === 0) canvas.style.cursor = "grab";
}
canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", releasePointer);
canvas.addEventListener("pointerleave", (e) => {
  if (pointers.size < 2) releasePointer(e);
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const p = toCanvasPoint(e.clientX, e.clientY);
    zoomAt(p.x, p.y, e.deltaY > 0 ? 1.2 : 1 / 1.2);
  },
  { passive: false }
);

canvas.addEventListener("dblclick", (e) => {
  const p = toCanvasPoint(e.clientX, e.clientY);
  zoomAt(p.x, p.y, 1 / 2);
});

document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomAt(W / 2, H / 2, 1 / 1.5);
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomAt(W / 2, H / 2, 1.5);
});
document.getElementById("resetBtn").addEventListener("click", () => {
  view = { ...DEFAULT_VIEW };
  scheduleRender();
});

render();
