(function () {
  const params = new URLSearchParams(location.search);
  const statuses = ["open", "queued", "running", "applied", "verified", "blocked", "rejected"];
  const locked = new Set(["queued", "running"]);
  const key = `gqo-comments:${location.pathname}`;
  const state = { targetId: "", mode: params.get("mode") === "edit" ? "edit" : "comment", filter: "all", items: load() };

  function byId(id) { return document.getElementById(id); }
  function page() { return location.pathname.split("/").pop() || "review.html"; }
  function readStorage() { try { return localStorage.getItem(key); } catch (error) { return null; } }
  function writeStorage() { try { localStorage.setItem(key, JSON.stringify(state.items)); } catch (error) { return; } }
  function load() { try { const parsed = JSON.parse(readStorage() || "[]"); return Array.isArray(parsed) ? parsed : []; } catch (error) { return []; } }
  function safe(text) { return text.replaceAll("`", "\\`").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
  function attr(text) { return safe(text).replaceAll("&", "&amp;").replaceAll('"', "&quot;"); }
  function actualUrl() {
    const value = params.get("actual") || "";
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }
  function download(name, body, type) {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function select(value, id) {
    const element = document.createElement("select");
    if (id) element.id = id;
    for (const status of statuses) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === value;
      element.append(option);
    }
    return element;
  }
  function scopeFor(targetId) {
    if (targetId === "global") return "global";
    const target = document.querySelector(`[data-gqo-id="${CSS.escape(targetId)}"]`);
    return target?.getAttribute("data-gqo-scope") || "element";
  }
  function changeRequests() { return state.items.filter((item) => item.type === "change-request"); }
  function queueable() { return changeRequests().filter((item) => item.status === "open" || item.status === "blocked"); }
  function requestFrom(item, status) {
    const now = new Date().toISOString();
    return {
      id: item.id.replace(/^comment-/, "change-"),
      sourceCommentId: item.id,
      targetId: item.targetId,
      page: item.page,
      scope: item.scope || scopeFor(item.targetId),
      requestedChange: item.comment,
      rationale: item.rationale || "Captured from visual review edit request.",
      acceptanceSignal: item.acceptanceSignal || "Updated UI matches the requested visual review change.",
      priority: item.severity,
      status,
      createdAt: item.createdAt,
      createdBy: "visual-review",
      queuedAt: status === "queued" ? now : undefined,
      queuedBy: status === "queued" ? "visual-review" : undefined,
      checks: {
        workStart: { targetConfirmed: true, requestActionable: true, scopeConfirmed: true, acceptanceSignalDefined: true, dependenciesRecorded: false },
        completion: { artifactUpdated: false, acceptanceSignalObserved: false, documentsAligned: false, openQuestionsPreserved: true, changedArtifactsRecorded: false },
      },
    };
  }
  function queuePayload(items) {
    return { schema: "gqo.change-request-queue.v1", source: page(), actual: actualUrl(), exportedAt: new Date().toISOString(), requests: items.map((item) => requestFrom(item, "queued")) };
  }
  function changePayload(items) {
    return { schema: "gqo.change-requests.v1", source: page(), actual: actualUrl(), exportedAt: new Date().toISOString(), requests: items.map((item) => requestFrom(item, item.status)) };
  }
  function markdown() {
    const lines = ["# Visual Review Comments", ""];
    for (const item of state.items) {
      lines.push(`## ${item.targetId}`, "", `- Type: ${item.type}`, `- Severity: ${item.severity}`, `- Scope: ${item.scope || scopeFor(item.targetId)}`, `- Status: ${item.status}`, `- Mode: ${item.mode}`, `- Page: ${item.page}`, `- Created: ${item.createdAt}`, "", "```", safe(item.comment), "```", "");
    }
    return lines.join("\n");
  }
  function createShell() {
    const toolbar = document.createElement("div");
    toolbar.className = "gqo-toolbar";
    const actual = actualUrl();
    toolbar.innerHTML = `<div class="gqo-toolbar-title"><strong>GIQO Visual Review</strong>${actual ? ` <a href="${attr(actual)}" target="_blank" rel="noreferrer">Actual screen</a>` : ""}</div><div class="gqo-toolbar-controls"><label>Mode <select id="gqo-mode"><option value="comment">Comment</option><option value="edit">Edit request</option></select></label><label>Status <select id="gqo-filter"><option value="all">All</option></select></label><button id="gqo-global" type="button">Global comment</button><button id="gqo-json" type="button">Export comments.json</button><button id="gqo-md" type="button">Export review.md</button><button id="gqo-requests" type="button">Export change requests</button><button id="gqo-queue" type="button">Apply as queue</button><button id="gqo-clear" type="button">Clear local comments</button></div>`;
    document.body.prepend(toolbar);
    for (const status of statuses) byId("gqo-filter").append(new Option(status, status));
    const panel = document.createElement("aside");
    panel.className = "gqo-panel";
    panel.hidden = true;
    panel.innerHTML = `<strong id="gqo-panel-title">GIQO comment</strong><p id="gqo-target-label"></p><label>Type<select id="gqo-type"><option value="change-request">Change request</option><option value="question">Question</option><option value="approval">Approval</option><option value="risk">Risk</option></select></label><label>Severity<select id="gqo-severity"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Comment<textarea id="gqo-comment" placeholder="Write feedback or requested edit"></textarea></label><div class="gqo-panel-actions"><button id="gqo-cancel" type="button">Cancel</button><button id="gqo-save" type="button">Save</button></div>`;
    document.body.append(panel);
    const list = document.createElement("aside");
    list.className = "gqo-comment-list";
    list.innerHTML = `<strong>Review queue</strong><div id="gqo-comments"></div>`;
    document.body.append(list);
    return panel;
  }
  function openPanel(panel, targetId) {
    state.targetId = targetId;
    byId("gqo-panel-title").textContent = state.mode === "edit" ? "GIQO edit request" : "GIQO comment";
    byId("gqo-type").value = state.mode === "edit" ? "change-request" : "question";
    byId("gqo-target-label").textContent = targetId === "global" ? "Global project feedback" : targetId;
    byId("gqo-comment").value = "";
    panel.hidden = false;
    byId("gqo-comment").focus();
  }
  function savePanel(panel) {
    const comment = byId("gqo-comment").value.trim();
    if (!state.targetId || !comment) return;
    state.items.push({ id: `comment-${Date.now()}`, targetId: state.targetId, page: page(), mode: state.mode, scope: scopeFor(state.targetId), type: byId("gqo-type").value, severity: byId("gqo-severity").value, comment, createdAt: new Date().toISOString(), status: "open" });
    writeStorage();
    render();
    panel.hidden = true;
  }
  function renderPins() {
    document.querySelectorAll(".gqo-comment-pin").forEach((pin) => pin.remove());
    const counts = new Map();
    for (const item of state.items.filter((entry) => entry.targetId !== "global")) counts.set(item.targetId, (counts.get(item.targetId) || 0) + 1);
    for (const [targetId, count] of counts) {
      const target = document.querySelector(`[data-gqo-id="${CSS.escape(targetId)}"]`);
      if (!target) continue;
      const pin = document.createElement("span");
      pin.className = "gqo-comment-pin";
      pin.setAttribute("aria-hidden", "true");
      pin.textContent = String(count);
      target.append(pin);
    }
  }
  function renderList() {
    const box = byId("gqo-comments");
    box.textContent = "";
    const items = state.filter === "all" ? state.items : state.items.filter((item) => item.status === state.filter);
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "gqo-empty";
      empty.textContent = "No comments match this status.";
      box.append(empty);
    }
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "gqo-list-item";
      const title = document.createElement("b");
      title.textContent = `${item.targetId} · ${item.type}`;
      const body = document.createElement("p");
      body.textContent = item.comment;
      const picker = select(item.status);
      picker.dataset.gqoStatus = item.id;
      picker.disabled = locked.has(item.status);
      card.append(title, body, picker);
      box.append(card);
    }
    byId("gqo-queue").disabled = queueable().length === 0 || changeRequests().some((item) => locked.has(item.status));
  }
  function render() { renderPins(); renderList(); }
  function wire(panel) {
    document.querySelectorAll("[data-gqo-id]").forEach((element) => {
      element.addEventListener("mouseenter", () => element.classList.add("gqo-highlight"));
      element.addEventListener("mouseleave", () => element.classList.remove("gqo-highlight"));
    });
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest(".gqo-toolbar, .gqo-panel, .gqo-comment-list")) return;
      const element = target.closest("[data-gqo-id]");
      if (element) { event.preventDefault(); event.stopPropagation(); openPanel(panel, element.getAttribute("data-gqo-id") || ""); }
    });
    byId("gqo-mode").value = state.mode;
    byId("gqo-mode").addEventListener("change", (event) => { state.mode = event.target.value; document.body.dataset.gqoMode = state.mode; });
    byId("gqo-filter").addEventListener("change", (event) => { state.filter = event.target.value; renderList(); });
    byId("gqo-comments").addEventListener("change", (event) => { const item = state.items.find((entry) => entry.id === event.target.dataset.gqoStatus); if (item && !locked.has(item.status)) { item.status = event.target.value; writeStorage(); render(); } });
    byId("gqo-global").addEventListener("click", () => openPanel(panel, "global"));
    byId("gqo-cancel").addEventListener("click", () => { panel.hidden = true; });
    byId("gqo-save").addEventListener("click", () => savePanel(panel));
    byId("gqo-json").addEventListener("click", () => download("comments.json", JSON.stringify(state.items, null, 2), "application/json"));
    byId("gqo-md").addEventListener("click", () => download("review.md", markdown(), "text/markdown"));
    byId("gqo-requests").addEventListener("click", () => download("change-requests.json", JSON.stringify(changePayload(changeRequests()), null, 2), "application/json"));
    byId("gqo-queue").addEventListener("click", () => { const queued = queueable(); const ids = new Set(queued.map((item) => item.id)); state.items.forEach((item) => { if (ids.has(item.id)) item.status = "queued"; }); state.filter = "all"; byId("gqo-filter").value = "all"; writeStorage(); download("change-request-queue.json", JSON.stringify(queuePayload(queued), null, 2), "application/json"); render(); });
    byId("gqo-clear").addEventListener("click", () => { state.items = []; state.filter = "all"; byId("gqo-filter").value = "all"; writeStorage(); render(); });
  }
  function init() { const panel = createShell(); document.body.dataset.gqoMode = state.mode; wire(panel); render(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
