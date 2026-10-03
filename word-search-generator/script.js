const SIZE = 12;
const DEFAULT_WORDS = ["JAVA", "PYTHON", "RUBY", "SWIFT", "RUST", "PHP", "KOTLIN", "SCALA"];
const DIRECTIONS = [
  { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
  { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
  { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
  { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const wordListEl = document.getElementById("wordList");
const newPuzzleBtn = document.getElementById("newPuzzleBtn");
const useCustomBtn = document.getElementById("useCustomBtn");
const customWordsInput = document.getElementById("customWords");

let currentWords = DEFAULT_WORDS;
let letters = [];
let cellsEl = [];
let foundWords = new Set();
let selection = [];
let selecting = false;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function canPlace(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dy * i;
    const c = col + dir.dx * i;
    if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(grid, word) {
  const attempts = 300;
  for (let i = 0; i < attempts; i++) {
    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    if (canPlace(grid, word, row, col, dir)) {
      for (let j = 0; j < word.length; j++) {
        grid[row + dir.dy * j][col + dir.dx * j] = word[j];
      }
      return true;
    }
  }
  return false;
}

// Longer words have fewer valid spots left as the grid fills up, so they
// go first while there's still the most open space to place them into.
function buildPuzzle(words) {
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const grid = emptyGrid();
  const placed = [];

  for (const word of sorted) {
    if (word.length > SIZE) continue;
    if (placeWord(grid, word)) placed.push(word);
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, placed };
}

function renderGrid(grid) {
  gridEl.innerHTML = "";
  cellsEl = [];
  for (let r = 0; r < SIZE; r++) {
    const rowEls = [];
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      gridEl.appendChild(cell);
      rowEls.push(cell);
    }
    cellsEl.push(rowEls);
  }
}

function renderWordList() {
  wordListEl.innerHTML = "";
  for (const word of currentWords) {
    const li = document.createElement("li");
    li.textContent = word;
    if (foundWords.has(word)) li.classList.add("found");
    wordListEl.appendChild(li);
  }
  updateStatus();
}

function updateStatus() {
  const total = currentWords.length;
  const found = foundWords.size;
  statusEl.textContent =
    found === total && total > 0
      ? `Geschafft! Alle ${total} Wörter gefunden.`
      : `${found} von ${total} Wörtern gefunden.`;
}

function newPuzzle(words) {
  foundWords = new Set();
  selection = [];
  const { grid, placed } = buildPuzzle(words);
  currentWords = placed;
  letters = grid;
  renderGrid(grid);
  renderWordList();
}

function cellFromPoint(clientX, clientY) {
  const rect = gridEl.getBoundingClientRect();
  const col = Math.floor(((clientX - rect.left) / rect.width) * SIZE);
  const row = Math.floor(((clientY - rect.top) / rect.height) * SIZE);
  if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) return null;
  return { row, col };
}

function clearSelectionStyles() {
  for (const { row, col } of selection) {
    if (!cellsEl[row][col].classList.contains("found")) {
      cellsEl[row][col].classList.remove("selecting");
    }
  }
}

// Snaps the drag to the nearest straight line (horizontal, vertical, or
// diagonal) through the start cell, so a slightly wobbly swipe still
// selects a clean word instead of a jagged path.
function buildLine(start, current) {
  const dr = current.row - start.row;
  const dc = current.col - start.col;
  const dy = Math.sign(dr);
  const dx = Math.sign(dc);
  const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const line = [];
  for (let i = 0; i < length; i++) {
    const row = start.row + dy * i;
    const col = start.col + dx * i;
    if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) break;
    line.push({ row, col });
  }
  return line;
}

function wordFromSelection() {
  return selection.map(({ row, col }) => letters[row][col]).join("");
}

function checkSelection() {
  const forward = wordFromSelection();
  const backward = [...forward].reverse().join("");

  for (const word of currentWords) {
    if (foundWords.has(word)) continue;
    if (word === forward || word === backward) {
      foundWords.add(word);
      for (const { row, col } of selection) {
        cellsEl[row][col].classList.add("found");
      }
      renderWordList();
      return;
    }
  }
}

let startCell = null;

function handleStart(event) {
  const point = cellFromPoint(event.clientX, event.clientY);
  if (!point) return;
  gridEl.setPointerCapture(event.pointerId);
  selecting = true;
  startCell = point;
  selection = [point];
  cellsEl[point.row][point.col].classList.add("selecting");
}

function handleMove(event) {
  if (!selecting) return;
  const point = cellFromPoint(event.clientX, event.clientY);
  if (!point) return;
  clearSelectionStyles();
  selection = buildLine(startCell, point);
  for (const { row, col } of selection) {
    cellsEl[row][col].classList.add("selecting");
  }
}

function handleEnd() {
  if (!selecting) return;
  selecting = false;
  checkSelection();
  clearSelectionStyles();
  selection = [];
}

gridEl.addEventListener("pointerdown", handleStart);
gridEl.addEventListener("pointermove", handleMove);
gridEl.addEventListener("pointerup", handleEnd);
gridEl.addEventListener("pointercancel", handleEnd);

newPuzzleBtn.addEventListener("click", () => newPuzzle(currentWords));

useCustomBtn.addEventListener("click", () => {
  const raw = customWordsInput.value
    .split(",")
    .map((w) => w.trim().toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 2 && w.length <= SIZE);

  if (raw.length === 0) {
    statusEl.textContent = "Bitte mindestens ein gültiges Wort (2-12 Buchstaben) eingeben.";
    return;
  }
  newPuzzle([...new Set(raw)]);
});

newPuzzle(DEFAULT_WORDS);
