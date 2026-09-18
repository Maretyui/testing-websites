const fieldsEl = document.getElementById('fields');
const noteEl = document.getElementById('note');
const binaryBtn = document.getElementById('binaryBtn');
const decimalBtn = document.getElementById('decimalBtn');

const BINARY_UNITS = [
  { key: 'B', label: 'Bytes', factor: 1 },
  { key: 'KiB', label: 'Kibibyte (KiB)', factor: 1024 },
  { key: 'MiB', label: 'Mebibyte (MiB)', factor: 1024 ** 2 },
  { key: 'GiB', label: 'Gibibyte (GiB)', factor: 1024 ** 3 },
  { key: 'TiB', label: 'Tebibyte (TiB)', factor: 1024 ** 4 },
];

const DECIMAL_UNITS = [
  { key: 'B', label: 'Bytes', factor: 1 },
  { key: 'KB', label: 'Kilobyte (KB)', factor: 1000 },
  { key: 'MB', label: 'Megabyte (MB)', factor: 1000 ** 2 },
  { key: 'GB', label: 'Gigabyte (GB)', factor: 1000 ** 3 },
  { key: 'TB', label: 'Terabyte (TB)', factor: 1000 ** 4 },
];

let units = BINARY_UNITS;
let inputs = {};

function render() {
  fieldsEl.innerHTML = '';
  inputs = {};
  units.forEach((unit) => {
    const field = document.createElement('div');
    field.className = 'field';

    const label = document.createElement('label');
    label.setAttribute('for', `unit-${unit.key}`);
    label.textContent = unit.label;

    const input = document.createElement('input');
    input.type = 'number';
    input.id = `unit-${unit.key}`;
    input.min = '0';
    input.step = 'any';
    input.placeholder = '0';
    input.addEventListener('input', () => onInput(unit.key));

    field.appendChild(label);
    field.appendChild(input);
    fieldsEl.appendChild(field);
    inputs[unit.key] = input;
  });
}

function onInput(sourceKey) {
  const sourceUnit = units.find((u) => u.key === sourceKey);
  const raw = inputs[sourceKey].value;
  if (raw === '') {
    units.forEach((u) => {
      if (u.key !== sourceKey) inputs[u.key].value = '';
    });
    noteEl.textContent = '';
    return;
  }
  const value = parseFloat(raw);
  if (Number.isNaN(value) || value < 0) {
    noteEl.textContent = 'Bitte eine Zahl größer oder gleich 0 eingeben.';
    return;
  }
  const bytes = value * sourceUnit.factor;
  units.forEach((u) => {
    if (u.key === sourceKey) return;
    const converted = bytes / u.factor;
    inputs[u.key].value = trimNumber(converted);
  });
  noteEl.textContent = `${bytes.toLocaleString('de-DE')} Bytes gesamt`;
}

function trimNumber(n) {
  if (n === 0) return '0';
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return parseFloat(n.toFixed(4)).toString();
  return parseFloat(n.toPrecision(4)).toString();
}

binaryBtn.addEventListener('click', () => {
  units = BINARY_UNITS;
  binaryBtn.classList.add('active');
  decimalBtn.classList.remove('active');
  render();
});

decimalBtn.addEventListener('click', () => {
  units = DECIMAL_UNITS;
  decimalBtn.classList.add('active');
  binaryBtn.classList.remove('active');
  render();
});

render();
