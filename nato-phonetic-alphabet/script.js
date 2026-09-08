const NATO = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
  M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
  X: "X-ray", Y: "Yankee", Z: "Zulu",
  0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four",
  5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Niner",
};

const REVERSE = {};
for (const [letter, word] of Object.entries(NATO)) {
  REVERSE[word.toLowerCase()] = letter;
}

const textInput = document.getElementById("textInput");
const natoOutput = document.getElementById("natoOutput");
const natoInput = document.getElementById("natoInput");
const textOutput = document.getElementById("textOutput");
const toNatoTab = document.getElementById("toNatoTab");
const toTextTab = document.getElementById("toTextTab");
const toNatoPanel = document.getElementById("toNatoPanel");
const toTextPanel = document.getElementById("toTextPanel");
const referenceGrid = document.getElementById("referenceGrid");

function renderTextToNato() {
  const value = textInput.value;
  natoOutput.innerHTML = "";
  if (!value.trim()) return;

  for (const char of value) {
    if (char === " ") {
      natoOutput.appendChild(document.createTextNode("   "));
      continue;
    }
    const upper = char.toUpperCase();
    const span = document.createElement("span");
    span.className = "word";
    if (NATO[upper]) {
      span.textContent = NATO[upper];
    } else {
      span.textContent = char;
      span.classList.add("unknown");
    }
    natoOutput.appendChild(span);
  }
}

function renderNatoToText() {
  const value = natoInput.value.trim();
  textOutput.innerHTML = "";
  if (!value) return;

  const tokens = value.split(/\s+/);
  let result = "";
  for (const token of tokens) {
    const key = token.toLowerCase().replace(/[.,]/g, "");
    if (REVERSE[key] !== undefined) {
      result += REVERSE[key];
    } else {
      const span = document.createElement("span");
      span.className = "word unknown";
      span.textContent = token + "?";
      textOutput.appendChild(span);
      continue;
    }
  }
  if (result) {
    const span = document.createElement("span");
    span.textContent = result;
    textOutput.prepend(span);
  }
}

function buildReferenceTable() {
  for (const [key, word] of Object.entries(NATO)) {
    const cell = document.createElement("div");
    cell.innerHTML = `<strong>${key}</strong> — ${word}`;
    referenceGrid.appendChild(cell);
  }
}

function switchTab(target) {
  const showNato = target === "toNato";
  toNatoTab.classList.toggle("active", showNato);
  toTextTab.classList.toggle("active", !showNato);
  toNatoTab.setAttribute("aria-selected", String(showNato));
  toTextTab.setAttribute("aria-selected", String(!showNato));
  toNatoPanel.hidden = !showNato;
  toTextPanel.hidden = showNato;
}

textInput.addEventListener("input", renderTextToNato);
natoInput.addEventListener("input", renderNatoToText);
toNatoTab.addEventListener("click", () => switchTab("toNato"));
toTextTab.addEventListener("click", () => switchTab("toText"));

buildReferenceTable();
