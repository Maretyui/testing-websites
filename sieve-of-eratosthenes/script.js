const limitInput = document.getElementById("limit");
const speedInput = document.getElementById("speed");
const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const autoBtn = document.getElementById("autoBtn");
const statusEl = document.getElementById("status");
const gridEl = document.getElementById("grid");
const summaryEl = document.getElementById("summary");

let limit = 0;
let composite = [];
let candidate = 2;
let autoTimer = null;

function buildGrid() {
  gridEl.innerHTML = "";
  const cells = [];
  for (let n = 2; n <= limit; n++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = n;
    gridEl.appendChild(cell);
    cells[n] = cell;
  }
  return cells;
}

let cells = [];

function setup() {
  limit = Math.max(10, Math.min(2000, Number(limitInput.value) || 200));
  limitInput.value = limit;
  composite = new Array(limit + 1).fill(false);
  candidate = 2;
  stopAuto();
  cells = buildGrid();
  stepBtn.disabled = false;
  autoBtn.disabled = false;
  autoBtn.textContent = "Automatisch";
  statusEl.textContent = `Bereit. Erste Primzahl zum Sieben: ${candidate}.`;
  summaryEl.textContent = "";
}

function finish() {
  for (let n = 2; n <= limit; n++) {
    if (!composite[n]) cells[n].classList.add("prime");
  }
  const primes = [];
  for (let n = 2; n <= limit; n++) if (!composite[n]) primes.push(n);
  statusEl.textContent = `Fertig — ${primes.length} Primzahlen bis ${limit} gefunden.`;
  summaryEl.textContent = primes.join(", ");
  stepBtn.disabled = true;
  autoBtn.disabled = true;
  stopAuto();
}

function step() {
  if (candidate * candidate > limit) {
    finish();
    return;
  }

  for (let n = 2; n <= limit; n++) cells[n].classList.remove("current");

  if (composite[candidate]) {
    candidate++;
    step();
    return;
  }

  cells[candidate].classList.add("current", "prime");
  let marked = 0;
  for (let multiple = candidate * candidate; multiple <= limit; multiple += candidate) {
    if (!composite[multiple]) {
      composite[multiple] = true;
      cells[multiple].classList.add("composite");
      marked++;
    }
  }
  statusEl.textContent = `Primzahl ${candidate}: ${marked} Vielfache durchgestrichen.`;
  candidate++;

  if (candidate * candidate > limit) {
    finish();
  }
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    autoBtn.textContent = "Automatisch";
  }
}

function toggleAuto() {
  if (autoTimer) {
    stopAuto();
    return;
  }
  autoBtn.textContent = "Pause";
  autoTimer = setInterval(() => {
    if (candidate * candidate > limit) {
      finish();
      return;
    }
    step();
  }, Number(speedInput.value));
}

startBtn.addEventListener("click", setup);
stepBtn.addEventListener("click", step);
autoBtn.addEventListener("click", toggleAuto);
speedInput.addEventListener("input", () => {
  if (autoTimer) {
    stopAuto();
    toggleAuto();
  }
});

setup();
