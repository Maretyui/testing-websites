const preview = document.getElementById("preview");
const typeTabs = document.getElementById("typeTabs");
const angleRow = document.getElementById("angleRow");
const angleInput = document.getElementById("angle");
const angleValue = document.getElementById("angleValue");
const stopsContainer = document.getElementById("stops");
const addStopBtn = document.getElementById("addStopBtn");
const randomizeBtn = document.getElementById("randomizeBtn");
const codeEl = document.getElementById("code");
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

const MIN_STOPS = 2;
const MAX_STOPS = 5;

const state = {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#6366f1", pos: 0 },
    { color: "#ec4899", pos: 100 },
  ],
};

function randomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
}

function sortedStops() {
  return [...state.stops].sort((a, b) => a.pos - b.pos);
}

function buildGradientCss() {
  const stopsCss = sortedStops()
    .map((stop) => `${stop.color} ${stop.pos}%`)
    .join(", ");

  if (state.type === "radial") {
    return `radial-gradient(circle, ${stopsCss})`;
  }
  return `linear-gradient(${state.angle}deg, ${stopsCss})`;
}

function update() {
  const gradient = buildGradientCss();
  preview.style.background = gradient;
  codeEl.value = `background: ${gradient};`;
}

function renderStops() {
  stopsContainer.innerHTML = "";

  state.stops.forEach((stop, index) => {
    const row = document.createElement("div");
    row.className = "stop-row";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = stop.color;
    colorInput.addEventListener("input", () => {
      stop.color = colorInput.value;
      update();
    });

    const posInput = document.createElement("input");
    posInput.type = "range";
    posInput.min = "0";
    posInput.max = "100";
    posInput.value = String(stop.pos);
    posInput.addEventListener("input", () => {
      stop.pos = Number(posInput.value);
      posLabel.textContent = `${stop.pos}%`;
      update();
    });

    const posLabel = document.createElement("span");
    posLabel.className = "stop-pos";
    posLabel.textContent = `${stop.pos}%`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-stop";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Farbe entfernen");
    removeBtn.disabled = state.stops.length <= MIN_STOPS;
    removeBtn.addEventListener("click", () => {
      if (state.stops.length <= MIN_STOPS) return;
      state.stops.splice(index, 1);
      renderStops();
      update();
    });

    row.append(colorInput, posInput, posLabel, removeBtn);
    stopsContainer.appendChild(row);
  });

  addStopBtn.disabled = state.stops.length >= MAX_STOPS;
}

typeTabs.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    typeTabs.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    state.type = tab.dataset.type;
    angleRow.style.display = state.type === "linear" ? "flex" : "none";
    update();
  });
});

angleInput.addEventListener("input", () => {
  state.angle = Number(angleInput.value);
  angleValue.textContent = `${state.angle}°`;
  update();
});

addStopBtn.addEventListener("click", () => {
  if (state.stops.length >= MAX_STOPS) return;
  const sorted = sortedStops();
  const lastPos = sorted[sorted.length - 1].pos;
  const newPos = Math.min(100, lastPos === 100 ? 50 : lastPos + 20);
  state.stops.push({ color: randomHexColor(), pos: newPos });
  renderStops();
  update();
});

randomizeBtn.addEventListener("click", () => {
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 stops
  const step = 100 / (count - 1);
  state.stops = Array.from({ length: count }, (_, i) => ({
    color: randomHexColor(),
    pos: Math.round(i * step),
  }));
  state.angle = Math.floor(Math.random() * 360);
  angleInput.value = String(state.angle);
  angleValue.textContent = `${state.angle}°`;
  renderStops();
  update();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeEl.value);
  } catch (err) {
    codeEl.select();
    document.execCommand("copy");
  }
  copiedMsg.textContent = "In Zwischenablage kopiert";
  setTimeout(() => {
    copiedMsg.textContent = "";
  }, 1500);
});

renderStops();
update();
