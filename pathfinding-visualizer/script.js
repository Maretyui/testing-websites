const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const W = canvas.width;
const H = canvas.height;
const COLS = 20;
const ROWS = 14;
const CELL = W / COLS;

let start = { x: 1, y: Math.floor(ROWS / 2) };
let end = { x: COLS - 2, y: Math.floor(ROWS / 2) };
const walls = new Set();

let mode = "wall";
let pointerPainting = false;
let paintValue = true; // true = add wall, false = erase, while dragging

let visited = [];
let path = [];
let animTimer = null;

function key(x, y) {
  return `${x},${y}`;
}

function isStartOrEnd(x, y) {
  return (x === start.x && y === start.y) || (x === end.x && y === end.y);
}

function cellFromPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) / rect.width) * COLS);
  const y = Math.floor(((clientY - rect.top) / rect.height) * ROWS);
  return {
    x: Math.max(0, Math.min(COLS - 1, x)),
    y: Math.max(0, Math.min(ROWS - 1, y)),
  };
}

function stopAnimation() {
  if (animTimer !== null) {
    clearInterval(animTimer);
    animTimer = null;
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let fill = "#1b2834";
      if (walls.has(key(x, y))) fill = "#334155";
      ctx.fillStyle = fill;
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
    }
  }

  visited.forEach(({ x, y }) => {
    ctx.fillStyle = "rgba(34, 211, 238, 0.35)";
    ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
  });

  path.forEach(({ x, y }) => {
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
  });

  ctx.fillStyle = "#4ade80";
  ctx.fillRect(start.x * CELL, start.y * CELL, CELL - 1, CELL - 1);
  ctx.fillStyle = "#f87171";
  ctx.fillRect(end.x * CELL, end.y * CELL, CELL - 1, CELL - 1);
}

function setMode(newMode) {
  mode = newMode;
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

function paintCell(x, y) {
  stopAnimation();
  visited = [];
  path = [];

  if (mode === "start") {
    if (!isStartOrEnd(x, y)) {
      start = { x, y };
      walls.delete(key(x, y));
    }
    render();
    return;
  }
  if (mode === "end") {
    if (!isStartOrEnd(x, y)) {
      end = { x, y };
      walls.delete(key(x, y));
    }
    render();
    return;
  }

  if (isStartOrEnd(x, y)) return;
  if (paintValue) walls.add(key(x, y));
  else walls.delete(key(x, y));
  render();
}

canvas.addEventListener("pointerdown", (e) => {
  const { x, y } = cellFromPoint(e.clientX, e.clientY);
  pointerPainting = true;
  paintValue = !walls.has(key(x, y));
  canvas.setPointerCapture(e.pointerId);
  paintCell(x, y);
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointerPainting || mode !== "wall") return;
  const { x, y } = cellFromPoint(e.clientX, e.clientY);
  paintCell(x, y);
});

function stopPaint() {
  pointerPainting = false;
}
canvas.addEventListener("pointerup", stopPaint);
canvas.addEventListener("pointercancel", stopPaint);

function neighbors(node) {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];
  const result = [];
  for (const d of dirs) {
    const nx = node.x + d.x;
    const ny = node.y + d.y;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
    if (walls.has(key(nx, ny))) continue;
    result.push({ x: nx, y: ny });
  }
  return result;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Runs A* synchronously and returns the order cells were settled in (for the
// animation) plus the final path, instead of animating the search itself
// frame-by-frame - keeps the algorithm simple and deterministic to test.
function runAStar() {
  const open = [{ ...start, g: 0, f: heuristic(start, end) }];
  const cameFrom = new Map();
  const gScore = new Map([[key(start.x, start.y), 0]]);
  const closedOrder = [];
  const closedSet = new Set();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    const ck = key(current.x, current.y);
    if (closedSet.has(ck)) continue;
    closedSet.add(ck);
    closedOrder.push({ x: current.x, y: current.y });

    if (current.x === end.x && current.y === end.y) {
      const fullPath = [];
      let k = ck;
      while (cameFrom.has(k)) {
        const [px, py] = k.split(",").map(Number);
        fullPath.unshift({ x: px, y: py });
        k = cameFrom.get(k);
      }
      return { closedOrder, path: fullPath };
    }

    for (const n of neighbors(current)) {
      const nk = key(n.x, n.y);
      const tentativeG = gScore.get(ck) + 1;
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentativeG);
        cameFrom.set(nk, ck);
        open.push({ ...n, g: tentativeG, f: tentativeG + heuristic(n, end) });
      }
    }
  }
  return { closedOrder, path: null };
}

document.getElementById("findBtn").addEventListener("click", () => {
  stopAnimation();
  visited = [];
  path = [];
  const result = runAStar();

  statusEl.textContent = "Suche läuft …";
  let i = 0;
  animTimer = setInterval(() => {
    if (i >= result.closedOrder.length) {
      stopAnimation();
      if (result.path) {
        path = result.path;
        statusEl.textContent = `Pfad gefunden (Länge ${result.path.length}).`;
      } else {
        statusEl.textContent = "Kein Pfad möglich - Start und Ziel sind durch Wände getrennt.";
      }
      render();
      return;
    }
    visited.push(result.closedOrder[i]);
    i++;
    render();
  }, 12);
});

document.getElementById("randomBtn").addEventListener("click", () => {
  stopAnimation();
  visited = [];
  path = [];
  walls.clear();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (isStartOrEnd(x, y)) continue;
      if (Math.random() < 0.25) walls.add(key(x, y));
    }
  }
  statusEl.textContent = "Zufällige Wände gesetzt.";
  render();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  stopAnimation();
  visited = [];
  path = [];
  walls.clear();
  statusEl.textContent = "Bereit.";
  render();
});

render();
