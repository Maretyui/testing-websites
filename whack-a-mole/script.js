const HOLE_COUNT = 9;
const GAME_SECONDS = 30;
const BEST_KEY = "whack-a-mole-best";

const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const gameOverEl = document.getElementById("gameOver");

let score = 0;
let timeLeft = GAME_SECONDS;
let timerId = null;
let moleTimeoutId = null;
let activeHole = null;
let running = false;

const holes = Array.from({ length: HOLE_COUNT }, (_, i) => {
  const hole = document.createElement("button");
  hole.type = "button";
  hole.className = "hole";
  hole.setAttribute("aria-label", `Loch ${i + 1}`);
  const mole = document.createElement("div");
  mole.className = "mole";
  hole.appendChild(mole);
  hole.addEventListener("click", () => whack(hole));
  grid.appendChild(hole);
  return hole;
});

function loadBest() {
  const stored = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
  bestEl.textContent = String(Number.isFinite(stored) ? stored : 0);
}

function saveBestIfNeeded() {
  const stored = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
  if (score > stored) {
    localStorage.setItem(BEST_KEY, String(score));
    bestEl.textContent = String(score);
  }
}

function randomDelay(min, max) {
  return min + Math.random() * (max - min);
}

function showRandomMole() {
  if (!running) return;
  if (activeHole) activeHole.classList.remove("up");

  const next = holes[Math.floor(Math.random() * holes.length)];
  next.classList.add("up");
  activeHole = next;

  const upFor = randomDelay(500, 1000);
  moleTimeoutId = setTimeout(() => {
    if (activeHole === next) {
      next.classList.remove("up");
      activeHole = null;
    }
    if (running) {
      moleTimeoutId = setTimeout(showRandomMole, randomDelay(200, 600));
    }
  }, upFor);
}

function whack(hole) {
  if (!running || !hole.classList.contains("up")) return;
  hole.classList.remove("up");
  hole.classList.add("whacked");
  setTimeout(() => hole.classList.remove("whacked"), 150);
  if (activeHole === hole) activeHole = null;
  score += 1;
  scoreEl.textContent = String(score);
}

function tick() {
  timeLeft -= 1;
  timeEl.textContent = String(timeLeft);
  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  score = 0;
  timeLeft = GAME_SECONDS;
  scoreEl.textContent = "0";
  timeEl.textContent = String(GAME_SECONDS);
  gameOverEl.textContent = "";
  running = true;
  startBtn.disabled = true;
  holes.forEach((h) => h.classList.remove("up", "whacked"));

  timerId = setInterval(tick, 1000);
  showRandomMole();
}

function endGame() {
  running = false;
  clearInterval(timerId);
  clearTimeout(moleTimeoutId);
  holes.forEach((h) => h.classList.remove("up"));
  activeHole = null;
  startBtn.disabled = false;
  saveBestIfNeeded();
  gameOverEl.textContent = `Vorbei! Du hast ${score} Punkte erreicht.`;
}

startBtn.addEventListener("click", startGame);
loadBest();
