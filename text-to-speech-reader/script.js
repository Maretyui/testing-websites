const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rateInput');
const rateValue = document.getElementById('rateValue');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

const supported = 'speechSynthesis' in window;
let voices = [];
let paused = false;

function populateVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  const deIndex = voices.findIndex((v) => v.lang.startsWith('de'));
  if (deIndex !== -1) voiceSelect.value = deIndex;
}

function setButtons({ playing, canPause }) {
  playBtn.disabled = playing;
  pauseBtn.disabled = !canPause;
  stopBtn.disabled = !playing && !canPause;
}

function speak() {
  const text = textInput.value.trim();
  if (!text) {
    status.textContent = 'Bitte zuerst Text eingeben.';
    return;
  }
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const chosen = voices[Number(voiceSelect.value)];
  if (chosen) {
    utterance.voice = chosen;
    utterance.lang = chosen.lang;
  }
  utterance.rate = Number(rateInput.value);

  utterance.onstart = () => {
    status.textContent = 'Wird vorgelesen …';
    setButtons({ playing: true, canPause: true });
  };
  utterance.onend = () => {
    status.textContent = 'Fertig.';
    setButtons({ playing: false, canPause: false });
  };
  utterance.onerror = () => {
    status.textContent = 'Beim Vorlesen ist ein Fehler aufgetreten.';
    setButtons({ playing: false, canPause: false });
  };

  speechSynthesis.speak(utterance);
  paused = false;
}

if (supported) {
  populateVoices();
  if ('onvoiceschanged' in speechSynthesis) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  rateInput.addEventListener('input', () => {
    rateValue.textContent = Number(rateInput.value).toFixed(1);
  });

  playBtn.addEventListener('click', speak);

  pauseBtn.addEventListener('click', () => {
    if (!paused) {
      speechSynthesis.pause();
      paused = true;
      pauseBtn.textContent = '▶ Weiter';
      status.textContent = 'Pausiert.';
    } else {
      speechSynthesis.resume();
      paused = false;
      pauseBtn.textContent = '⏸ Pause';
      status.textContent = 'Wird vorgelesen …';
    }
  });

  stopBtn.addEventListener('click', () => {
    speechSynthesis.cancel();
    paused = false;
    pauseBtn.textContent = '⏸ Pause';
    status.textContent = 'Gestoppt.';
    setButtons({ playing: false, canPause: false });
  });
} else {
  status.textContent = 'Dieser Browser unterstützt die Web-Speech-API nicht.';
  playBtn.disabled = true;
}
