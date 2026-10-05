const tempInput = document.getElementById('tempInput');
const windInput = document.getElementById('windInput');
const errorEl = document.getElementById('error');
const outputEl = document.getElementById('output');
const resultValueEl = document.getElementById('resultValue');
const categoryEl = document.getElementById('category');
const noteEl = document.getElementById('note');

function celsiusToFahrenheit(c) {
  return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f) {
  return (f - 32) * 5 / 9;
}

function kmhToMph(kmh) {
  return kmh / 1.60934;
}

// NWS wind chill formula (2001 revision), defined in °F / mph.
// Only meaningful at or below 50°F with wind above 3 mph; below that
// threshold wind has no cooling effect worth modeling and the chart
// just reports the air temperature itself.
function windChillFahrenheit(tempF, windMph) {
  if (tempF > 50 || windMph <= 3) {
    return { value: tempF, applies: false };
  }
  const v16 = Math.pow(windMph, 0.16);
  const wct = 35.74 + 0.6215 * tempF - 35.75 * v16 + 0.4275 * tempF * v16;
  return { value: wct, applies: true };
}

function categoryFor(tempF) {
  if (tempF >= 0) return { label: 'Minimales Risiko', className: 'safe' };
  if (tempF >= -15) return { label: 'Erhöhtes Risiko – Erfrierung in ca. 30 Min.', className: 'caution' };
  if (tempF >= -35) return { label: 'Hohes Risiko – Erfrierung in 10–30 Min.', className: 'extreme-caution' };
  if (tempF >= -60) return { label: 'Gefahr – Erfrierung in 5–10 Min.', className: 'danger' };
  return { label: 'Extreme Gefahr – Erfrierung in unter 5 Min.', className: 'extreme-danger' };
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  outputEl.hidden = true;
  noteEl.hidden = true;
}

function calculate() {
  const tempC = parseFloat(tempInput.value);
  const windKmh = parseFloat(windInput.value);

  if (Number.isNaN(tempC) || Number.isNaN(windKmh)) {
    showError('Bitte gültige Werte eintragen.');
    return;
  }
  if (windKmh < 0) {
    showError('Die Windgeschwindigkeit kann nicht negativ sein.');
    return;
  }

  errorEl.hidden = true;

  const tempF = celsiusToFahrenheit(tempC);
  const windMph = kmhToMph(windKmh);
  const { value: wctF, applies } = windChillFahrenheit(tempF, windMph);
  const wctC = fahrenheitToCelsius(wctF);
  const category = categoryFor(wctF);

  resultValueEl.textContent = `${wctC.toFixed(1)} °C`;
  categoryEl.textContent = category.label;
  categoryEl.className = `category ${category.className}`;
  outputEl.hidden = false;

  if (!applies) {
    noteEl.textContent = 'Außerhalb des Gültigkeitsbereichs (über 10 °C oder unter 4,8 km/h Wind) hat Wind kaum kühlenden Effekt — angezeigt wird die Lufttemperatur selbst.';
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
  }
}

tempInput.addEventListener('input', calculate);
windInput.addEventListener('input', calculate);
calculate();
