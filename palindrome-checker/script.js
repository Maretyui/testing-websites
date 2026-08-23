const input = document.getElementById("input");
const result = document.getElementById("result");
const longestEl = document.getElementById("longest");

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isPalindrome(str) {
  for (let i = 0, j = str.length - 1; i < j; i++, j--) {
    if (str[i] !== str[j]) return false;
  }
  return true;
}

function longestPalindromicSubstring(str) {
  if (str.length === 0) return "";

  let start = 0;
  let maxLen = 1;

  function expand(left, right) {
    while (left >= 0 && right < str.length && str[left] === str[right]) {
      const len = right - left + 1;
      if (len > maxLen) {
        maxLen = len;
        start = left;
      }
      left--;
      right++;
    }
  }

  for (let i = 0; i < str.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }

  return str.slice(start, start + maxLen);
}

function update() {
  const raw = input.value;
  const cleaned = normalize(raw);

  if (cleaned.length === 0) {
    result.textContent = "Ergebnis erscheint hier.";
    longestEl.textContent = "—";
    return;
  }

  const palindrome = isPalindrome(cleaned);
  result.textContent = palindrome
    ? "✅ Ist ein Palindrom"
    : "❌ Kein Palindrom";
  result.style.color = palindrome ? "#15803d" : "#b91c1c";

  const longest = longestPalindromicSubstring(cleaned);
  longestEl.textContent = longest.length > 1 ? longest : "—";
}

input.addEventListener("input", update);
