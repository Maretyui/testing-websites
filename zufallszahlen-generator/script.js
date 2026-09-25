const minInput = document.getElementById('minInput');
const maxInput = document.getElementById('maxInput');
const countInput = document.getElementById('countInput');
const uniqueInput = document.getElementById('uniqueInput');
const generateBtn = document.getElementById('generateBtn');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');

// Rejection sampling avoids the modulo-bias a plain `% range` would
// introduce: without it, some numbers in the range would be very
// slightly more likely to appear than others.
function randomInt(min, max) {
  const range = max - min + 1;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return min + (value % range);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultsEl.hidden = true;
}

function generate() {
  const min = parseInt(minInput.value, 10);
  const max = parseInt(maxInput.value, 10);
  const count = parseInt(countInput.value, 10);
  const unique = uniqueInput.checked;

  if (Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(count)) {
    showError('Bitte gültige Zahlen eintragen.');
    return;
  }
  if (min > max) {
    showError('Minimum darf nicht größer als Maximum sein.');
    return;
  }
  if (count < 1) {
    showError('Anzahl muss mindestens 1 sein.');
    return;
  }
  const rangeSize = max - min + 1;
  if (unique && count > rangeSize) {
    showError(`Für ${count} eindeutige Zahlen ist der Bereich zu klein (nur ${rangeSize} möglich).`);
    return;
  }

  errorEl.hidden = true;

  const numbers = [];
  if (unique) {
    const pool = new Set();
    while (pool.size < count) {
      pool.add(randomInt(min, max));
    }
    numbers.push(...pool);
  } else {
    for (let i = 0; i < count; i++) {
      numbers.push(randomInt(min, max));
    }
  }

  resultsEl.innerHTML = '';
  for (const n of numbers) {
    const li = document.createElement('li');
    li.textContent = n;
    li.title = 'Klicken zum Kopieren';
    li.addEventListener('click', () => copyNumber(li, n));
    resultsEl.appendChild(li);
  }
  resultsEl.hidden = false;
}

async function copyNumber(li, value) {
  try {
    await navigator.clipboard.writeText(String(value));
    li.classList.add('copied');
    setTimeout(() => li.classList.remove('copied'), 1000);
  } catch {
    // Clipboard write can be denied - the number stays visible either way.
  }
}

generateBtn.addEventListener('click', generate);
generate();
