const tabs = document.querySelectorAll(".tab");
const keyInput = document.getElementById("key");
const textInput = document.getElementById("text");
const output = document.getElementById("output");

let mode = "encrypt";

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    mode = tab.dataset.mode;
    update();
  });
});

const A = "A".charCodeAt(0);

function vigenere(text, key, decrypt) {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!cleanKey) return "";

  let result = "";
  let keyIndex = 0;

  for (const char of text) {
    const isUpper = char >= "A" && char <= "Z";
    const isLower = char >= "a" && char <= "z";

    if (!isUpper && !isLower) {
      result += char;
      continue;
    }

    const base = isUpper ? char.charCodeAt(0) - A : char.charCodeAt(0) - A - 32;
    const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - A;
    const applied = decrypt ? shift * -1 : shift;
    const shifted = ((base + applied) % 26 + 26) % 26;

    result += String.fromCharCode(shifted + A + (isLower ? 32 : 0));
    keyIndex++;
  }

  return result;
}

function update() {
  const key = keyInput.value;
  const text = textInput.value;

  if (!key.replace(/[^A-Za-z]/g, "") || !text) {
    output.value = "";
    return;
  }

  output.value = vigenere(text, key, mode === "decrypt");
}

keyInput.addEventListener("input", update);
textInput.addEventListener("input", update);
