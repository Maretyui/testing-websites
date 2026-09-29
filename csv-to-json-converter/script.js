const csvInput = document.getElementById('csvInput');
const jsonOutput = document.getElementById('jsonOutput');
const delimiterSelect = document.getElementById('delimiter');
const errorEl = document.getElementById('error');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Hand-rolled parser instead of a plain String.split(delimiter) so
// quoted fields can contain the delimiter itself or an escaped quote
// ("") without breaking the row into the wrong number of columns.
function parseCSV(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(r => !(r.length === 1 && r[0] === ''));
}

function convert() {
  const raw = csvInput.value;
  const delimiter = delimiterSelect.value === '\\t' ? '\t' : delimiterSelect.value;
  errorEl.textContent = '';

  if (!raw.trim()) {
    jsonOutput.value = '';
    return;
  }

  try {
    const rows = parseCSV(raw, delimiter);
    if (rows.length < 1) {
      jsonOutput.value = '[]';
      return;
    }

    const headers = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1);

    const objects = dataRows.map(cells => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = cells[i] !== undefined ? cells[i] : '';
      });
      return obj;
    });

    jsonOutput.value = JSON.stringify(objects, null, 2);
  } catch (err) {
    errorEl.textContent = `Fehler beim Parsen: ${err.message}`;
    jsonOutput.value = '';
  }
}

csvInput.addEventListener('input', convert);
delimiterSelect.addEventListener('change', convert);

copyBtn.addEventListener('click', async () => {
  if (!jsonOutput.value) return;
  try {
    await navigator.clipboard.writeText(jsonOutput.value);
    copyBtn.textContent = 'Kopiert!';
    setTimeout(() => (copyBtn.textContent = 'JSON kopieren'), 1200);
  } catch {
    // Clipboard write can be denied - the text stays selectable either way.
  }
});

downloadBtn.addEventListener('click', () => {
  if (!jsonOutput.value) return;
  const blob = new Blob([jsonOutput.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
});
