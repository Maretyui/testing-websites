const jwtInput = document.getElementById("jwtInput");
const errorMsg = document.getElementById("errorMsg");
const result = document.getElementById("result");
const headerOut = document.getElementById("headerOut");
const payloadOut = document.getElementById("payloadOut");
const sigOut = document.getElementById("sigOut");
const expNote = document.getElementById("expNote");

function base64UrlDecode(segment) {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    segment.length + ((4 - (segment.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function formatExp(payload) {
  if (typeof payload.exp !== "number") return "";
  const expDate = new Date(payload.exp * 1000);
  const now = new Date();
  const diffMs = expDate.getTime() - now.getTime();
  const status = diffMs > 0 ? "läuft ab in" : "ist abgelaufen seit";
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);
  const readable =
    absMinutes < 60
      ? `${absMinutes} Min.`
      : `${Math.round(absMinutes / 60)} Std.`;
  return `exp: ${expDate.toLocaleString("de-DE")} (${status} ${readable})`;
}

function decode() {
  const raw = jwtInput.value.trim();
  errorMsg.textContent = "";
  result.hidden = true;
  if (!raw) return;

  const parts = raw.split(".");
  if (parts.length !== 3) {
    errorMsg.textContent = "Kein gültiges JWT — es braucht genau drei durch Punkte getrennte Teile (Header.Payload.Signatur).";
    return;
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    headerOut.textContent = JSON.stringify(header, null, 2);
    payloadOut.textContent = JSON.stringify(payload, null, 2);
    sigOut.textContent = parts[2];
    expNote.textContent = formatExp(payload);
    result.hidden = false;
  } catch (err) {
    errorMsg.textContent = "Konnte Header/Payload nicht decodieren — ist das wirklich ein Base64url-codiertes JWT?";
  }
}

jwtInput.addEventListener("input", decode);
