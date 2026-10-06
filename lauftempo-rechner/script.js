const distanceInput = document.getElementById('distanceInput');
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const errorEl = document.getElementById('error');
const outputEl = document.getElementById('output');
const paceValueEl = document.getElementById('paceValue');
const speedValueEl = document.getElementById('speedValue');
const predictionsEl = document.getElementById('predictions');
const predictionsListEl = document.getElementById('predictionsList');

const STANDARD_DISTANCES = [
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: 'Halbmarathon', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
];

function formatDuration(totalSeconds) {
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  outputEl.hidden = true;
  predictionsEl.hidden = true;
}

function calculate() {
  const distanceKm = parseFloat(distanceInput.value);
  const hours = parseFloat(hoursInput.value) || 0;
  const minutes = parseFloat(minutesInput.value) || 0;
  const seconds = parseFloat(secondsInput.value) || 0;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (Number.isNaN(distanceKm) || distanceKm <= 0) {
    showError('Bitte eine Distanz größer als 0 eintragen.');
    return;
  }
  if (totalSeconds <= 0) {
    showError('Bitte eine Zeit größer als 0 eintragen.');
    return;
  }

  errorEl.hidden = true;

  const paceSecondsPerKm = totalSeconds / distanceKm;
  const speedKmh = distanceKm / (totalSeconds / 3600);

  paceValueEl.textContent = `${formatDuration(paceSecondsPerKm)} / km`;
  speedValueEl.textContent = `entspricht ${speedKmh.toFixed(2)} km/h`;
  outputEl.hidden = false;

  // Riegel's race-time prediction formula: T2 = T1 * (D2 / D1)^1.06.
  // The 1.06 exponent (not 1.0) accounts for endurance/fatigue falloff
  // over longer distances instead of assuming pace holds perfectly flat.
  predictionsListEl.innerHTML = '';
  STANDARD_DISTANCES.forEach(({ label, km }) => {
    const predictedSeconds = totalSeconds * Math.pow(km / distanceKm, 1.06);
    const li = document.createElement('li');
    const isCurrent = Math.abs(km - distanceKm) < 0.01;
    li.innerHTML = `<span class="pred-label">${label}${isCurrent ? ' (eingegeben)' : ''}</span><span class="pred-value">${formatDuration(predictedSeconds)}</span>`;
    predictionsListEl.appendChild(li);
  });
  predictionsEl.hidden = false;
}

[distanceInput, hoursInput, minutesInput, secondsInput].forEach((el) => {
  el.addEventListener('input', calculate);
});
calculate();
