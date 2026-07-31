const modeTabs = document.getElementById("modeTabs");
const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const swapBtn = document.getElementById("swapBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

let mode = "base64";

function setStatus(message, kind) {
  status.textContent = message;
  status.className = kind ? `status ${kind}` : "status";
}

// btoa/atob only handle Latin1, so route through TextEncoder/TextDecoder
// to make Base64 conversion safe for umlauts, emoji, etc.
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToUtf8(str) {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function encode() {
  const raw = input.value;
  if (!raw) {
    setStatus("Noch nichts eingegeben");
    output.value = "";
    return;
  }
  try {
    output.value = mode === "base64" ? utf8ToBase64(raw) : encodeURIComponent(raw);
    setStatus("Erfolgreich kodiert", "ok");
  } catch (err) {
    output.value = "";
    setStatus(`Fehler beim Kodieren: ${err.message}`, "error");
  }
}

function decode() {
  const raw = input.value;
  if (!raw) {
    setStatus("Noch nichts eingegeben");
    output.value = "";
    return;
  }
  try {
    output.value = mode === "base64" ? base64ToUtf8(raw.trim()) : decodeURIComponent(raw);
    setStatus("Erfolgreich dekodiert", "ok");
  } catch (err) {
    output.value = "";
    const label = mode === "base64" ? "Ungültiges Base64" : "Ungültige URL-Kodierung";
    setStatus(`${label}: ${err.message}`, "error");
  }
}

modeTabs.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    modeTabs.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    mode = tab.dataset.mode;
    setStatus("Bereit");
  });
});

encodeBtn.addEventListener("click", encode);
decodeBtn.addEventListener("click", decode);

swapBtn.addEventListener("click", () => {
  if (!output.value) return;
  input.value = output.value;
  output.value = "";
  setStatus("Ausgabe in Eingabe übernommen");
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  output.value = "";
  setStatus("Bereit");
});

copyBtn.addEventListener("click", async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
  } catch (err) {
    output.select();
    document.execCommand("copy");
  }
  copiedMsg.textContent = "In Zwischenablage kopiert";
  setTimeout(() => {
    copiedMsg.textContent = "";
  }, 1500);
});
