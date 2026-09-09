const digitsInput = document.getElementById('digitsInput');
const resultEl = document.getElementById('result');
const errorMsg = document.getElementById('errorMsg');

// Sums a full digit array (most significant digit first) using the
// Luhn rule: from the right, every second digit is doubled (and has
// 9 subtracted if that makes it two digits). The rightmost digit
// itself (index 0 from the right) is never doubled.
function luhnSum(digits) {
  let sum = 0;
  const reversed = [...digits].reverse();
  for (let i = 0; i < reversed.length; i++) {
    let d = reversed[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum;
}

function computeCheckDigit(base) {
  // Appending a 0 placeholder keeps every base digit's doubling
  // parity identical to what it would be once a real check digit is
  // appended, since the placeholder itself always lands at index 0
  // (never doubled) and contributes nothing to the sum.
  const sum = luhnSum([...base, 0]);
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
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

  if (raw.length < 2) {
    errorMsg.textContent = 'Mindestens 2 Ziffern eingeben.';
    return;
  }

  const digits = raw.split('').map(Number);
  const base = digits.slice(0, -1);
  const given = digits[digits.length - 1];
  const computed = computeCheckDigit(base);
  const valid = given === computed;

  resultEl.innerHTML = `
    <div class="code">${base.join('')}<span class="check">${given}</span></div>
    <span class="status ${valid ? 'valid' : 'invalid'}">
      ${valid ? 'Gültig nach Luhn-Algorithmus' : `Ungültig — erwartet ${computed}, gefunden ${given}`}
    </span>
  `;
}

digitsInput.addEventListener('input', () => {
  digitsInput.value = digitsInput.value.replace(/\D/g, '');
  render();
});
