const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const tSlider = document.getElementById("tSlider");
const tValueLabel = document.getElementById("tValue");
const W = canvas.width;
const H = canvas.height;
const POINT_RADIUS = 9;
const HIT_RADIUS = 22;

const DEFAULT_POINTS = [
  { x: 60, y: 320 },
  { x: 160, y: 60 },
  { x: 440, y: 60 },
  { x: 540, y: 320 },
];

let points = DEFAULT_POINTS.map((p) => ({ ...p }));
let dragIndex = null;

function toCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cubicPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function drawLine(a, b, color, dashed) {
  ctx.beginPath();
  ctx.setLineDash(dashed ? [6, 5] : []);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDot(p, radius, color, label) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  if (label) {
    ctx.fillStyle = "#111827";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(label, p.x + radius + 4, p.y - radius - 2);
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  const [p0, p1, p2, p3] = points;

  // Control polygon.
  drawLine(p0, p1, "#cbd5e1", true);
  drawLine(p1, p2, "#cbd5e1", true);
  drawLine(p2, p3, "#cbd5e1", true);

  // Curve itself, sampled.
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  const steps = 80;
  for (let i = 1; i <= steps; i++) {
    const pt = cubicPoint(p0, p1, p2, p3, i / steps);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // De Casteljau construction at the current t.
  const t = Number(tSlider.value);
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  const f = lerp(d, e, t);

  drawLine(a, b, "#f59e0b", false);
  drawLine(b, c, "#f59e0b", false);
  drawLine(d, e, "#ef4444", false);
  drawDot(a, 4, "#f59e0b");
  drawDot(b, 4, "#f59e0b");
  drawDot(c, 4, "#f59e0b");
  drawDot(d, 5, "#ef4444");
  drawDot(e, 5, "#ef4444");
  drawDot(f, 7, "#059669");

  // Draggable control points on top.
  const labels = ["P0", "P1", "P2", "P3"];
  const colors = ["#2563eb", "#7c3aed", "#7c3aed", "#2563eb"];
  points.forEach((p, i) => drawDot(p, POINT_RADIUS, colors[i], labels[i]));
}

canvas.addEventListener("pointerdown", (e) => {
  const p = toCanvasPoint(e.clientX, e.clientY);
  let closest = -1;
  let closestDist = Infinity;
  points.forEach((pt, i) => {
    const dist = Math.hypot(pt.x - p.x, pt.y - p.y);
    if (dist < HIT_RADIUS && dist < closestDist) {
      closest = i;
      closestDist = dist;
    }
  });
  if (closest !== -1) {
    dragIndex = closest;
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (dragIndex === null) return;
  const p = toCanvasPoint(e.clientX, e.clientY);
  points[dragIndex] = {
    x: Math.max(0, Math.min(W, p.x)),
    y: Math.max(0, Math.min(H, p.y)),
  };
  render();
});

function stopDrag() {
  dragIndex = null;
}
canvas.addEventListener("pointerup", stopDrag);
canvas.addEventListener("pointercancel", stopDrag);

tSlider.addEventListener("input", () => {
  tValueLabel.textContent = Number(tSlider.value).toFixed(2);
  render();
});

document.getElementById("randomizeBtn").addEventListener("click", () => {
  points = points.map(() => ({
    x: 40 + Math.random() * (W - 80),
    y: 40 + Math.random() * (H - 80),
  }));
  render();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  points = DEFAULT_POINTS.map((p) => ({ ...p }));
  render();
});

render();
