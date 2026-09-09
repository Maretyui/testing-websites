const countInput = document.getElementById('countInput');
const generateBtn = document.getElementById('generateBtn');
const uuidList = document.getElementById('uuidList');
const copiedMsg = document.getElementById('copiedMsg');

function generate() {
  const count = Math.min(50, Math.max(1, Number(countInput.value) || 1));
  countInput.value = count;
  uuidList.innerHTML = '';
  copiedMsg.textContent = '';

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const li = document.createElement('li');

    const code = document.createElement('code');
    code.textContent = id;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Kopieren';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(id);
        copiedMsg.textContent = `Kopiert: ${id}`;
      } catch {
        copiedMsg.textContent = 'Kopieren fehlgeschlagen — bitte manuell markieren.';
      }
    });

    li.append(code, copyBtn);
    uuidList.append(li);
  }
}

generateBtn.addEventListener('click', generate);
generate();
