const SYMBOLS = ['🍕', '🚀', '🐙', '🎧', '🌵', '🎲', '🍄', '⚡'];

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const timeEl = document.getElementById('time');
const newGameBtn = document.getElementById('newGameBtn');
const winMessage = document.getElementById('winMessage');

let cards = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let lockBoard = false;
let timerId = null;
let elapsedSeconds = 0;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(timerId);
  elapsedSeconds = 0;
  timeEl.textContent = formatTime(0);
  timerId = setInterval(() => {
    elapsedSeconds++;
    timeEl.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function buildBoard() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS]);
  cards = deck.map((symbol, index) => ({ symbol, index, matched: false }));

  board.innerHTML = '';
  cards.forEach((card) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Verdeckte Karte');
    btn.dataset.index = card.index;
    btn.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back">?</span>
        <span class="card-face card-front">${card.symbol}</span>
      </span>
    `;
    btn.addEventListener('click', () => handleFlip(btn, card));
    board.appendChild(btn);
  });
}

function handleFlip(btn, card) {
  if (lockBoard || btn.classList.contains('flipped') || card.matched) return;
  if (!timerId) startTimer();

  btn.classList.add('flipped');
  flipped.push({ btn, card });

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flipped;
  const isMatch = first.card.symbol === second.card.symbol;

  if (isMatch) {
    first.card.matched = true;
    second.card.matched = true;
    first.btn.classList.add('matched');
    second.btn.classList.add('matched');
    first.btn.setAttribute('aria-label', `Aufgedeckt: ${first.card.symbol}`);
    second.btn.setAttribute('aria-label', `Aufgedeckt: ${second.card.symbol}`);
    matchedCount++;
    pairsEl.textContent = `${matchedCount} / ${SYMBOLS.length}`;
    flipped = [];

    if (matchedCount === SYMBOLS.length) {
      clearInterval(timerId);
      winMessage.textContent = `Geschafft in ${moves} Zügen und ${formatTime(elapsedSeconds)}!`;
      winMessage.hidden = false;
    }
    return;
  }

  lockBoard = true;
  setTimeout(() => {
    first.btn.classList.remove('flipped');
    second.btn.classList.remove('flipped');
    flipped = [];
    lockBoard = false;
  }, 800);
}

function newGame() {
  clearInterval(timerId);
  timerId = null;
  moves = 0;
  matchedCount = 0;
  flipped = [];
  lockBoard = false;
  movesEl.textContent = '0';
  pairsEl.textContent = `0 / ${SYMBOLS.length}`;
  timeEl.textContent = '00:00';
  winMessage.hidden = true;
  buildBoard();
}

newGameBtn.addEventListener('click', newGame);

newGame();
