const CATEGORY_LABELS = {
  'alkali-metal': 'Alkalimetall',
  'alkaline-earth': 'Erdalkalimetall',
  'transition-metal': 'Übergangsmetall',
  'post-transition-metal': 'Metall',
  'metalloid': 'Halbmetall',
  'nonmetal': 'Nichtmetall',
  'halogen': 'Halogen',
  'noble-gas': 'Edelgas',
  'lanthanide': 'Lanthanoid',
  'actinide': 'Actinoid',
};

const ptable = document.getElementById('ptable');
const detail = document.getElementById('detail');

function renderTable() {
  const fragment = document.createDocumentFragment();

  for (const el of ELEMENTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cell ${el.cat}`;
    btn.style.gridColumn = String(el.group);
    btn.style.gridRow = String(el.period);
    btn.dataset.n = String(el.n);
    btn.setAttribute('aria-label', `${el.name} (${el.s}), Ordnungszahl ${el.n}`);
    btn.innerHTML = `<span class="num">${el.n}</span><span class="sym">${el.s}</span>`;
    btn.addEventListener('click', () => selectElement(el.n));
    fragment.appendChild(btn);
  }

  ptable.appendChild(fragment);
}

function selectElement(n) {
  const el = ELEMENTS.find((e) => e.n === n);
  if (!el) return;

  for (const cell of ptable.querySelectorAll('.cell.selected')) {
    cell.classList.remove('selected');
  }
  const cell = ptable.querySelector(`.cell[data-n="${n}"]`);
  if (cell) cell.classList.add('selected');

  detail.innerHTML = `
    <p class="name">${el.n} — ${el.name} (${el.s})</p>
    <dl>
      <dt>Kategorie</dt><dd>${CATEGORY_LABELS[el.cat] || el.cat}</dd>
      <dt>Periode</dt><dd>${el.period <= 7 ? el.period : (el.period === 9 ? 6 : 7)}</dd>
      <dt>Atommasse</dt><dd>${el.mass} u</dd>
    </dl>
  `;
}

renderTable();
