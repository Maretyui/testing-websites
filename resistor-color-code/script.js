const DIGIT_COLORS = [
  { name: "Schwarz", hex: "#1a1a1a", value: 0 },
  { name: "Braun", hex: "#7b4a1e", value: 1 },
  { name: "Rot", hex: "#d13b2f", value: 2 },
  { name: "Orange", hex: "#e8791a", value: 3 },
  { name: "Gelb", hex: "#e8c81a", value: 4 },
  { name: "Grün", hex: "#3a9e3a", value: 5 },
  { name: "Blau", hex: "#2f5fd1", value: 6 },
  { name: "Violett", hex: "#7b2fd1", value: 7 },
  { name: "Grau", hex: "#8a8a8a", value: 8 },
  { name: "Weiß", hex: "#f2f2f2", value: 9 },
];

const MULTIPLIER_COLORS = [
  ...DIGIT_COLORS.map((c) => ({ ...c, multiplier: 10 ** c.value })),
  { name: "Gold", hex: "#d4af37", multiplier: 0.1 },
  { name: "Silber", hex: "#c0c0c0", multiplier: 0.01 },
];

const TOLERANCE_COLORS = [
  { name: "Braun (±1%)", hex: "#7b4a1e", tolerance: 1 },
  { name: "Rot (±2%)", hex: "#d13b2f", tolerance: 2 },
  { name: "Gold (±5%)", hex: "#d4af37", tolerance: 5 },
  { name: "Silber (±10%)", hex: "#c0c0c0", tolerance: 10 },
];

const digit1Select = document.getElementById("digit1");
const digit2Select = document.getElementById("digit2");
const multiplierSelect = document.getElementById("multiplier");
const toleranceSelect = document.getElementById("tolerance");
const resultText = document.getElementById("resultText");
const valueInput = document.getElementById("valueInput");
const applyBtn = document.getElementById("applyBtn");

const band1 = document.getElementById("band1");
const band2 = document.getElementById("band2");
const band3 = document.getElementById("band3");
const band4 = document.getElementById("band4");

function populate(select, colors, labelKey) {
  select.innerHTML = colors
    .map((c, i) => `<option value="${i}">${c.name}</option>`)
    .join("");
}

populate(digit1Select, DIGIT_COLORS);
populate(digit2Select, DIGIT_COLORS);
populate(multiplierSelect, MULTIPLIER_COLORS);
populate(toleranceSelect, TOLERANCE_COLORS);

digit1Select.value = 4; // yellow
digit2Select.value = 7; // violet
multiplierSelect.value = 2; // x100 -> 4700
toleranceSelect.value = 2; // gold

function formatOhms(ohms) {
  if (ohms >= 1_000_000) return `${trim(ohms / 1_000_000)} MΩ`;
  if (ohms >= 1_000) return `${trim(ohms / 1_000)} kΩ`;
  return `${trim(ohms)} Ω`;
}

function trim(n) {
  return Number(n.toFixed(3)).toString().replace(".", ",");
}

function render() {
  const d1 = DIGIT_COLORS[digit1Select.value];
  const d2 = DIGIT_COLORS[digit2Select.value];
  const mult = MULTIPLIER_COLORS[multiplierSelect.value];
  const tol = TOLERANCE_COLORS[toleranceSelect.value];

  band1.style.background = d1.hex;
  band2.style.background = d2.hex;
  band3.style.background = mult.hex;
  band4.style.background = tol.hex;

  const base = d1.value * 10 + d2.value;
  const ohms = base * mult.multiplier;

  resultText.textContent = `${formatOhms(ohms)} ± ${tol.tolerance}%`;
}

[digit1Select, digit2Select, multiplierSelect, toleranceSelect].forEach((el) =>
  el.addEventListener("change", render)
);

function closestIndex(colors, key, target) {
  let bestIndex = 0;
  let bestDiff = Infinity;
  colors.forEach((c, i) => {
    const diff = Math.abs(c[key] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  });
  return bestIndex;
}

applyBtn.addEventListener("click", () => {
  const target = parseFloat(valueInput.value);
  if (!Number.isFinite(target) || target <= 0) return;

  let bestMultIndex = 0;
  let bestBase = 0;
  let bestDiff = Infinity;

  MULTIPLIER_COLORS.forEach((mult, mIndex) => {
    const rawBase = target / mult.multiplier;
    const base = Math.min(99, Math.max(0, Math.round(rawBase)));
    const approx = base * mult.multiplier;
    const diff = Math.abs(approx - target);
    if (base >= 10 && base <= 99 && diff < bestDiff) {
      bestDiff = diff;
      bestMultIndex = mIndex;
      bestBase = base;
    }
  });

  digit1Select.value = Math.floor(bestBase / 10);
  digit2Select.value = bestBase % 10;
  multiplierSelect.value = bestMultIndex;
  render();
});

render();
