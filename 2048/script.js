const SIZE = 4;
const grid = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const restartBtn = document.getElementById('restartBtn');
const newGameBtn = document.getElementById('newGameBtn');

let board = [];
let score = 0;
let wonAcknowledged = false;

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cellsWithValue(value) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === value) cells.push([r, c]);
    }
  }
  return cells;
}

function spawnTile() {
  const empty = cellsWithValue(0);
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  grid.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const value = board[r][c];
      if (value) {
        cell.dataset.value = String(value);
        cell.textContent = String(value);
      }
      grid.appendChild(cell);
    }
  }
  scoreEl.textContent = String(score);
}

function collapseRow(row) {
  const values = row.filter((v) => v !== 0);
  const result = [];
  let gained = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const merged = values[i] * 2;
      result.push(merged);
      gained += merged;
      i++;
    } else {
      result.push(values[i]);
    }
  }
  while (result.length < SIZE) result.push(0);
  return { row: result, gained };
}

function boardsEqual(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function cloneBoard(source) {
  return source.map((row) => row.slice());
}

function rotateClockwise(source) {
  const result = emptyBoard();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      result[c][SIZE - 1 - r] = source[r][c];
    }
  }
  return result;
}

function move(direction) {
  const before = cloneBoard(board);
  let rotations = 0;
  if (direction === 'up') rotations = 3;
  else if (direction === 'right') rotations = 2;
  else if (direction === 'down') rotations = 1;

  let working = cloneBoard(board);
  for (let i = 0; i < rotations; i++) working = rotateClockwise(working);

  let gainedTotal = 0;
  const moved = working.map((row) => {
    const { row: newRow, gained } = collapseRow(row);
    gainedTotal += gained;
    return newRow;
  });

  let result = moved;
  for (let i = 0; i < (4 - rotations) % 4; i++) result = rotateClockwise(result);

  board = result;
  score += gainedTotal;

  if (!boardsEqual(before, board)) {
    spawnTile();
    render();
    checkGameState();
  }
}

function canMove() {
  if (cellsWithValue(0).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (c < SIZE - 1 && board[r][c + 1] === value) return true;
      if (r < SIZE - 1 && board[r + 1][c] === value) return true;
    }
  }
  return false;
}

function checkGameState() {
  if (!wonAcknowledged && cellsWithValue(2048).length > 0) {
    wonAcknowledged = true;
    showOverlay('Geschafft! Du hast 2048 erreicht.');
    return;
  }
  if (!canMove()) {
    showOverlay('Keine Züge mehr übrig.');
  }
}

function showOverlay(text) {
  overlayText.textContent = text;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function startGame() {
  board = emptyBoard();
  score = 0;
  wonAcknowledged = false;
  hideOverlay();
  spawnTile();
  spawnTile();
  render();
}

const KEY_DIRECTIONS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

document.addEventListener('keydown', (e) => {
  const direction = KEY_DIRECTIONS[e.key];
  if (!direction) return;
  e.preventDefault();
  if (!overlay.classList.contains('hidden')) return;
  move(direction);
});

let touchStartX = 0;
let touchStartY = 0;

grid.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

grid.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (!overlay.classList.contains('hidden')) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

restartBtn.addEventListener('click', startGame);
newGameBtn.addEventListener('click', startGame);

startGame();
