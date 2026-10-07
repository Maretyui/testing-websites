const SIZE = 5;
const SCRAMBLE_MOVES = 20;
const BEST_KEY = "lights-out-best-moves";

const grid = document.getElementById("grid");
const movesEl = document.getElementById("moves");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const newBtn = document.getElementById("newBtn");

let state = [];
let moves = 0;
let won = false;

const cells = Array.from({ length: SIZE * SIZE }, (_, i) => {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  const row = Math.floor(i / SIZE) + 1;
  const col = (i % SIZE) + 1;
  cell.setAttribute("aria-label", `Feld Zeile ${row}, Spalte ${col}`);
  cell.addEventListener("click", () => handleClick(i));
  grid.appendChild(cell);
  return cell;
});

function loadBest() {
  const stored = parseInt(localStorage.getItem(BEST_KEY) || "", 10);
  bestEl.textContent = Number.isFinite(stored) ? String(stored) : "–";
}

function saveBestIfNeeded() {
  const stored = parseInt(localStorage.getItem(BEST_KEY) || "", 10);
  if (!Number.isFinite(stored) || moves < stored) {
    localStorage.setItem(BEST_KEY, String(moves));
    bestEl.textContent = String(moves);
  }
}

function neighborsOf(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const result = [index];
  if (row > 0) result.push(index - SIZE);
  if (row < SIZE - 1) result.push(index + SIZE);
  if (col > 0) result.push(index - 1);
  if (col < SIZE - 1) result.push(index + 1);
  return result;
}

function toggle(index, countsAsMove) {
  neighborsOf(index).forEach((i) => {
    state[i] = !state[i];
  });
  render();
  if (countsAsMove) {
    moves += 1;
    movesEl.textContent = String(moves);
    checkWin();
  }
}

function render() {
  cells.forEach((cell, i) => {
    cell.classList.toggle("on", state[i]);
  });
}

function checkWin() {
  if (state.every((v) => !v)) {
    won = true;
    statusEl.textContent = `Gelöst in ${moves} Zügen!`;
    saveBestIfNeeded();
  }
}

function handleClick(index) {
  if (won) return;
  toggle(index, true);
}

function newPuzzle() {
  state = new Array(SIZE * SIZE).fill(false);
  moves = 0;
  won = false;
  movesEl.textContent = "0";
  statusEl.textContent = "";

  // Scramble by replaying random toggle-moves from the solved (all-off)
  // board, so the puzzle is always guaranteed solvable - undoing the same
  // moves gets back to all-off, even if it isn't the shortest solution.
  for (let i = 0; i < SCRAMBLE_MOVES; i++) {
    const idx = Math.floor(Math.random() * state.length);
    toggle(idx, false);
  }

  // A scramble can land back on all-off by chance; try again if so.
  if (state.every((v) => !v)) {
    newPuzzle();
    return;
  }

  render();
}

newBtn.addEventListener("click", newPuzzle);
loadBest();
newPuzzle();
