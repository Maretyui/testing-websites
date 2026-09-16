const bpmSlider = document.getElementById('bpmSlider');
const bpmValue = document.getElementById('bpmValue');
const playBtn = document.getElementById('playBtn');
const tapBtn = document.getElementById('tapBtn');
const beatDot = document.getElementById('beatDot');

const lookahead = 25.0; // ms between scheduler passes
const scheduleAheadTime = 0.1; // seconds scheduled ahead of audio-clock time

let audioCtx = null;
let bpm = Number(bpmSlider.value);
let isPlaying = false;
let timerID = null;
let nextNoteTime = 0.0;
let beatCount = 0;
let tapTimes = [];

function scheduleNote(beatNumber, time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = beatNumber === 0 ? 1000 : 800;
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.start(time);
  osc.stop(time + 0.05);

  const delay = Math.max(0, (time - audioCtx.currentTime) * 1000);
  setTimeout(() => pulse(beatNumber), delay);
}

function pulse(beatNumber) {
  beatDot.classList.remove('pulse', 'accent');
  void beatDot.offsetWidth; // restart the CSS transition
  beatDot.classList.add('pulse');
  if (beatNumber === 0) beatDot.classList.add('accent');
  setTimeout(() => beatDot.classList.remove('pulse', 'accent'), 90);
}

function advanceNote() {
  const secondsPerBeat = 60.0 / bpm;
  nextNoteTime += secondsPerBeat;
  beatCount = (beatCount + 1) % 4;
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleNote(beatCount, nextNoteTime);
    advanceNote();
  }
  timerID = setTimeout(scheduler, lookahead);
}

function togglePlay() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (isPlaying) {
    clearTimeout(timerID);
    isPlaying = false;
    playBtn.textContent = 'Start';
    return;
  }

  if (audioCtx.state === 'suspended') audioCtx.resume();
  beatCount = 0;
  nextNoteTime = audioCtx.currentTime + 0.05;
  scheduler();
  isPlaying = true;
  playBtn.textContent = 'Stop';
}

function tapTempo() {
  const now = performance.now();
  tapTimes = tapTimes.filter((t) => now - t < 2000);
  tapTimes.push(now);
  if (tapTimes.length < 2) return;

  const intervals = [];
  for (let i = 1; i < tapTimes.length; i++) {
    intervals.push(tapTimes[i] - tapTimes[i - 1]);
  }
  const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  bpm = Math.min(240, Math.max(30, Math.round(60000 / avgMs)));
  bpmSlider.value = bpm;
  bpmValue.textContent = bpm;
}

bpmSlider.addEventListener('input', () => {
  bpm = Number(bpmSlider.value);
  bpmValue.textContent = bpm;
});
playBtn.addEventListener('click', togglePlay);
tapBtn.addEventListener('click', tapTempo);
