const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");
const formatBtn = document.getElementById("format");
const minifyBtn = document.getElementById("minify");
const clearBtn = document.getElementById("clear");

function parseOrShowError() {
  const raw = input.value.trim();
  if (!raw) {
    status.textContent = "Noch kein JSON eingegeben";
    status.className = "status";
    output.textContent = "";
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    status.textContent = "Gültiges JSON";
    status.className = "status ok";
    return parsed;
  } catch (err) {
    status.textContent = `Ungültiges JSON: ${err.message}`;
    status.className = "status error";
    output.textContent = "";
    return undefined;
  }
}

formatBtn.addEventListener("click", () => {
  const parsed = parseOrShowError();
  if (parsed !== null && parsed !== undefined) {
    output.textContent = JSON.stringify(parsed, null, 2);
  }
});

minifyBtn.addEventListener("click", () => {
  const parsed = parseOrShowError();
  if (parsed !== null && parsed !== undefined) {
    output.textContent = JSON.stringify(parsed);
  }
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  output.textContent = "";
  status.textContent = "Noch kein JSON eingegeben";
  status.className = "status";
});
