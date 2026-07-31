const PASSAGES = [
  "Der schnelle braune Fuchs springt über den faulen Hund und verschwindet im dichten Wald.",
  "Programmieren bedeutet, Probleme in kleine, verständliche Schritte zu zerlegen und geduldig zu testen.",
  "Am Ende des Tages zählt nicht die Geschwindigkeit allein, sondern auch die Genauigkeit deiner Arbeit.",
  "Ein guter Entwickler liest mehr Code, als er schreibt, und lernt aus jedem Fehler, den er macht.",
  "Kaffee, Musik und ein ruhiger Raum sind für viele Menschen die perfekte Umgebung zum konzentrierten Arbeiten.",
  "Die Sonne ging langsam unter, während die Wellen sanft gegen die Felsen an der Küste schlugen.",
  "Wer regelmäßig übt, wird mit der Zeit automatisch schneller und macht dabei auch weniger Fehler.",
  "Manchmal ist der einfachste Weg auch der schnellste, auch wenn er zunächst unscheinbar wirkt.",
];

const textDisplay = document.getElementById("textDisplay");
const typedInput = document.getElementById("typedInput");
const status = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const wpmValue = document.getElementById("wpmValue");
const accuracyValue = document.getElementById("accuracyValue");
const timeValue = document.getElementById("timeValue");
const errorsValue = document.getElementById("errorsValue");

let target = "";
let startTime = null;
let timerId = null;
let finished = false;
let errorCount = 0;

function pickPassage() {
  const others = PASSAGES.filter((p) => p !== target);
  const pool = others.length ? others : PASSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderTarget() {
  textDisplay.innerHTML = "";
  target.split("").forEach((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;
    textDisplay.appendChild(span);
  });
}

function updateHighlight() {
  const typed = typedInput.value;
  const spans = textDisplay.querySelectorAll(".char");
  let correct = 0;

  spans.forEach((span, i) => {
    span.classList.remove("correct", "incorrect", "current");
    if (i < typed.length) {
      if (typed[i] === target[i]) {
        span.classList.add("correct");
        correct++;
      } else {
        span.classList.add("incorrect");
      }
    } else if (i === typed.length) {
      span.classList.add("current");
    }
  });

  return correct;
}

function elapsedMinutes() {
  if (!startTime) return 0;
  return (Date.now() - startTime) / 60000;
}

function updateStats(correctChars) {
  const typed = typedInput.value;
  const minutes = elapsedMinutes();
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;

  wpmValue.textContent = String(wpm);
  accuracyValue.textContent = `${accuracy}%`;
  errorsValue.textContent = String(errorCount);
}

function tick() {
  if (!startTime || finished) return;
  timeValue.textContent = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
  updateStats(updateHighlight());
}

function finish() {
  finished = true;
  clearInterval(timerId);
  typedInput.disabled = true;
  const correct = updateHighlight();
  updateStats(correct);
  status.textContent = `Fertig! ${wpmValue.textContent} WPM bei ${accuracyValue.textContent} Genauigkeit.`;
  status.className = "status ok";
}

function reset() {
  target = pickPassage();
  startTime = null;
  finished = false;
  errorCount = 0;
  clearInterval(timerId);
  timerId = null;
  typedInput.disabled = false;
  typedInput.value = "";
  wpmValue.textContent = "0";
  accuracyValue.textContent = "100%";
  timeValue.textContent = "0.0s";
  errorsValue.textContent = "0";
  status.textContent = "Bereit – beginne einfach zu tippen";
  status.className = "status";
  renderTarget();
  typedInput.focus();
}

typedInput.addEventListener("input", (event) => {
  if (finished) return;

  if (!startTime) {
    startTime = Date.now();
    timerId = setInterval(tick, 100);
  }

  if (typedInput.value.length > target.length) {
    typedInput.value = typedInput.value.slice(0, target.length);
  }

  if (event.inputType === "insertText" || event.inputType === "insertCompositionText") {
    const lastIndex = typedInput.value.length - 1;
    if (lastIndex >= 0 && typedInput.value[lastIndex] !== target[lastIndex]) {
      errorCount++;
    }
  }

  const correct = updateHighlight();
  updateStats(correct);

  if (typedInput.value.length === target.length) {
    finish();
  }
});

restartBtn.addEventListener("click", reset);

reset();
