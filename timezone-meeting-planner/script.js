const CITIES = [
  { name: 'Los Angeles', zone: 'America/Los_Angeles' },
  { name: 'New York', zone: 'America/New_York' },
  { name: 'São Paulo', zone: 'America/Sao_Paulo' },
  { name: 'London', zone: 'Europe/London' },
  { name: 'Berlin', zone: 'Europe/Berlin' },
  { name: 'Kairo', zone: 'Africa/Cairo' },
  { name: 'Dubai', zone: 'Asia/Dubai' },
  { name: 'Neu-Delhi', zone: 'Asia/Kolkata' },
  { name: 'Bangkok', zone: 'Asia/Bangkok' },
  { name: 'Singapur', zone: 'Asia/Singapore' },
  { name: 'Tokio', zone: 'Asia/Tokyo' },
  { name: 'Sydney', zone: 'Australia/Sydney' },
  { name: 'Auckland', zone: 'Pacific/Auckland' },
];

const hourInput = document.getElementById('hourInput');
const timeReadout = document.getElementById('timeReadout');
const citySelect = document.getElementById('citySelect');
const addBtn = document.getElementById('addBtn');
const cityList = document.getElementById('cityList');

let selected = ['America/New_York', 'Europe/Berlin', 'Asia/Tokyo'];

for (const city of CITIES) {
  const opt = document.createElement('option');
  opt.value = city.zone;
  opt.textContent = city.name;
  citySelect.appendChild(opt);
}

function categorize(hour) {
  if (hour >= 9 && hour < 18) return 'work';
  if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 22)) return 'ok';
  return 'sleep';
}

function referenceUtcDate(minutesFromMidnight) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  d.setUTCMinutes(minutesFromMidnight);
  return d;
}

function localPartsFor(date, zone) {
  const fmt = new Intl.DateTimeFormat('de-DE', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  return { hour, minute, weekday: get('weekday') };
}

function render() {
  const minutes = Number(hourInput.value);
  const utcHour = Math.floor(minutes / 60);
  const utcMinute = minutes % 60;
  timeReadout.textContent =
    `${String(utcHour).padStart(2, '0')}:${String(utcMinute).padStart(2, '0')} UTC`;

  const refDate = referenceUtcDate(minutes);

  cityList.textContent = '';

  if (selected.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-hint';
    p.textContent = 'Noch keine Stadt hinzugefügt.';
    cityList.appendChild(p);
    return;
  }

  for (const zone of selected) {
    const city = CITIES.find((c) => c.zone === zone);
    const { hour, minute, weekday } = localPartsFor(refDate, zone);

    const row = document.createElement('div');
    row.className = 'city-row';

    const top = document.createElement('div');
    top.className = 'top';

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = city ? city.name : zone;

    const localTime = document.createElement('span');
    localTime.className = 'local-time';
    localTime.textContent =
      `${weekday}. ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove';
    removeBtn.setAttribute('aria-label', `${city ? city.name : zone} entfernen`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      selected = selected.filter((z) => z !== zone);
      render();
    });

    top.append(name, localTime, removeBtn);

    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.setAttribute('role', 'img');
    strip.setAttribute(
      'aria-label',
      `${city ? city.name : zone}: ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} Uhr, ${categorize(hour)}`
    );

    for (let h = 0; h < 24; h++) {
      const seg = document.createElement('div');
      seg.className = `seg ${categorize(h)}`;
      strip.appendChild(seg);
    }

    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = `${((hour + minute / 60) / 24) * 100}%`;
    strip.appendChild(marker);

    row.append(top, strip);
    cityList.appendChild(row);
  }
}

hourInput.addEventListener('input', render);

addBtn.addEventListener('click', () => {
  const zone = citySelect.value;
  if (!zone || selected.includes(zone)) return;
  selected.push(zone);
  render();
});

render();
