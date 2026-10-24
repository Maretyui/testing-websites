const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const canvasWrap = document.getElementById("canvasWrap");
const canvas = document.getElementById("picker");
const crosshair = document.getElementById("crosshair");
const current = document.getElementById("current");
const currentSwatch = document.getElementById("currentSwatch");
const currentHex = document.getElementById("currentHex");
const currentRgb = document.getElementById("currentRgb");
const copyCurrentBtn = document.getElementById("copyCurrent");
const historyEl = document.getElementById("history");
const emptyHint = document.getElementById("emptyHint");

const ctx = canvas.getContext("2d", { willReadFrequently: true });
const MAX_DIMENSION = 900;
const history = [];
let lastPickedHex = null;

function toHex(n) {
  return n.toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    canvasWrap.hidden = false;
    fileLabel.textContent = file.name;
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
});

function canvasPointFromEvent(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
  return {
    x: Math.min(canvas.width - 1, Math.max(0, Math.round(x))),
    y: Math.min(canvas.height - 1, Math.max(0, Math.round(y))),
    cssX: evt.clientX - rect.left,
    cssY: evt.clientY - rect.top
  };
}

function pickAt(evt) {
  const point = canvasPointFromEvent(evt);
  const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

  current.hidden = false;
  currentSwatch.style.background = hex;
  currentHex.textContent = hex;
  currentRgb.textContent = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

  crosshair.hidden = false;
  crosshair.style.left = `${point.cssX}px`;
  crosshair.style.top = `${point.cssY}px`;

  lastPickedHex = hex;
  if (history[0] !== hex) addToHistory(hex);
}

function addToHistory(hex) {
  history.unshift(hex);
  if (history.length > 24) history.pop();
  renderHistory();
}

function renderHistory() {
  emptyHint.hidden = history.length > 0;
  historyEl.innerHTML = "";
  for (const hex of history) {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = hex;
    swatch.title = hex;
    swatch.addEventListener("click", () => copyHex(hex, swatch));
    historyEl.appendChild(swatch);
  }
}

async function copyHex(hex, el) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = hex;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  if (el) {
    el.classList.add("copied");
    setTimeout(() => el.classList.remove("copied"), 900);
  }
}

canvas.addEventListener("pointerdown", pickAt);

copyCurrentBtn.addEventListener("click", () => {
  if (lastPickedHex) copyHex(lastPickedHex, null);
});
