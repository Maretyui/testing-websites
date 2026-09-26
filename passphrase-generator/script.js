const output = document.getElementById('output');
const wordCountInput = document.getElementById('wordCount');
const wordCountValue = document.getElementById('wordCountValue');
const separatorSelect = document.getElementById('separator');
const capitalizeCheckbox = document.getElementById('capitalize');
const addNumberCheckbox = document.getElementById('addNumber');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const entropyEl = document.getElementById('entropy');

// Rejection sampling avoids the modulo-bias that a plain
// `randomByte % list.length` would introduce, matching the approach
// already used in this repo's password-generator.
function randomIndex(max) {
  const array = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function randomWord() {
  return WORDLIST[randomIndex(WORDLIST.length)];
}

function randomDigit() {
  return String(randomIndex(10));
}

function generate() {
  const count = Number(wordCountInput.value);
  const separator = separatorSelect.value;
  const words = Array.from({ length: count }, randomWord).map((word) =>
    capitalizeCheckbox.checked ? word.charAt(0).toUpperCase() + word.slice(1) : word
  );

  if (addNumberCheckbox.checked) {
    words.push(randomDigit() + randomDigit());
  }

  output.textContent = words.join(separator);

  const bitsPerWord = Math.log2(WORDLIST.length);
  const extraBits = addNumberCheckbox.checked ? Math.log2(100) : 0;
  const totalBits = Math.round(bitsPerWord * count + extraBits);
  entropyEl.textContent = `~${totalBits} bit Entropie (${WORDLIST.length} Wörter im Vokabular)`;
}

wordCountInput.addEventListener('input', () => {
  wordCountValue.textContent = wordCountInput.value;
  generate();
});
separatorSelect.addEventListener('change', generate);
capitalizeCheckbox.addEventListener('change', generate);
addNumberCheckbox.addEventListener('change', generate);
generateBtn.addEventListener('click', generate);

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = 'Kopiert!';
    setTimeout(() => (copyBtn.textContent = 'Kopieren'), 1200);
  } catch {
    // Clipboard write can be denied - the text stays selectable either way.
  }
});

generate();
