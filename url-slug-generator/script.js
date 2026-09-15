const titleInput = document.getElementById('titleInput');
const separatorSelect = document.getElementById('separatorSelect');
const lowercaseToggle = document.getElementById('lowercaseToggle');
const result = document.getElementById('result');
const slugOutput = document.getElementById('slugOutput');
const copyBtn = document.getElementById('copyBtn');
const copiedMsg = document.getElementById('copiedMsg');

// German umlauts/ß have a conventional transliteration that plain
// diacritic-stripping (NFD normalize) would get wrong (ä -> a, not ae),
// so they're mapped explicitly before the generic accent-stripping pass.
const GERMAN_MAP = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
};

function slugify(input, separator, lowercase) {
  let text = input;
  for (const [from, to] of Object.entries(GERMAN_MAP)) {
    text = text.split(from).join(to);
  }

  text = text.normalize('NFD').replace(/[̀-ͯ]/g, '');

  if (lowercase) {
    text = text.toLowerCase();
  }

  text = text
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '')
    .replace(new RegExp(`\\${separator}{2,}`, 'g'), separator);

  return text;
}

function update() {
  const value = titleInput.value.trim();

  if (!value) {
    result.hidden = true;
    return;
  }

  const separator = separatorSelect.value;
  const lowercase = lowercaseToggle.checked;
  slugOutput.value = slugify(value, separator, lowercase);
  result.hidden = false;
  copiedMsg.hidden = true;
}

titleInput.addEventListener('input', update);
separatorSelect.addEventListener('change', update);
lowercaseToggle.addEventListener('change', update);

copyBtn.addEventListener('click', async () => {
  if (!slugOutput.value) return;
  await navigator.clipboard.writeText(slugOutput.value);
  copiedMsg.hidden = false;
  setTimeout(() => { copiedMsg.hidden = true; }, 1500);
});
