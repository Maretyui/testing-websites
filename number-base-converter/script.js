const fields = {
  2: document.getElementById("binInput"),
  8: document.getElementById("octInput"),
  10: document.getElementById("decInput"),
  16: document.getElementById("hexInput"),
};
const errorEl = document.getElementById("error");

function isValidForBase(value, base) {
  if (value === "") return true;
  const digits = "0123456789abcdef".slice(0, base);
  return [...value.toLowerCase()].every((ch) => digits.includes(ch));
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("hidden", !message);
}

function syncFrom(base) {
  const input = fields[base];
  const raw = input.value.trim();

  Object.values(fields).forEach((el) => el.classList.remove("invalid"));

  if (raw === "") {
    Object.entries(fields).forEach(([b, el]) => {
      if (Number(b) !== base) el.value = "";
    });
    showError("");
    return;
  }

  if (!isValidForBase(raw, base)) {
    input.classList.add("invalid");
    showError(`Ungültiges Zeichen für Basis ${base}.`);
    return;
  }

  const value = parseInt(raw, base);
  if (!Number.isSafeInteger(value)) {
    input.classList.add("invalid");
    showError("Zahl ist zu groß.");
    return;
  }

  showError("");
  Object.entries(fields).forEach(([b, el]) => {
    if (Number(b) !== base) el.value = value.toString(Number(b)).toUpperCase();
  });
}

Object.entries(fields).forEach(([base, input]) => {
  input.addEventListener("input", () => syncFrom(Number(base)));
});

fields[10].value = "10";
syncFrom(10);
