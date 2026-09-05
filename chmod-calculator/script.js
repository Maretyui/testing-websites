const GROUPS = [
  { key: 'owner', label: 'Eigentümer' },
  { key: 'group', label: 'Gruppe' },
  { key: 'other', label: 'Andere' },
];
const BITS = ['r', 'w', 'x'];

const state = {
  owner: { r: true, w: true, x: false },
  group: { r: true, w: false, x: false },
  other: { r: true, w: false, x: false },
};

const permBody = document.getElementById('permBody');
const octalInput = document.getElementById('octalInput');
const symbolicInput = document.getElementById('symbolicInput');
const commandOutput = document.getElementById('commandOutput');
const errorMsg = document.getElementById('errorMsg');

const checkboxes = {};

GROUPS.forEach(({ key, label }) => {
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.textContent = label;
  row.appendChild(nameCell);

  checkboxes[key] = {};
  BITS.forEach((bit) => {
    const cell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `${label}: ${bit}`);
    checkbox.checked = state[key][bit];
    checkbox.addEventListener('change', () => {
      state[key][bit] = checkbox.checked;
      syncFromState();
    });
    checkboxes[key][bit] = checkbox;
    cell.appendChild(checkbox);
    row.appendChild(cell);
  });
  permBody.appendChild(row);
});

function groupToOctal(group) {
  return (group.r ? 4 : 0) + (group.w ? 2 : 0) + (group.x ? 1 : 0);
}

function groupToSymbol(group) {
  return `${group.r ? 'r' : '-'}${group.w ? 'w' : '-'}${group.x ? 'x' : '-'}`;
}

function stateToOctal() {
  return GROUPS.map(({ key }) => groupToOctal(state[key])).join('');
}

function stateToSymbolic() {
  return GROUPS.map(({ key }) => groupToSymbol(state[key])).join('');
}

function syncFromState() {
  errorMsg.textContent = '';
  const octal = stateToOctal();
  const symbolic = stateToSymbolic();
  octalInput.value = octal;
  symbolicInput.value = symbolic;
  commandOutput.value = `chmod ${octal} datei`;
}

function applyOctalDigit(key, digit) {
  state[key].r = !!(digit & 4);
  state[key].w = !!(digit & 2);
  state[key].x = !!(digit & 1);
  checkboxes[key].r.checked = state[key].r;
  checkboxes[key].w.checked = state[key].w;
  checkboxes[key].x.checked = state[key].x;
}

octalInput.addEventListener('input', () => {
  const raw = octalInput.value.trim();
  const digits = raw.length === 4 ? raw.slice(1) : raw;
  if (!/^[0-7]{3}$/.test(digits)) {
    errorMsg.textContent = raw === '' ? '' : 'Oktalwert muss aus 3 Ziffern von 0–7 bestehen (z. B. 755).';
    return;
  }
  errorMsg.textContent = '';
  GROUPS.forEach(({ key }, i) => applyOctalDigit(key, Number(digits[i])));
  const symbolic = stateToSymbolic();
  symbolicInput.value = symbolic;
  commandOutput.value = `chmod ${digits} datei`;
});

symbolicInput.addEventListener('input', () => {
  const raw = symbolicInput.value.trim();
  if (!/^([r-][w-][x-]){3}$/.test(raw)) {
    errorMsg.textContent = raw === '' ? '' : 'Symbolischer Modus muss 9 Zeichen sein, z. B. rwxr-xr--.';
    return;
  }
  errorMsg.textContent = '';
  GROUPS.forEach(({ key }, i) => {
    const chunk = raw.slice(i * 3, i * 3 + 3);
    state[key].r = chunk[0] === 'r';
    state[key].w = chunk[1] === 'w';
    state[key].x = chunk[2] === 'x';
    checkboxes[key].r.checked = state[key].r;
    checkboxes[key].w.checked = state[key].w;
    checkboxes[key].x.checked = state[key].x;
  });
  const octal = stateToOctal();
  octalInput.value = octal;
  commandOutput.value = `chmod ${octal} datei`;
});

syncFromState();
