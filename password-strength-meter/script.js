const input = document.getElementById("password");
const toggle = document.getElementById("toggle");
const meterFill = document.getElementById("meterFill");
const strengthLabel = document.getElementById("strengthLabel");
const rules = document.querySelectorAll("#rules li");

const checks = {
  length: (value) => value.length >= 8,
  lower: (value) => /[a-z]/.test(value),
  upper: (value) => /[A-Z]/.test(value),
  number: (value) => /[0-9]/.test(value),
  symbol: (value) => /[^A-Za-z0-9]/.test(value),
};

const levels = [
  { max: 0, label: "Noch kein Passwort eingegeben", color: "#d1d5db", width: "0%" },
  { max: 1, label: "Sehr schwach", color: "#dc2626", width: "20%" },
  { max: 2, label: "Schwach", color: "#f97316", width: "40%" },
  { max: 3, label: "Okay", color: "#eab308", width: "60%" },
  { max: 4, label: "Stark", color: "#84cc16", width: "80%" },
  { max: 5, label: "Sehr stark", color: "#16a34a", width: "100%" },
];

function update() {
  const value = input.value;
  let metCount = 0;

  rules.forEach((li) => {
    const rule = li.dataset.rule;
    const passes = checks[rule](value);
    li.classList.toggle("met", passes);
    if (passes) metCount += 1;
  });

  const level = value.length === 0 ? levels[0] : levels[metCount];
  meterFill.style.width = level.width;
  meterFill.style.background = level.color;
  strengthLabel.textContent = level.label;
  strengthLabel.style.color = value.length === 0 ? "#374151" : level.color;
}

toggle.addEventListener("click", () => {
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  toggle.textContent = showing ? "Anzeigen" : "Verbergen";
});

input.addEventListener("input", update);

update();
