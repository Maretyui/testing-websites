const minSizeInput = document.getElementById('minSize');
const minWidthInput = document.getElementById('minWidth');
const maxSizeInput = document.getElementById('maxSize');
const maxWidthInput = document.getElementById('maxWidth');
const viewportSim = document.getElementById('viewportSim');
const viewportSimValue = document.getElementById('viewportSimValue');
const previewText = document.getElementById('previewText');
const codeEl = document.getElementById('code');
const copyBtn = document.getElementById('copyBtn');
const copiedMsg = document.getElementById('copiedMsg');

const ROOT_PX = 16;

function readValues() {
  return {
    minSize: parseFloat(minSizeInput.value) || 0,
    minWidth: parseFloat(minWidthInput.value) || 1,
    maxSize: parseFloat(maxSizeInput.value) || 0,
    maxWidth: parseFloat(maxWidthInput.value) || 1,
  };
}

function buildClamp({ minSize, minWidth, maxSize, maxWidth }) {
  const lo = { size: minSize, width: minWidth };
  const hi = { size: maxSize, width: maxWidth };
  if (lo.width > hi.width) [lo.width, hi.width] = [hi.width, lo.width];
  if (lo.size > hi.size) {
    // keep size/width pairing consistent with their own width, only reorder if needed by width swap above
  }

  const slope = (hi.size - lo.size) / (hi.width - lo.width || 1);
  const intersection = lo.size - slope * lo.width;
  const slopeVw = slope * 100;

  const minRem = (Math.min(minSize, maxSize) / ROOT_PX).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  const maxRem = (Math.max(minSize, maxSize) / ROOT_PX).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  const intersectionRem = (intersection / ROOT_PX).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  const slopeVwStr = slopeVw.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

  const preferred = `${intersectionRem}rem + ${slopeVwStr}vw`;
  return {
    css: `font-size: clamp(${minRem}rem, ${preferred}, ${maxRem}rem);`,
    fontSizeAt(viewportWidth) {
      const px = intersection + slope * viewportWidth;
      return Math.min(Math.max(px, Math.min(minSize, maxSize)), Math.max(minSize, maxSize));
    },
  };
}

function render() {
  const values = readValues();
  const clamp = buildClamp(values);

  codeEl.value = clamp.css;

  const vw = parseFloat(viewportSim.value);
  viewportSimValue.textContent = `${vw}px`;
  previewText.style.fontSize = `${clamp.fontSizeAt(vw)}px`;
}

[minSizeInput, minWidthInput, maxSizeInput, maxWidthInput, viewportSim].forEach((el) => {
  el.addEventListener('input', render);
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(codeEl.value);
  copiedMsg.textContent = 'In Zwischenablage kopiert.';
  setTimeout(() => { copiedMsg.textContent = ''; }, 1600);
});

render();
