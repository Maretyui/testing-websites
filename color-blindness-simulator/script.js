const MATRICES = {
  protanopia: [
    0.567, 0.433, 0.000,
    0.558, 0.442, 0.000,
    0.000, 0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0.000,
    0.700, 0.300, 0.000,
    0.000, 0.300, 0.700,
  ],
  tritanopia: [
    0.950, 0.050, 0.000,
    0.000, 0.433, 0.567,
    0.000, 0.475, 0.525,
  ],
};

const canvases = {
  normal: document.getElementById("canvas-normal"),
  protanopia: document.getElementById("canvas-protanopia"),
  deuteranopia: document.getElementById("canvas-deuteranopia"),
  tritanopia: document.getElementById("canvas-tritanopia"),
  achromatopsia: document.getElementById("canvas-achromatopsia"),
};

function applyMatrix(imageData, m) {
  const out = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  const src = imageData.data;
  const dst = out.data;
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    dst[i] = m[0] * r + m[1] * g + m[2] * b;
    dst[i + 1] = m[3] * r + m[4] * g + m[5] * b;
    dst[i + 2] = m[6] * r + m[7] * g + m[8] * b;
  }
  return out;
}

function applyGrayscale(imageData) {
  const out = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  const src = imageData.data;
  const dst = out.data;
  for (let i = 0; i < src.length; i += 4) {
    const gray = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    dst[i] = gray;
    dst[i + 1] = gray;
    dst[i + 2] = gray;
  }
  return out;
}

function render(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const scale = Math.min(1, 360 / w);
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  canvases.normal.width = cw;
  canvases.normal.height = ch;
  const ctxNormal = canvases.normal.getContext("2d");
  ctxNormal.drawImage(img, 0, 0, cw, ch);
  const base = ctxNormal.getImageData(0, 0, cw, ch);

  for (const key of Object.keys(MATRICES)) {
    const canvas = canvases[key];
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(applyMatrix(base, MATRICES[key]), 0, 0);
  }

  const achroCanvas = canvases.achromatopsia;
  achroCanvas.width = cw;
  achroCanvas.height = ch;
  achroCanvas.getContext("2d").putImageData(applyGrayscale(base), 0, 0);
}

function loadSample() {
  const w = 360;
  const h = 220;
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");

  const swatches = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];
  const cols = 4;
  const cellW = w / cols;
  const cellH = h / Math.ceil(swatches.length / cols);
  swatches.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect((i % cols) * cellW, Math.floor(i / cols) * cellH, cellW, cellH);
  });

  const img = new Image();
  img.onload = () => render(img);
  img.src = off.toDataURL();
}

document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => render(img);
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("sampleBtn").addEventListener("click", loadSample);

loadSample();
