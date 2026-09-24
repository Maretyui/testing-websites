const rawInput = document.getElementById('rawInput');
const output = document.getElementById('output');
const preview = document.getElementById('preview');
const copyBtn = document.getElementById('copyBtn');
const firstRowHeader = document.getElementById('firstRowHeader');
const delimRadios = document.querySelectorAll('input[name="delim"]');

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || '';
  const counts = {
    '\t': (firstLine.match(/\t/g) || []).length,
    ',': (firstLine.match(/,/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
  };
  let best = ',';
  let bestCount = -1;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = delim;
      bestCount = count;
    }
  }
  return bestCount > 0 ? best : ',';
}

function getDelimiter(text) {
  const checked = document.querySelector('input[name="delim"]:checked').value;
  if (checked === 'auto') return detectDelimiter(text);
  if (checked === '\\t') return '\t';
  return checked;
}

function parseRows(text, delim) {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delim).map((cell) => cell.trim()));
}

function escapeCell(cell) {
  return cell.replace(/\|/g, '\\|');
}

function buildMarkdown(rows, hasHeader) {
  if (rows.length === 0) return '';

  const colCount = Math.max(...rows.map((r) => r.length));
  const normalized = rows.map((r) => {
    const row = r.slice();
    while (row.length < colCount) row.push('');
    return row;
  });

  const header = hasHeader ? normalized[0] : normalized[0].map((_, i) => `Spalte ${i + 1}`);
  const bodyRows = hasHeader ? normalized.slice(1) : normalized;

  const lines = [];
  lines.push(`| ${header.map(escapeCell).join(' | ')} |`);
  lines.push(`| ${header.map(() => '---').join(' | ')} |`);
  bodyRows.forEach((row) => {
    lines.push(`| ${row.map(escapeCell).join(' | ')} |`);
  });
  return lines.join('\n');
}

function renderPreview(rows, hasHeader) {
  preview.innerHTML = '';
  if (rows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Noch keine Daten eingefügt.';
    preview.appendChild(empty);
    return;
  }

  const colCount = Math.max(...rows.map((r) => r.length));
  const normalized = rows.map((r) => {
    const row = r.slice();
    while (row.length < colCount) row.push('');
    return row;
  });

  const header = hasHeader ? normalized[0] : normalized[0].map((_, i) => `Spalte ${i + 1}`);
  const bodyRows = hasHeader ? normalized.slice(1) : normalized;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  header.forEach((cell) => {
    const th = document.createElement('th');
    th.textContent = cell;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  bodyRows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  preview.appendChild(table);
}

function update() {
  const text = rawInput.value;
  const delim = getDelimiter(text);
  const rows = parseRows(text, delim);
  const hasHeader = firstRowHeader.checked;

  output.value = buildMarkdown(rows, hasHeader);
  renderPreview(rows, hasHeader);
}

rawInput.addEventListener('input', update);
firstRowHeader.addEventListener('change', update);
delimRadios.forEach((r) => r.addEventListener('change', update));

copyBtn.addEventListener('click', async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Kopiert!';
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 1200);
  } catch (err) {
    output.select();
  }
});

update();
