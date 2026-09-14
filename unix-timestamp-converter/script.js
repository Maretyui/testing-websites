const nowTimestamp = document.getElementById("nowTimestamp");
const useNowBtn = document.getElementById("useNowBtn");
const timestampInput = document.getElementById("timestampInput");
const dateInput = document.getElementById("dateInput");
const tsError = document.getElementById("tsError");
const result = document.getElementById("result");
const localOut = document.getElementById("localOut");
const utcOut = document.getElementById("utcOut");
const isoOut = document.getElementById("isoOut");
const relativeOut = document.getElementById("relativeOut");

let syncing = false;

function tickNow() {
  nowTimestamp.textContent = `Gerade eben: ${Math.floor(Date.now() / 1000)}`;
}
tickNow();
setInterval(tickNow, 1000);

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function relativeLabel(date) {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const units = [
    ["Jahr", 31536000],
    ["Tag", 86400],
    ["Stunde", 3600],
    ["Minute", 60],
    ["Sekunde", 1],
  ];
  for (const [name, secs] of units) {
    if (abs >= secs || name === "Sekunde") {
      const value = Math.round(abs / secs);
      const plural = value === 1 ? name : name + (name === "Stunde" ? "n" : "e");
      return diffSec >= 0 ? `in ${value} ${plural}` : `vor ${value} ${plural}`;
    }
  }
  return "";
}

function renderFromDate(date) {
  if (Number.isNaN(date.getTime())) {
    result.hidden = true;
    return;
  }
  localOut.textContent = date.toLocaleString("de-DE", { dateStyle: "full", timeStyle: "medium" });
  utcOut.textContent = date.toUTCString();
  isoOut.textContent = date.toISOString();
  relativeOut.textContent = relativeLabel(date);
  result.hidden = false;
}

function setFromTimestamp(seconds) {
  syncing = true;
  const date = new Date(seconds * 1000);
  dateInput.value = toDatetimeLocalValue(date);
  renderFromDate(date);
  syncing = false;
}

timestampInput.addEventListener("input", () => {
  if (syncing) return;
  const raw = timestampInput.value.trim();
  tsError.textContent = "";
  if (!raw) {
    result.hidden = true;
    return;
  }
  if (!/^-?\d+$/.test(raw)) {
    tsError.textContent = "Bitte nur eine ganze Zahl eingeben (Sekunden seit 1.1.1970 UTC).";
    result.hidden = true;
    return;
  }
  setFromTimestamp(Number(raw));
});

dateInput.addEventListener("input", () => {
  if (syncing) return;
  if (!dateInput.value) {
    result.hidden = true;
    return;
  }
  const date = new Date(dateInput.value);
  syncing = true;
  timestampInput.value = String(Math.floor(date.getTime() / 1000));
  syncing = false;
  tsError.textContent = "";
  renderFromDate(date);
});

useNowBtn.addEventListener("click", () => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  timestampInput.value = String(nowSeconds);
  tsError.textContent = "";
  setFromTimestamp(nowSeconds);
});
