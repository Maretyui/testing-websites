const addForm = document.getElementById('addForm');
const titleInput = document.getElementById('titleInput');
const targetInput = document.getElementById('targetInput');
const errorMsg = document.getElementById('errorMsg');
const listEl = document.getElementById('list');
const emptyState = document.getElementById('emptyState');

const STORAGE_KEY = 'countdown-timer-items';

let items = loadItems();

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

function formatTargetDate(ts) {
  return new Date(ts).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function diffParts(targetTs, nowTs) {
  const diff = Math.max(0, targetTs - nowTs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isPast: targetTs - nowTs <= 0 };
}

function render() {
  emptyState.classList.toggle('hidden', items.length > 0);
  listEl.innerHTML = '';

  const now = Date.now();
  const sorted = [...items].sort((a, b) => a.target - b.target);

  sorted.forEach((item) => {
    const { days, hours, minutes, seconds, isPast } = diffParts(item.target, now);

    const card = document.createElement('div');
    card.className = `card${isPast ? ' is-past' : ''}`;
    card.dataset.id = item.id;

    const top = document.createElement('div');
    top.className = 'card-top';

    const titleWrap = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = item.title;
    const targetEl = document.createElement('div');
    targetEl.className = 'card-target';
    targetEl.textContent = formatTargetDate(item.target);
    titleWrap.append(titleEl, targetEl);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'card-remove';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `${item.title} entfernen`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeItem(item.id));

    top.append(titleWrap, removeBtn);
    card.append(top);

    if (isPast) {
      const doneText = document.createElement('div');
      doneText.className = 'done-text';
      doneText.textContent = 'Der Zeitpunkt ist erreicht!';
      card.append(doneText);
    } else {
      const units = document.createElement('div');
      units.className = 'units';
      [
        [days, 'Tage'],
        [hours, 'Std.'],
        [minutes, 'Min.'],
        [seconds, 'Sek.'],
      ].forEach(([value, label]) => {
        const unit = document.createElement('div');
        unit.className = 'unit';
        const valueEl = document.createElement('span');
        valueEl.className = 'unit-value';
        valueEl.textContent = String(value).padStart(2, '0');
        const labelEl = document.createElement('span');
        labelEl.className = 'unit-label';
        labelEl.textContent = label;
        unit.append(valueEl, labelEl);
        units.append(unit);
      });
      card.append(units);
    }

    listEl.append(card);
  });
}

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  render();
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const title = titleInput.value.trim();
  const targetValue = targetInput.value;

  if (!title) {
    showError('Bitte gib einen Titel ein.');
    return;
  }
  if (!targetValue) {
    showError('Bitte wähle ein Zieldatum.');
    return;
  }

  const targetTs = new Date(targetValue).getTime();
  if (Number.isNaN(targetTs)) {
    showError('Ungültiges Datum.');
    return;
  }

  items.push({ id: makeId(), title, target: targetTs });
  saveItems();
  render();

  addForm.reset();
  titleInput.focus();
});

setInterval(render, 1000);
render();
