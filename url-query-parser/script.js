const urlInput = document.getElementById('urlInput');
const urlOutput = document.getElementById('urlOutput');
const paramBody = document.getElementById('paramBody');
const addParamBtn = document.getElementById('addParamBtn');
const errorMsg = document.getElementById('errorMsg');

let base = '';
let params = [];

function parseUrl(value) {
  try {
    const url = new URL(value);
    base = url.origin + url.pathname;
    params = [...url.searchParams.entries()].map(([key, value]) => ({ key, value }));
    errorMsg.textContent = '';
  } catch {
    base = value.split('?')[0];
    params = [];
    errorMsg.textContent = value ? 'Keine gültige absolute URL — Parameter-Bearbeitung deaktiviert.' : '';
  }
  renderTable();
  renderOutput();
}

function renderTable() {
  paramBody.innerHTML = '';
  params.forEach((param, index) => {
    const row = document.createElement('tr');

    const keyCell = document.createElement('td');
    const keyInput = document.createElement('input');
    keyInput.value = param.key;
    keyInput.addEventListener('input', () => {
      params[index].key = keyInput.value;
      renderOutput();
    });
    keyCell.appendChild(keyInput);

    const valueCell = document.createElement('td');
    const valueInput = document.createElement('input');
    valueInput.value = param.value;
    valueInput.addEventListener('input', () => {
      params[index].value = valueInput.value;
      renderOutput();
    });
    valueCell.appendChild(valueInput);

    const removeCell = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', 'Parameter entfernen');
    removeBtn.addEventListener('click', () => {
      params.splice(index, 1);
      renderTable();
      renderOutput();
    });
    removeCell.appendChild(removeBtn);

    row.append(keyCell, valueCell, removeCell);
    paramBody.appendChild(row);
  });
}

function renderOutput() {
  if (!base) {
    urlOutput.value = '';
    return;
  }
  const search = new URLSearchParams();
  params.forEach(({ key, value }) => {
    if (key) search.append(key, value);
  });
  const query = search.toString();
  urlOutput.value = query ? `${base}?${query}` : base;
}

addParamBtn.addEventListener('click', () => {
  params.push({ key: '', value: '' });
  renderTable();
  renderOutput();
});

urlInput.addEventListener('input', () => parseUrl(urlInput.value));

urlInput.value = 'https://example.com/pfad?a=1&b=hallo+welt';
parseUrl(urlInput.value);
