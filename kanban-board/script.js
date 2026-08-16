const STORAGE_KEY = "kanban-board-tasks";
const STATUSES = ["todo", "doing", "done"];

const addForm = document.getElementById("addForm");
const taskInput = document.getElementById("taskInput");
const lists = Object.fromEntries(
  STATUSES.map((status) => [status, document.getElementById(`list-${status}`)])
);

let tasks = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  STATUSES.forEach((status) => {
    lists[status].innerHTML = "";
  });

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task";
    li.draggable = true;
    li.dataset.id = task.id;

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove "${task.text}"`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      save();
      render();
    });

    li.addEventListener("dragstart", () => {
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });

    li.append(text, remove);
    lists[task.status].appendChild(li);
  });
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, status: "todo" });
  taskInput.value = "";
  save();
  render();
});

STATUSES.forEach((status) => {
  const column = document.querySelector(`.column[data-status="${status}"]`);

  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("drag-over");
    const dragging = document.querySelector(".task.dragging");
    if (!dragging) return;
    const id = dragging.dataset.id;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.status = status;
      save();
      render();
    }
  });
});

render();
