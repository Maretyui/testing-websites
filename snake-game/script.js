const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const speedSelect = document.getElementById('speedSelect');
const dpad = document.getElementById('dpad');

const GRID_SIZE = 20;
const CELL = canvas.width / GRID_SIZE;
const STORAGE_KEY = 'snake-highscore';

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let snake = [];
let direction = DIRS.right;
let queuedDirection = DIRS.right;
let food = { x: 0, y: 0 };
let score = 0;
let highscore = Number(localStorage.getItem(STORAGE_KEY) || '0');
let timerId = null;
let running = false;
let paused = false;

highscoreEl.textContent = highscore;

function resetState() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
    { x: mid - 3, y: mid },
  ];
  direction = DIRS.right;
  queuedDirection = DIRS.right;
  score = 0;
  scoreEl.textContent = score;
  placeFood();
}

function placeFood() {
  let candidate;
  do {
    candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((seg) => seg.x === candidate.x && seg.y === candidate.y));
  food = candidate;
}

function draw() {
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2.6,
    0,
    Math.PI * 2
  );
  ctx.fill();

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    const pad = 1.5;
    ctx.fillRect(
      seg.x * CELL + pad,
      seg.y * CELL + pad,
      CELL - pad * 2,
      CELL - pad * 2
    );
  });
}

function step() {
  direction = queuedDirection;
  const head = snake[0];
  const next = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall = next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE;
  const hitSelf = snake.some((seg) => seg.x === next.x && seg.y === next.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(next);

  if (next.x === food.x && next.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function currentSpeed() {
  return Number(speedSelect.value);
}

function startLoop() {
  clearInterval(timerId);
  timerId = setInterval(step, currentSpeed());
}

function gameOver() {
  clearInterval(timerId);
  timerId = null;
  running = false;
  paused = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';

  if (score > highscore) {
    highscore = score;
    localStorage.setItem(STORAGE_KEY, String(highscore));
    highscoreEl.textContent = highscore;
    overlayText.textContent = `Game Over! ${score} Punkte — neuer Highscore!`;
  } else {
    overlayText.textContent = `Game Over! ${score} Punkte`;
  }
  startBtn.textContent = 'Nochmal spielen';
  overlay.classList.remove('hidden');
}

function startGame() {
  resetState();
  draw();
  running = true;
  paused = false;
  overlay.classList.add('hidden');
  pauseBtn.disabled = false;
  pauseBtn.textContent = 'Pause';
  startLoop();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(timerId);
    timerId = null;
    pauseBtn.textContent = 'Weiter';
    overlayText.textContent = 'Pausiert';
    overlay.classList.remove('hidden');
  } else {
    pauseBtn.textContent = 'Pause';
    overlay.classList.add('hidden');
    startLoop();
  }
}

function setDirection(dir) {
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const wanted = DIRS[dir];
  if (!wanted) return;
  // ignore reversing directly into the snake's own neck
  if (wanted.x === -direction.x && wanted.y === -direction.y) return;
  queuedDirection = wanted;
  if (paused && running) togglePause();
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

speedSelect.addEventListener('change', () => {
  if (running && !paused) startLoop();
});

document.addEventListener('keydown', (e) => {
  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
  };
  if (e.key === ' ') {
    e.preventDefault();
    if (!running) startGame();
    else togglePause();
    return;
  }
  const dir = keyMap[e.key];
  if (dir) {
    e.preventDefault();
    setDirection(dir);
  }
});

dpad.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-dir]');
  if (!btn) return;
  if (!running) startGame();
  setDirection(btn.dataset.dir);
});

resetState();
draw();
