const DEFAULT_TEXT = `Der Wind drehte am Nachmittag und brachte kühle Luft von der Küste. Die Wolken zogen schnell über das Tal und warfen wechselnde Schatten auf die Wiesen. Am Abend beruhigte sich der Wind wieder und der Himmel klarte auf. Die Sterne waren in dieser Nacht besonders klar zu sehen, weil kein Mond am Himmel stand. Am nächsten Morgen lag Nebel über dem Fluss und verschwand erst gegen Mittag. Die Vögel sangen früh und laut, sobald die ersten Sonnenstrahlen die Bäume erreichten. Im Laufe des Tages wurde es wärmer und die Luft roch nach frisch gemähtem Gras. Am Nachmittag zogen wieder Wolken auf, diesmal dunkler als am Vortag. Ein kurzer Regenschauer kühlte die Luft merklich ab. Danach kehrte die Sonne zurück und ein Regenbogen spannte sich über das Tal.`;

const sourceText = document.getElementById('sourceText');
const sentenceCountInput = document.getElementById('sentenceCount');
const sentenceCountValue = document.getElementById('sentenceCountValue');
const generateBtn = document.getElementById('generateBtn');
const output = document.getElementById('output');

sourceText.value = DEFAULT_TEXT;

sentenceCountInput.addEventListener('input', () => {
  sentenceCountValue.textContent = sentenceCountInput.value;
});

function tokenizeSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean));
}

function buildChain(sentences) {
  const starts = [];
  const transitions = new Map();

  for (const words of sentences) {
    if (!words.length) continue;
    starts.push(words[0]);
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i];
      const next = words[i + 1];
      if (!transitions.has(current)) transitions.set(current, []);
      transitions.get(current).push(next);
    }
  }

  return { starts, transitions };
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateSentence(chain, maxWords = 16) {
  if (!chain.starts.length) return '';
  const words = [pickRandom(chain.starts)];

  while (words.length < maxWords) {
    const current = words[words.length - 1];
    const options = chain.transitions.get(current);
    if (!options || !options.length) break;
    words.push(pickRandom(options));
  }

  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function render(sentences) {
  if (!sentences.length) {
    output.innerHTML = '<span class="empty">Noch keine Sätze erzeugt.</span>';
    return;
  }
  output.textContent = sentences.join(' ');
}

generateBtn.addEventListener('click', () => {
  const sentences = tokenizeSentences(sourceText.value);
  const chain = buildChain(sentences);

  if (!chain.starts.length) {
    output.innerHTML = '<span class="empty">Bitte etwas mehr Text eingeben (mind. ein vollständiger Satz).</span>';
    return;
  }

  const count = Number(sentenceCountInput.value);
  const generated = Array.from({ length: count }, () => generateSentence(chain)).filter(Boolean);
  render(generated);
});

render([]);
