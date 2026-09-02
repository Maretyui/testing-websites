const canvas = document.getElementById('bars');
const ctx = canvas.getContext('2d');
const algoSelect = document.getElementById('algoSelect');
const sizeInput = document.getElementById('sizeInput');
const sizeValue = document.getElementById('sizeValue');
const speedInput = document.getElementById('speedInput');
const shuffleBtn = document.getElementById('shuffleBtn');
const startBtn = document.getElementById('startBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');
const statusEl = document.getElementById('status');

let values = [];
let comparisons = 0;
let swaps = 0;
let timerId = null;
let running = false;

function shuffle() {
  const n = Number(sizeInput.value);
  values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 100));
  comparisons = 0;
  swaps = 0;
  updateStats();
  statusEl.textContent = 'Bereit';
  draw(values, []);
}

function updateStats() {
  comparisonsEl.textContent = comparisons;
  swapsEl.textContent = swaps;
}

function draw(array, active, done) {
  const w = canvas.width / array.length;
  const max = Math.max(...array, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  array.forEach((value, i) => {
    const h = (value / max) * (canvas.height - 10);
    ctx.fillStyle = done ? '#16a34a' : active.includes(i) ? '#dc2626' : '#4338ca';
    ctx.fillRect(i * w + 1, canvas.height - h, Math.max(w - 2, 1), h);
  });
}

function* bubbleSort(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      yield { array: a, active: [j, j + 1], swap: false };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { array: a, active: [j, j + 1], swap: true };
      }
    }
  }
}

function* selectionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      yield { array: a, active: [min, j], swap: false };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { array: a, active: [i, min], swap: true };
    }
  }
}

function* insertionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      yield { array: a, active: [j - 1, j], swap: false };
      if (a[j - 1] > a[j]) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        yield { array: a, active: [j - 1, j], swap: true };
        j--;
      } else {
        break;
      }
    }
  }
}

function* quickSort(arr) {
  const a = arr.slice();
  function* qs(lo, hi) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield { array: a, active: [j, hi], swap: false };
      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          yield { array: a, active: [i, j], swap: true };
        }
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    yield { array: a, active: [i, hi], swap: true };
    yield* qs(lo, i - 1);
    yield* qs(i + 1, hi);
  }
  yield* qs(0, a.length - 1);
}

const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  quick: quickSort,
};

function setControlsDisabled(disabled) {
  algoSelect.disabled = disabled;
  sizeInput.disabled = disabled;
  shuffleBtn.disabled = disabled;
}

function step(generator) {
  const result = generator.next();
  if (result.done) {
    running = false;
    setControlsDisabled(false);
    startBtn.textContent = 'Start';
    statusEl.textContent = 'Fertig sortiert';
    draw(values, [], true);
    return;
  }
  const { array, active, swap } = result.value;
  values = array;
  comparisons++;
  if (swap) swaps++;
  updateStats();
  draw(array, active);

  const delay = 210 - Number(speedInput.value) * 2;
  timerId = setTimeout(() => step(generator), Math.max(delay, 5));
}

function start() {
  if (running) return;
  running = true;
  setControlsDisabled(true);
  startBtn.textContent = 'Läuft…';
  statusEl.textContent = 'Sortiert…';
  comparisons = 0;
  swaps = 0;
  const generator = algorithms[algoSelect.value](values);
  step(generator);
}

sizeInput.addEventListener('input', () => {
  sizeValue.textContent = sizeInput.value;
  if (!running) shuffle();
});
shuffleBtn.addEventListener('click', shuffle);
startBtn.addEventListener('click', start);

shuffle();
