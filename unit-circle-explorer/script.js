(function () {
  const canvas = document.getElementById('circle');
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('angleSlider');
  const angleDegEl = document.getElementById('angleDeg');
  const angleRadEl = document.getElementById('angleRad');
  const sinEl = document.getElementById('sinValue');
  const cosEl = document.getElementById('cosValue');
  const tanEl = document.getElementById('tanValue');
  const presetButtons = document.querySelectorAll('.preset-btn');

  const SIZE = canvas.width; // internal resolution, independent of CSS display size
  const CENTER = SIZE / 2;
  const RADIUS = SIZE * 0.36;

  let angleRad = (45 * Math.PI) / 180;
  let dragging = false;

  function formatTan(sin, cos) {
    if (Math.abs(cos) < 1e-4) return 'undefined';
    const t = sin / cos;
    if (Math.abs(t) > 999) return t > 0 ? '→ +∞' : '→ -∞';
    return t.toFixed(3);
  }

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CENTER);
    ctx.lineTo(SIZE, CENTER);
    ctx.moveTo(CENTER, 0);
    ctx.lineTo(CENTER, SIZE);
    ctx.stroke();

    // Unit circle
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const px = CENTER + cos * RADIUS;
    const py = CENTER - sin * RADIUS;

    // cos segment (horizontal, blue) along the x-axis
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(px, CENTER);
    ctx.stroke();

    // sin segment (vertical, red) from the x-axis up/down to the point
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, CENTER);
    ctx.lineTo(px, py);
    ctx.stroke();

    // radius line (indigo) from center to the point
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(px, py);
    ctx.stroke();

    // small arc sweeping the current angle near the center
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS * 0.22, 0, -angleRad, true);
    ctx.stroke();

    // point marker
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function updateReadout() {
    const deg = (angleRad * 180) / Math.PI;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    angleDegEl.textContent = deg.toFixed(1) + '°';
    angleRadEl.textContent = angleRad.toFixed(3);
    sinEl.textContent = sin.toFixed(3);
    cosEl.textContent = cos.toFixed(3);
    tanEl.textContent = formatTan(sin, cos);
  }

  function setAngleRad(rad) {
    const twoPi = Math.PI * 2;
    angleRad = ((rad % twoPi) + twoPi) % twoPi;
    slider.value = Math.round((angleRad * 180) / Math.PI) % 360;
    draw();
    updateReadout();
  }

  function angleFromPointer(evt) {
    const rect = canvas.getBoundingClientRect();
    // Convert the pointer's on-screen position into the canvas's own
    // coordinate space - rect.width is the CSS display size, which differs
    // from the canvas's internal SIZE once the page is narrower than 320px.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    const dx = x - CENTER;
    const dy = CENTER - y; // flip to standard math orientation (up = positive)
    return Math.atan2(dy, dx);
  }

  canvas.addEventListener('pointerdown', (evt) => {
    dragging = true;
    canvas.setPointerCapture(evt.pointerId);
    setAngleRad(angleFromPointer(evt));
  });

  canvas.addEventListener('pointermove', (evt) => {
    if (!dragging) return;
    setAngleRad(angleFromPointer(evt));
  });

  function stopDrag(evt) {
    dragging = false;
    if (canvas.hasPointerCapture(evt.pointerId)) {
      canvas.releasePointerCapture(evt.pointerId);
    }
  }

  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);

  slider.addEventListener('input', () => {
    setAngleRad((Number(slider.value) * Math.PI) / 180);
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setAngleRad((Number(btn.dataset.angle) * Math.PI) / 180);
    });
  });

  setAngleRad(angleRad);
})();
