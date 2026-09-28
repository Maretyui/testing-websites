const input = document.getElementById('input');
const resultsEl = document.getElementById('results');
const emptyMsg = document.getElementById('emptyMsg');

const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);

const TOKEN_RE =
  /(::[a-zA-Z-]+)|(:where\([^)]*\))|(:[a-zA-Z-]+\([^)]*\))|(:[a-zA-Z-]+)|(#[a-zA-Z0-9_-]+)|(\.[a-zA-Z0-9_-]+)|(\[[^\]]*\])|([a-zA-Z][a-zA-Z0-9-]*)|(\*)/g;

function calcSpecificity(selector) {
  let ids = 0;
  let classes = 0;
  let types = 0;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(selector)) !== null) {
    if (match[1]) {
      types += 1; // pseudo-element ::x
    } else if (match[2]) {
      // :where(...) contributes nothing
    } else if (match[3]) {
      classes += 1; // functional pseudo-class, e.g. :nth-child(), :not()
    } else if (match[4]) {
      const name = match[4].slice(1).toLowerCase();
      if (LEGACY_PSEUDO_ELEMENTS.has(name)) {
        types += 1;
      } else {
        classes += 1;
      }
    } else if (match[5]) {
      ids += 1;
    } else if (match[6]) {
      classes += 1;
    } else if (match[7]) {
      classes += 1; // attribute selector
    } else if (match[8]) {
      types += 1;
    }
    // group 9 (*) contributes nothing
  }

  return { ids, classes, types };
}

function specificityValue(s) {
  return s.ids * 1_000_000 + s.classes * 1_000 + s.types;
}

function render() {
  const lines = input.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  resultsEl.innerHTML = '';
  emptyMsg.style.display = lines.length ? 'none' : 'block';
  if (!lines.length) return;

  const parsed = lines.map((selector) => ({ selector, spec: calcSpecificity(selector) }));
  const maxValue = Math.max(...parsed.map((p) => specificityValue(p.spec)));

  parsed.forEach(({ selector, spec }) => {
    const li = document.createElement('li');
    li.className = 'result-row';

    const value = specificityValue(spec);
    const pct = maxValue === 0 ? 0 : Math.round((value / maxValue) * 100);

    li.innerHTML = `
      <code class="selector">${escapeHtml(selector)}</code>
      <span class="tuple">${spec.ids},${spec.classes},${spec.types}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    `;
    if (value === maxValue) li.classList.add('is-winner');
    resultsEl.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

input.addEventListener('input', render);
render();
