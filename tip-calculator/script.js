const billInput = document.getElementById("billInput");
const tipButtons = document.getElementById("tipButtons");
const customTipInput = document.getElementById("customTipInput");
const decreasePeople = document.getElementById("decreasePeople");
const increasePeople = document.getElementById("increasePeople");
const peopleDisplay = document.getElementById("peopleDisplay");
const tipAmountEl = document.getElementById("tipAmount");
const totalAmountEl = document.getElementById("totalAmount");
const perPersonAmountEl = document.getElementById("perPersonAmount");

let tipPercent = 15;
let people = 1;

function formatEuro(value) {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function recalculate() {
  const bill = Math.max(0, parseFloat(billInput.value) || 0);
  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  const perPerson = total / people;

  tipAmountEl.textContent = formatEuro(tipAmount);
  totalAmountEl.textContent = formatEuro(total);
  perPersonAmountEl.textContent = formatEuro(perPerson);
}

function setTipPercent(value, activeBtn) {
  tipPercent = value;
  Array.from(tipButtons.querySelectorAll("button")).forEach((btn) => {
    btn.classList.toggle("active", btn === activeBtn);
  });
  if (activeBtn) customTipInput.value = "";
  recalculate();
}

billInput.addEventListener("input", recalculate);

tipButtons.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => setTipPercent(Number(btn.dataset.tip), btn));
});

customTipInput.addEventListener("input", () => {
  const value = parseFloat(customTipInput.value);
  if (!Number.isNaN(value) && value >= 0) {
    tipPercent = value;
    tipButtons.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
    recalculate();
  }
});

decreasePeople.addEventListener("click", () => {
  people = Math.max(1, people - 1);
  peopleDisplay.textContent = people;
  recalculate();
});

increasePeople.addEventListener("click", () => {
  people = Math.min(50, people + 1);
  peopleDisplay.textContent = people;
  recalculate();
});

recalculate();
