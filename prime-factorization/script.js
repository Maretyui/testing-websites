const numberInput = document.getElementById('numberInput');
const numberError = document.getElementById('numberError');
const result = document.getElementById('result');
const primeFlag = document.getElementById('primeFlag');
const factorList = document.getElementById('factorList');
const powerForm = document.getElementById('powerForm');

const MIN = 2;
const MAX = 1_000_000_000;

function factorize(n) {
  const factors = [];
  let remaining = n;
  for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

function toPowerForm(factors) {
  const counts = new Map();
  for (const f of factors) {
    counts.set(f, (counts.get(f) || 0) + 1);
  }
  const SUPERSCRIPTS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const toSuperscript = (num) => String(num).split('').map((d) => SUPERSCRIPTS[d]).join('');

  return [...counts.entries()]
    .map(([base, exp]) => (exp === 1 ? `${base}` : `${base}${toSuperscript(exp)}`))
    .join(' × ');
}

function update() {
  const raw = numberInput.value.trim();

  if (!raw) {
    numberError.textContent = '';
    result.hidden = true;
    return;
  }

  if (!/^\d+$/.test(raw)) {
    numberError.textContent = 'Bitte nur eine ganze positive Zahl eingeben.';
    result.hidden = true;
    return;
  }

  const value = Number(raw);

  if (value < MIN || value > MAX) {
    numberError.textContent = `Die Zahl muss zwischen ${MIN.toLocaleString('de-DE')} und ${MAX.toLocaleString('de-DE')} liegen.`;
    result.hidden = true;
    return;
  }

  numberError.textContent = '';

  const factors = factorize(value);
  const isPrime = factors.length === 1;

  primeFlag.hidden = !isPrime;
  factorList.textContent = factors.join(' × ');
  powerForm.textContent = toPowerForm(factors);
  result.hidden = false;
}

numberInput.addEventListener('input', update);
