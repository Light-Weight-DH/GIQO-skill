const STATUS_ORDER = ["running", "failed", "saved", "stashed", "applied", "cancelled"];
const OPEN_STATUSES = new Set(["saved", "running", "failed", "stashed"]);

const sampleState = {
  plans: [
    {
      plan: {
        id: "plan-sample-dashboard",
        title: "Sample Plan Dashboard",
        summary: "Replace this sample state by generating dashboard.html next to real plan.json and tasks.json.",
        docsPath: ".giqo/plans/plan-sample-dashboard/docs",
        createdAt: "2026-07-23T00:00:00.000Z",
        updatedAt: "2026-07-23T00:00:00.000Z"
      },
      taskState: {
        phases: [
          { id: "phase-model", title: "Define state model", summary: "Plan, Phase, Task, and rollup rules.", order: 0 },
          { id: "phase-dashboard", title: "Render progress", summary: "Read-only dashboard generated from JSON state.", order: 1 }
        ],
        tasks: [
          { id: "task-model-doc", phaseId: "phase-model", title: "Write Plan/Task policy", status: "applied", summary: "Policy is documented in references/plan-task-model.md." },
          { id: "task-schema", phaseId: "phase-model", title: "Define JSON schemas", status: "running", summary: "Schemas describe plan.json and tasks.json." },
          { id: "task-dashboard", phaseId: "phase-dashboard", title: "Generate dashboard artifact", status: "saved", summary: "Static HTML/CSS/JS renders Plans, Phases, and Tasks." }
        ]
      }
    }
  ]
};

const board = document.querySelector("#gqo-board");
const statusMessage = document.querySelector("#gqo-status");
const refreshButton = document.querySelector("#gqo-refresh");

refreshButton?.addEventListener("click", () => {
  void loadDashboard();
});

void loadDashboard();

async function loadDashboard() {
  setStatus("Loading dashboard state…");
  const state = await readEmbeddedState();
  renderDashboard(state);
  setStatus("Dashboard loaded from read-only state.");
}

async function readEmbeddedState() {
  const embedded = document.querySelector('script[type="application/json"][data-gqo-dashboard-state]');
  if (!embedded?.textContent?.trim()) {
    return sampleState;
  }

  try {
    return JSON.parse(embedded.textContent);
  } catch (error) {
    setStatus(`Could not parse embedded dashboard state: ${error instanceof Error ? error.message : "unknown error"}`);
    return sampleState;
  }
}

function renderDashboard(state) {
  const plans = Array.isArray(state.plans) ? state.plans : [];
  board.replaceChildren(...plans.map(renderPlan));
  updateSummary(plans);

  if (plans.length === 0) {
    board.append(createElement("div", "empty-state", "No Plans found. Run /giqo-skill plan before generating a dashboard."));
  }
}

function renderPlan(entry) {
  const plan = entry.plan ?? {};
  const taskState = entry.taskState ?? {};
  const phases = sortByOrder(Array.isArray(taskState.phases) ? taskState.phases : []);
  const tasks = Array.isArray(taskState.tasks) ? taskState.tasks : [];
  const planColumn = createElement("article", "plan-column");
  const titleRow = createElement("div", "plan-title-row");
  titleRow.append(
    createElement("h2", "", plan.title || plan.id || "Untitled Plan"),
    renderStatusPill(rollupStatus(tasks))
  );

  planColumn.append(
    titleRow,
    createElement("p", "plan-summary", plan.summary || plan.docsPath || "No plan summary recorded."),
    renderPhases(phases, tasks)
  );

  return planColumn;
}

function renderPhases(phases, tasks) {
  const phaseList = createElement("div", "phase-list");
  if (phases.length === 0) {
    phaseList.append(createElement("div", "empty-state", "No phases recorded."));
    return phaseList;
  }

  for (const phase of phases) {
    const phaseTasks = tasks.filter((task) => task.phaseId === phase.id);
    const phaseCard = createElement("section", "phase-card");
    const header = createElement("div", "phase-header");
    header.append(createElement("h3", "", phase.title || phase.id), renderStatusPill(rollupStatus(phaseTasks)));
    phaseCard.append(header, createElement("p", "phase-summary", phase.summary || "No phase summary recorded."), renderTasks(phaseTasks));
    phaseList.append(phaseCard);
  }

  return phaseList;
}

function renderTasks(tasks) {
  const taskList = createElement("div", "task-list");
  if (tasks.length === 0) {
    taskList.append(createElement("div", "empty-state", "No tasks in this phase."));
    return taskList;
  }

  for (const task of tasks) {
    const card = createElement("article", "task-card");
    const meta = createElement("div", "task-meta");
    meta.append(createElement("h4", "", task.title || task.id), renderStatusPill(task.status));
    card.append(meta);

    if (task.summary) {
      card.append(createElement("p", "task-summary", task.summary));
    }

    const footnotes = [
      formatList("Docs", task.sourceDocs),
      formatList("Targets", task.targetFiles),
      formatList("Review", task.sourceReviewRequests)
    ].filter(Boolean);

    for (const footnote of footnotes) {
      card.append(createElement("p", "task-footnote", footnote));
    }

    taskList.append(card);
  }

  return taskList;
}

function renderStatusPill(status = "saved") {
  const normalized = STATUS_ORDER.includes(status) ? status : "saved";
  const pill = createElement("span", "status-pill", normalized);
  pill.dataset.status = normalized;
  return pill;
}

function rollupStatus(tasks) {
  if (!tasks.length) {
    return "saved";
  }

  if (tasks.some((task) => task.status === "running")) {
    return "running";
  }

  if (tasks.some((task) => task.status === "failed")) {
    return "failed";
  }

  if (tasks.some((task) => task.status === "saved")) {
    return "saved";
  }

  if (tasks.every((task) => task.status === "cancelled")) {
    return "cancelled";
  }

  if (tasks.every((task) => task.status === "stashed" || task.status === "cancelled")) {
    return "stashed";
  }

  if (tasks.some((task) => task.status === "applied")) {
    return "applied";
  }

  return "saved";
}

function updateSummary(plans) {
  const phases = plans.flatMap((entry) => entry.taskState?.phases ?? []);
  const tasks = plans.flatMap((entry) => entry.taskState?.tasks ?? []);
  setText("#gqo-plan-count", String(plans.length));
  setText("#gqo-phase-count", String(phases.length));
  setText("#gqo-task-count", String(tasks.length));
  setText("#gqo-open-count", String(tasks.filter((task) => OPEN_STATUSES.has(task.status)).length));
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function setStatus(message) {
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

function sortByOrder(items) {
  return [...items].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function formatList(label, values) {
  return Array.isArray(values) && values.length > 0 ? `${label}: ${values.join(", ")}` : "";
}

function createElement(tagName, className = "", text = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}
