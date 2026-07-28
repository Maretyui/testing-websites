const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const copiedMsg = document.getElementById('copiedMsg');
const generateBtn = document.getElementById('generateBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

const checkboxes = {
  lowercase: document.getElementById('lowercase'),
  uppercase: document.getElementById('uppercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
};

// Rejection sampling avoids the modulo-bias that a plain
// `randomByte % charset.length` would introduce for charset lengths
// that don't evenly divide 256.
function randomIndex(max) {
  const array = new Uint8Array(1);
  const limit = 256 - (256 % max);
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function activeCharset() {
  let charset = '';
  for (const key in checkboxes) {
    if (checkboxes[key].checked) charset += CHARSETS[key];
  }
  if (!charset) {
    checkboxes.lowercase.checked = true;
    charset = CHARSETS.lowercase;
  }
  return charset;
}

function generate() {
  const charset = activeCharset();
  const length = Number(lengthRange.value);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomIndex(charset.length)];
  }
  output.value = password;
  copiedMsg.textContent = '';
  updateStrength(charset.length, length);
}

function updateStrength(charsetSize, length) {
  const bits = length * Math.log2(charsetSize);
  let ratio, label, color;
  if (bits < 40) {
    ratio = 0.25; label = 'Schwach'; color = '#ef4444';
  } else if (bits < 60) {
    ratio = 0.5; label = 'Okay'; color = '#f59e0b';
  } else if (bits < 90) {
    ratio = 0.75; label = 'Stark'; color = '#22c55e';
  } else {
    ratio = 1; label = 'Sehr stark'; color = '#16a34a';
  }
  strengthFill.style.width = `${ratio * 100}%`;
  strengthFill.style.background = color;
  strengthLabel.textContent = label;
}

lengthRange.addEventListener('input', () => {
  lengthValue.textContent = lengthRange.value;
  generate();
});

Object.values(checkboxes).forEach((box) => {
  box.addEventListener('change', generate);
});

generateBtn.addEventListener('click', generate);

copyBtn.addEventListener('click', async () => {
  if (!output.value) return;
  await navigator.clipboard.writeText(output.value);
  copiedMsg.textContent = 'In Zwischenablage kopiert!';
  setTimeout(() => { copiedMsg.textContent = ''; }, 2000);
});

generate();
