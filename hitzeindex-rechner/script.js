const tempInput = document.getElementById('tempInput');
const humidityInput = document.getElementById('humidityInput');
const errorEl = document.getElementById('error');
const outputEl = document.getElementById('output');
const resultValueEl = document.getElementById('resultValue');
const categoryEl = document.getElementById('category');

function celsiusToFahrenheit(c) {
  return c * 9 / 5 + 32;
}

function fahrenheitToCelsius(f) {
  return (f - 32) * 5 / 9;
}

// NWS Rothfusz regression - only valid/meaningful above roughly 27°C
// (80°F); below that the simple average approximation is used instead,
// matching how the National Weather Service itself handles the low end.
function heatIndexFahrenheit(tempF, rh) {
  const simple = 0.5 * (tempF + 61 + (tempF - 68) * 1.2 + rh * 0.094);
  const average = (simple + tempF) / 2;

  if (average < 80) {
    return simple;
  }

  let hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  } else if (rh > 85 && tempF >= 80 && tempF <= 87) {
    hi += ((rh - 85) / 10) * ((87 - tempF) / 5);
  }

  return hi;
}

function categoryFor(tempF) {
  if (tempF < 80) return { label: 'Normal', className: 'safe' };
  if (tempF < 90) return { label: 'Vorsicht', className: 'caution' };
  if (tempF < 103) return { label: 'Erhöhte Vorsicht', className: 'extreme-caution' };
  if (tempF < 125) return { label: 'Gefahr', className: 'danger' };
  return { label: 'Extreme Gefahr', className: 'extreme-danger' };
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  outputEl.hidden = true;
}

function calculate() {
  const tempC = parseFloat(tempInput.value);
  const rh = parseFloat(humidityInput.value);

  if (Number.isNaN(tempC) || Number.isNaN(rh)) {
    showError('Bitte gültige Werte eintragen.');
    return;
  }
  if (rh < 0 || rh > 100) {
    showError('Die Luftfeuchtigkeit muss zwischen 0 und 100 % liegen.');
    return;
  }

  errorEl.hidden = true;

  const tempF = celsiusToFahrenheit(tempC);
  const hiF = heatIndexFahrenheit(tempF, rh);
  const hiC = fahrenheitToCelsius(hiF);
  const category = categoryFor(hiF);

  resultValueEl.textContent = `${hiC.toFixed(1)} °C`;
  categoryEl.textContent = category.label;
  categoryEl.className = `category ${category.className}`;
  outputEl.hidden = false;
}

tempInput.addEventListener('input', calculate);
humidityInput.addEventListener('input', calculate);
calculate();
