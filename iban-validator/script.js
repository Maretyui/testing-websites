const COUNTRY_LENGTHS = {
  AD: 24, AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22,
  DK: 18, EE: 20, ES: 24, FI: 18, FR: 27, GB: 22, GR: 27, HR: 21,
  HU: 28, IE: 22, IS: 26, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21,
  MT: 31, NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19,
  SK: 24, SM: 27,
};

const input = document.getElementById('ibanInput');
const statusText = document.getElementById('statusText');
const countryText = document.getElementById('countryText');
const formattedText = document.getElementById('formattedText');
const statusRow = statusText.closest('.result-row');

function mod97(numericString) {
  let remainder = numericString;
  while (remainder.length > 2) {
    const chunk = remainder.slice(0, 9);
    remainder = String(Number(chunk) % 97) + remainder.slice(chunk.length);
  }
  return Number(remainder) % 97;
}

function checkIban(raw) {
  const cleaned = raw.replace(/\s+/g, '').toUpperCase();

  if (cleaned.length === 0) {
    return { state: 'empty' };
  }

  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { state: 'invalid', reason: 'Enthält ungültige Zeichen' };
  }

  const country = cleaned.slice(0, 2);
  const expectedLength = COUNTRY_LENGTHS[country];

  if (!/^[A-Z]{2}$/.test(country) || !expectedLength) {
    return { state: 'invalid', reason: 'Unbekanntes Länderkürzel', country };
  }

  if (cleaned.length !== expectedLength) {
    return {
      state: 'invalid',
      reason: `Falsche Länge (erwartet ${expectedLength}, hat ${cleaned.length})`,
      country,
    };
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  const valid = mod97(numeric) === 1;
  const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();

  return {
    state: valid ? 'valid' : 'invalid',
    reason: valid ? null : 'Prüfziffer stimmt nicht (Mod-97)',
    country,
    formatted,
  };
}

function render(result) {
  statusRow.classList.remove('valid', 'invalid');

  if (result.state === 'empty') {
    statusText.textContent = '–';
    countryText.textContent = '–';
    formattedText.textContent = '–';
    return;
  }

  if (result.state === 'valid') {
    statusRow.classList.add('valid');
    statusText.textContent = 'Gültig';
  } else {
    statusRow.classList.add('invalid');
    statusText.textContent = result.reason || 'Ungültig';
  }

  countryText.textContent = result.country || '–';
  formattedText.textContent = result.formatted || '–';
}

input.addEventListener('input', () => {
  render(checkIban(input.value));
});
