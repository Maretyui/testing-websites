const numberInput = document.getElementById('numberInput');
const output = document.getElementById('output');
const errorMsg = document.getElementById('errorMsg');
const copyBtn = document.getElementById('copyBtn');

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
];
const SCALES = ['', ' thousand', ' million', ' billion'];

const MAX_VALUE = 999999999999;

function threeDigitsToWords(n) {
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds > 0) parts.push(`${ONES[hundreds]} hundred`);

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest]);
    } else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }

  return parts.join(' ');
}

function numberToWords(n) {
  if (n === 0) return 'zero';

  const negative = n < 0;
  n = Math.abs(n);

  const groups = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const words = groups
    .map((group, i) => (group === 0 ? '' : threeDigitsToWords(group) + SCALES[i]))
    .filter(Boolean)
    .reverse()
    .join(', ');

  return negative ? `negative ${words}` : words;
}

function render() {
  const raw = numberInput.value.trim();

  if (raw === '') {
    output.textContent = 'Gib eine Zahl ein.';
    errorMsg.classList.add('hidden');
    return;
  }

  const value = Number(raw);

  if (!Number.isInteger(value)) {
    errorMsg.textContent = 'Bitte eine Ganzzahl eingeben (keine Dezimalstellen).';
    errorMsg.classList.remove('hidden');
    output.textContent = ' ';
    return;
  }

  if (Math.abs(value) > MAX_VALUE) {
    errorMsg.textContent = `Der Betrag muss zwischen -${MAX_VALUE.toLocaleString('de-DE')} und ${MAX_VALUE.toLocaleString('de-DE')} liegen.`;
    errorMsg.classList.remove('hidden');
    output.textContent = ' ';
    return;
  }

  errorMsg.classList.add('hidden');
  const words = numberToWords(value);
  output.textContent = words.charAt(0).toUpperCase() + words.slice(1);
}

numberInput.addEventListener('input', render);

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = 'Kopiert!';
    setTimeout(() => (copyBtn.textContent = 'In Zwischenablage kopieren'), 1200);
  } catch {
    // Clipboard write can be denied - the text stays selectable either way.
  }
});

render();
