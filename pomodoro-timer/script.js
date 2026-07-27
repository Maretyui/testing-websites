const modeLabel = document.getElementById('mode');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const focusInput = document.getElementById('focusInput');
const breakInput = document.getElementById('breakInput');
const sessionCount = document.getElementById('sessionCount');

const MODE_FOCUS = 'focus';
const MODE_BREAK = 'break';

let mode = MODE_FOCUS;
let secondsLeft = focusMinutes() * 60;
let timerId = null;
let completedSessions = 0;

function focusMinutes() {
  return Math.max(1, parseInt(focusInput.value, 10) || 25);
}

function breakMinutes() {
  return Math.max(1, parseInt(breakInput.value, 10) || 5);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function render() {
  display.textContent = formatTime(secondsLeft);
  modeLabel.textContent = mode === MODE_FOCUS ? 'Fokus' : 'Pause';
  modeLabel.classList.toggle('is-break', mode === MODE_BREAK);
  sessionCount.textContent = completedSessions;
  document.title = `${formatTime(secondsLeft)} · ${mode === MODE_FOCUS ? 'Fokus' : 'Pause'}`;
}

function switchMode() {
  if (mode === MODE_FOCUS) {
    completedSessions += 1;
    mode = MODE_BREAK;
    secondsLeft = breakMinutes() * 60;
  } else {
    mode = MODE_FOCUS;
    secondsLeft = focusMinutes() * 60;
  }
  render();
}

function tick() {
  secondsLeft -= 1;
  if (secondsLeft < 0) {
    switchMode();
    return;
  }
  render();
}

function start() {
  if (timerId !== null) return;
  timerId = setInterval(tick, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  focusInput.disabled = true;
  breakInput.disabled = true;
}

function pause() {
  if (timerId === null) return;
  clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function reset() {
  pause();
  mode = MODE_FOCUS;
  secondsLeft = focusMinutes() * 60;
  focusInput.disabled = false;
  breakInput.disabled = false;
  render();
}

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);

focusInput.addEventListener('change', () => {
  if (mode === MODE_FOCUS && timerId === null) {
    secondsLeft = focusMinutes() * 60;
    render();
  }
});

breakInput.addEventListener('change', () => {
  if (mode === MODE_BREAK && timerId === null) {
    secondsLeft = breakMinutes() * 60;
    render();
  }
});

render();
