const diskCountInput = document.getElementById('diskCount');
const diskCountValue = document.getElementById('diskCountValue');
const pegsEl = document.getElementById('pegs');
const pegEls = Array.from(pegsEl.querySelectorAll('.peg'));
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const solveBtn = document.getElementById('solveBtn');
const pauseBtn = document.getElementById('pauseBtn');

let diskCount = Number(diskCountInput.value);
let pegs; // pegs[p] = array of disk sizes, index 0 = bottom, last = top
let moveCount = 0;
let autoTimer = null;
let autoQueue = [];
let autoPaused = false;

function diskColor(size) {
  const hue = Math.round((size / diskCount) * 260);
  return `hsl(${hue}, 65%, 60%)`;
}

function reset() {
  diskCount = Number(diskCountInput.value);
  diskCountValue.textContent = String(diskCount);
  pegs = [Array.from({ length: diskCount }, (_, i) => diskCount - i), [], []];
  moveCount = 0;
  stopAuto();
  render();
}

function minMoves() {
  return Math.pow(2, diskCount) - 1;
}

function updateStatus() {
  status.textContent = `${moveCount} move${moveCount === 1 ? '' : 's'}. Minimum possible: ${minMoves()}.`;
  if (pegs[2].length === diskCount) {
    status.textContent += moveCount === minMoves() ? ' Solved optimally!' : ' Solved!';
  }
}

function render() {
  pegEls.forEach((pegEl, p) => {
    pegEl.querySelectorAll('.disk').forEach((d) => d.remove());
    pegs[p].forEach((size) => {
      const disk = document.createElement('div');
      disk.className = 'disk';
      disk.dataset.size = String(size);
      const widthPct = 30 + (size / diskCount) * 65;
      disk.style.width = `${widthPct}%`;
      disk.style.background = diskColor(size);
      disk.textContent = String(size);
      pegEl.appendChild(disk);
    });
  });
  updateStatus();
}

function canMove(from, to) {
  if (from === to) return false;
  if (pegs[from].length === 0) return false;
  const moving = pegs[from][pegs[from].length - 1];
  const target = pegs[to][pegs[to].length - 1];
  return target === undefined || moving < target;
}

function applyMove(from, to) {
  if (!canMove(from, to)) return false;
  const disk = pegs[from].pop();
  pegs[to].push(disk);
  moveCount++;
  render();
  return true;
}

// --- Drag to move a disk between pegs (pointer events, works with touch too) ---

let dragDisk = null;
let dragFromPeg = null;
let ghost = null;

function pegUnderPoint(x, y) {
  if (ghost) ghost.style.display = 'none';
  const el = document.elementFromPoint(x, y);
  if (ghost) ghost.style.display = '';
  const pegEl = el && el.closest ? el.closest('.peg') : null;
  return pegEl ? Number(pegEl.dataset.peg) : null;
}

pegEls.forEach((pegEl) => {
  pegEl.addEventListener('pointerdown', (e) => {
    const p = Number(pegEl.dataset.peg);
    if (pegs[p].length === 0) return;
    const topDiskSize = pegs[p][pegs[p].length - 1];
    const diskEl = pegEl.querySelector(`.disk[data-size="${topDiskSize}"]`);
    if (!diskEl) return;
    dragFromPeg = p;
    dragDisk = topDiskSize;
    diskEl.classList.add('dragging');

    const rect = diskEl.getBoundingClientRect();
    ghost = diskEl.cloneNode(true);
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '1000';
    document.body.appendChild(ghost);

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    function onMove(ev) {
      ghost.style.left = `${ev.clientX - offsetX}px`;
      ghost.style.top = `${ev.clientY - offsetY}px`;
      pegEls.forEach((pe) => pe.classList.remove('drop-target'));
      const targetPeg = pegUnderPoint(ev.clientX, ev.clientY);
      if (targetPeg !== null) pegEls[targetPeg].classList.add('drop-target');
    }

    function onUp(ev) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      pegEls.forEach((pe) => pe.classList.remove('drop-target'));
      const targetPeg = pegUnderPoint(ev.clientX, ev.clientY);
      if (ghost) { ghost.remove(); ghost = null; }
      if (targetPeg !== null) applyMove(dragFromPeg, targetPeg);
      else render();
      dragDisk = null;
      dragFromPeg = null;
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
});

// --- Auto-solve: classic recursive solution, replayed as a queue of moves ---

function buildMoves(n, from, to, aux, moves) {
  if (n === 0) return;
  buildMoves(n - 1, from, aux, to, moves);
  moves.push([from, to]);
  buildMoves(n - 1, aux, to, from, moves);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  autoQueue = [];
  autoPaused = false;
  solveBtn.hidden = false;
  pauseBtn.hidden = true;
  pauseBtn.textContent = 'Pause';
}

function startAuto() {
  reset();
  autoQueue = [];
  buildMoves(diskCount, 0, 2, 1, autoQueue);
  solveBtn.hidden = true;
  pauseBtn.hidden = false;
  autoPaused = false;
  autoTimer = setInterval(() => {
    if (autoPaused) return;
    const next = autoQueue.shift();
    if (!next) {
      stopAuto();
      return;
    }
    applyMove(next[0], next[1]);
  }, 500);
}

diskCountInput.addEventListener('input', reset);
resetBtn.addEventListener('click', reset);
solveBtn.addEventListener('click', startAuto);
pauseBtn.addEventListener('click', () => {
  autoPaused = !autoPaused;
  pauseBtn.textContent = autoPaused ? 'Resume' : 'Pause';
});

reset();
