const ROWS = 6;
const COLS = 7;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreRedEl = document.getElementById("scoreRed");
const scoreYellowEl = document.getElementById("scoreYellow");
const scoreDrawEl = document.getElementById("scoreDraw");
const newRoundBtn = document.getElementById("newRoundBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

let grid = [];
let current = "red";
let over = false;
let scores = { red: 0, yellow: 0, draw: 0 };

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function buildBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const wrap = document.createElement("div");
      wrap.className = "cell-wrap";
      wrap.dataset.col = col;
      wrap.dataset.row = row;
      wrap.addEventListener("click", () => handleDrop(col));
      const cell = document.createElement("div");
      cell.className = "cell empty";
      wrap.appendChild(cell);
      boardEl.appendChild(wrap);
    }
  }
}

function cellAt(row, col) {
  return boardEl.querySelector(`.cell-wrap[data-row="${row}"][data-col="${col}"] .cell`);
}

function lowestEmptyRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!grid[row][col]) return row;
  }
  return -1;
}

function handleDrop(col) {
  if (over) return;
  const row = lowestEmptyRow(col);
  if (row === -1) return;

  grid[row][col] = current;
  const el = cellAt(row, col);
  el.className = `cell ${current}`;

  const winLine = findWin(row, col);
  if (winLine) {
    over = true;
    winLine.forEach(([r, c]) => cellAt(r, c).classList.add("win-cell"));
    scores[current] += 1;
    updateScores();
    statusEl.textContent = `${current === "red" ? "Rot" : "Gelb"} gewinnt!`;
    statusEl.className = "status win";
    return;
  }

  if (grid.every((r) => r.every((c) => c))) {
    over = true;
    scores.draw += 1;
    updateScores();
    statusEl.textContent = "Unentschieden!";
    statusEl.className = "status draw";
    return;
  }

  current = current === "red" ? "yellow" : "red";
  statusEl.textContent = `${current === "red" ? "Rot" : "Gelb"} ist am Zug`;
  statusEl.className = "status";
}

function findWin(row, col) {
  const player = grid[row][col];
  const directions = [
    [[0, 1], [0, -1]],   // horizontal
    [[1, 0], [-1, 0]],   // vertical
    [[1, 1], [-1, -1]],  // diagonal \
    [[1, -1], [-1, 1]],  // diagonal /
  ];

  for (const pair of directions) {
    let line = [[row, col]];
    for (const [dr, dc] of pair) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
        line.push([r, c]);
        r += dr;
        c += dc;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

function updateScores() {
  scoreRedEl.textContent = scores.red;
  scoreYellowEl.textContent = scores.yellow;
  scoreDrawEl.textContent = scores.draw;
}

function newRound() {
  grid = emptyGrid();
  current = "red";
  over = false;
  buildBoard();
  statusEl.textContent = "Rot ist am Zug";
  statusEl.className = "status";
}

newRoundBtn.addEventListener("click", newRound);
resetScoreBtn.addEventListener("click", () => {
  scores = { red: 0, yellow: 0, draw: 0 };
  updateScores();
  newRound();
});

newRound();
