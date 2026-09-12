const textInput = document.getElementById('textInput');
const hashList = document.getElementById('hashList');
const copiedMsg = document.getElementById('copiedMsg');

const algorithms = [
  { label: 'SHA-1', name: 'SHA-1' },
  { label: 'SHA-256', name: 'SHA-256' },
  { label: 'SHA-384', name: 'SHA-384' },
  { label: 'SHA-512', name: 'SHA-512' },
];

async function digestHex(name, text) {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(name, data);
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function render() {
  const text = textInput.value;
  hashList.innerHTML = '';
  copiedMsg.textContent = '';

  if (text === '') {
    return;
  }

  const hashes = await Promise.all(
    algorithms.map((algo) => digestHex(algo.name, text))
  );

  algorithms.forEach((algo, i) => {
    const hash = hashes[i];
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.className = 'algo-label';
    label.textContent = algo.label;

    const code = document.createElement('code');
    code.textContent = hash;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Kopieren';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(hash);
        copiedMsg.textContent = `${algo.label} kopiert.`;
      } catch {
        copiedMsg.textContent = 'Kopieren fehlgeschlagen — bitte manuell markieren.';
      }
    });

    li.append(label, code, copyBtn);
    hashList.append(li);
  });
}

textInput.addEventListener('input', render);
