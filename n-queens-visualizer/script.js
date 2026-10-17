const sizeInput = document.getElementById('sizeInput');
const speedInput = document.getElementById('speedInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const boardEl = document.getElementById('board');
const solutionCountEl = document.getElementById('solutionCount');

let n = Number(sizeInput.value);
let timer = null;
let generator = null;
let solutionsFound = 0;

// Yields one step per column attempt per row, with a snapshot of the
// current partial placement, so the UI can render exactly what the
// backtracking search is doing instead of just the final answer.
function* solveSteps(size) {
  const cols = new Array(size).fill(-1);

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      const c = cols[r];
      if (c === col || Math.abs(c - col) === row - r) return false;
    }
    return true;
  }

  function* place(row) {
    if (row === size) {
      solutionsFound++;
      yield { type: 'solution', cols: cols.slice(), solutions: solutionsFound };
      return;
    }
    for (let col = 0; col < size; col++) {
      if (isSafe(row, col)) {
        cols[row] = col;
        yield { type: 'place', row, col, cols: cols.slice() };
        yield* place(row + 1);
        cols[row] = -1;
        yield { type: 'remove', row, col, cols: cols.slice() };
      } else {
        yield { type: 'conflict', row, col, cols: cols.slice() };
      }
    }
  }

  yield* place(0);
  yield { type: 'done', solutions: solutionsFound, cols: cols.slice() };
}

function buildBoard(size) {
  boardEl.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  boardEl.innerHTML = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = `board-cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      boardEl.appendChild(cell);
    }
  }
}

function render(cols, highlight) {
  for (const cell of boardEl.children) {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.classList.remove('tried');
    cell.innerHTML = '';
    if (cols[row] === col) {
      const queen = document.createElement('div');
      queen.className = 'queen';
      cell.appendChild(queen);
    }
    if (highlight && highlight.row === row && highlight.col === col && highlight.type === 'conflict') {
      cell.classList.add('tried');
    }
  }
}

function getDelay() {
  return Math.max(10, 220 - Number(speedInput.value));
}

function applyStep(step) {
  switch (step.type) {
    case 'place':
      render(step.cols, step);
      statusEl.className = 'status';
      statusEl.textContent = `Zeile ${step.row + 1}: Dame in Spalte ${step.col + 1} gesetzt.`;
      break;
    case 'conflict':
      render(step.cols, step);
      statusEl.className = 'status';
      statusEl.textContent = `Zeile ${step.row + 1}, Spalte ${step.col + 1} schlägt eine andere Dame — nächste Spalte.`;
      break;
    case 'remove':
      render(step.cols, step);
      statusEl.className = 'status';
      statusEl.textContent = `Keine Spalte mehr in Zeile ${step.row + 1} frei — zurück zu Zeile ${step.row}.`;
      break;
    case 'solution':
      render(step.cols, null);
      statusEl.className = 'status solved';
      statusEl.textContent = `Lösung #${step.solutions} gefunden!`;
      solutionCountEl.textContent = `${step.solutions} Lösung${step.solutions === 1 ? '' : 'en'} bisher gefunden.`;
      break;
    case 'done':
      statusEl.className = 'status done';
      statusEl.textContent = `Fertig — insgesamt ${step.solutions} Lösung${step.solutions === 1 ? '' : 'en'} für N=${n}.`;
      finish();
      break;
  }
}

function loop() {
  const { value, done } = generator.next();
  if (done) return;
  applyStep(value);
  if (value.type !== 'done') {
    timer = setTimeout(loop, getDelay());
  }
}

function start() {
  n = Math.min(9, Math.max(4, Number(sizeInput.value) || 6));
  sizeInput.value = String(n);
  solutionsFound = 0;
  buildBoard(n);
  render(new Array(n).fill(-1), null);
  solutionCountEl.textContent = '';
  statusEl.className = 'status';
  statusEl.textContent = 'Suche läuft…';
  generator = solveSteps(n);
  startBtn.disabled = true;
  sizeInput.disabled = true;
  stopBtn.disabled = false;
  loop();
}

function finish() {
  clearTimeout(timer);
  startBtn.disabled = false;
  sizeInput.disabled = false;
  stopBtn.disabled = true;
}

startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', () => {
  clearTimeout(timer);
  statusEl.className = 'status done';
  statusEl.textContent = 'Angehalten.';
  finish();
});

buildBoard(n);
render(new Array(n).fill(-1), null);
