const modeButtons = document.getElementById("modeButtons");
const timeLabel = document.getElementById("timeLabel");
const timeInput = document.getElementById("timeInput");
const fallAsleepInput = document.getElementById("fallAsleepInput");
const results = document.getElementById("results");

const CYCLE_MINUTES = 90;
let mode = "bedtime";

modeButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mode]");
  if (!button) return;
  mode = button.dataset.mode;
  [...modeButtons.children].forEach((btn) => btn.classList.toggle("active", btn === button));
  timeLabel.textContent = mode === "bedtime" ? "Aktuelle Uhrzeit" : "Aufwachzeit";
  calculate();
});

function formatTime(date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function parseTimeToday(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function calculate() {
  if (!timeInput.value) {
    results.innerHTML = "";
    return;
  }

  const fallAsleepMinutes = Math.max(0, parseInt(fallAsleepInput.value, 10) || 0);
  const baseTime = parseTimeToday(timeInput.value);
  results.innerHTML = "";

  if (mode === "bedtime") {
    // Falling asleep first, then count forward whole cycles — each row is a
    // valid wake-up time landing at the end of a full cycle, not mid-cycle.
    const asleepAt = new Date(baseTime.getTime() + fallAsleepMinutes * 60000);
    for (let cycles = 6; cycles >= 3; cycles--) {
      const wakeTime = new Date(asleepAt.getTime() + cycles * CYCLE_MINUTES * 60000);
      if (wakeTime <= baseTime) wakeTime.setDate(wakeTime.getDate() + 1);
      const row = document.createElement("div");
      row.className = "result-row" + (cycles === 5 ? " best" : "");
      row.innerHTML = `<span>${formatTime(wakeTime)} <span class="cycles">(${cycles} Zyklen)</span></span><strong>${cycles * 1.5} Std.</strong>`;
      results.appendChild(row);
    }
  } else {
    // Counting backward from the desired wake time to find bedtimes that
    // land the sleeper at the start of a cycle boundary.
    for (let cycles = 6; cycles >= 3; cycles--) {
      const sleepNeeded = cycles * CYCLE_MINUTES + fallAsleepMinutes;
      const bedTime = new Date(baseTime.getTime() - sleepNeeded * 60000);
      const row = document.createElement("div");
      row.className = "result-row" + (cycles === 5 ? " best" : "");
      row.innerHTML = `<span>${formatTime(bedTime)} <span class="cycles">(${cycles} Zyklen)</span></span><strong>${cycles * 1.5} Std.</strong>`;
      results.appendChild(row);
    }
  }
}

const now = new Date();
timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

timeInput.addEventListener("input", calculate);
fallAsleepInput.addEventListener("input", calculate);
calculate();
