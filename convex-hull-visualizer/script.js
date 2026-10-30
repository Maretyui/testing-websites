const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hullBtn = document.getElementById('hullBtn');
const randomBtn = document.getElementById('randomBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

let points = [];
let hull = [];

function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
  draw();
}

function pointerToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function computeHull(pts) {
  if (pts.length < 3) return pts.slice();

  const sorted = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);

  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function draw() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (hull.length >= 3) {
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
  }
}

function updateStatus() {
  const extra = hull.length >= 3 ? `, hull has ${hull.length} vertices` : '';
  statusEl.textContent = `${points.length} point${points.length === 1 ? '' : 's'}${extra}`;
}

function addPoint(p) {
  points.push(p);
  hull = [];
  updateStatus();
  draw();
}

canvas.addEventListener('pointerdown', (e) => {
  addPoint(pointerToCanvas(e));
});

hullBtn.addEventListener('click', () => {
  hull = computeHull(points);
  updateStatus();
  draw();
});

randomBtn.addEventListener('click', () => {
  points = [];
  hull = [];
  const count = 12;
  const margin = 24;
  for (let i = 0; i < count; i++) {
    points.push({
      x: margin + Math.random() * (canvas.width - margin * 2),
      y: margin + Math.random() * (canvas.height - margin * 2),
    });
  }
  updateStatus();
  draw();
});

clearBtn.addEventListener('click', () => {
  points = [];
  hull = [];
  updateStatus();
  draw();
});

window.addEventListener('resize', resize);
resize();
updateStatus();
