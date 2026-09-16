const optionsInput = document.getElementById('optionsInput');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

let rotation = 0;
let spinning = false;

function getOptions() {
  return optionsInput.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
}

function drawWheel() {
  const options = getOptions();
  const rect = canvas.getBoundingClientRect();
  const size = rect.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  ctx.clearRect(0, 0, size, size);
  if (options.length === 0) return;

  const seg = (Math.PI * 2) / options.length;

  options.forEach((label, i) => {
    const start = i * seg - Math.PI / 2;
    const end = start + seg;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#111827';
    ctx.font = `600 ${Math.max(11, size / 28)}px system-ui, sans-serif`;
    ctx.fillText(truncate(label, 16), radius - 10, 0);
    ctx.restore();
  });
}

function spin() {
  const options = getOptions();

  if (options.length < 2) {
    resultEl.textContent = 'Bitte mindestens 2 Optionen eintragen.';
    return;
  }
  if (spinning) return;

  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = '';

  const seg = 360 / options.length;
  const winningIndex = Math.floor(Math.random() * options.length);

  // The wheel is drawn with slice 0 starting at the top (-90deg) and
  // going clockwise. A CSS rotation of R moves a point that was at
  // canvas angle "a" to physical angle "a + R". The pointer sits at
  // the physical top (-90deg), so solve for the rotation that brings
  // the winning slice's center there, then add a few full turns so
  // the spin always visibly moves forward.
  const winningCenter = winningIndex * seg + seg / 2;
  const targetMod = ((-winningCenter % 360) + 360) % 360;
  const currentMod = ((rotation % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;

  const extraSpins = 6;
  rotation += extraSpins * 360 + delta;

  canvas.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.65, 0.15, 1)';
  canvas.style.transform = `rotate(${rotation}deg)`;

  canvas.addEventListener(
    'transitionend',
    () => {
      spinning = false;
      spinBtn.disabled = false;
      resultEl.textContent = `Ergebnis: ${options[winningIndex]}`;
    },
    { once: true }
  );
}

optionsInput.addEventListener('input', () => {
  if (!spinning) drawWheel();
});
window.addEventListener('resize', sizeCanvas);
spinBtn.addEventListener('click', spin);

sizeCanvas();
