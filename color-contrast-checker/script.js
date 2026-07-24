const fgColor = document.getElementById("fg");
const bgColor = document.getElementById("bg");
const fgHex = document.getElementById("fgHex");
const bgHex = document.getElementById("bgHex");
const preview = document.getElementById("preview");
const ratioEl = document.getElementById("ratio");
const checksEl = document.getElementById("checks");

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function isValidHex(hex) {
  return /^#([0-9a-f]{6})$/i.test(hex);
}

function relativeLuminance({ r, g, b }) {
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

const thresholds = [
  { label: "AA — normaler Text (4.5:1)", min: 4.5 },
  { label: "AA — großer Text (3:1)", min: 3 },
  { label: "AAA — normaler Text (7:1)", min: 7 },
  { label: "AAA — großer Text (4.5:1)", min: 4.5 },
];

function update() {
  const fg = fgHex.value;
  const bg = bgHex.value;
  if (!isValidHex(fg) || !isValidHex(bg)) return;

  preview.style.color = fg;
  preview.style.background = bg;

  const ratio = contrastRatio(fg, bg);
  ratioEl.textContent = `${ratio.toFixed(2)} : 1`;

  checksEl.innerHTML = "";
  thresholds.forEach(({ label, min }) => {
    const li = document.createElement("li");
    const passes = ratio >= min;
    li.className = passes ? "pass" : "fail";
    li.textContent = `${passes ? "✓" : "✗"} ${label}`;
    checksEl.appendChild(li);
  });
}

fgColor.addEventListener("input", () => {
  fgHex.value = fgColor.value;
  update();
});
bgColor.addEventListener("input", () => {
  bgHex.value = bgColor.value;
  update();
});
fgHex.addEventListener("input", () => {
  if (isValidHex(fgHex.value)) fgColor.value = fgHex.value;
  update();
});
bgHex.addEventListener("input", () => {
  if (isValidHex(bgHex.value)) bgColor.value = bgHex.value;
  update();
});

update();
