const tabs = document.querySelectorAll(".tab");
const keyInput = document.getElementById("key");
const textInput = document.getElementById("text");
const output = document.getElementById("output");
const gridEl = document.getElementById("grid");
const noteEl = document.getElementById("note");

let mode = "encrypt";

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    mode = tab.dataset.mode;
    update();
  });
});

function buildSquare(key) {
  const normalized = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const seen = new Set();
  const letters = [];

  for (const ch of normalized) {
    if (!seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
  }
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    if (ch === "J") continue;
    if (!seen.has(ch)) {
      seen.add(ch);
      letters.push(ch);
    }
  }

  const square = [];
  const position = {};
  for (let r = 0; r < 5; r++) {
    square.push(letters.slice(r * 5, r * 5 + 5));
    for (let c = 0; c < 5; c++) {
      position[letters[r * 5 + c]] = [r, c];
    }
  }
  return { square, position };
}

function renderSquare(square) {
  gridEl.innerHTML = "";
  for (const row of square) {
    for (const letter of row) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = letter;
      gridEl.appendChild(cell);
    }
  }
}

function toDigraphs(text) {
  const letters = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const pairs = [];
  let i = 0;
  while (i < letters.length) {
    const a = letters[i];
    const b = letters[i + 1];
    if (!b) {
      pairs.push([a, "X"]);
      i += 1;
    } else if (a === b) {
      pairs.push([a, "X"]);
      i += 1;
    } else {
      pairs.push([a, b]);
      i += 2;
    }
  }
  return pairs;
}

function shift(n, by) {
  return ((n + by) % 5 + 5) % 5;
}

function playfair(text, key, decrypt) {
  const { square, position } = buildSquare(key);
  renderSquare(square);

  const pairs = toDigraphs(text);
  const dir = decrypt ? -1 : 1;
  let result = "";

  for (const [a, b] of pairs) {
    const [ra, ca] = position[a];
    const [rb, cb] = position[b];

    if (ra === rb) {
      result += square[ra][shift(ca, dir)];
      result += square[rb][shift(cb, dir)];
    } else if (ca === cb) {
      result += square[shift(ra, dir)][ca];
      result += square[shift(rb, dir)][cb];
    } else {
      result += square[ra][cb];
      result += square[rb][ca];
    }
  }

  return result;
}

function update() {
  const key = keyInput.value;
  const text = textInput.value;

  if (!key.replace(/[^A-Za-z]/g, "") || !text.replace(/[^A-Za-z]/g, "")) {
    output.value = "";
    noteEl.textContent = "";
    renderSquare(buildSquare(key || "").square);
    return;
  }

  output.value = playfair(text, key, mode === "decrypt");
  noteEl.textContent = "Doppelte Buchstaben im selben Paar und eine ungerade Gesamtlänge werden automatisch mit X aufgefüllt — das Ergebnis kann daher länger als der Eingabetext sein.";
}

keyInput.addEventListener("input", update);
textInput.addEventListener("input", update);

renderSquare(buildSquare("").square);
