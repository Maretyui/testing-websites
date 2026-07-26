const input = document.getElementById('input');

const charCount = document.getElementById('charCount');
const charCountNoSpaces = document.getElementById('charCountNoSpaces');
const wordCount = document.getElementById('wordCount');
const sentenceCount = document.getElementById('sentenceCount');
const paragraphCount = document.getElementById('paragraphCount');
const readingTime = document.getElementById('readingTime');

const WORDS_PER_MINUTE = 200;

function update() {
  const text = input.value;

  charCount.textContent = text.length;
  charCountNoSpaces.textContent = text.replace(/\s/g, '').length;

  const words = text.trim().length === 0 ? [] : text.trim().split(/\s+/);
  wordCount.textContent = words.length;

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  sentenceCount.textContent = sentences.length;

  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  paragraphCount.textContent = paragraphs.length;

  const minutes = words.length === 0 ? 0 : Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));
  readingTime.textContent = `${minutes} Min.`;
}

input.addEventListener('input', update);
update();
