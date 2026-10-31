const previewBox = document.getElementById("previewBox");
const offsetXInput = document.getElementById("offsetX");
const offsetYInput = document.getElementById("offsetY");
const blurInput = document.getElementById("blur");
const spreadInput = document.getElementById("spread");
const opacityInput = document.getElementById("opacity");
const colorInput = document.getElementById("color");
const insetInput = document.getElementById("inset");
const randomizeBtn = document.getElementById("randomizeBtn");
const codeEl = document.getElementById("code");
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

const offsetXValue = document.getElementById("offsetXValue");
const offsetYValue = document.getElementById("offsetYValue");
const blurValue = document.getElementById("blurValue");
const spreadValue = document.getElementById("spreadValue");
const opacityValue = document.getElementById("opacityValue");

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function buildShadowCss() {
  const x = Number(offsetXInput.value);
  const y = Number(offsetYInput.value);
  const blur = Number(blurInput.value);
  const spread = Number(spreadInput.value);
  const alpha = Number(opacityInput.value) / 100;
  const { r, g, b } = hexToRgb(colorInput.value);
  const insetPart = insetInput.checked ? "inset " : "";

  return `${insetPart}${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

function update() {
  offsetXValue.textContent = `${offsetXInput.value}px`;
  offsetYValue.textContent = `${offsetYInput.value}px`;
  blurValue.textContent = `${blurInput.value}px`;
  spreadValue.textContent = `${spreadInput.value}px`;
  opacityValue.textContent = `${opacityInput.value}%`;

  const shadow = buildShadowCss();
  previewBox.style.boxShadow = shadow;
  codeEl.value = `box-shadow: ${shadow};`;
}

[offsetXInput, offsetYInput, blurInput, spreadInput, opacityInput, colorInput, insetInput].forEach((input) => {
  input.addEventListener("input", update);
});

randomizeBtn.addEventListener("click", () => {
  offsetXInput.value = String(Math.floor(Math.random() * 41) - 20);
  offsetYInput.value = String(Math.floor(Math.random() * 41) - 20);
  blurInput.value = String(Math.floor(Math.random() * 60) + 5);
  spreadInput.value = String(Math.floor(Math.random() * 21) - 10);
  opacityInput.value = String(Math.floor(Math.random() * 60) + 15);
  update();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeEl.value);
  } catch (err) {
    codeEl.select();
    document.execCommand("copy");
  }
  copiedMsg.textContent = "In Zwischenablage kopiert";
  setTimeout(() => {
    copiedMsg.textContent = "";
  }, 1500);
});

update();
