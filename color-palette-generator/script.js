const baseColorPicker = document.getElementById('baseColor');
const baseColorHex = document.getElementById('baseColorHex');
const schemeTabs = document.getElementById('schemeTabs');
const palette = document.getElementById('palette');

let activeScheme = 'complementary';

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function isValidHex(value) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function buildPalette(hex) {
  const { h, s, l } = hexToHsl(hex);

  switch (activeScheme) {
    case 'complementary':
      return [
        hslToHex(h, s, Math.max(l - 20, 10)),
        hslToHex(h, s, Math.max(l - 8, 10)),
        hslToHex(h, s, l),
        hslToHex(h + 180, s, l),
        hslToHex(h + 180, s, Math.max(l - 15, 10)),
      ];
    case 'analogous':
      return [-30, -15, 0, 15, 30].map((offset) => hslToHex(h + offset, s, l));
    case 'triadic':
      return [
        hslToHex(h, s, l),
        hslToHex(h, s, Math.max(l - 15, 10)),
        hslToHex(h + 120, s, l),
        hslToHex(h + 240, s, l),
        hslToHex(h + 120, s, Math.max(l - 15, 10)),
      ];
    case 'shades':
      return [80, 65, l, Math.max(l - 20, 5), Math.max(l - 40, 5)].map((lightness) =>
        hslToHex(h, s, lightness)
      );
    default:
      return [hex];
  }
}

function render() {
  const hex = baseColorHex.value;
  if (!isValidHex(hex)) return;

  palette.innerHTML = '';
  const colors = buildPalette(hex);

  colors.forEach((color) => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = color;

    const label = document.createElement('span');
    label.className = 'swatch-label';
    label.textContent = color;
    swatch.appendChild(label);

    swatch.addEventListener('click', () => {
      navigator.clipboard?.writeText(color);
      swatch.classList.add('copied');
      setTimeout(() => swatch.classList.remove('copied'), 1200);
    });

    palette.appendChild(swatch);
  });
}

baseColorPicker.addEventListener('input', () => {
  baseColorHex.value = baseColorPicker.value.toUpperCase();
  render();
});

baseColorHex.addEventListener('input', () => {
  const value = baseColorHex.value.trim();
  if (isValidHex(value)) {
    baseColorPicker.value = value;
    render();
  }
});

schemeTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-scheme]');
  if (!btn) return;
  schemeTabs.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  activeScheme = btn.dataset.scheme;
  render();
});

render();
