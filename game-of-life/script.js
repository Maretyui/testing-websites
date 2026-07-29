const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const toggleBtn = document.getElementById("toggleBtn");
const stepBtn = document.getElementById("stepBtn");
const randomBtn = document.getElementById("randomBtn");
const clearBtn = document.getElementById("clearBtn");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const generationEl = document.getElementById("generation");
const populationEl = document.getElementById("population");

const COLS = 50;
const ROWS = 35;
const CELL_SIZE = canvas.width / COLS;

let grid = new Uint8Array(ROWS * COLS);
let generation = 0;
let running = false;
let intervalId = null;

function index(row, col) {
  return row * COLS + col;
}

function countNeighbors(source, row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = (row + dr + ROWS) % ROWS;
      const c = (col + dc + COLS) % COLS;
      count += source[index(r, c)];
    }
  }
  return count;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6366f1";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[index(row, col)]) {
        ctx.fillRect(col * CELL_SIZE + 0.5, row * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
  }
}

function updateStats() {
  generationEl.textContent = String(generation);
  let alive = 0;
  for (let i = 0; i < grid.length; i++) alive += grid[i];
  populationEl.textContent = String(alive);
}

function step() {
  const next = new Uint8Array(ROWS * COLS);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = index(row, col);
      const alive = grid[idx];
      const neighbors = countNeighbors(grid, row, col);
      next[idx] = alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : (neighbors === 3 ? 1 : 0);
    }
  }
  grid = next;
  generation++;
  render();
  updateStats();
}

function intervalForSpeed() {
  const value = Number(speedInput.value);
  return 1050 - value * 100; // 1 -> 950ms (slow), 10 -> 50ms (fast)
}

function setRunning(shouldRun) {
  running = shouldRun;
  toggleBtn.textContent = running ? "Pause" : "Start";
  toggleBtn.classList.toggle("is-running", running);
  clearInterval(intervalId);
  if (running) {
    intervalId = setInterval(step, intervalForSpeed());
  }
}

toggleBtn.addEventListener("click", () => setRunning(!running));

stepBtn.addEventListener("click", () => {
  setRunning(false);
  step();
});

randomBtn.addEventListener("click", () => {
  setRunning(false);
  grid = grid.map(() => (Math.random() < 0.25 ? 1 : 0));
  generation = 0;
  render();
  updateStats();
});

clearBtn.addEventListener("click", () => {
  setRunning(false);
  grid = new Uint8Array(ROWS * COLS);
  generation = 0;
  render();
  updateStats();
});

speedInput.addEventListener("input", () => {
  speedValue.textContent = speedInput.value;
  if (running) {
    setRunning(true);
  }
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const col = Math.floor(((event.clientX - rect.left) * scaleX) / CELL_SIZE);
  const row = Math.floor(((event.clientY - rect.top) * scaleY) / CELL_SIZE);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
  const idx = index(row, col);
  grid[idx] = grid[idx] ? 0 : 1;
  render();
  updateStats();
});

// Seed a small glider so the grid isn't empty on first load.
[[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]].forEach(([row, col]) => {
  grid[index(row + 2, col + 2)] = 1;
});

render();
updateStats();
