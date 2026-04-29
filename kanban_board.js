const STORAGE_KEY = "sg-majors-kanban-v1";
const THEME_KEY = "sg-majors-kanban-theme";

const columns = ["todo", "doing", "waiting", "done"];
const columnNames = {
  todo: "To Do",
  doing: "Doing",
  waiting: "Waiting",
  done: "Done",
};

const starterTasks = [
  {
    id: crypto.randomUUID(),
    title: "Decide scoreboard hosting: GitHub Pages or Mac mini tunnel",
    column: "todo",
    priority: "high",
    due: "2026-04-30",
  },
  {
    id: crypto.randomUUID(),
    title: "Move the entire SG_Majors folder to the Mac mini after the scoreboard is 90% built",
    column: "todo",
    priority: "high",
    due: "2026-05-11",
  },
  {
    id: crypto.randomUUID(),
    title: "Create PGA scoreboard JSON data model for teams, picks, scores, and Calcutta",
    column: "done",
    priority: "high",
    due: "2026-05-04",
  },
  {
    id: crypto.randomUUID(),
    title: "Build public PGA scoreboard tab on the tournament website",
    column: "done",
    priority: "high",
    due: "2026-05-06",
  },
  {
    id: crypto.randomUUID(),
    title: "Expand PGA admin app to edit website sections and regenerate markdown",
    column: "done",
    priority: "high",
    due: "2026-04-29",
  },
  {
    id: crypto.randomUUID(),
    title: "Add Calcutta pot, auction cost, payout percentage, and projected payout display",
    column: "done",
    priority: "normal",
    due: "2026-05-07",
  },
  {
    id: crypto.randomUUID(),
    title: "Run Mac mini PGA admin server with SCOREBOARD_ADMIN_TOKEN",
    column: "todo",
    priority: "high",
    due: "2026-05-08",
  },
  {
    id: crypto.randomUUID(),
    title: "Test score entry workflow with sample Saturday, Sunday, and PGA player scores",
    column: "todo",
    priority: "high",
    due: "2026-05-10",
  },
  {
    id: crypto.randomUUID(),
    title: "Configure Mac mini Git auth for admin Commit and Push button",
    column: "todo",
    priority: "high",
    due: "2026-05-11",
  },
  {
    id: crypto.randomUUID(),
    title: "Create PGA Championship WhatsApp group",
    column: "todo",
    priority: "high",
    due: "2026-04-29",
  },
  {
    id: crypto.randomUUID(),
    title: "Verify Jon Vrolyks and Vasan Srinivasan contact info",
    column: "todo",
    priority: "high",
    due: "2026-04-29",
  },
  {
    id: crypto.randomUUID(),
    title: "Ask players to book Saturday May 16 tee times on May 2",
    column: "todo",
    priority: "high",
    due: "2026-05-02",
  },
  {
    id: crypto.randomUUID(),
    title: "Ask players to book Sunday May 17 tee times on May 3",
    column: "todo",
    priority: "high",
    due: "2026-05-03",
  },
  {
    id: crypto.randomUUID(),
    title: "Collect 2-man team pairings",
    column: "doing",
    priority: "normal",
    due: "2026-05-08",
  },
  {
    id: crypto.randomUUID(),
    title: "Update pga_championship_teams.csv once teams are final",
    column: "waiting",
    priority: "normal",
    due: "",
  },
];

let tasks = loadTasks();
let activeDragId = null;

const board = document.querySelector("#board");
const template = document.querySelector("#cardTemplate");
const statusLine = document.querySelector("#statusLine");
const searchInput = document.querySelector("#searchInput");
const titleInput = document.querySelector("#taskTitle");
const columnInput = document.querySelector("#taskColumn");
const priorityInput = document.querySelector("#taskPriority");
const dueInput = document.querySelector("#taskDue");
const addButton = document.querySelector("#addTask");
const resetSeed = document.querySelector("#resetSeed");
const themeToggle = document.querySelector("#themeToggle");

