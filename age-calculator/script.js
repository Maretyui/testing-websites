const birthdateInput = document.getElementById("birthdateInput");
const resultEl = document.getElementById("result");
const emptyState = document.getElementById("emptyState");
const yearsValue = document.getElementById("yearsValue");
const monthsValue = document.getElementById("monthsValue");
const daysValue = document.getElementById("daysValue");
const totalDaysText = document.getElementById("totalDaysText");
const nextBirthdayText = document.getElementById("nextBirthdayText");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calculateAge(birthdate, today) {
  let years = today.getFullYear() - birthdate.getFullYear();
  let months = today.getMonth() - birthdate.getMonth();
  let days = today.getDate() - birthdate.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function nextBirthday(birthdate, today) {
  let next = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, birthdate.getMonth(), birthdate.getDate());
  }
  const daysUntil = Math.ceil((next - today) / MS_PER_DAY);
  return { date: next, daysUntil };
}

function render() {
  if (!birthdateInput.value) {
    resultEl.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  const birthdate = new Date(`${birthdateInput.value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthdate > today) {
    resultEl.classList.add("hidden");
    emptyState.textContent = "Das Geburtsdatum liegt in der Zukunft.";
    emptyState.classList.remove("hidden");
    return;
  }

  const { years, months, days } = calculateAge(birthdate, today);
  const totalDays = Math.floor((today - birthdate) / MS_PER_DAY);
  const { date, daysUntil } = nextBirthday(birthdate, today);

  yearsValue.textContent = years;
  monthsValue.textContent = months;
  daysValue.textContent = days;
  totalDaysText.textContent = `Insgesamt ${totalDays.toLocaleString("de-DE")} Tage gelebt.`;
  nextBirthdayText.textContent = daysUntil === 0
    ? "Heute ist dein Geburtstag! 🎉"
    : `Nächster Geburtstag: ${date.toLocaleDateString("de-DE")} (in ${daysUntil} Tagen).`;

  resultEl.classList.remove("hidden");
  emptyState.classList.add("hidden");
}

birthdateInput.addEventListener("change", render);
render();
