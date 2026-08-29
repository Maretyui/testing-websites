const pad = document.getElementById('pad');
const lastTimeEl = document.getElementById('lastTime');
const bestTimeEl = document.getElementById('bestTime');
const avgTimeEl = document.getElementById('avgTime');
const attemptCountEl = document.getElementById('attemptCount');

let state = 'idle'; // idle | armed | go
let armTimer = null;
let goStartedAt = 0;
let times = [];

function setPad(cls, text) {
  pad.className = 'pad ' + cls;
  pad.textContent = text;
}

function arm() {
  state = 'armed';
  setPad('armed', 'Warten auf Grün...');
  const delay = 1000 + Math.random() * 3000;
  armTimer = setTimeout(() => {
    state = 'go';
    goStartedAt = performance.now();
    setPad('go', 'JETZT KLICKEN!');
  }, delay);
}

function recordResult(ms) {
  times.push(ms);
  lastTimeEl.textContent = ms + ' ms';
  const best = Math.min(...times);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  bestTimeEl.textContent = best + ' ms';
  avgTimeEl.textContent = avg + ' ms';
  attemptCountEl.textContent = times.length + (times.length === 1 ? ' Versuch' : ' Versuche');
}

pad.addEventListener('click', () => {
  if (state === 'idle') {
    arm();
    return;
  }

  if (state === 'armed') {
    clearTimeout(armTimer);
    state = 'idle';
    setPad('too-soon', 'Zu früh! Nochmal klicken zum Neustart.');
    return;
  }

  if (state === 'go') {
    const ms = Math.round(performance.now() - goStartedAt);
    recordResult(ms);
    state = 'idle';
    setPad('waiting', 'Klicken für nächsten Versuch');
    return;
  }
});
