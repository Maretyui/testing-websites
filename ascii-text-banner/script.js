const textInput = document.getElementById("textInput");
const bannerOutput = document.getElementById("bannerOutput");
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

// Offscreen canvas used purely as a sampling buffer - never attached to the
// page, so it needs no responsive sizing of its own.
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const FONT_SIZE = 64;
const PADDING = 6;
// Each ASCII cell samples a block of source pixels. Rows use a taller block
// than columns because monospace text characters are taller than they are
// wide, so this keeps the rendered banner's proportions close to the
// original glyph shapes instead of squashing them.
const CELL_W = 5;
const CELL_H = 9;
const SHADES = " .:-=+*#%@";

function render(text) {
  if (!text.trim()) {
    bannerOutput.textContent = "";
    return;
  }

  ctx.font = `bold ${FONT_SIZE}px sans-serif`;
  const metrics = ctx.measureText(text);
  const width = Math.max(1, Math.ceil(metrics.width) + PADDING * 2);
  const height = Math.ceil(FONT_SIZE * 1.4);

  canvas.width = width;
  canvas.height = height;

  // Re-apply font/fill after resizing - changing canvas.width/height resets
  // the 2D context's state, so the settings above would otherwise be lost.
  ctx.font = `bold ${FONT_SIZE}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";
  ctx.fillText(text, PADDING, PADDING / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const rows = Math.ceil(height / CELL_H);
  const cols = Math.ceil(width / CELL_W);
  const lines = [];

  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      let sum = 0;
      let count = 0;
      const y0 = row * CELL_H;
      const x0 = col * CELL_W;
      for (let y = y0; y < Math.min(y0 + CELL_H, height); y++) {
        for (let x = x0; x < Math.min(x0 + CELL_W, width); x++) {
          const i = (y * width + x) * 4;
          // Greyscale luminance of this pixel; the canvas was only ever
          // drawn in black-on-white, but a weighted average keeps this
          // correct if that ever changes.
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          count++;
        }
      }
      const brightness = sum / count / 255; // 1 = white, 0 = black
      const darkness = 1 - brightness;
      const shadeIndex = Math.min(
        SHADES.length - 1,
        Math.floor(darkness * SHADES.length)
      );
      line += SHADES[shadeIndex];
    }
    lines.push(line.replace(/\s+$/, ""));
  }

  // Trim fully blank rows top/bottom so the banner isn't padded with empty
  // lines above and below the actual glyph shapes.
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  bannerOutput.textContent = lines.join("\n");
}

textInput.addEventListener("input", () => render(textInput.value));

copyBtn.addEventListener("click", async () => {
  if (!bannerOutput.textContent) return;
  try {
    await navigator.clipboard.writeText(bannerOutput.textContent);
    copiedMsg.textContent = "Banner kopiert!";
  } catch {
    copiedMsg.textContent = "Kopieren fehlgeschlagen.";
  }
  setTimeout(() => {
    copiedMsg.textContent = "";
  }, 2000);
});

render(textInput.value);
