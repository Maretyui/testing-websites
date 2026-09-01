const coefA = document.getElementById('coefA');
const coefB = document.getElementById('coefB');
const coefC = document.getElementById('coefC');
const result = document.getElementById('result');

function fmt(n) {
  const rounded = Math.round(n * 10000) / 10000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function solve() {
  const a = parseFloat(coefA.value);
  const b = parseFloat(coefB.value);
  const c = parseFloat(coefC.value);

  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
    result.innerHTML = 'Bitte alle drei Koeffizienten eingeben.';
    return;
  }

  if (a === 0) {
    if (b === 0) {
      result.innerHTML = c === 0
        ? 'Jede Zahl ist eine Lösung (0 = 0).'
        : 'Keine Lösung (Widerspruch).';
      return;
    }
    const x = -c / b;
    result.innerHTML = `Keine echte quadratische Gleichung (a = 0), aber linear lösbar:<br><span class="roots">x = ${fmt(x)}</span>`;
    return;
  }

  const discriminant = b * b - 4 * a * c;
  let rootsHtml;

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    rootsHtml = `<span class="roots">x₁ = ${fmt(x1)}, x₂ = ${fmt(x2)}</span>`;
  } else if (discriminant === 0) {
    const x = -b / (2 * a);
    rootsHtml = `<span class="roots">x = ${fmt(x)}</span> (doppelte Lösung)`;
  } else {
    const real = -b / (2 * a);
    const imag = Math.sqrt(-discriminant) / (2 * a);
    rootsHtml = `<span class="roots">x₁ = ${fmt(real)} + ${fmt(Math.abs(imag))}i, x₂ = ${fmt(real)} − ${fmt(Math.abs(imag))}i</span>`;
  }

  result.innerHTML = `${rootsHtml}<div class="discriminant">Diskriminante D = ${fmt(discriminant)}</div>`;
}

[coefA, coefB, coefC].forEach(input => input.addEventListener('input', solve));
solve();
