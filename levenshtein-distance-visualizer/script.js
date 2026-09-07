const wordAInput = document.getElementById('wordA');
const wordBInput = document.getElementById('wordB');
const resultEl = document.getElementById('result');
const matrixEl = document.getElementById('matrix');

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp;
}

function tracePath(dp, a, b) {
  const path = new Set();
  let i = a.length;
  let j = b.length;
  path.add(`${i},${j}`);

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      i--; j--;
    } else {
      const diag = i > 0 && j > 0 ? dp[i - 1][j - 1] : Infinity;
      const up = i > 0 ? dp[i - 1][j] : Infinity;
      const left = j > 0 ? dp[i][j - 1] : Infinity;
      const best = Math.min(diag, up, left);

      if (best === diag) { i--; j--; }
      else if (best === up) { i--; }
      else { j--; }
    }
    path.add(`${i},${j}`);
  }
  return path;
}

function render() {
  const a = wordAInput.value;
  const b = wordBInput.value;

  if (!a && !b) {
    resultEl.textContent = '';
    matrixEl.innerHTML = '';
    return;
  }

  const dp = levenshtein(a, b);
  const path = tracePath(dp, a, b);
  const distance = dp[a.length][b.length];

  resultEl.textContent = `Distanz: ${distance} Bearbeitung${distance === 1 ? '' : 'en'} (Einfügen, Löschen oder Ersetzen)`;

  let html = '<tr><th></th><th></th>';
  for (const ch of b) html += `<th>${ch}</th>`;
  html += '</tr>';

  for (let i = 0; i <= a.length; i++) {
    html += `<tr><th>${i === 0 ? '' : a[i - 1]}</th>`;
    for (let j = 0; j <= b.length; j++) {
      const cls = path.has(`${i},${j}`) ? ' class="path"' : '';
      html += `<td${cls}>${dp[i][j]}</td>`;
    }
    html += '</tr>';
  }

  matrixEl.innerHTML = html;
}

wordAInput.addEventListener('input', render);
wordBInput.addEventListener('input', render);
render();
