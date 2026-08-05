const addForm = document.getElementById('addForm');
const labelInput = document.getElementById('labelInput');
const zoneInput = document.getElementById('zoneInput');
const errorMsg = document.getElementById('errorMsg');
const listEl = document.getElementById('list');
const emptyState = document.getElementById('emptyState');

const STORAGE_KEY = 'world-clock-entries';

const FALLBACK_ZONES = [
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

let clocks = loadClocks();

function loadClocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveClocks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clocks));
}

function makeId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function clearError() {
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
}

function populateZones() {
  let zones = FALLBACK_ZONES;
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      zones = Intl.supportedValuesOf('timeZone');
    } catch {
      zones = FALLBACK_ZONES;
    }
  }
  zoneInput.innerHTML = '';
  zones.forEach((zone) => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone.replace(/_/g, ' ');
    zoneInput.append(option);
  });
}

function offsetLabel(zone, now) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    }).formatToParts(now);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
  } catch {
    return '';
  }
}

function render() {
  emptyState.classList.toggle('hidden', clocks.length > 0);
  listEl.innerHTML = '';

  const now = new Date();

  clocks.forEach((clock) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = clock.id;

    const top = document.createElement('div');
    top.className = 'card-top';

    const titleWrap = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = clock.label;
    const zoneEl = document.createElement('div');
    zoneEl.className = 'card-target';
    zoneEl.textContent = `${clock.zone.replace(/_/g, ' ')} (${offsetLabel(clock.zone, now)})`;
    titleWrap.append(titleEl, zoneEl);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'card-remove';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `${clock.label} entfernen`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeClock(clock.id));

    top.append(titleWrap, removeBtn);
    card.append(top);

    let timeText = '--:--:--';
    let dateText = '';
    try {
      timeText = new Intl.DateTimeFormat('de-DE', {
        timeZone: clock.zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);
      dateText = new Intl.DateTimeFormat('de-DE', {
        timeZone: clock.zone,
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }).format(now);
    } catch {
      // zone became invalid (unlikely) — keep placeholders
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'clock-time';
    timeEl.textContent = timeText;

    const dateEl = document.createElement('div');
    dateEl.className = 'clock-date';
    dateEl.textContent = dateText;

    card.append(timeEl, dateEl);
    listEl.append(card);
  });
}

function removeClock(id) {
  clocks = clocks.filter((clock) => clock.id !== id);
  saveClocks();
  render();
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const label = labelInput.value.trim();
  const zone = zoneInput.value;

  if (!label) {
    showError('Bitte gib eine Bezeichnung ein.');
    return;
  }
  if (!zone) {
    showError('Bitte wähle eine Zeitzone.');
    return;
  }

  clocks.push({ id: makeId(), label, zone });
  saveClocks();
  render();

  addForm.reset();
  labelInput.focus();
});

populateZones();
setInterval(render, 1000);
render();
