const CATEGORIES = {
  length: {
    // Factor to convert 1 unit into meters.
    units: {
      mm: { label: 'Millimeter', factor: 0.001 },
      cm: { label: 'Zentimeter', factor: 0.01 },
      m: { label: 'Meter', factor: 1 },
      km: { label: 'Kilometer', factor: 1000 },
      in: { label: 'Zoll', factor: 0.0254 },
      ft: { label: 'Fuß', factor: 0.3048 },
      mi: { label: 'Meile', factor: 1609.344 },
    },
    defaultFrom: 'm',
    defaultTo: 'ft',
  },
  weight: {
    // Factor to convert 1 unit into grams.
    units: {
      mg: { label: 'Milligramm', factor: 0.001 },
      g: { label: 'Gramm', factor: 1 },
      kg: { label: 'Kilogramm', factor: 1000 },
      t: { label: 'Tonne', factor: 1000000 },
      oz: { label: 'Unze', factor: 28.3495 },
      lb: { label: 'Pfund', factor: 453.592 },
    },
    defaultFrom: 'kg',
    defaultTo: 'lb',
  },
  temperature: {
    // Temperature has no shared linear factor, so each unit gets
    // explicit conversion functions to/from Celsius instead.
    units: {
      c: { label: 'Celsius', toCelsius: (v) => v, fromCelsius: (v) => v },
      f: { label: 'Fahrenheit', toCelsius: (v) => (v - 32) * 5 / 9, fromCelsius: (v) => v * 9 / 5 + 32 },
      k: { label: 'Kelvin', toCelsius: (v) => v - 273.15, fromCelsius: (v) => v + 273.15 },
    },
    defaultFrom: 'c',
    defaultTo: 'f',
  },
};

const tabs = document.querySelectorAll('.tab');
const fromValue = document.getElementById('fromValue');
const toValue = document.getElementById('toValue');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const swapBtn = document.getElementById('swapBtn');

let currentCategory = 'length';

function populateUnits(category) {
  const units = CATEGORIES[category].units;
  [fromUnit, toUnit].forEach((select) => (select.innerHTML = ''));

  for (const key in units) {
    const optionFrom = new Option(units[key].label, key);
    const optionTo = new Option(units[key].label, key);
    fromUnit.add(optionFrom);
    toUnit.add(optionTo);
  }

  fromUnit.value = CATEGORIES[category].defaultFrom;
  toUnit.value = CATEGORIES[category].defaultTo;
}

function convert() {
  const input = parseFloat(fromValue.value);
  if (Number.isNaN(input)) {
    toValue.value = '';
    return;
  }

  const units = CATEGORIES[currentCategory].units;
  const from = units[fromUnit.value];
  const to = units[toUnit.value];
  let result;

  if (currentCategory === 'temperature') {
    result = to.fromCelsius(from.toCelsius(input));
  } else {
    result = (input * from.factor) / to.factor;
  }

  toValue.value = Number(result.toFixed(6)).toString();
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    currentCategory = tab.dataset.category;
    populateUnits(currentCategory);
    convert();
  });
});

swapBtn.addEventListener('click', () => {
  const previousFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = previousFrom;
  fromValue.value = toValue.value || fromValue.value;
  convert();
});

[fromValue, fromUnit, toUnit].forEach((el) => {
  el.addEventListener('input', convert);
});

populateUnits(currentCategory);
convert();
