const countInput = document.getElementById("countInput");
const sidesInput = document.getElementById("sidesInput");
const rollBtn = document.getElementById("rollBtn");
const diceEl = document.getElementById("dice");
const totalEl = document.getElementById("total");
const historyEl = document.getElementById("history");
const emptyHistory = document.getElementById("emptyHistory");

const HISTORY_LIMIT = 8;
let history = [];

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function render(rolls, sides) {
  diceEl.innerHTML = "";
  for (const value of rolls) {
    const die = document.createElement("div");
    die.className = "die";
    die.textContent = value;
    diceEl.appendChild(die);
  }
  const total = rolls.reduce((sum, value) => sum + value, 0);
  totalEl.textContent = rolls.length > 1
    ? `Summe: ${total}`
    : `Ergebnis: ${total}`;

  history.unshift({ rolls: [...rolls], sides, total });
  history = history.slice(0, HISTORY_LIMIT);
  renderHistory();
}

function renderHistory() {
  historyEl.innerHTML = "";
  emptyHistory.classList.toggle("hidden", history.length > 0);
  for (const entry of history) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${entry.rolls.length}×D${entry.sides}: ${entry.rolls.join(", ")}`;
    const total = document.createElement("span");
    total.className = "roll-total";
    total.textContent = entry.total;
    li.append(label, total);
    historyEl.appendChild(li);
  }
}

rollBtn.addEventListener("click", () => {
  const count = Math.min(Math.max(parseInt(countInput.value, 10) || 1, 1), 12);
  const sides = parseInt(sidesInput.value, 10);
  countInput.value = count;

  const rolls = Array.from({ length: count }, () => rollDie(sides));
  render(rolls, sides);
});

renderHistory();
