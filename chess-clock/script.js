const setup = document.getElementById('setup');
const board = document.getElementById('board');
const controls = document.getElementById('controls');
const status = document.getElementById('status');

const minutesInput = document.getElementById('minutesInput');
const incrementInput = document.getElementById('incrementInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const clockA = document.getElementById('clockA');
const clockB = document.getElementById('clockB');
const timeA = document.getElementById('timeA');
const timeB = document.getElementById('timeB');

let incrementMs = 0;
let msA = 0;
let msB = 0;
let active = null; // 'A' | 'B' | null
let paused = true;
let lastTick = 0;
let rafId = null;
let flagged = false;

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function render() {
  timeA.textContent = formatTime(msA);
  timeB.textContent = formatTime(msB);
  clockA.classList.toggle('active', active === 'A' && !paused);
  clockB.classList.toggle('active', active === 'B' && !paused);
  clockA.classList.toggle('flagged', flagged && msA <= 0);
  clockB.classList.toggle('flagged', flagged && msB <= 0);
}

function tick(now) {
  if (paused || flagged) return;
  const delta = now - lastTick;
  lastTick = now;

  if (active === 'A') {
    msA = Math.max(0, msA - delta);
    if (msA <= 0) {
      flagged = true;
      status.textContent = 'Spieler A ist die Zeit ausgegangen — Spieler B gewinnt.';
    }
  } else if (active === 'B') {
    msB = Math.max(0, msB - delta);
    if (msB <= 0) {
      flagged = true;
      status.textContent = 'Spieler B ist die Zeit ausgegangen — Spieler A gewinnt.';
    }
  }

  render();
  if (!flagged) {
    rafId = requestAnimationFrame(tick);
  } else {
    clockA.disabled = true;
    clockB.disabled = true;
  }
}

function passTurn(from) {
  if (flagged) return;
  if (active === null) {
    // first press starts the opponent's clock
    active = from === 'A' ? 'B' : 'A';
    paused = false;
    lastTick = performance.now();
    rafId = requestAnimationFrame(tick);
    return;
  }
  if (active !== from) return; // can't pass on the other player's turn

  if (from === 'A') msA += incrementMs;
  if (from === 'B') msB += incrementMs;

  active = from === 'A' ? 'B' : 'A';
  render();
}

clockA.addEventListener('click', () => passTurn('A'));
clockB.addEventListener('click', () => passTurn('B'));

startBtn.addEventListener('click', () => {
  const minutes = Math.min(60, Math.max(1, Number(minutesInput.value) || 5));
  incrementMs = Math.min(60, Math.max(0, Number(incrementInput.value) || 0)) * 1000;
  msA = minutes * 60 * 1000;
  msB = minutes * 60 * 1000;
  active = null;
  paused = true;
  flagged = false;
  status.textContent = '';
  clockA.disabled = false;
  clockB.disabled = false;

  setup.classList.add('hidden');
  board.classList.remove('hidden');
  controls.classList.remove('hidden');
  render();
});

pauseBtn.addEventListener('click', () => {
  if (flagged || active === null) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Weiter' : 'Pause';
  if (!paused) {
    lastTick = performance.now();
    rafId = requestAnimationFrame(tick);
  } else if (rafId) {
    cancelAnimationFrame(rafId);
  }
  render();
});

resetBtn.addEventListener('click', () => {
  if (rafId) cancelAnimationFrame(rafId);
  setup.classList.remove('hidden');
  board.classList.add('hidden');
  controls.classList.add('hidden');
  pauseBtn.textContent = 'Pause';
  status.textContent = '';
});
