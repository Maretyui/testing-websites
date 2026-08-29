const genderButtons = document.getElementById('genderButtons');
const ageInput = document.getElementById('ageInput');
const heightInput = document.getElementById('heightInput');
const weightInput = document.getElementById('weightInput');
const activityInput = document.getElementById('activityInput');
const results = document.getElementById('results');

let gender = 'female';

genderButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-gender]');
  if (!btn) return;
  gender = btn.dataset.gender;
  [...genderButtons.querySelectorAll('button')].forEach((b) =>
    b.classList.toggle('active', b === btn)
  );
  render();
});

[ageInput, heightInput, weightInput, activityInput].forEach((el) =>
  el.addEventListener('input', render)
);

function calcBMR(age, heightCm, weightKg, gender) {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

function render() {
  const age = parseFloat(ageInput.value);
  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);
  const activity = parseFloat(activityInput.value);

  if (!age || !height || !weight || age <= 0 || height <= 0 || weight <= 0) {
    results.innerHTML = '<div class="result-row"><span>Bitte gültige Werte eingeben.</span></div>';
    return;
  }

  const bmr = calcBMR(age, height, weight, gender);
  const tdee = bmr * activity;

  results.innerHTML = `
    <div class="result-row">
      <span>Grundumsatz (BMR)</span>
      <strong>${Math.round(bmr)} kcal/Tag</strong>
    </div>
    <div class="result-row best">
      <span>Gesamtumsatz (TDEE)<br><span class="note">bei aktuellem Aktivitätslevel</span></span>
      <strong>${Math.round(tdee)} kcal/Tag</strong>
    </div>
    <div class="result-row">
      <span>Abnehmen<br><span class="note">ca. −500 kcal/Tag</span></span>
      <strong>${Math.round(tdee - 500)} kcal/Tag</strong>
    </div>
    <div class="result-row">
      <span>Zunehmen<br><span class="note">ca. +500 kcal/Tag</span></span>
      <strong>${Math.round(tdee + 500)} kcal/Tag</strong>
    </div>
  `;
}

render();
