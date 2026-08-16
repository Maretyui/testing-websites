const DECKS = {
  "Web Dev Basics": [
    { front: "What does DNS stand for?", back: "Domain Name System" },
    { front: "HTTP status code for \"Not Found\"?", back: "404" },
    { front: "CSS property to change text color?", back: "color" },
    { front: "What does CORS stand for?", back: "Cross-Origin Resource Sharing" },
    { front: "JS array method to add to the end?", back: "push()" },
  ],
  "Minecraft Server Admin": [
    { front: "Default Minecraft server port?", back: "25565" },
    { front: "Command to give a player an item?", back: "/give <player> <item> <amount>" },
    { front: "File that stores server world settings?", back: "server.properties" },
    { front: "Plugin platform for high-performance Bukkit forks?", back: "Paper" },
    { front: "Command to teleport a player?", back: "/tp <player> <target>" },
  ],
  "Git Commands": [
    { front: "Undo the last commit but keep changes staged?", back: "git reset --soft HEAD~1" },
    { front: "Show commit history as a graph?", back: "git log --graph --oneline" },
    { front: "Temporarily shelve uncommitted changes?", back: "git stash" },
    { front: "Rename the current branch?", back: "git branch -m <new-name>" },
    { front: "Fetch and rebase in one step?", back: "git pull --rebase" },
  ],
};

const deckSelect = document.getElementById("deckSelect");
const progress = document.getElementById("progress");
const flashcard = document.getElementById("flashcard");
const front = document.getElementById("front");
const back = document.getElementById("back");
const actions = document.getElementById("actions");
const hardBtn = document.getElementById("hardBtn");
const easyBtn = document.getElementById("easyBtn");
const doneMessage = document.getElementById("doneMessage");
const restartBtn = document.getElementById("restartBtn");

let queue = [];
let current = null;
let total = 0;
let correct = 0;

Object.keys(DECKS).forEach((name) => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  deckSelect.appendChild(opt);
});

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startDeck() {
  const deck = DECKS[deckSelect.value];
  queue = shuffle(deck);
  total = deck.length;
  correct = 0;
  doneMessage.hidden = true;
  restartBtn.hidden = true;
  actions.hidden = false;
  flashcard.hidden = false;
  nextCard();
}

function nextCard() {
  flashcard.classList.remove("flipped");
  if (queue.length === 0) {
    finishDeck();
    return;
  }
  current = queue.shift();
  front.textContent = current.front;
  back.textContent = current.back;
  updateProgress();
}

function updateProgress() {
  const remaining = queue.length + 1;
  progress.textContent = `${remaining} card${remaining === 1 ? "" : "s"} left in this pass`;
}

function finishDeck() {
  flashcard.hidden = true;
  actions.hidden = true;
  progress.textContent = "";
  doneMessage.hidden = false;
  doneMessage.textContent = `Deck complete — ${correct}/${total} marked "knew it" along the way.`;
  restartBtn.hidden = false;
}

flashcard.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});

hardBtn.addEventListener("click", () => {
  queue.push(current);
  nextCard();
});

easyBtn.addEventListener("click", () => {
  correct += 1;
  nextCard();
});

restartBtn.addEventListener("click", startDeck);
deckSelect.addEventListener("change", startDeck);

startDeck();
