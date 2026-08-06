const arabicInput = document.getElementById("arabicInput");
const romanInput = document.getElementById("romanInput");
const errorMsg = document.getElementById("errorMsg");

const VALUES = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num) {
  let result = "";
  let remaining = num;
  for (const [value, symbol] of VALUES) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

function fromRoman(str) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const upper = str.toUpperCase();
  if (!/^[IVXLCDM]+$/.test(upper)) return null;

  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const current = map[upper[i]];
    const next = map[upper[i + 1]];
    if (next && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }

  // round-trip check: reject malformed numerals like "IIII" or "VV"
  if (toRoman(total) !== upper) return null;
  return total;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.toggle("hidden", !message);
}

let syncing = false;

arabicInput.addEventListener("input", () => {
  if (syncing) return;
  showError("");
  const raw = arabicInput.value.trim();
  if (raw === "") {
    syncing = true;
    romanInput.value = "";
    syncing = false;
    return;
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 1 || num > 3999) {
    showError("Bitte eine ganze Zahl zwischen 1 und 3999 eingeben.");
    return;
  }
  syncing = true;
  romanInput.value = toRoman(num);
  syncing = false;
});

romanInput.addEventListener("input", () => {
  if (syncing) return;
  showError("");
  const raw = romanInput.value.trim();
  if (raw === "") {
    syncing = true;
    arabicInput.value = "";
    syncing = false;
    return;
  }
  const num = fromRoman(raw);
  if (num === null) {
    showError("Keine gültige römische Zahl.");
    return;
  }
  syncing = true;
  arabicInput.value = num;
  syncing = false;
});
