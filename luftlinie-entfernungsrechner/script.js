const lat1Input = document.getElementById('lat1Input');
const lon1Input = document.getElementById('lon1Input');
const lat2Input = document.getElementById('lat2Input');
const lon2Input = document.getElementById('lon2Input');
const errorEl = document.getElementById('error');
const outputEl = document.getElementById('output');
const resultValueEl = document.getElementById('resultValue');
const resultSubEl = document.getElementById('resultSub');

const EARTH_RADIUS_KM = 6371;
const COMPASS_POINTS = [
  'N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

function toRad(deg) {
  return deg * Math.PI / 180;
}

// Haversine: treats the earth as a sphere and measures great-circle
// (shortest-path-over-the-surface) distance between two lat/lon points.
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function initialBearing(lat1, lon1, lat2, lon2) {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  return (theta * 180 / Math.PI + 360) % 360;
}

function compassLabel(bearing) {
  const index = Math.round(bearing / 22.5) % 16;
  return COMPASS_POINTS[index];
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  outputEl.hidden = true;
}

function calculate() {
  const lat1 = parseFloat(lat1Input.value);
  const lon1 = parseFloat(lon1Input.value);
  const lat2 = parseFloat(lat2Input.value);
  const lon2 = parseFloat(lon2Input.value);

  if ([lat1, lon1, lat2, lon2].some(Number.isNaN)) {
    showError('Bitte alle vier Koordinaten eintragen.');
    return;
  }
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90) {
    showError('Der Breitengrad muss zwischen -90 und 90 liegen.');
    return;
  }
  if (Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    showError('Der Längengrad muss zwischen -180 und 180 liegen.');
    return;
  }

  errorEl.hidden = true;

  const distanceKm = haversineDistanceKm(lat1, lon1, lat2, lon2);
  const distanceMi = distanceKm / 1.60934;

  resultValueEl.textContent = `${distanceKm.toFixed(1)} km`;

  if (distanceKm < 0.001) {
    resultSubEl.textContent = 'Das sind praktisch dieselbe Stelle.';
  } else {
    const bearing = initialBearing(lat1, lon1, lat2, lon2);
    resultSubEl.textContent =
      `≈ ${distanceMi.toFixed(1)} mi · Anfangspeilung von A nach B: ${bearing.toFixed(0)}° (${compassLabel(bearing)})`;
  }

  outputEl.hidden = false;
}

[lat1Input, lon1Input, lat2Input, lon2Input].forEach((input) => {
  input.addEventListener('input', calculate);
});
calculate();
