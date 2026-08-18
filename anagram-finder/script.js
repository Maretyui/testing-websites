const DEFAULT_WORDS = [
    "Ohren", "Hoeren", "Ehren", "Reiten", "Renten", "Rinnen",
    "Karten", "Rasten", "Starke", "Trakes", "Nettar",
    "Leiter", "Teiler", "Retile",
    "Herz", "Hertz",
    "Rate", "Tear", "Are", "Ear", "Eat", "Ate",
    "Leben", "Nebel", "Beleg",
    "Wasser", "Waser",
    "Berlin", "Bilrne",
    "Garten", "Tragen", "Argent",
    "Motor", "Torom",
    "Fenster", "Frenets",
    "Katze", "Zakte",
];

const wordInput = document.getElementById("word-input");
const findButton = document.getElementById("find-button");
const resultArea = document.getElementById("result-area");
const resultSummary = document.getElementById("result-summary");
const resultList = document.getElementById("result-list");
const wordlistInput = document.getElementById("wordlist-input");

function normalize(word) {
    return word
        .trim()
        .toLowerCase()
        .replace(/[^a-zäöüß]/g, "");
}

function signature(word) {
    return normalize(word).split("").sort().join("");
}

function getWordList() {
    const raw = wordlistInput.value.trim();
    if (!raw) {
        return DEFAULT_WORDS;
    }
    return raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function findAnagrams() {
    const target = wordInput.value;
    const targetNormalized = normalize(target);

    if (!targetNormalized) {
        resultArea.hidden = true;
        return;
    }

    const targetSignature = signature(target);
    const candidates = getWordList();

    const matches = candidates.filter((candidate) => {
        const candidateNormalized = normalize(candidate);
        if (!candidateNormalized || candidateNormalized === targetNormalized) {
            return false;
        }
        return signature(candidate) === targetSignature;
    });

    resultArea.hidden = false;
    resultList.innerHTML = "";

    if (matches.length === 0) {
        resultSummary.textContent = `Keine Anagramme für "${target.trim()}" in der Liste gefunden.`;
        return;
    }

    resultSummary.textContent = `${matches.length} Anagramm(e) für "${target.trim()}" gefunden:`;
    matches.forEach((match) => {
        const li = document.createElement("li");
        li.textContent = match;
        resultList.appendChild(li);
    });
}

findButton.addEventListener("click", findAnagrams);
wordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        findAnagrams();
    }
});
