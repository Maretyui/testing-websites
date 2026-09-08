const textInput = document.getElementById("textInput");
const results = document.getElementById("results");

function splitWords(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

const CONVERTERS = [
  {
    label: "camelCase",
    convert: (words) =>
      words
        .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
        .join(""),
  },
  {
    label: "PascalCase",
    convert: (words) =>
      words.map((word) => word[0].toUpperCase() + word.slice(1)).join(""),
  },
  {
    label: "snake_case",
    convert: (words) => words.join("_"),
  },
  {
    label: "kebab-case",
    convert: (words) => words.join("-"),
  },
  {
    label: "CONSTANT_CASE",
    convert: (words) => words.join("_").toUpperCase(),
  },
  {
    label: "Title Case",
    convert: (words) =>
      words.map((word) => word[0].toUpperCase() + word.slice(1)).join(" "),
  },
  {
    label: "Sentence case",
    convert: (words) => {
      const sentence = words.join(" ");
      return sentence ? sentence[0].toUpperCase() + sentence.slice(1) : "";
    },
  },
];

function render() {
  const words = splitWords(textInput.value);
  results.innerHTML = "";

  if (words.length === 0) return;

  for (const { label, convert } of CONVERTERS) {
    const value = convert(words);

    const row = document.createElement("div");
    row.className = "result-row";

    const labelEl = document.createElement("span");
    labelEl.className = "label";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.className = "value";
    valueEl.textContent = value;

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "Kopieren";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
        copyBtn.textContent = "Kopiert!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "Kopieren";
          copyBtn.classList.remove("copied");
        }, 1200);
      } catch {
        copyBtn.textContent = "Fehler";
      }
    });

    row.append(labelEl, valueEl, copyBtn);
    results.appendChild(row);
  }
}

textInput.addEventListener("input", render);
