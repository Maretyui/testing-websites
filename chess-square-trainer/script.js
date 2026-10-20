const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const board = document.getElementById('board');
const targetSquare = document.getElementById('targetSquare');
const scoreValue = document.getElementById('scoreValue');
const streakValue = document.getElementById('streakValue');
const avgValue = document.getElementById('avgValue');
const resetBtn = document.getElementById('resetBtn');

let score = 0;
let streak = 0;
let times = [];
let current = null;
let targetSetAt = 0;
let locked = false;

const cells = [];

for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const file = FILES[col];
    const rank = 8 - row;
    const square = `${file}${rank}`;

    const cell = document.createElement('div');
    cell.className = `board-cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
    cell.dataset.square = square;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Feld ${square}`);

    cell.addEventListener('click', () => handlePick(cell));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePick(cell);
      }
    });

    board.appendChild(cell);
    cells.push(cell);
  }
}

function pickTarget() {
  let next;
  do {
    next = FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);
  } while (next === current);
  current = next;
  targetSquare.textContent = current;
  targetSetAt = performance.now();
}

function handlePick(cell) {
  if (locked) return;
  locked = true;

  const elapsed = performance.now() - targetSetAt;
  const isCorrect = cell.dataset.square === current;

  if (isCorrect) {
    cell.classList.add('correct');
    score += 1;
    streak += 1;
    times.push(elapsed);
    if (times.length > 20) times.shift();
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    avgValue.textContent = `${(avgMs / 1000).toFixed(1)}s`;
  } else {
    cell.classList.add('wrong');
    streak = 0;
    const correctCell = cells.find((c) => c.dataset.square === current);
    if (correctCell) correctCell.classList.add('correct');
  }

  scoreValue.textContent = score;
  streakValue.textContent = streak;

  setTimeout(() => {
    cells.forEach((c) => c.classList.remove('correct', 'wrong'));
    pickTarget();
    locked = false;
  }, isCorrect ? 250 : 650);
}

resetBtn.addEventListener('click', () => {
  score = 0;
  streak = 0;
  times = [];
  scoreValue.textContent = '0';
  streakValue.textContent = '0';
  avgValue.textContent = '–';
  cells.forEach((c) => c.classList.remove('correct', 'wrong'));
  locked = false;
  pickTarget();
});

pickTarget();
