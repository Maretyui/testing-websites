const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const newMazeBtn = document.getElementById("newMazeBtn");
const solveBtn = document.getElementById("solveBtn");
const resetPathBtn = document.getElementById("resetPathBtn");
const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");
const statusEl = document.getElementById("status");

const WALL_N = 1;
const WALL_E = 2;
const WALL_S = 4;
const WALL_W = 8;
const DIRS = [
  { dx: 0, dy: -1, wall: WALL_N, opposite: WALL_S },
  { dx: 1, dy: 0, wall: WALL_E, opposite: WALL_W },
  { dx: 0, dy: 1, wall: WALL_S, opposite: WALL_N },
  { dx: -1, dy: 0, wall: WALL_W, opposite: WALL_E },
];

let size = Number(sizeInput.value);
let walls = [];
let userPath = [];
let solutionPath = [];
let cell = canvas.width / size;

function cellIndex(x, y) {
  return y * size + x;
}

// Every cell starts fully walled in; carving removes walls between the
// current cell and whichever unvisited neighbor the backtracker steps to.
function generateMaze() {
  walls = new Array(size * size).fill(WALL_N | WALL_E | WALL_S | WALL_W);
  const visited = new Array(size * size).fill(false);
  const stack = [{ x: 0, y: 0 }];
  visited[0] = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const options = [];

    for (const dir of DIRS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      if (!visited[cellIndex(nx, ny)]) {
        options.push({ nx, ny, dir });
      }
    }

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const { nx, ny, dir } = options[Math.floor(Math.random() * options.length)];
    walls[cellIndex(current.x, current.y)] &= ~dir.wall;
    walls[cellIndex(nx, ny)] &= ~dir.opposite;
    visited[cellIndex(nx, ny)] = true;
    stack.push({ x: nx, y: ny });
  }
}

function solveMaze() {
  const start = 0;
  const goal = size * size - 1;
  const prev = new Array(size * size).fill(-1);
  const visited = new Array(size * size).fill(false);
  const queue = [start];
  visited[start] = true;

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === goal) break;
    const x = current % size;
    const y = Math.floor(current / size);
    const cellWalls = walls[current];

    for (const dir of DIRS) {
      if (cellWalls & dir.wall) continue;
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      const ni = cellIndex(nx, ny);
      if (!visited[ni]) {
        visited[ni] = true;
        prev[ni] = current;
        queue.push(ni);
      }
    }
  }

  const path = [];
  let node = goal;
  while (node !== -1) {
    path.unshift(node);
    node = prev[node];
  }
  return path;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1f2430";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#5b6477";
  ctx.lineWidth = Math.max(2, cell * 0.06);
  ctx.lineCap = "round";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const w = walls[cellIndex(x, y)];
      const left = x * cell;
      const top = y * cell;

      ctx.beginPath();
      if (w & WALL_N) { ctx.moveTo(left, top); ctx.lineTo(left + cell, top); }
      if (w & WALL_E) { ctx.moveTo(left + cell, top); ctx.lineTo(left + cell, top + cell); }
      if (w & WALL_S) { ctx.moveTo(left, top + cell); ctx.lineTo(left + cell, top + cell); }
      if (w & WALL_W) { ctx.moveTo(left, top); ctx.lineTo(left, top + cell); }
      ctx.stroke();
    }
  }

  drawPath(solutionPath, "rgba(99, 102, 241, 0.55)");
  drawPath(userPath, "#34d399");

  drawMarker(0, 0, "#22c55e");
  drawMarker(size - 1, size - 1, "#ef4444");
}

function drawPath(path, color) {
  if (path.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, cell * 0.22);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const x = (path[i] % size) * cell + cell / 2;
    const y = Math.floor(path[i] / size) * cell + cell / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawMarker(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * cell + cell / 2, y * cell + cell / 2, cell * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function canMove(fromIndex, toIndex) {
  const fx = fromIndex % size;
  const fy = Math.floor(fromIndex / size);
  const tx = toIndex % size;
  const ty = Math.floor(toIndex / size);
  const dir = DIRS.find((d) => fx + d.dx === tx && fy + d.dy === ty);
  if (!dir) return false;
  return !(walls[fromIndex] & dir.wall);
}

function cellFromEvent(event) {
  // Convert from on-screen pixels to canvas pixels first - the canvas is
  // scaled by CSS (width: 100%) so clientX/clientY don't map 1:1 to the
  // underlying coordinate space the maze is actually drawn in.
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((event.clientX - rect.left) * scaleX) / cell);
  const y = Math.floor(((event.clientY - rect.top) * scaleY) / cell);
  if (x < 0 || y < 0 || x >= size || y >= size) return -1;
  return cellIndex(x, y);
}

let dragging = false;

function startDrag(event) {
  const index = cellFromEvent(event);
  if (index !== 0 && userPath.length === 0) return;
  dragging = true;
  extendPath(index);
}

function moveDrag(event) {
  if (!dragging) return;
  extendPath(cellFromEvent(event));
}

function endDrag() {
  dragging = false;
}

function extendPath(index) {
  if (index === -1) return;
  const last = userPath[userPath.length - 1];

  if (userPath.length === 0) {
    if (index !== 0) return;
    userPath.push(index);
  } else if (index === last) {
    // no-op, pointer hasn't left the current cell yet
  } else if (userPath.length > 1 && index === userPath[userPath.length - 2]) {
    // stepping back onto the previous cell un-walks the last step
    userPath.pop();
  } else if (canMove(last, index)) {
    userPath.push(index);
  } else {
    return;
  }

  render();

  if (userPath[userPath.length - 1] === size * size - 1) {
    statusEl.textContent = `Ziel erreicht in ${userPath.length - 1} Schritten!`;
    dragging = false;
  } else {
    statusEl.textContent = "Unterwegs zum roten Feld …";
  }
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  startDrag(event);
});
canvas.addEventListener("pointermove", moveDrag);
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

newMazeBtn.addEventListener("click", () => {
  generateMaze();
  userPath = [];
  solutionPath = [];
  statusEl.textContent = "Neues Labyrinth erzeugt.";
  render();
});

solveBtn.addEventListener("click", () => {
  solutionPath = solveMaze();
  statusEl.textContent = "Lösungsweg eingeblendet.";
  render();
});

resetPathBtn.addEventListener("click", () => {
  userPath = [];
  statusEl.textContent = "Weg gelöscht.";
  render();
});

sizeInput.addEventListener("input", () => {
  size = Number(sizeInput.value);
  sizeValue.textContent = String(size);
  cell = canvas.width / size;
  generateMaze();
  userPath = [];
  solutionPath = [];
  render();
});

sizeValue.textContent = String(size);
generateMaze();
render();
