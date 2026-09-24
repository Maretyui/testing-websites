const LETTER_TO_BRAILLE = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑',
  f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕',
  p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽',
  z: '⠵',
};
const BRAILLE_TO_LETTER = Object.fromEntries(
  Object.entries(LETTER_TO_BRAILLE).map(([letter, braille]) => [braille, letter])
);

const PUNCT_TO_BRAILLE = {
  ',': '⠂', ';': '⠆', ':': '⠒', '.': '⠲',
  '!': '⠖', '?': '⠦', "'": '⠄', '-': '⠤',
  '(': '⠶', ')': '⠶',
};
const BRAILLE_TO_PUNCT = Object.fromEntries(
  Object.entries(PUNCT_TO_BRAILLE).map(([punct, braille]) => [braille, punct])
);

const DIGIT_TO_LETTER = { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g', '8': 'h', '9': 'i', '0': 'j' };
const LETTER_TO_DIGIT = Object.fromEntries(Object.entries(DIGIT_TO_LETTER).map(([d, l]) => [l, d]));

const CAPITAL_SIGN = '⠠';
const NUMBER_SIGN = '⠼';

const input = document.getElementById('input');
const output = document.getElementById('output');
const inputLabel = document.getElementById('inputLabel');
const outputLabel = document.getElementById('outputLabel');
const copyBtn = document.getElementById('copyBtn');
const unsupportedNote = document.getElementById('unsupportedNote');
const tabToBraille = document.getElementById('tabToBraille');
const tabToText = document.getElementById('tabToText');

let mode = 'toBraille';
let sawUnsupported = false;

function textToBraille(text) {
  sawUnsupported = false;
  let result = '';
  let inNumberMode = false;

  for (const char of text) {
    if (/[a-zA-Z]/.test(char)) {
      const lower = char.toLowerCase();
      if (char !== lower) result += CAPITAL_SIGN;
      result += LETTER_TO_BRAILLE[lower];
      inNumberMode = false;
    } else if (/[0-9]/.test(char)) {
      if (!inNumberMode) result += NUMBER_SIGN;
      result += LETTER_TO_BRAILLE[DIGIT_TO_LETTER[char]];
      inNumberMode = true;
    } else if (char === ' ' || char === '\n') {
      result += char;
      inNumberMode = false;
    } else if (PUNCT_TO_BRAILLE[char]) {
      result += PUNCT_TO_BRAILLE[char];
      inNumberMode = false;
    } else {
      result += char;
      inNumberMode = false;
      sawUnsupported = true;
    }
  }
  return result;
}

function brailleToText(braille) {
  sawUnsupported = false;
  let result = '';
  let inNumberMode = false;
  let capitalizeNext = false;

  for (const char of braille) {
    if (char === CAPITAL_SIGN) {
      capitalizeNext = true;
      continue;
    }
    if (char === NUMBER_SIGN) {
      inNumberMode = true;
      continue;
    }
    if (BRAILLE_TO_LETTER[char]) {
      const letter = BRAILLE_TO_LETTER[char];
      if (inNumberMode && LETTER_TO_DIGIT[letter]) {
        result += LETTER_TO_DIGIT[letter];
      } else {
        result += capitalizeNext ? letter.toUpperCase() : letter;
        inNumberMode = false;
      }
      capitalizeNext = false;
    } else if (BRAILLE_TO_PUNCT[char]) {
      result += BRAILLE_TO_PUNCT[char];
      inNumberMode = false;
      capitalizeNext = false;
    } else if (char === ' ' || char === '\n' || char === '⠀') {
      result += ' ';
      inNumberMode = false;
      capitalizeNext = false;
    } else {
      result += char;
      inNumberMode = false;
      capitalizeNext = false;
      sawUnsupported = true;
    }
  }
  return result;
}

function update() {
  const text = input.value;
  output.value = mode === 'toBraille' ? textToBraille(text) : brailleToText(text);
  unsupportedNote.hidden = !sawUnsupported || text.length === 0;
}

function setMode(newMode) {
  mode = newMode;
  const toBraille = mode === 'toBraille';
  tabToBraille.classList.toggle('active', toBraille);
  tabToBraille.setAttribute('aria-selected', String(toBraille));
  tabToText.classList.toggle('active', !toBraille);
  tabToText.setAttribute('aria-selected', String(!toBraille));
  inputLabel.textContent = toBraille ? 'Text' : 'Braille';
  outputLabel.textContent = toBraille ? 'Braille' : 'Text';
  input.placeholder = toBraille ? 'Hallo Welt' : '⠓⠁⠇⠇⠕ ⠺⠑⠇⠞';

  const previousValue = input.value;
  input.value = output.value;
  output.value = '';
  if (previousValue) update();
}

input.addEventListener('input', update);
tabToBraille.addEventListener('click', () => setMode('toBraille'));
tabToText.addEventListener('click', () => setMode('toText'));

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

input.value = 'Hallo Welt';
update();
