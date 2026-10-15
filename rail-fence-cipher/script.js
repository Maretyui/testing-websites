const textInput = document.getElementById('textInput');
const railsInput = document.getElementById('railsInput');
const outputText = document.getElementById('outputText');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const zigzagGrid = document.getElementById('zigzagGrid');

function clampRails() {
  let rails = parseInt(railsInput.value, 10);
  if (Number.isNaN(rails)) rails = 2;
  rails = Math.min(10, Math.max(2, rails));
  railsInput.value = rails;
  return rails;
}

// Row index for every position in a text of the given length, following
// the zigzag path down to the last rail and back up to the first.
function railPattern(length, rails) {
  const pattern = [];
  let row = 0;
  let dir = 1;
  for (let i = 0; i < length; i++) {
    pattern.push(row);
    if (row === 0) dir = 1;
    else if (row === rails - 1) dir = -1;
    row += dir;
  }
  return pattern;
}

function railFenceEncode(text, rails) {
  if (rails < 2 || text.length === 0) return text;
  const pattern = railPattern(text.length, rails);
  const fence = Array.from({ length: rails }, () => []);
  for (let i = 0; i < text.length; i++) {
    fence[pattern[i]].push(text[i]);
  }
  return fence.map((r) => r.join('')).join('');
}

function railFenceDecode(cipher, rails) {
  if (rails < 2 || cipher.length === 0) return cipher;
  const pattern = railPattern(cipher.length, rails);
  const rowCounts = Array(rails).fill(0);
  pattern.forEach((r) => rowCounts[r]++);

  const rowChars = [];
  let idx = 0;
  for (let r = 0; r < rails; r++) {
    rowChars.push(cipher.slice(idx, idx + rowCounts[r]).split(''));
    idx += rowCounts[r];
  }

  const pointers = Array(rails).fill(0);
  let result = '';
  for (const r of pattern) {
    result += rowChars[r][pointers[r]++];
  }
  return result;
}

function renderGrid(text, rails) {
  zigzagGrid.innerHTML = '';
  if (text.length === 0) return;

  const pattern = railPattern(text.length, rails);
  zigzagGrid.style.gridTemplateColumns = `repeat(${text.length}, 1.8rem)`;
  zigzagGrid.style.gridTemplateRows = `repeat(${rails}, 1.8rem)`;

  for (let row = 0; row < rails; row++) {
    for (let col = 0; col < text.length; col++) {
      const cell = document.createElement('div');
      cell.className = 'zigzag-cell';
      cell.style.gridRow = row + 1;
      cell.style.gridColumn = col + 1;
      if (pattern[col] === row) {
        cell.classList.add('filled');
        cell.textContent = text[col] === ' ' ? '·' : text[col];
      }
      zigzagGrid.appendChild(cell);
    }
  }
}

function updateGrid() {
  renderGrid(textInput.value, clampRails());
}

encryptBtn.addEventListener('click', () => {
  outputText.value = railFenceEncode(textInput.value, clampRails());
});

decryptBtn.addEventListener('click', () => {
  outputText.value = railFenceDecode(textInput.value, clampRails());
});

textInput.addEventListener('input', updateGrid);
railsInput.addEventListener('input', updateGrid);

updateGrid();
