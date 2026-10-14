const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;

const RSlider = document.getElementById("RSlider");
const rSlider = document.getElementById("rSlider");
const dSlider = document.getElementById("dSlider");
const RValue = document.getElementById("RValue");
const rValue = document.getElementById("rValue");
const dValue = document.getElementById("dValue");

const DEFAULTS = { R: 220, r: 70, d: 120 };

let animFrame = null;

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function point(R, r, d, t) {
  const k = R - r;
  return {
    x: k * Math.cos(t) + d * Math.cos((k / r) * t),
    y: k * Math.sin(t) - d * Math.sin((k / r) * t),
  };
}

function startDrawing() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }

  const R = Number(RSlider.value);
  const r = Number(rSlider.value);
  const d = Number(dSlider.value);

  const maxExtent = (R - r) + d || 1;
  const scale = Math.min(1, (Math.min(CX, CY) - 15) / maxExtent);

  const divisor = gcd(R, r);
  const loops = r / divisor;
  const tMax = 2 * Math.PI * loops;
  // Cap the sample count so wildly coprime R/r combos (many loops) still
  // finish drawing in a reasonable number of frames instead of crawling.
  const steps = Math.min(4000, Math.max(200, Math.round(loops * 240)));
  const dt = tMax / steps;

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#e0aaff";
  ctx.lineWidth = 1.75;
  ctx.beginPath();

  let t = 0;
  let first = true;
  let stepsPerFrame = Math.max(1, Math.round(steps / 240));

  function frame() {
    for (let i = 0; i < stepsPerFrame && t <= tMax; i++) {
      const p = point(R, r, d, t);
      const x = CX + p.x * scale;
      const y = CY + p.y * scale;
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
      t += dt;
    }
    ctx.stroke();

    if (t <= tMax) {
      animFrame = requestAnimationFrame(frame);
    } else {
      animFrame = null;
    }
  }

  animFrame = requestAnimationFrame(frame);
}

function syncLabels() {
  RValue.textContent = RSlider.value;
  rValue.textContent = rSlider.value;
  dValue.textContent = dSlider.value;
}

[RSlider, rSlider, dSlider].forEach((slider) => {
  slider.addEventListener("input", () => {
    syncLabels();
    startDrawing();
  });
});

document.getElementById("randomizeBtn").addEventListener("click", () => {
  RSlider.value = String(100 + Math.floor(Math.random() * 161));
  rSlider.value = String(10 + Math.floor(Math.random() * 141));
  dSlider.value = String(Math.floor(Math.random() * 201));
  syncLabels();
  startDrawing();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  RSlider.value = String(DEFAULTS.R);
  rSlider.value = String(DEFAULTS.r);
  dSlider.value = String(DEFAULTS.d);
  syncLabels();
  startDrawing();
});

syncLabels();
startDrawing();
