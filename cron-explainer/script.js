const cronInput = document.getElementById('cronInput');
const errorEl = document.getElementById('error');
const descriptionEl = document.getElementById('description');
const runsEl = document.getElementById('runs');

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const WEEKDAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const FIELD_RANGES = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6],
};

function parseField(raw, [min, max]) {
  const values = new Set();

  for (const part of raw.split(',')) {
    const stepMatch = part.match(/^(\*|\d+-\d+)(?:\/(\d+))$/);
    let rangeStart = min;
    let rangeEnd = max;
    let step = 1;

    if (stepMatch) {
      const [, range, stepStr] = stepMatch;
      step = Number(stepStr);
      if (step <= 0) {
        throw new Error(`Ungültige Schrittweite in "${part}".`);
      }
      if (range !== '*') {
        const [s, e] = range.split('-').map(Number);
        rangeStart = s;
        rangeEnd = e;
      }
    } else if (part === '*') {
      rangeStart = min;
      rangeEnd = max;
    } else if (/^\d+-\d+$/.test(part)) {
      const [s, e] = part.split('-').map(Number);
      rangeStart = s;
      rangeEnd = e;
    } else if (/^\d+$/.test(part)) {
      rangeStart = Number(part);
      rangeEnd = rangeStart;
    } else {
      throw new Error(`Unbekanntes Format: "${part}".`);
    }

    if (rangeStart < min || rangeEnd > max || rangeStart > rangeEnd) {
      throw new Error(`Wert außerhalb des gültigen Bereichs (${min}-${max}) in "${part}".`);
    }

    for (let v = rangeStart; v <= rangeEnd; v += step) {
      values.add(v);
    }
  }

  return values;
}

function parseCron(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('Es werden genau 5 Felder erwartet: Minute Stunde Tag Monat Wochentag.');
  }

  const [minuteRaw, hourRaw, domRaw, monthRaw, dowRaw] = parts;

  return {
    minute: parseField(minuteRaw, FIELD_RANGES.minute),
    hour: parseField(hourRaw, FIELD_RANGES.hour),
    dayOfMonth: parseField(domRaw, FIELD_RANGES.dayOfMonth),
    month: parseField(monthRaw, FIELD_RANGES.month),
    dayOfWeek: parseField(dowRaw, FIELD_RANGES.dayOfWeek),
    raw: { minuteRaw, hourRaw, domRaw, monthRaw, dowRaw },
  };
}

function describeField(set, max, allLabel, unitLabel) {
  if (set.size === max) return allLabel;
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.map((v) => `${unitLabel}${v}`).join(', ');
}

function describeCron(cron) {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;
  const totalMinutes = FIELD_RANGES.minute[1] - FIELD_RANGES.minute[0] + 1;
  const totalHours = FIELD_RANGES.hour[1] - FIELD_RANGES.hour[0] + 1;
  const totalDom = FIELD_RANGES.dayOfMonth[1] - FIELD_RANGES.dayOfMonth[0] + 1;
  const totalMonths = FIELD_RANGES.month[1] - FIELD_RANGES.month[0] + 1;
  const totalDow = FIELD_RANGES.dayOfWeek[1] - FIELD_RANGES.dayOfWeek[0] + 1;

  const parts = [];

  if (minute.size === totalMinutes && hour.size === totalHours) {
    parts.push('Läuft jede Minute');
  } else if (minute.size === 1 && hour.size === totalHours) {
    parts.push(`Läuft zur Minute ${[...minute][0]} jeder Stunde`);
  } else if (minute.size === 1 && hour.size === 1) {
    const m = String([...minute][0]).padStart(2, '0');
    const h = String([...hour][0]).padStart(2, '0');
    parts.push(`Läuft um ${h}:${m} Uhr`);
  } else {
    parts.push(`Läuft zu den Minuten [${describeField(minute, totalMinutes, 'jede', '')}] der Stunden [${describeField(hour, totalHours, 'jede', '')}]`);
  }

  if (dayOfMonth.size < totalDom) {
    parts.push(`an den Tagen [${describeField(dayOfMonth, totalDom, '', '')}] des Monats`);
  }

  if (month.size < totalMonths) {
    const names = [...month].sort((a, b) => a - b).map((m) => MONTH_NAMES[m - 1]);
    parts.push(`in den Monaten ${names.join(', ')}`);
  }

  if (dayOfWeek.size < totalDow) {
    const names = [...dayOfWeek].sort((a, b) => a - b).map((d) => WEEKDAY_NAMES[d]);
    parts.push(`an den Wochentagen ${names.join(', ')}`);
  }

  return parts.join(', ') + '.';
}

function matches(date, cron) {
  return (
    cron.minute.has(date.getMinutes()) &&
    cron.hour.has(date.getHours()) &&
    cron.dayOfMonth.has(date.getDate()) &&
    cron.month.has(date.getMonth() + 1) &&
    cron.dayOfWeek.has(date.getDay())
  );
}

function nextRuns(cron, count) {
  const results = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 60 * 24 * 366 * 2;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    if (matches(cursor, cron)) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
    iterations += 1;
  }

  return results;
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function render() {
  let cron;
  try {
    cron = parseCron(cronInput.value);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
    descriptionEl.style.display = 'none';
    runsEl.style.display = 'none';
    return;
  }

  errorEl.hidden = true;
  descriptionEl.style.display = 'block';
  runsEl.style.display = 'flex';

  descriptionEl.textContent = describeCron(cron);

  const runs = nextRuns(cron, 5);
  runsEl.innerHTML = '';
  if (runs.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Keine Ausführung in den nächsten 2 Jahren gefunden.';
    runsEl.appendChild(li);
  } else {
    for (const run of runs) {
      const li = document.createElement('li');
      li.textContent = formatDate(run);
      runsEl.appendChild(li);
    }
  }
}

cronInput.addEventListener('input', render);
render();
