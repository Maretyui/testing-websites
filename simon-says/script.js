const COLORS = ["green", "red", "yellow", "blue"];
const HIGHSCORE_KEY = "simon-says-highscore";

const board = document.getElementById("board");
const pads = Array.from(board.querySelectorAll(".pad"));
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("statusText");
const roundCountEl = document.getElementById("roundCount");
const highscoreEl = document.getElementById("highscore");

let sequence = [];
let playerStep = 0;
let round = 0;
let acceptingInput = false;
let highscore = Number(localStorage.getItem(HIGHSCORE_KEY) || 0);

highscoreEl.textContent = highscore;

function padByColor(color) {
  return pads.find((pad) => pad.dataset.color === color);
}

function lightUp(color, duration = 500) {
  return new Promise((resolve) => {
    const pad = padByColor(color);
    pad.classList.add("lit");
    setTimeout(() => {
      pad.classList.remove("lit");
      setTimeout(resolve, 150);
    }, duration);
  });
}

function setPadsDisabled(disabled) {
  pads.forEach((pad) => { pad.disabled = disabled; });
}

async function playSequence() {
  acceptingInput = false;
  setPadsDisabled(true);
  statusText.textContent = "Zuschauen…";
  await new Promise((r) => setTimeout(r, 400));
  for (const color of sequence) {
    await lightUp(color);
  }
  playerStep = 0;
  acceptingInput = true;
  setPadsDisabled(false);
  statusText.textContent = "Du bist dran";
}

function nextRound() {
  round += 1;
  roundCountEl.textContent = round;
  sequence.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
  playSequence();
}

function handlePadClick(color) {
  if (!acceptingInput) return;

  lightUp(color, 250);

  if (color !== sequence[playerStep]) {
    endGame();
    return;
  }

  playerStep += 1;

  if (playerStep === sequence.length) {
    acceptingInput = false;
    setPadsDisabled(true);
    statusText.textContent = "Richtig! Nächste Runde…";
    setTimeout(nextRound, 700);
  }
}

function endGame() {
  acceptingInput = false;
  setPadsDisabled(true);
  statusText.textContent = `Falsch! Du hast Runde ${round} erreicht.`;
  startBtn.disabled = false;
  startBtn.textContent = "Nochmal spielen";

  if (round > highscore) {
    highscore = round;
    localStorage.setItem(HIGHSCORE_KEY, String(highscore));
    highscoreEl.textContent = highscore;
    statusText.textContent += " Neuer Highscore!";
  }
}

function startGame() {
  sequence = [];
  round = 0;
  roundCountEl.textContent = round;
  startBtn.disabled = true;
  startBtn.textContent = "Läuft…";
  nextRound();
}

pads.forEach((pad) => {
  pad.addEventListener("click", () => handlePadClick(pad.dataset.color));
});

startBtn.addEventListener("click", startGame);
