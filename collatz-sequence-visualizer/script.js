const startInput = document.getElementById("start");
const runBtn = document.getElementById("runBtn");
const summaryEl = document.getElementById("summary");
const sequenceEl = document.getElementById("sequence");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

function collatzSequence(n) {
  const sequence = [n];
  let steps = 0;
  const maxSteps = 100000;
  while (n !== 1 && steps < maxSteps) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    sequence.push(n);
    steps++;
  }
  return sequence;
}

function drawChart(sequence) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const padding = 30;
  const max = Math.max(...sequence);
  const stepX = (width - padding * 2) / Math.max(1, sequence.length - 1);

  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();

  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  sequence.forEach((value, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (value / max) * (height - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#6b7280";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText("0", padding - 4, height - padding + 14);
  ctx.fillText(String(sequence.length - 1), width - padding - 10, height - padding + 14);
  ctx.fillText(String(max), 2, padding + 4);
}

function run() {
  const n = Math.max(1, Math.min(1000000, Math.floor(Number(startInput.value) || 1)));
  startInput.value = n;

  const sequence = collatzSequence(n);
  const peak = Math.max(...sequence);

  summaryEl.textContent = `${sequence.length - 1} Schritte bis zur 1, Höchstwert ${peak.toLocaleString("de-DE")}.`;
  drawChart(sequence);
  sequenceEl.textContent = sequence.length <= 200
    ? sequence.join(" → ")
    : sequence.slice(0, 200).join(" → ") + ` → … (${sequence.length - 200} weitere Schritte)`;
}

runBtn.addEventListener("click", run);
startInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
});

run();
