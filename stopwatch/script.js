const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsEl = document.getElementById('laps');

let running = false;
let startedAt = 0;
let elapsedBeforeStart = 0;
let rafId = null;
let laps = [];

function formatTime(ms) {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

function currentElapsed() {
  return running ? elapsedBeforeStart + (performance.now() - startedAt) : elapsedBeforeStart;
}

function tick() {
  display.textContent = formatTime(currentElapsed());
  rafId = requestAnimationFrame(tick);
}

function start() {
  running = true;
  startedAt = performance.now();
  startStopBtn.textContent = 'Stop';
  startStopBtn.classList.add('running');
  lapBtn.disabled = false;
  resetBtn.disabled = true;
  rafId = requestAnimationFrame(tick);
}

function stop() {
  running = false;
  elapsedBeforeStart = currentElapsed();
  cancelAnimationFrame(rafId);
  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('running');
  lapBtn.disabled = true;
  resetBtn.disabled = false;
}

function reset() {
  elapsedBeforeStart = 0;
  laps = [];
  display.textContent = formatTime(0);
  lapsEl.innerHTML = '';
}

function renderLaps() {
  lapsEl.innerHTML = '';
  const diffs = laps.map((lap, i) => (i === 0 ? lap : lap - laps[i - 1]));
  const fastest = Math.min(...diffs);
  const slowest = Math.max(...diffs);
  laps.forEach((lap, i) => {
    const diff = diffs[i];
    const li = document.createElement('li');
    if (laps.length > 1 && diff === fastest) li.classList.add('fastest');
    if (laps.length > 1 && diff === slowest) li.classList.add('slowest');
    li.innerHTML = `
      <span class="lap-number">#${i + 1}</span>
      <span class="lap-time">${formatTime(lap)}</span>
      <span class="lap-diff">+${formatTime(diff)}</span>
    `;
    lapsEl.prepend(li);
  });
}

startStopBtn.addEventListener('click', () => {
  running ? stop() : start();
});

lapBtn.addEventListener('click', () => {
  laps.push(currentElapsed());
  renderLaps();
});

resetBtn.addEventListener('click', reset);

resetBtn.disabled = true;
display.textContent = formatTime(0);
