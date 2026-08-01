const patternInput = document.getElementById("pattern");
const flagsInput = document.getElementById("flags");
const flagCheckboxes = Array.from(document.querySelectorAll("#flagToggles input[type=checkbox]"));
const statusEl = document.getElementById("status");
const testStringEl = document.getElementById("testString");
const highlightedEl = document.getElementById("highlighted");
const matchCountEl = document.getElementById("matchCount");
const matchListEl = document.getElementById("matchList");

const VALID_FLAG_CHARS = ["g", "i", "m", "s", "u", "y"];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function flagsFromCheckboxes() {
  return flagCheckboxes
    .filter((cb) => cb.checked)
    .map((cb) => cb.dataset.flag)
    .join("");
}

function syncCheckboxesFromFlags(flags) {
  flagCheckboxes.forEach((cb) => {
    cb.checked = flags.includes(cb.dataset.flag);
  });
}

function cleanFlags(raw) {
  const seen = new Set();
  let cleaned = "";
  for (const ch of raw) {
    if (VALID_FLAG_CHARS.includes(ch) && !seen.has(ch)) {
      seen.add(ch);
      cleaned += ch;
    }
  }
  return cleaned;
}

function buildHighlightedHtml(text, matches) {
  if (!matches.length) return escapeHtml(text) || "&nbsp;";
  let result = "";
  let last = 0;
  matches.forEach((m, i) => {
    const start = m.index;
    const end = start + m[0].length;
    result += escapeHtml(text.slice(last, start));
    const cls = i % 2 === 1 ? " alt" : "";
    if (m[0].length === 0) {
      result += `<mark class="zero${cls}" title="leerer Treffer">&#8203;•</mark>`;
    } else {
      result += `<mark class="${cls.trim()}">${escapeHtml(m[0])}</mark>`;
    }
    last = end;
  });
  result += escapeHtml(text.slice(last));
  return result;
}

function renderMatchList(matches) {
  matchCountEl.textContent = matches.length;

  if (!matches.length) {
    matchListEl.innerHTML = '<li class="empty">Kein Treffer</li>';
    return;
  }

  matchListEl.innerHTML = matches
    .map((m, i) => {
      const text = m[0].length ? escapeHtml(m[0]) : "(leerer Treffer)";
      const groupParts = [];

      for (let g = 1; g < m.length; g++) {
        groupParts.push(`Gruppe ${g}: ${m[g] !== undefined ? escapeHtml(m[g]) : "—"}`);
      }
      if (m.groups) {
        for (const [name, value] of Object.entries(m.groups)) {
          groupParts.push(`${escapeHtml(name)}: ${value !== undefined ? escapeHtml(value) : "—"}`);
        }
      }

      const groupsHtml = groupParts.length
        ? `<div class="match-groups">${groupParts.join(" &middot; ")}</div>`
        : "";

      return `<li><span class="match-index">#${i + 1}</span><span class="match-text">${text}</span> <span style="color:#9ca3af">bei Index ${m.index}</span>${groupsHtml}</li>`;
    })
    .join("");
}

function run() {
  const pattern = patternInput.value;
  const flags = flagsInput.value;
  const text = testStringEl.value;

  if (!pattern) {
    statusEl.textContent = "Muster eingeben, um zu starten";
    statusEl.className = "status";
    highlightedEl.innerHTML = escapeHtml(text) || "&nbsp;";
    matchCountEl.textContent = "0";
    matchListEl.innerHTML = '<li class="empty">Kein Muster angegeben</li>';
    return;
  }

  let matches = [];
  try {
    if (flags.includes("g")) {
      const re = new RegExp(pattern, flags);
      matches = Array.from(text.matchAll(re));
    } else {
      const re = new RegExp(pattern, flags);
      const m = re.exec(text);
      matches = m ? [m] : [];
    }
  } catch (err) {
    statusEl.textContent = `Ungültiges Muster: ${err.message}`;
    statusEl.className = "status error";
    highlightedEl.innerHTML = escapeHtml(text) || "&nbsp;";
    matchCountEl.textContent = "0";
    matchListEl.innerHTML = '<li class="empty">Ungültiges Muster</li>';
    return;
  }

  statusEl.textContent = matches.length
    ? `Gültiges Muster – ${matches.length} Treffer${matches.length === 1 ? "" : ""}`
    : "Gültiges Muster – kein Treffer";
  statusEl.className = "status ok";

  highlightedEl.innerHTML = buildHighlightedHtml(text, matches);
  renderMatchList(matches);
}

patternInput.addEventListener("input", run);
testStringEl.addEventListener("input", run);

flagsInput.addEventListener("input", () => {
  const cursor = flagsInput.selectionStart;
  const cleaned = cleanFlags(flagsInput.value);
  flagsInput.value = cleaned;
  flagsInput.setSelectionRange(Math.min(cursor, cleaned.length), Math.min(cursor, cleaned.length));
  syncCheckboxesFromFlags(cleaned);
  run();
});

flagCheckboxes.forEach((cb) => {
  cb.addEventListener("change", () => {
    flagsInput.value = flagsFromCheckboxes();
    run();
  });
});

flagsInput.value = flagsFromCheckboxes();
run();
