const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const output = document.getElementById('output');
const breakdownEl = document.getElementById('breakdown');

function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function calendarBreakdown(from, to) {
  // Walking month-by-month (rather than subtracting date parts
  // directly) avoids the classic off-by-one when `from`'s day-of-month
  // doesn't exist in the target month, e.g. Jan 31 -> Mar 1: adding 2
  // months to Jan 31 overflows Feb's 29 days into March, so it has to
  // back off a month at a time until the candidate no longer overshoots.
  let totalMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let candidate = new Date(from.getFullYear(), from.getMonth() + totalMonths, from.getDate());

  while (candidate > to && totalMonths > 0) {
    totalMonths -= 1;
    candidate = new Date(from.getFullYear(), from.getMonth() + totalMonths, from.getDate());
  }

  const days = Math.round((to - candidate) / (24 * 60 * 60 * 1000));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, days };
}

function countWeekdays(from, to) {
  let count = 0;
  const cursor = new Date(from);
  while (cursor <= to) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function render() {
  const start = parseDate(startInput.value);
  const end = parseDate(endInput.value);

  if (!start || !end) {
    output.textContent = 'Bitte beide Daten wählen.';
    breakdownEl.innerHTML = '';
    return;
  }

  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const reversed = start > end;

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((to - from) / msPerDay);
  const { years, months, days } = calendarBreakdown(from, to);

  output.textContent = reversed
    ? `${totalDays} Tage (Enddatum liegt vor dem Startdatum)`
    : `${totalDays} Tage insgesamt`;

  const weekdays = countWeekdays(from, to);
  const weekendDays = totalDays + 1 - weekdays;

  breakdownEl.innerHTML = `
    <div class="item"><strong>${years}</strong><span>Jahre</span></div>
    <div class="item"><strong>${months}</strong><span>Monate</span></div>
    <div class="item"><strong>${days}</strong><span>Tage (Rest)</span></div>
    <div class="item"><strong>${(totalDays / 7).toFixed(1)}</strong><span>Wochen</span></div>
    <div class="item"><strong>${weekdays}</strong><span>Werktage</span></div>
    <div class="item"><strong>${weekendDays}</strong><span>Wochenendtage</span></div>
  `;
}

startInput.addEventListener('input', render);
endInput.addEventListener('input', render);

const today = new Date().toISOString().slice(0, 10);
startInput.value = today;
render();
