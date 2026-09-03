const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
  "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
  "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex",
  "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const countInput = document.getElementById("countInput");
const unitInput = document.getElementById("unitInput");
const startInput = document.getElementById("startInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const copyStatus = document.getElementById("copyStatus");
const output = document.getElementById("output");

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeSentence(minWords = 6, maxWords = 14) {
  const length = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length }, randomWord);
  return capitalize(words.join(" ")) + ".";
}

function makeParagraph(minSentences = 4, maxSentences = 8) {
  const length = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
  return Array.from({ length }, () => makeSentence()).join(" ");
}

function generate() {
  const count = Math.min(50, Math.max(1, parseInt(countInput.value, 10) || 1));
  const unit = unitInput.value;
  const startWithLorem = startInput.checked;

  let pieces;
  if (unit === "words") {
    pieces = [Array.from({ length: count }, randomWord).join(" ")];
  } else if (unit === "sentences") {
    pieces = Array.from({ length: count }, () => makeSentence());
  } else {
    pieces = Array.from({ length: count }, () => makeParagraph());
  }

  if (startWithLorem && pieces.length > 0) {
    const opener = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    if (unit === "words") {
      pieces[0] = "Lorem ipsum dolor sit amet " + pieces[0];
    } else {
      pieces[0] = opener + " " + pieces[0].replace(/^\S+/, (m) => m);
    }
  }

  output.innerHTML = "";
  if (unit === "paragraphs") {
    pieces.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      output.appendChild(p);
    });
  } else {
    const p = document.createElement("p");
    p.textContent = unit === "sentences" ? pieces.join(" ") : pieces.join(" ");
    output.appendChild(p);
  }

  copyStatus.textContent = "";
}

async function copyOutput() {
  const text = output.textContent.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "In die Zwischenablage kopiert.";
  } catch (err) {
    copyStatus.textContent = "Kopieren fehlgeschlagen.";
  }
}

generateBtn.addEventListener("click", generate);
copyBtn.addEventListener("click", copyOutput);

generate();
