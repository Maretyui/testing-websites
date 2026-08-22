const tabs = document.querySelectorAll('.tab');
const modes = {
  of: document.getElementById('mode-of'),
  what: document.getElementById('mode-what'),
  change: document.getElementById('mode-change'),
};
const result = document.getElementById('result');

let activeMode = 'of';

function formatNumber(n) {
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
}

function compute() {
  if (activeMode === 'of') {
    const percent = parseFloat(document.getElementById('ofPercent').value);
    const value = parseFloat(document.getElementById('ofValue').value);
    if (Number.isNaN(percent) || Number.isNaN(value)) {
      result.textContent = 'Ergebnis erscheint hier.';
      return;
    }
    const out = (percent / 100) * value;
    result.textContent = `${formatNumber(percent)}% von ${formatNumber(value)} = ${formatNumber(out)}`;
  } else if (activeMode === 'what') {
    const part = parseFloat(document.getElementById('whatPart').value);
    const whole = parseFloat(document.getElementById('whatWhole').value);
    if (Number.isNaN(part) || Number.isNaN(whole) || whole === 0) {
      result.textContent = whole === 0 ? 'Gesamtwert darf nicht 0 sein.' : 'Ergebnis erscheint hier.';
      return;
    }
    const out = (part / whole) * 100;
    result.textContent = `${formatNumber(part)} ist ${formatNumber(out)}% von ${formatNumber(whole)}`;
  } else if (activeMode === 'change') {
    const from = parseFloat(document.getElementById('changeFrom').value);
    const to = parseFloat(document.getElementById('changeTo').value);
    if (Number.isNaN(from) || Number.isNaN(to) || from === 0) {
      result.textContent = from === 0 ? '"Von"-Wert darf nicht 0 sein.' : 'Ergebnis erscheint hier.';
      return;
    }
    const out = ((to - from) / Math.abs(from)) * 100;
    const sign = out > 0 ? '+' : '';
    const direction = out > 0 ? 'Anstieg' : out < 0 ? 'Rückgang' : 'keine Veränderung';
    result.textContent = `${sign}${formatNumber(out)}% (${direction})`;
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeMode = tab.dataset.mode;
    tabs.forEach((t) => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });
    Object.entries(modes).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== activeMode);
    });
    compute();
  });
});

document.querySelectorAll('.mode input').forEach((input) => {
  input.addEventListener('input', compute);
});
