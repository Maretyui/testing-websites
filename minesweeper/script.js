const SIZE = 9;
const MINE_COUNT = 10;

const boardEl = document.getElementById("board");
const mineCounterEl = document.getElementById("mineCounter");
const timerEl = document.getElementById("timer");
const resetBtn = document.getElementById("resetBtn");
const statusMsg = document.getElementById("statusMsg");

let cells = [];
let firstClickDone = false;
let gameOver = false;
let flagCount = 0;
let revealedCount = 0;
let timerInterval = null;
let secondsElapsed = 0;

resetBtn.addEventListener("click", newGame);
newGame();

function newGame() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerEl.textContent = "000";
  firstClickDone = false;
  gameOver = false;
  flagCount = 0;
  revealedCount = 0;
  mineCounterEl.textContent = String(MINE_COUNT);
  resetBtn.textContent = "🙂";
  statusMsg.classList.add("hidden");
  statusMsg.className = "status hidden";

  cells = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("div");
      btn.className = "cell";
      btn.dataset.row = r;
      btn.dataset.col = c;
      btn.addEventListener("click", () => handleReveal(r, c));
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleFlag(r, c);
      });
      boardEl.appendChild(btn);
    }
  }
}

function placeMines(safeRow, safeCol) {
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    const tooClose = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
    if (cells[r][c].mine || tooClose) continue;
    cells[r][c].mine = true;
    placed++;
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (cells[r][c].mine) continue;
      cells[r][c].adjacent = countAdjacentMines(r, c);
    }
  }
}

function countAdjacentMines(row, col) {
  let count = 0;
  forEachNeighbor(row, col, (r, c) => {
    if (cells[r][c].mine) count++;
  });
  return count;
}

function forEachNeighbor(row, col, fn) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) fn(r, c);
    }
  }
}

function handleReveal(row, col) {
  if (gameOver) return;
  const cell = cells[row][col];
  if (cell.revealed || cell.flagged) return;

  if (!firstClickDone) {
    placeMines(row, col);
    firstClickDone = true;
    startTimer();
  }

  if (cell.mine) {
    revealAllMines(row, col);
    endGame(false);
    return;
  }

  floodReveal(row, col);
  checkWin();
}

function floodReveal(row, col) {
  const cell = cells[row][col];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  revealedCount++;
  updateCellEl(row, col);

  if (cell.adjacent === 0) {
    forEachNeighbor(row, col, (r, c) => floodReveal(r, c));
  }
}

function handleFlag(row, col) {
  if (gameOver) return;
  const cell = cells[row][col];
  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  flagCount += cell.flagged ? 1 : -1;
  mineCounterEl.textContent = String(MINE_COUNT - flagCount);
  updateCellEl(row, col);
}

function updateCellEl(row, col) {
  const cell = cells[row][col];
  const el = boardEl.children[row * SIZE + col];
  el.classList.toggle("revealed", cell.revealed);
  el.classList.toggle("flagged", cell.flagged && !cell.revealed);

  if (cell.flagged && !cell.revealed) {
    el.textContent = "🚩";
    return;
  }

  if (!cell.revealed) {
    el.textContent = "";
    return;
  }

  if (cell.mine) {
    el.textContent = "💣";
    el.classList.add("mine");
  } else if (cell.adjacent > 0) {
    el.textContent = String(cell.adjacent);
    el.className = `cell revealed n${cell.adjacent}`;
  } else {
    el.textContent = "";
  }
}

function revealAllMines(triggerRow, triggerCol) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (cells[r][c].mine) {
        cells[r][c].revealed = true;
        updateCellEl(r, c);
      }
    }
  }
  const triggerEl = boardEl.children[triggerRow * SIZE + triggerCol];
  triggerEl.style.background = "#dc2626";
}

function checkWin() {
  if (revealedCount === SIZE * SIZE - MINE_COUNT) {
    endGame(true);
  }
}

function endGame(won) {
  gameOver = true;
  clearInterval(timerInterval);
  resetBtn.textContent = won ? "😎" : "💀";
  statusMsg.textContent = won ? "Gewonnen!" : "Verloren — Mine getroffen.";
  statusMsg.className = `status ${won ? "win" : "lose"}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed = Math.min(secondsElapsed + 1, 999);
    timerEl.textContent = String(secondsElapsed).padStart(3, "0");
  }, 1000);
}
