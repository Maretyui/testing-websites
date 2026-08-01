const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const modeToggle = document.getElementById("modeToggle");
const newRoundBtn = document.getElementById("newRoundBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");
const xLabel = document.getElementById("xLabel");
const oLabel = document.getElementById("oLabel");

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

let board = Array(9).fill(null);
let mode = "cpu"; // "cpu" | "pvp"
let current = "X";
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function checkResult(bd) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
      return { winner: bd[a], line };
    }
  }
  if (bd.every((cell) => cell !== null)) {
    return { winner: "draw", line: null };
  }
  return { winner: null, line: null };
}

function minimax(bd, depth, isMaximizing) {
  const result = checkResult(bd);
  if (result.winner === "O") return 10 - depth;
  if (result.winner === "X") return depth - 10;
  if (result.winner === "draw") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (bd[i]) continue;
      bd[i] = "O";
      best = Math.max(best, minimax(bd, depth + 1, false));
      bd[i] = null;
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (bd[i]) continue;
    bd[i] = "X";
    best = Math.min(best, minimax(bd, depth + 1, true));
    bd[i] = null;
  }
  return best;
}

function bestMove(bd) {
  const empty = bd.map((v, i) => (v ? -1 : i)).filter((i) => i !== -1);

  // Vary the opening move a little instead of always playing the same
  // square when the board is empty or has a single X in the center.
  if (empty.length === 9) {
    const openings = [0, 2, 6, 8];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  let bestScore = -Infinity;
  let move = empty[0];
  for (const i of empty) {
    bd[i] = "O";
    const score = minimax(bd, 0, false);
    bd[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function render(winLine) {
  boardEl.innerHTML = "";
  board.forEach((value, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell" + (value ? ` ${value.toLowerCase()}` : "");
    if (winLine && winLine.includes(i)) btn.classList.add("win-cell");
    btn.textContent = value || "";
    btn.disabled = Boolean(value) || gameOver || (mode === "cpu" && current === "O");
    btn.setAttribute("aria-label", `Feld ${i + 1}${value ? `, belegt mit ${value}` : ", frei"}`);
    btn.addEventListener("click", () => handleMove(i));
    boardEl.appendChild(btn);
  });
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = "status" + (cls ? ` ${cls}` : "");
}

function finishTurnCheck() {
  const result = checkResult(board);
  if (result.winner === "draw") {
    gameOver = true;
    scores.draw++;
    updateScoreboard();
    setStatus("Unentschieden!", "draw");
    render(null);
    return true;
  }
  if (result.winner) {
    gameOver = true;
    scores[result.winner]++;
    updateScoreboard();
    if (mode === "cpu") {
      setStatus(result.winner === "X" ? "Du hast gewonnen!" : "Der Computer gewinnt.", result.winner === "X" ? "win" : "lose");
    } else {
      setStatus(`Spieler ${result.winner} gewinnt!`, "win");
    }
    render(result.line);
    return true;
  }
  return false;
}

function handleMove(i) {
  if (gameOver || board[i]) return;
  if (mode === "cpu" && current === "O") return;

  board[i] = current;
  render(null);

  if (finishTurnCheck()) return;

  current = current === "X" ? "O" : "X";

  if (mode === "pvp") {
    setStatus(`Spieler ${current} ist dran`);
    render(null);
    return;
  }

  // cpu mode, it's now the computer's (O) turn
  setStatus("Der Computer überlegt...");
  render(null);
  window.setTimeout(() => {
    const move = bestMove(board);
    board[move] = "O";
    render(null);
    if (finishTurnCheck()) return;
    current = "X";
    setStatus("Du bist dran");
    render(null);
  }, 350);
}

function newRound() {
  board = Array(9).fill(null);
  gameOver = false;
  current = "X";
  setStatus(mode === "cpu" ? "Du bist X — du beginnst" : "Spieler X beginnt");
  render(null);
}

function applyMode(newMode) {
  mode = newMode;
  Array.from(modeToggle.querySelectorAll(".mode-btn")).forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === newMode);
  });
  oLabel.textContent = mode === "cpu" ? "Computer" : "O";
  xLabel.textContent = mode === "cpu" ? "Du" : "X";
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
  newRound();
}

modeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-btn");
  if (!btn || btn.classList.contains("active")) return;
  applyMode(btn.dataset.mode);
});

newRoundBtn.addEventListener("click", newRound);

resetScoreBtn.addEventListener("click", () => {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
  newRound();
});

applyMode("cpu");
