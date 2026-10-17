const textInput = document.getElementById('textInput');
const statsEl = document.getElementById('stats');
const codeTableBody = document.querySelector('#codeTable tbody');
const treeSvg = document.getElementById('treeSvg');
const bitsOutput = document.getElementById('bitsOutput');

function buildFrequencies(text) {
  const freq = new Map();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  return freq;
}

let nextId = 0;

function buildTree(freq) {
  let nodes = [...freq.entries()].map(([char, count]) => ({
    id: nextId++, char, freq: count, left: null, right: null,
  }));

  if (nodes.length === 0) return null;
  if (nodes.length === 1) {
    // A single distinct symbol has no real binary choice to encode;
    // it still gets assigned the 1-bit code "0" so the rest of the
    // pipeline (lengths, bitstream) doesn't need a special case.
    return nodes[0];
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({
      id: nextId++, char: null, freq: left.freq + right.freq, left, right,
    });
  }
  return nodes[0];
}

function assignCodes(node, prefix, map) {
  if (!node) return;
  if (node.char !== null) {
    map.set(node.char, prefix || '0');
    return;
  }
  assignCodes(node.left, prefix + '0', map);
  assignCodes(node.right, prefix + '1', map);
}

function layoutTree(root) {
  const LEAF_GAP = 56;
  const DEPTH_GAP = 70;
  const MARGIN = 36;
  let leafIndex = 0;
  let maxDepth = 0;

  function visit(node, depth) {
    maxDepth = Math.max(maxDepth, depth);
    if (node.char !== null) {
      node.x = MARGIN + leafIndex * LEAF_GAP;
      node.y = MARGIN + depth * DEPTH_GAP;
      leafIndex++;
      return;
    }
    visit(node.left, depth + 1);
    visit(node.right, depth + 1);
    node.x = (node.left.x + node.right.x) / 2;
    node.y = MARGIN + depth * DEPTH_GAP;
  }

  visit(root, 0);
  return {
    width: MARGIN * 2 + Math.max(1, leafIndex - 1) * LEAF_GAP,
    height: MARGIN * 2 + maxDepth * DEPTH_GAP,
  };
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function renderTree(root) {
  treeSvg.innerHTML = '';
  if (!root) return;
  const { width, height } = layoutTree(root);
  treeSvg.setAttribute('width', width);
  treeSvg.setAttribute('height', height);
  treeSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  function drawEdges(node) {
    if (node.char !== null) return;
    for (const [child, bit] of [[node.left, '0'], [node.right, '1']]) {
      treeSvg.appendChild(svgEl('line', {
        x1: node.x, y1: node.y, x2: child.x, y2: child.y,
        stroke: '#9ca3af', 'stroke-width': 1.5,
      }));
      const midX = (node.x + child.x) / 2;
      const midY = (node.y + child.y) / 2;
      const label = svgEl('text', {
        x: midX, y: midY - 4, 'text-anchor': 'middle',
        'font-size': '11', fill: '#4f46e5', 'font-family': 'ui-monospace, monospace',
      });
      label.textContent = bit;
      treeSvg.appendChild(label);
      drawEdges(child);
    }
  }
  drawEdges(root);

  function drawNodes(node) {
    const isLeaf = node.char !== null;
    treeSvg.appendChild(svgEl('circle', {
      cx: node.x, cy: node.y, r: isLeaf ? 16 : 13,
      fill: isLeaf ? '#4f46e5' : '#fff',
      stroke: '#4f46e5', 'stroke-width': 2,
    }));
    const label = svgEl('text', {
      x: node.x, y: node.y + (isLeaf ? 4 : 4), 'text-anchor': 'middle',
      'font-size': isLeaf ? '11' : '10',
      fill: isLeaf ? '#fff' : '#374151',
      'font-family': 'ui-monospace, monospace', 'font-weight': '600',
    });
    label.textContent = isLeaf
      ? (node.char === ' ' ? '␣' : node.char)
      : String(node.freq);
    treeSvg.appendChild(label);
    if (isLeaf) {
      const freqLabel = svgEl('text', {
        x: node.x, y: node.y + 28, 'text-anchor': 'middle',
        'font-size': '9', fill: '#6b7280', 'font-family': 'system-ui, sans-serif',
      });
      freqLabel.textContent = `×${node.freq}`;
      treeSvg.appendChild(freqLabel);
    } else {
      drawNodes(node.left);
      drawNodes(node.right);
    }
  }
  drawNodes(root);
}

function render() {
  const text = textInput.value;
  codeTableBody.innerHTML = '';
  bitsOutput.textContent = '';
  treeSvg.innerHTML = '';

  if (!text) {
    statsEl.textContent = 'Bitte Text eingeben.';
    return;
  }

  const freq = buildFrequencies(text);
  const tree = buildTree(freq);
  const codes = new Map();
  assignCodes(tree, '', codes);

  const sortedChars = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  for (const [char, count] of sortedChars) {
    const row = document.createElement('tr');
    const display = char === ' ' ? '␣ (Leerzeichen)' : char === '\n' ? '↵ (Zeilenumbruch)' : char;
    row.innerHTML = `<td>${display}</td><td>${count}</td><td class="code">${codes.get(char)}</td>`;
    codeTableBody.appendChild(row);
  }

  renderTree(tree);

  const originalBits = text.length * 8;
  let compressedBits = 0;
  let bitstream = '';
  for (const ch of text) {
    const code = codes.get(ch);
    compressedBits += code.length;
    bitstream += code;
  }
  const ratio = originalBits === 0 ? 0 : (100 - (compressedBits / originalBits) * 100);
  statsEl.textContent =
    `${text.length} Zeichen, ${freq.size} unterschiedliche. ` +
    `Original: ${originalBits} Bit (8 Bit/Zeichen) → Huffman: ${compressedBits} Bit ` +
    `(${ratio >= 0 ? '−' : '+'}${Math.abs(ratio).toFixed(1)}%).`;
  bitsOutput.textContent = bitstream;
}

textInput.addEventListener('input', render);
render();
