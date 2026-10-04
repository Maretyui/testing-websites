const NAMED_COLORS = [
  ['black', '#000000'], ['white', '#ffffff'], ['red', '#ff0000'], ['lime', '#00ff00'],
  ['blue', '#0000ff'], ['yellow', '#ffff00'], ['cyan', '#00ffff'], ['magenta', '#ff00ff'],
  ['silver', '#c0c0c0'], ['gray', '#808080'], ['maroon', '#800000'], ['olive', '#808000'],
  ['green', '#008000'], ['purple', '#800080'], ['teal', '#008080'], ['navy', '#000080'],
  ['orange', '#ffa500'], ['pink', '#ffc0cb'], ['brown', '#a52a2a'], ['gold', '#ffd700'],
  ['coral', '#ff7f50'], ['salmon', '#fa8072'], ['khaki', '#f0e68c'], ['violet', '#ee82ee'],
  ['indigo', '#4b0082'], ['turquoise', '#40e0d0'], ['orchid', '#da70d6'], ['plum', '#dda0dd'],
  ['tan', '#d2b48c'], ['chocolate', '#d2691e'], ['crimson', '#dc143c'], ['firebrick', '#b22222'],
  ['tomato', '#ff6347'], ['orangered', '#ff4500'], ['darkorange', '#ff8c00'], ['goldenrod', '#daa520'],
  ['yellowgreen', '#9acd32'], ['forestgreen', '#228b22'], ['seagreen', '#2e8b57'],
  ['mediumseagreen', '#3cb371'], ['springgreen', '#00ff7f'], ['darkgreen', '#006400'],
  ['olivedrab', '#6b8e23'], ['darkolivegreen', '#556b2f'], ['lightgreen', '#90ee90'],
  ['palegreen', '#98fb98'], ['darkseagreen', '#8fbc8f'], ['mediumspringgreen', '#00fa9a'],
  ['lawngreen', '#7cfc00'], ['chartreuse', '#7fff00'], ['limegreen', '#32cd32'],
  ['darkcyan', '#008b8b'], ['lightseagreen', '#20b2aa'], ['cadetblue', '#5f9ea0'],
  ['steelblue', '#4682b4'], ['lightblue', '#add8e6'], ['powderblue', '#b0e0e6'],
  ['skyblue', '#87ceeb'], ['deepskyblue', '#00bfff'], ['dodgerblue', '#1e90ff'],
  ['cornflowerblue', '#6495ed'], ['royalblue', '#4169e1'], ['mediumblue', '#0000cd'],
  ['darkblue', '#00008b'], ['midnightblue', '#191970'], ['slateblue', '#6a5acd'],
  ['darkslateblue', '#483d8b'], ['mediumslateblue', '#7b68ee'], ['blueviolet', '#8a2be2'],
  ['darkviolet', '#9400d3'], ['darkorchid', '#9932cc'], ['mediumorchid', '#ba55d3'],
  ['mediumpurple', '#9370db'], ['thistle', '#d8bfd8'], ['lavender', '#e6e6fa'],
  ['mediumvioletred', '#c71585'], ['deeppink', '#ff1493'], ['hotpink', '#ff69b4'],
  ['palevioletred', '#db7093'], ['lightpink', '#ffb6c1'], ['mistyrose', '#ffe4e1'],
  ['peachpuff', '#ffdab9'], ['bisque', '#ffe4c4'], ['wheat', '#f5deb3'],
  ['navajowhite', '#ffdead'], ['moccasin', '#ffe4b5'], ['cornsilk', '#fff8dc'],
  ['lemonchiffon', '#fffacd'], ['lightyellow', '#ffffe0'], ['lightgoldenrodyellow', '#fafad2'],
  ['papayawhip', '#ffefd5'], ['blanchedalmond', '#ffebcd'], ['antiquewhite', '#faebd7'],
  ['linen', '#faf0e6'], ['oldlace', '#fdf5e6'], ['seashell', '#fff5ee'], ['ivory', '#fffff0'],
  ['honeydew', '#f0fff0'], ['mintcream', '#f5fffa'], ['azure', '#f0ffff'], ['aliceblue', '#f0f8ff'],
  ['ghostwhite', '#f8f8ff'], ['whitesmoke', '#f5f5f5'], ['snow', '#fffafa'], ['gainsboro', '#dcdcdc'],
  ['lightgray', '#d3d3d3'], ['darkgray', '#a9a9a9'], ['dimgray', '#696969'], ['slategray', '#708090'],
  ['lightslategray', '#778899'], ['darkslategray', '#2f4f4f'], ['beige', '#f5f5dc'],
  ['sienna', '#a0522d'], ['saddlebrown', '#8b4513'], ['peru', '#cd853f'], ['rosybrown', '#bc8f8f'],
  ['sandybrown', '#f4a460'], ['burlywood', '#deb887'], ['darkkhaki', '#bdb76b'],
  ['darksalmon', '#e9967a'], ['lightsalmon', '#ffa07a'], ['lightcoral', '#f08080'],
  ['indianred', '#cd5c5c'], ['rebeccapurple', '#663399'], ['darkmagenta', '#8b008b'],
  ['darkgoldenrod', '#b8860b'], ['lightcyan', '#e0ffff'], ['darkturquoise', '#00ced1'],
  ['mediumturquoise', '#48d1cc'], ['paleturquoise', '#afeeee'], ['aquamarine', '#7fffd4'],
  ['mediumaquamarine', '#66cdaa'], ['greenyellow', '#adff2f'], ['darkred', '#8b0000'],
];

const pickedColor = document.getElementById('pickedColor');
const pickedColorHex = document.getElementById('pickedColorHex');
const matchesEl = document.getElementById('matches');

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function render(hex) {
  const target = hexToRgb(hex);
  const ranked = NAMED_COLORS
    .map(([name, nameHex]) => ({ name, hex: nameHex, dist: distance(target, hexToRgb(nameHex)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);

  matchesEl.innerHTML = '';
  ranked.forEach((m) => {
    const row = document.createElement('div');
    row.className = 'match' + (m.dist === 0 ? ' exact' : '');

    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.background = m.hex;

    const info = document.createElement('div');
    info.className = 'info';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = m.name;
    const hexLabel = document.createElement('div');
    hexLabel.className = 'hex';
    hexLabel.textContent = m.hex;
    info.append(name, hexLabel);

    const distanceEl = document.createElement('div');
    distanceEl.className = 'distance';
    distanceEl.textContent = m.dist === 0 ? 'Exakt' : `Δ ${m.dist.toFixed(1)}`;

    row.append(swatch, info, distanceEl);
    matchesEl.append(row);
  });
}

function isValidHex(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex);
}

pickedColor.addEventListener('input', () => {
  pickedColorHex.value = pickedColor.value;
  render(pickedColor.value);
});

pickedColorHex.addEventListener('input', () => {
  const hex = pickedColorHex.value.trim();
  if (isValidHex(hex)) {
    pickedColor.value = hex;
    render(hex);
  }
});

render(pickedColor.value);
