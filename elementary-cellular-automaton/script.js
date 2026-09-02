const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');
const ruleInput = document.getElementById('ruleInput');
const startSelect = document.getElementById('startSelect');
const randomRuleBtn = document.getElementById('randomRuleBtn');
const presetButtons = document.querySelectorAll('.preset-btn');
const rulePreview = document.getElementById('rulePreview');

const CELL_SIZE = 3;
const COLS = canvas.width / CELL_SIZE;
const ROWS = canvas.height / CELL_SIZE;

function clampRule(value) {
  const n = Math.trunc(Number(value));
  if (Number.isNaN(n)) return 30;
  return Math.min(255, Math.max(0, n));
}

function ruleOutputs(rule) {
  // Index 0 = pattern 111 (leftmost bit), Index 7 = pattern 000.
  const outputs = [];
  for (let pattern = 7; pattern >= 0; pattern--) {
    outputs.push((rule >> pattern) & 1);
  }
  return outputs;
}

function firstRow(mode) {
  const row = new Uint8Array(COLS);
  if (mode === 'random') {
    for (let i = 0; i < COLS; i++) row[i] = Math.random() < 0.5 ? 1 : 0;
  } else {
    row[Math.floor(COLS / 2)] = 1;
  }
  return row;
}

function nextRow(row, rule) {
  const next = new Uint8Array(COLS);
  for (let i = 0; i < COLS; i++) {
    const left = row[(i - 1 + COLS) % COLS];
    const center = row[i];
    const right = row[(i + 1) % COLS];
    const pattern = (left << 2) | (center << 1) | right;
    next[i] = (rule >> pattern) & 1;
  }
  return next;
}

function draw() {
  const rule = clampRule(ruleInput.value);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1f2937';

  let row = firstRow(startSelect.value);
  for (let r = 0; r < ROWS; r++) {
    for (let i = 0; i < COLS; i++) {
      if (row[i]) ctx.fillRect(i * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    row = nextRow(row, rule);
  }

  const outputs = ruleOutputs(rule);
  const patterns = ['111', '110', '101', '100', '011', '010', '001', '000'];
  rulePreview.textContent = 'Regel ' + rule + ': '
    + patterns.map((p, i) => p + '→' + outputs[i]).join('  ');
}

ruleInput.addEventListener('input', () => {
  ruleInput.value = clampRule(ruleInput.value);
  draw();
});
startSelect.addEventListener('change', draw);
randomRuleBtn.addEventListener('click', () => {
  ruleInput.value = Math.floor(Math.random() * 256);
  draw();
});
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    ruleInput.value = btn.dataset.rule;
    draw();
  });
});

draw();
