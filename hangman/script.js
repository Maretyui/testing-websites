const WORDS = [
  { word: "JAVASCRIPT", category: "Programmierung" },
  { word: "TASTATUR", category: "Hardware" },
  { word: "GLUEHBIRNE", category: "Haushalt" },
  { word: "FUSSBALL", category: "Sport" },
  { word: "REGENSCHIRM", category: "Alltag" },
  { word: "SCHMETTERLING", category: "Tiere" },
  { word: "KUEHLSCHRANK", category: "Haushalt" },
  { word: "GITARRE", category: "Musik" },
  { word: "SCHACHBRETT", category: "Spiele" },
  { word: "LEUCHTTURM", category: "Bauwerke" },
];

const MAX_MISTAKES = 6;
const PARTS = [
  "part-head",
  "part-body",
  "part-arm-left",
  "part-arm-right",
  "part-leg-left",
  "part-leg-right",
];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const wordDisplay = document.getElementById("wordDisplay");
const categoryDisplay = document.getElementById("categoryDisplay");
const triesDisplay = document.getElementById("triesDisplay");
const messageDisplay = document.getElementById("messageDisplay");
const keyboard = document.getElementById("keyboard");
const newWordBtn = document.getElementById("newWordBtn");

let currentWord = "";
let guessed = new Set();
let mistakes = 0;
let gameOver = false;

function render() {
  wordDisplay.textContent = currentWord
    .split("")
    .map((letter) => (guessed.has(letter) ? letter : "_"))
    .join(" ");

  triesDisplay.textContent = `Fehlversuche: ${mistakes} / ${MAX_MISTAKES}`;

  PARTS.forEach((id, index) => {
    document.getElementById(id).style.visibility = index < mistakes ? "visible" : "hidden";
  });
}

function checkGameEnd() {
  const won = currentWord.split("").every((letter) => guessed.has(letter));
  if (won) {
    gameOver = true;
    messageDisplay.textContent = "Gewonnen! Wort erraten.";
    messageDisplay.className = "message win";
    disableKeyboard();
    return true;
  }
  if (mistakes >= MAX_MISTAKES) {
    gameOver = true;
    messageDisplay.textContent = `Verloren! Das Wort war: ${currentWord}`;
    messageDisplay.className = "message lose";
    disableKeyboard();
    return true;
  }
  return false;
}

function disableKeyboard() {
  keyboard.querySelectorAll("button").forEach((btn) => { btn.disabled = true; });
}

function guessLetter(letter, btn) {
  if (gameOver || guessed.has(letter)) return;

  guessed.add(letter);

  if (currentWord.includes(letter)) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    mistakes += 1;
  }

  btn.disabled = true;
  render();
  checkGameEnd();
}

function buildKeyboard() {
  keyboard.innerHTML = "";
  ALPHABET.forEach((letter) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = letter;
    btn.addEventListener("click", () => guessLetter(letter, btn));
    keyboard.appendChild(btn);
  });
}

function startGame() {
  const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentWord = pick.word;
  categoryDisplay.textContent = `Kategorie: ${pick.category}`;
  guessed = new Set();
  mistakes = 0;
  gameOver = false;
  messageDisplay.textContent = "";
  messageDisplay.className = "message";
  buildKeyboard();
  render();
}

document.addEventListener("keydown", (event) => {
  const letter = event.key.toUpperCase();
  if (ALPHABET.includes(letter)) {
    const btn = Array.from(keyboard.querySelectorAll("button")).find((b) => b.textContent === letter);
    if (btn && !btn.disabled) guessLetter(letter, btn);
  }
});

newWordBtn.addEventListener("click", startGame);

startGame();