document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "light";

addButton.addEventListener("click", addTask);
titleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});
searchInput.addEventListener("input", renderBoard);
resetSeed.addEventListener("click", () => {
  tasks = [...starterTasks.map((task) => ({ ...task, id: crypto.randomUUID() })), ...tasks];
  saveTasks();
  renderBoard();
  setStatus("Starter tasks restored");
});
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
});

document.querySelectorAll(".dropzone").forEach((zone) => {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");
    if (!activeDragId) return;
    moveTask(activeDragId, zone.dataset.dropzone);
    activeDragId = null;
  });
});

renderBoard();

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return starterTasks;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : starterTasks;
  } catch {
    return starterTasks;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask() {
  const title = titleInput.value.trim();
  if (!title) {
    setStatus("Add a task title first");
    titleInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    column: columnInput.value,
    priority: priorityInput.value,
    due: dueInput.value,
  });

  titleInput.value = "";
  dueInput.value = "";
  saveTasks();
  renderBoard();
  setStatus("Task added");
  titleInput.focus();
}

function renderBoard() {
  const query = searchInput.value.trim().toLowerCase();

  columns.forEach((column) => {
    const zone = document.querySelector(`[data-dropzone="${column}"]`);
    zone.innerHTML = "";

    tasks
      .filter((task) => task.column === column)
      .forEach((task) => zone.appendChild(renderCard(task, query)));

    const visibleCount = tasks.filter(
      (task) => task.column === column && matchesQuery(task, query),
    ).length;
    document.querySelector(`[data-count="${column}"]`).textContent = visibleCount;
  });

  const visible = tasks.filter((task) => matchesQuery(task, query)).length;
  setStatus(`${visible} visible task${visible === 1 ? "" : "s"}`);
}

function renderCard(task, query) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.id = task.id;
  if (!matchesQuery(task, query)) card.classList.add("hidden");

  const priorityBadge = card.querySelector(".priority");
  priorityBadge.textContent = task.priority;
  priorityBadge.dataset.priority = task.priority;

  const moveSelect = card.querySelector(".move-select");
  moveSelect.value = task.column;
  moveSelect.title = `Move to ${columnNames[task.column]}`;
  moveSelect.addEventListener("change", () => moveTask(task.id, moveSelect.value));

  const title = card.querySelector(".title");
  title.value = task.title;
  title.addEventListener("input", () => updateTask(task.id, { title: title.value }, false));

  const priority = card.querySelector(".priority-select");
  priority.value = task.priority;
  priority.addEventListener("change", () => updateTask(task.id, { priority: priority.value }));

  const due = card.querySelector(".due-input");
  due.value = task.due || "";
  due.addEventListener("change", () => updateTask(task.id, { due: due.value }));

  card.querySelector(".duplicate").addEventListener("click", () => duplicateTask(task.id));
  card.querySelector(".remove").addEventListener("click", () => removeTask(task.id));

  card.addEventListener("dragstart", () => {
    activeDragId = task.id;
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    activeDragId = null;
    card.classList.remove("dragging");
  });

  return card;
}

function matchesQuery(task, query) {
  if (!query) return true;
  return [task.title, task.priority, task.due, columnNames[task.column]]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function updateTask(id, patch, shouldRender = true) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
  saveTasks();
  if (shouldRender) renderBoard();
}

function moveTask(id, column) {
  updateTask(id, { column });
  setStatus(`Moved to ${columnNames[column]}`);
}

function duplicateTask(id) {
  const original = tasks.find((task) => task.id === id);
  if (!original) return;
  tasks.unshift({ ...original, id: crypto.randomUUID(), title: `${original.title} copy` });
  saveTasks();
  renderBoard();
  setStatus("Task duplicated");
}

function removeTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  const confirmed = window.confirm(`Remove "${task.title}" from this board?`);
  if (!confirmed) return;
  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  renderBoard();
  setStatus("Task removed");
}

function setStatus(message) {
  statusLine.textContent = message;
}
