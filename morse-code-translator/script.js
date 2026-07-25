const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "-": "-....-", "/": "-..-.", "@": ".--.-.",
};

const TEXT_MAP = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([letter, code]) => [code, letter])
);

const text = document.getElementById("text");
const morse = document.getElementById("morse");
const status = document.getElementById("status");

function textToMorse() {
  const words = text.value.trim().toUpperCase().split(/\s+/);
  const result = words
    .map((word) =>
      word
        .split("")
        .map((char) => MORSE_MAP[char] ?? "")
        .filter(Boolean)
        .join(" ")
    )
    .join(" / ");
  morse.value = result;
  status.textContent = result ? "Übersetzt in Morsecode" : "Kein übersetzbarer Text";
}

function morseToText() {
  const words = morse.value.trim().split(/\s*\/\s*/);
  const result = words
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((code) => TEXT_MAP[code] ?? "")
        .join("")
    )
    .join(" ");
  text.value = result;
  status.textContent = result ? "Übersetzt in Text" : "Kein gültiger Morsecode";
}

function playMorse() {
  const code = morse.value.trim();
  if (!code) {
    status.textContent = "Nichts zum Abspielen — erst übersetzen";
    return;
  }

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const unit = 0.08;
  let time = audioCtx.currentTime + 0.1;

  const beep = (duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 600;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.2, time);
    osc.start(time);
    osc.stop(time + duration);
    time += duration + unit;
  };

  for (const symbol of code) {
    if (symbol === ".") beep(unit);
    else if (symbol === "-") beep(unit * 3);
    else if (symbol === " ") time += unit * 2;
    else if (symbol === "/") time += unit * 4;
  }

  status.textContent = "Spiele ab...";
  setTimeout(() => {
    status.textContent = "Fertig";
  }, (time - audioCtx.currentTime) * 1000);
}

document.getElementById("toMorse").addEventListener("click", textToMorse);
document.getElementById("toText").addEventListener("click", morseToText);
document.getElementById("play").addEventListener("click", playMorse);
