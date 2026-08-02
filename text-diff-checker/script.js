const textA = document.getElementById('textA');
const textB = document.getElementById('textB');
const compareBtn = document.getElementById('compareBtn');
const clearBtn = document.getElementById('clearBtn');
const diffOutput = document.getElementById('diffOutput');
const statsEl = document.getElementById('stats');
const addedCountEl = document.getElementById('addedCount');
const removedCountEl = document.getElementById('removedCount');
const unchangedCountEl = document.getElementById('unchangedCount');

// Classic LCS (longest common subsequence) table over lines, then
// walked backwards to produce a minimal added/removed/unchanged diff -
// the same core idea behind `diff`/git's line diffing, just without
// the Myers optimizations.
function diffLines(a, b) {
  const rows = a.length;
  const cols = b.length;
  const lcs = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      lcs[i][j] = a[i - 1] === b[j - 1]
        ? lcs[i - 1][j - 1] + 1
        : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }

  const ops = [];
  let i = rows;
  let j = cols;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'unchanged', text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      ops.push({ type: 'added', text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: 'removed', text: a[i - 1] });
      i--;
    }
  }
  return ops.reverse();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function render() {
  const linesA = textA.value.split('\n');
  const linesB = textB.value.split('\n');

  if (!textA.value && !textB.value) {
    diffOutput.innerHTML = '<span class="empty">Beide Felder sind leer.</span>';
    statsEl.hidden = true;
    return;
  }

  const ops = diffLines(linesA, linesB);
  const counts = { added: 0, removed: 0, unchanged: 0 };

  const html = ops.map((op) => {
    counts[op.type]++;
    const marker = op.type === 'added' ? '+' : op.type === 'removed' ? '-' : ' ';
    const text = op.text === '' ? '&nbsp;' : escapeHtml(op.text);
    return `<span class="line ${op.type}"><span class="marker">${marker}</span>${text}</span>`;
  }).join('\n');

  diffOutput.innerHTML = html || '<span class="empty">Keine Unterschiede.</span>';

  addedCountEl.textContent = counts.added;
  removedCountEl.textContent = counts.removed;
  unchangedCountEl.textContent = counts.unchanged;
  statsEl.hidden = false;
}

compareBtn.addEventListener('click', render);

clearBtn.addEventListener('click', () => {
  textA.value = '';
  textB.value = '';
  diffOutput.innerHTML = '';
  statsEl.hidden = true;
  textA.focus();
});
