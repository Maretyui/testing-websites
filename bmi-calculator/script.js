const metricBtn = document.getElementById("metricBtn");
const imperialBtn = document.getElementById("imperialBtn");
const metricPanes = document.getElementById("metricPanes");
const imperialPanes = document.getElementById("imperialPanes");

const heightCm = document.getElementById("heightCm");
const weightKg = document.getElementById("weightKg");
const heightIn = document.getElementById("heightIn");
const weightLb = document.getElementById("weightLb");

const result = document.getElementById("result");
const bmiValueEl = document.getElementById("bmiValue");
const bmiCategoryEl = document.getElementById("bmiCategory");
const bmiMarker = document.getElementById("bmiMarker");
const errorMsg = document.getElementById("errorMsg");

let unit = "metric";

const CATEGORIES = [
  { max: 18.5, label: "Untergewicht", color: "#60a5fa" },
  { max: 25, label: "Normalgewicht", color: "#34d399" },
  { max: 30, label: "Übergewicht", color: "#fbbf24" },
  { max: Infinity, label: "Adipositas", color: "#f87171" },
];

// The visual scale spans a fixed BMI 15-40 window; clamp so the
// marker never flies off the bar for extreme inputs.
const SCALE_MIN = 15;
const SCALE_MAX = 40;

metricBtn.addEventListener("click", () => setUnit("metric"));
imperialBtn.addEventListener("click", () => setUnit("imperial"));

function setUnit(next) {
  unit = next;
  metricBtn.classList.toggle("active", unit === "metric");
  imperialBtn.classList.toggle("active", unit === "imperial");
  metricPanes.classList.toggle("hidden", unit !== "metric");
  imperialPanes.classList.toggle("hidden", unit !== "imperial");
  compute();
}

[heightCm, weightKg, heightIn, weightLb].forEach((input) => {
  input.addEventListener("input", compute);
});

function compute() {
  let bmi;

  if (unit === "metric") {
    const h = parseFloat(heightCm.value);
    const w = parseFloat(weightKg.value);
    if (!h || !w || h <= 0 || w <= 0) {
      showEmpty();
      return;
    }
    const meters = h / 100;
    bmi = w / (meters * meters);
  } else {
    const h = parseFloat(heightIn.value);
    const w = parseFloat(weightLb.value);
    if (!h || !w || h <= 0 || w <= 0) {
      showEmpty();
      return;
    }
    bmi = (w / (h * h)) * 703;
  }

  if (!isFinite(bmi) || bmi <= 0) {
    showError("Bitte gültige Werte eingeben.");
    return;
  }

  errorMsg.classList.add("hidden");
  result.classList.remove("hidden");

  const category = CATEGORIES.find((c) => bmi < c.max);
  bmiValueEl.textContent = bmi.toFixed(1);
  bmiCategoryEl.textContent = category.label;
  bmiCategoryEl.style.color = category.color;

  const clamped = Math.min(Math.max(bmi, SCALE_MIN), SCALE_MAX);
  const percent = ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  bmiMarker.style.left = percent + "%";
}

function showEmpty() {
  result.classList.add("hidden");
  errorMsg.classList.add("hidden");
}

function showError(message) {
  result.classList.add("hidden");
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}
