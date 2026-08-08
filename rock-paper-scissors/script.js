const choiceButtons = document.querySelectorAll(".choice-btn");
const resultEl = document.getElementById("result");
const revealEl = document.getElementById("reveal");
const playerScoreEl = document.getElementById("playerScore");
const tieScoreEl = document.getElementById("tieScore");
const computerScoreEl = document.getElementById("computerScore");
const resetBtn = document.getElementById("resetBtn");

const CHOICES = ["rock", "paper", "scissors"];
const EMOJI = { rock: "✊", paper: "✋", scissors: "✌️" };
const LABEL = { rock: "Stein", paper: "Papier", scissors: "Schere" };
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };

let scores = { player: 0, tie: 0, computer: 0 };

function updateScoreDisplay() {
  playerScoreEl.textContent = scores.player;
  tieScoreEl.textContent = scores.tie;
  computerScoreEl.textContent = scores.computer;
}

function play(playerChoice) {
  const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

  revealEl.textContent = `${EMOJI[playerChoice]} vs ${EMOJI[computerChoice]}`;

  if (playerChoice === computerChoice) {
    scores.tie++;
    resultEl.textContent = "Unentschieden!";
  } else if (BEATS[playerChoice] === computerChoice) {
    scores.player++;
    resultEl.textContent = `Du gewinnst! ${LABEL[playerChoice]} schlägt ${LABEL[computerChoice]}.`;
  } else {
    scores.computer++;
    resultEl.textContent = `Computer gewinnt! ${LABEL[computerChoice]} schlägt ${LABEL[playerChoice]}.`;
  }

  updateScoreDisplay();
}

choiceButtons.forEach((btn) => {
  btn.addEventListener("click", () => play(btn.dataset.choice));
});

resetBtn.addEventListener("click", () => {
  scores = { player: 0, tie: 0, computer: 0 };
  updateScoreDisplay();
  resultEl.textContent = "Wähle einen Zug, um zu starten.";
  revealEl.textContent = "";
});
