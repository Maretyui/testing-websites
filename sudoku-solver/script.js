const boardEl = document.getElementById('board');
const numpadEl = document.getElementById('numpad');
const noteEl = document.getElementById('note');
const difficultyEl = document.getElementById('difficulty');

let solution = [];
let puzzle = [];
let userGrid = [];
let givenMask = [];
let selected = null;

function emptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isSafe(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findEmptyCell(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function solveGrid(grid, randomize) {
  const spot = findEmptyCell(grid);
  if (!spot) return true;
  const [row, col] = spot;
  const digits = randomize ? shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const num of digits) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveGrid(grid, randomize)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function generatePuzzle(clueCount) {
  const full = emptyGrid();
  solveGrid(full, true);

  const holes = emptyGrid();
  for (let r = 0; r < 9; r++) holes[r] = full[r].slice();

  const cells = shuffled(Array.from({ length: 81 }, (_, i) => i));
  let removed = 0;
  const toRemove = 81 - clueCount;
  for (const idx of cells) {
    if (removed >= toRemove) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    if (holes[r][c] === 0) continue;
    const backup = holes[r][c];
    holes[r][c] = 0;
    const attempt = emptyGrid();
    for (let i = 0; i < 9; i++) attempt[i] = holes[i].slice();
    const solvable = solveGrid(attempt, false);
    if (solvable) {
      removed++;
    } else {
      holes[r][c] = backup;
    }
  }
  return { full, holes };
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cell';
      btn.dataset.row = String(r);
      btn.dataset.col = String(c);
      const val = userGrid[r][c];
      btn.textContent = val === 0 ? '' : String(val);
      if (givenMask[r][c]) {
        btn.classList.add('given');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => selectCell(r, c));
      }
      boardEl.appendChild(btn);
    }
  }
  highlightSelection();
}

function renderNumpad() {
  numpadEl.innerHTML = '';
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(n);
    btn.addEventListener('click', () => placeNumber(n));
    numpadEl.appendChild(btn);
  }
}

function selectCell(r, c) {
  selected = { r, c };
  highlightSelection();
}

function highlightSelection() {
  boardEl.querySelectorAll('.cell').forEach((cell) => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    cell.classList.toggle('selected', !!selected && selected.r === r && selected.c === c);
  });
}

function placeNumber(n) {
  if (!selected) {
    noteEl.textContent = 'Erst ein freies Feld antippen, dann eine Zahl wählen.';
    return;
  }
  const { r, c } = selected;
  userGrid[r][c] = n;
  renderBoard();
  selected = { r, c };
  highlightSelection();
  noteEl.textContent = '';
}

document.getElementById('eraseBtn').addEventListener('click', () => {
  if (!selected) return;
  userGrid[selected.r][selected.c] = 0;
  renderBoard();
  highlightSelection();
});

document.getElementById('checkBtn').addEventListener('click', () => {
  let conflicts = 0;
  boardEl.querySelectorAll('.cell').forEach((cell) => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    const val = userGrid[r][c];
    cell.classList.remove('conflict');
    if (val !== 0 && val !== solution[r][c]) {
      cell.classList.add('conflict');
      conflicts++;
    }
  });
  const filled = userGrid.flat().every((v) => v !== 0);
  if (conflicts === 0 && filled) {
    noteEl.textContent = 'Gelöst! Alle Felder stimmen mit der Lösung überein.';
  } else if (conflicts === 0) {
    noteEl.textContent = 'Bisher alles richtig, aber noch nicht vollständig.';
  } else {
    noteEl.textContent = `${conflicts} Feld(er) stimmen nicht mit der Lösung überein.`;
  }
});

document.getElementById('solveBtn').addEventListener('click', () => {
  for (let r = 0; r < 9; r++) userGrid[r] = solution[r].slice();
  selected = null;
  renderBoard();
  noteEl.textContent = 'Per Backtracking-Algorithmus gelöst.';
});

document.getElementById('newGameBtn').addEventListener('click', startNewGame);

function startNewGame() {
  const clueCount = Number(difficultyEl.value);
  const { full, holes } = generatePuzzle(clueCount);
  solution = full;
  puzzle = holes;
  userGrid = emptyGrid();
  givenMask = emptyGrid();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      userGrid[r][c] = puzzle[r][c];
      givenMask[r][c] = puzzle[r][c] !== 0 ? 1 : 0;
    }
  }
  selected = null;
  noteEl.textContent = '';
  renderBoard();
}

renderNumpad();
startNewGame();
