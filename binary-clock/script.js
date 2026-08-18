const DIGIT_IDS = ["h0", "h1", "m0", "m1", "s0", "s1"];
const BIT_VALUES = [8, 4, 2, 1];

function buildDigit(container) {
    BIT_VALUES.forEach((value) => {
        const bit = document.createElement("div");
        bit.className = "bit";
        bit.dataset.value = String(value);
        container.appendChild(bit);
    });
}

function setDigit(container, value) {
    const bits = container.querySelectorAll(".bit");
    bits.forEach((bit) => {
        const bitValue = Number(bit.dataset.value);
        bit.classList.toggle("on", (value & bitValue) === bitValue);
    });
}

function init() {
    DIGIT_IDS.forEach((id) => {
        const el = document.querySelector(`[data-digit="${id}"]`);
        buildDigit(el);
    });
}

function pad(n) {
    return String(n).padStart(2, "0");
}

function tick() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    setDigit(document.querySelector('[data-digit="h0"]'), Number(h[0]));
    setDigit(document.querySelector('[data-digit="h1"]'), Number(h[1]));
    setDigit(document.querySelector('[data-digit="m0"]'), Number(m[0]));
    setDigit(document.querySelector('[data-digit="m1"]'), Number(m[1]));
    setDigit(document.querySelector('[data-digit="s0"]'), Number(s[0]));
    setDigit(document.querySelector('[data-digit="s1"]'), Number(s[1]));

    document.getElementById("readout").textContent = `${h}:${m}:${s}`;
}

init();
tick();
setInterval(tick, 1000);
