const textInput = document.getElementById("textInput");
const shiftInput = document.getElementById("shiftInput");
const outputText = document.getElementById("outputText");
const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const bruteForce = document.getElementById("bruteForce");

const A = "A".charCodeAt(0);
const a = "a".charCodeAt(0);

function shiftText(text, shift) {
  const normalizedShift = ((shift % 26) + 26) % 26;
  let result = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= A && code <= A + 25) {
      result += String.fromCharCode(((code - A + normalizedShift) % 26) + A);
    } else if (code >= a && code <= a + 25) {
      result += String.fromCharCode(((code - a + normalizedShift) % 26) + a);
    } else {
      result += ch;
    }
  }
  return result;
}

function renderBruteForce() {
  const text = textInput.value;
  bruteForce.innerHTML = "";
  for (let shift = 0; shift < 26; shift++) {
    const row = document.createElement("div");
    row.className = "brute-force-row";
    const label = document.createElement("span");
    label.className = "shift-label";
    label.textContent = shift;
    const shifted = document.createElement("span");
    shifted.className = "shift-text";
    shifted.textContent = text ? shiftText(text, shift) : "";
    row.appendChild(label);
    row.appendChild(shifted);
    bruteForce.appendChild(row);
  }
}

encryptBtn.addEventListener("click", () => {
  const shift = parseInt(shiftInput.value, 10) || 0;
  outputText.value = shiftText(textInput.value, shift);
});

decryptBtn.addEventListener("click", () => {
  const shift = parseInt(shiftInput.value, 10) || 0;
  outputText.value = shiftText(textInput.value, -shift);
});

textInput.addEventListener("input", renderBruteForce);

renderBruteForce();
