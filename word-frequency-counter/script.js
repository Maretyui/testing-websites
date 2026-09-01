const inputText = document.getElementById('inputText');
const statsEl = document.getElementById('stats');
const freqBody = document.getElementById('freqBody');

function countWords(text) {
  const words = text
    .toLowerCase()
    .match(/[\p{L}\p{N}']+/gu) || [];

  const counts = new Map();
  words.forEach(word => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return { words, counts };
}

function render() {
  const { words, counts } = countWords(inputText.value);
  const total = words.length;
  const unique = counts.size;

  statsEl.textContent = total === 0
    ? 'Noch kein Text eingegeben.'
    : `${total} Wörter gesamt, ${unique} davon eindeutig.`;

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  freqBody.innerHTML = '';

  if (sorted.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = '<td colspan="3">Keine Wörter gefunden.</td>';
    freqBody.appendChild(row);
    return;
  }

  const maxCount = sorted[0][1];

  sorted.forEach(([word, count]) => {
    const row = document.createElement('tr');
    const pct = Math.round((count / maxCount) * 100);
    row.innerHTML = `
      <td>${word}</td>
      <td>${count}</td>
      <td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div></td>
    `;
    freqBody.appendChild(row);
  });
}

inputText.addEventListener('input', render);
render();
