const cidrInput = document.getElementById('cidrInput');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');

const fields = {
  network: document.getElementById('network'),
  broadcast: document.getElementById('broadcast'),
  mask: document.getElementById('mask'),
  wildcard: document.getElementById('wildcard'),
  firstHost: document.getElementById('firstHost'),
  lastHost: document.getElementById('lastHost'),
  usable: document.getElementById('usable'),
  total: document.getElementById('total'),
};

function ipToInt(parts) {
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
}

function parseCidr(value) {
  const match = value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!match) {
    throw new Error('Format erwartet: a.b.c.d/prefix, z. B. 192.168.1.10/24');
  }
  const parts = [1, 2, 3, 4].map((i) => Number(match[i]));
  const prefix = Number(match[5]);

  if (parts.some((p) => p < 0 || p > 255)) {
    throw new Error('Jedes Oktett muss zwischen 0 und 255 liegen.');
  }
  if (prefix < 0 || prefix > 32) {
    throw new Error('Das Präfix muss zwischen 0 und 32 liegen.');
  }

  return { ip: ipToInt(parts), prefix };
}

function maskFromPrefix(prefix) {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function render() {
  let parsed;
  try {
    parsed = parseCidr(cidrInput.value);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
    resultsEl.style.display = 'none';
    return;
  }
  errorEl.hidden = true;
  resultsEl.style.display = 'flex';

  const { ip, prefix } = parsed;
  const mask = maskFromPrefix(prefix);
  const wildcard = (~mask) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let firstHost, lastHost, usable;
  if (prefix >= 31) {
    // /31 point-to-point (both addresses usable) and /32 (single host)
    firstHost = network;
    lastHost = broadcast;
    usable = prefix === 31 ? 2 : 1;
  } else {
    firstHost = (network + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
    usable = totalAddresses - 2;
  }

  fields.network.textContent = `${intToIp(network)}/${prefix}`;
  fields.broadcast.textContent = intToIp(broadcast);
  fields.mask.textContent = intToIp(mask);
  fields.wildcard.textContent = intToIp(wildcard);
  fields.firstHost.textContent = intToIp(firstHost);
  fields.lastHost.textContent = intToIp(lastHost);
  fields.usable.textContent = usable.toLocaleString('de-DE');
  fields.total.textContent = totalAddresses.toLocaleString('de-DE');
}

cidrInput.addEventListener('input', render);
render();
