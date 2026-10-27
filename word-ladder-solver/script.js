const form = document.getElementById('form');
const startInput = document.getElementById('startWord');
const endInput = document.getElementById('endWord');
const status = document.getElementById('status');
const ladderEl = document.getElementById('ladder');

const WORDS = Array.from(new Set(WORD_LIST.map((w) => w.toLowerCase())));

function wordsOfLength(n) {
  return WORDS.filter((w) => w.length === n);
}

function differsByOneLetter(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 1) return false;
  }
  return diff === 1;
}

function buildBuckets(pool) {
  // Group words by a wildcard pattern (one letter blanked out) so neighbor
  // lookups are O(word length) instead of comparing against every word.
  const buckets = new Map();
  for (const word of pool) {
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + '*' + word.slice(i + 1);
      if (!buckets.has(pattern)) buckets.set(pattern, []);
      buckets.get(pattern).push(word);
    }
  }
  return buckets;
}

function neighborsOf(word, buckets) {
  const out = new Set();
  for (let i = 0; i < word.length; i++) {
    const pattern = word.slice(0, i) + '*' + word.slice(i + 1);
    const bucket = buckets.get(pattern);
    if (!bucket) continue;
    for (const w of bucket) if (w !== word) out.add(w);
  }
  return out;
}

function solve(start, end) {
  if (start.length !== end.length) {
    return { error: 'Both words need to be the same length.' };
  }
  const pool = wordsOfLength(start.length);
  if (!pool.includes(start)) {
    return { error: `"${start}" isn't in the word list for length ${start.length}.` };
  }
  if (!pool.includes(end)) {
    return { error: `"${end}" isn't in the word list for length ${end.length}.` };
  }
  if (start === end) {
    return { path: [start] };
  }

  const buckets = buildBuckets(pool);
  const queue = [start];
  const prev = new Map([[start, null]]);
  let qi = 0;

  while (qi < queue.length) {
    const current = queue[qi++];
    if (current === end) break;
    for (const next of neighborsOf(current, buckets)) {
      if (!prev.has(next)) {
        prev.set(next, current);
        queue.push(next);
      }
    }
  }

  if (!prev.has(end)) {
    return { error: `No ladder found — "${start}" and "${end}" aren't connected through the word list.` };
  }

  const path = [];
  let node = end;
  while (node !== null) {
    path.unshift(node);
    node = prev.get(node);
  }
  return { path };
}

function render(result) {
  ladderEl.innerHTML = '';
  if (result.error) {
    status.textContent = result.error;
    return;
  }
  const { path } = result;
  status.textContent = path.length === 1
    ? 'Start and end word are the same.'
    : `Found a ${path.length - 1}-step ladder.`;

  path.forEach((word, i) => {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'step-num';
    num.textContent = String(i);
    li.appendChild(num);

    const prevWord = i > 0 ? path[i - 1] : null;
    for (let c = 0; c < word.length; c++) {
      const span = document.createElement('span');
      span.className = 'letter';
      if (prevWord && prevWord[c] !== word[c]) span.classList.add('changed');
      span.textContent = word[c];
      li.appendChild(span);
    }
    ladderEl.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const start = startInput.value.trim().toLowerCase();
  const end = endInput.value.trim().toLowerCase();
  if (!start || !end) {
    status.textContent = 'Enter both a start and end word.';
    ladderEl.innerHTML = '';
    return;
  }
  render(solve(start, end));
});

render(solve(startInput.value.trim().toLowerCase(), endInput.value.trim().toLowerCase()));
