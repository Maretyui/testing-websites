const digitsInput = document.getElementById('digitsInput');
const resultEl = document.getElementById('result');
const errorMsg = document.getElementById('errorMsg');

function computeCheckDigit(digits) {
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function render() {
  const raw = digitsInput.value.trim();
  resultEl.innerHTML = '';
  errorMsg.textContent = '';

  if (raw === '') return;

  if (!/^\d+$/.test(raw)) {
    errorMsg.textContent = 'Nur Ziffern eingeben.';
    return;
  }

  if (raw.length !== 12 && raw.length !== 13) {
    errorMsg.textContent = `12 Ziffern (ohne Prüfziffer) oder 13 Ziffern (mit Prüfziffer) erwartet — aktuell ${raw.length}.`;
    return;
  }

  const digits = raw.split('').map(Number);
  const base = digits.slice(0, 12);
  const computed = computeCheckDigit(base);

  if (raw.length === 12) {
    resultEl.innerHTML = `
      <div class="code">${base.join('')}<span class="check">${computed}</span></div>
      <span class="status computed">Prüfziffer berechnet: ${computed}</span>
    `;
    return;
  }

  const given = digits[12];
  const valid = given === computed;
  resultEl.innerHTML = `
    <div class="code">${base.join('')}<span class="check">${given}</span></div>
    <span class="status ${valid ? 'valid' : 'invalid'}">
      ${valid ? 'Gültige Prüfziffer' : `Ungültig — erwartet ${computed}, gefunden ${given}`}
    </span>
  `;
}

digitsInput.addEventListener('input', () => {
  digitsInput.value = digitsInput.value.replace(/\D/g, '');
  render();
});
