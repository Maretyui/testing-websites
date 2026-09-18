const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const topTextEl = document.getElementById('topText');
const bottomTextEl = document.getElementById('bottomText');
const downloadBtn = document.getElementById('downloadBtn');

let image = null;

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      image = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      placeholder.style.display = 'none';
      downloadBtn.disabled = false;
      draw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

topTextEl.addEventListener('input', draw);
bottomTextEl.addEventListener('input', draw);

function draw() {
  if (!image) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const fontSize = Math.round(canvas.width * 0.09);
  ctx.font = `700 ${fontSize}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = fontSize * 0.08;
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#fff';

  const topText = topTextEl.value.trim().toUpperCase();
  if (topText) {
    drawWrappedText(topText, canvas.width / 2, fontSize * 1.2, fontSize, 'top');
  }

  const bottomText = bottomTextEl.value.trim().toUpperCase();
  if (bottomText) {
    drawWrappedText(bottomText, canvas.width / 2, canvas.height - fontSize * 0.6, fontSize, 'bottom');
  }
}

function drawWrappedText(text, x, baseY, fontSize, anchor) {
  const maxWidth = canvas.width * 0.92;
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);

  const lineHeight = fontSize * 1.1;
  lines.forEach((line, i) => {
    const y = anchor === 'top'
      ? baseY + i * lineHeight
      : baseY - (lines.length - 1 - i) * lineHeight;
    ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
  });
}

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
