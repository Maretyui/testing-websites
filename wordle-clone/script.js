const WORDS = [
  "APFEL", "TISCH", "WOLKE", "BLUME", "KATZE", "MOTOR", "GEIST", "FLUSS",
  "KREIS", "PUNKT", "SONNE", "STERN", "WOLLE", "BIRNE", "NADEL", "FEDER",
  "KETTE", "TRAUM", "SCHAL", "RAUCH", "LAMPE", "TASSE", "BRETT", "HEBEL",
  "NEBEL", "KABEL", "SEGEL", "MUSIK", "PFOTE", "FALKE",
];

const WORD_LENGTH = 5;
const MAX_ROWS = 6;
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Y", "X", "C", "V", "B", "N", "M", "BACK"],
];

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const messageDisplay = document.getElementById("messageDisplay");
const newWordBtn = document.getElementById("newWordBtn");

let solution = "";
let currentRow = 0;
let currentGuess = "";
let gameOver = false;
let tiles = []; // tiles[row][col]
let keyStates = {}; // letter -> 'correct' | 'present' | 'absent'

function buildBoard() {
  board.innerHTML = "";
  tiles = [];
  for (let r = 0; r < MAX_ROWS; r++) {
    const row = document.createElement("div");
    row.className = "board-row";
    const rowTiles = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
      rowTiles.push(tile);
    }
    board.appendChild(row);
    tiles.push(rowTiles);
  }
}

function buildKeyboard() {
  keyboard.innerHTML = "";
  KEYBOARD_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach((key) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.key = key;
      if (key === "ENTER" || key === "BACK") {
        btn.className = "wide";
        btn.textContent = key === "ENTER" ? "Enter" : "⌫";
      } else {
        btn.textContent = key;
      }
      btn.addEventListener("click", () => handleKey(key));
      rowEl.appendChild(btn);
    });
    keyboard.appendChild(rowEl);
  });
}

function setMessage(text, cls) {
  messageDisplay.textContent = text;
  messageDisplay.className = cls ? `message ${cls}` : "message";
}

function handleKey(key) {
  if (gameOver) return;
  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACK") {
    if (currentGuess.length > 0) {
      currentGuess = currentGuess.slice(0, -1);
      renderCurrentRow();
    }
  } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
    currentGuess += key;
    renderCurrentRow();
  }
}

function renderCurrentRow() {
  const rowTiles = tiles[currentRow];
  for (let c = 0; c < WORD_LENGTH; c++) {
    const letter = currentGuess[c] || "";
    rowTiles[c].textContent = letter;
    rowTiles[c].classList.toggle("filled", letter !== "");
  }
}

function submitGuess() {
  if (currentGuess.length < WORD_LENGTH) {
    setMessage("Zu wenige Buchstaben.", "lose");
    tiles[currentRow].forEach((t) => {
      t.classList.remove("shake");
      void t.offsetWidth;
      t.classList.add("shake");
    });
    return;
  }

  setMessage("", "");
  const guess = currentGuess;
  const result = evaluateGuess(guess, solution);
  const rowTiles = tiles[currentRow];

  result.forEach((status, i) => {
    setTimeout(() => {
      rowTiles[i].classList.add(status, "pop");
      updateKeyState(guess[i], status);
    }, i * 120);
  });

  const isWin = guess === solution;
  const isLastRow = currentRow === MAX_ROWS - 1;

  setTimeout(() => {
    if (isWin) {
      gameOver = true;
      setMessage(`Gewonnen! Das Wort war ${solution}.`, "win");
      disableKeyboard();
    } else if (isLastRow) {
      gameOver = true;
      setMessage(`Verloren! Das Wort war: ${solution}`, "lose");
      disableKeyboard();
    }
  }, WORD_LENGTH * 120 + 100);

  currentRow += 1;
  currentGuess = "";
}

function evaluateGuess(guess, target) {
  const result = new Array(WORD_LENGTH).fill("absent");
  const targetLetters = target.split("");
  const used = new Array(WORD_LENGTH).fill(false);

  // first pass: exact matches
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  // second pass: present-but-misplaced, respecting remaining letter counts
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.findIndex((letter, j) => letter === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }

  return result;
}

function updateKeyState(letter, status) {
  const rank = { absent: 0, present: 1, correct: 2 };
  const current = keyStates[letter];
  if (!current || rank[status] > rank[current]) {
    keyStates[letter] = status;
    const btn = keyboard.querySelector(`button[data-key="${letter}"]`);
    if (btn) {
      btn.classList.remove("absent", "present", "correct");
      btn.classList.add(status);
    }
  }
}

function disableKeyboard() {
  keyboard.querySelectorAll("button").forEach((btn) => { btn.disabled = true; });
}

function startGame() {
  solution = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  keyStates = {};
  setMessage("", "");
  buildBoard();
  buildKeyboard();
}

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toUpperCase();
  if (key === "ENTER") {
    handleKey("ENTER");
  } else if (key === "BACKSPACE") {
    handleKey("BACK");
  } else if (/^[A-Z]$/.test(key)) {
    handleKey(key);
  }
});

newWordBtn.addEventListener("click", startGame);

startGame();
