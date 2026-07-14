(function () {
  const params = new URLSearchParams(location.search);
  const statuses = ["saved", "running", "applied", "failed"];
  const statusLabels = { saved: "Saved", running: "In progress", applied: "Applied", failed: "Failed" };
  const key = `gqo-comments:${location.pathname}`;
  const state = { targetId: "", mode: params.get("mode") === "edit" ? "edit" : "comment", filter: "all", items: load() };

  function byId(id) { return document.getElementById(id); }
  function page() { return location.pathname.split("/").pop() || "review.html"; }
  function readStorage() { try { return localStorage.getItem(key); } catch (error) { return null; } }
  function writeStorage() { try { localStorage.setItem(key, JSON.stringify(state.items)); } catch (error) { return; } }
  function status(value) {
    if (value === "running" || value === "applied" || value === "failed") return value;
    if (value === "blocked" || value === "rejected") return "failed";
    if (value === "verified") return "applied";
    return "saved";
  }
  function normalizeItems(items) { return items.map((item) => ({ ...item, status: status(item.status) })); }
  function load() { try { const parsed = JSON.parse(readStorage() || "[]"); return Array.isArray(parsed) ? normalizeItems(parsed) : []; } catch (error) { return []; } }
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
  function select(value, id) {
    const element = document.createElement("select");
    if (id) element.id = id;
    for (const status of statuses) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = statusLabels[status] || status;
      option.selected = status === value;
      element.append(option);
    }
    return element;
  }
  function visible(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.right >= 0 && rect.top <= innerHeight && rect.left <= innerWidth && style.visibility !== "hidden" && style.display !== "none";
  }
  function targetElements() {
    return [...document.querySelectorAll("[data-gqo-id]")].filter(visible);
  }
  function targets() {
    return [{ id: "global", label: "Global" }].concat(targetElements().map((element) => ({ id: element.getAttribute("data-gqo-id") || "", label: element.getAttribute("data-gqo-id") || "Untitled" })).filter((item) => item.id));
  }
  function targetManifest() {
    return targets().map((target) => {
      const element = target.id === "global" ? document.body : document.querySelector(`[data-gqo-id="${CSS.escape(target.id)}"]`);
      const rect = element?.getBoundingClientRect();
      return { id: target.id, label: target.label, scope: target.id === "global" ? "global" : scopeFor(target.id), editable: element?.getAttribute("data-gqo-editable") || "", text: target.id === "global" ? "" : (element?.textContent || "").trim().replace(/\s+/g, " ").slice(0, 160), bounds: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null };
    });
  }
  function targetSelect() {
    const element = document.createElement("select");
    element.id = "gqo-target";
    for (const target of targets()) {
      const option = document.createElement("option");
      option.value = target.id;
      option.textContent = target.label;
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
  function requestFrom(item, requestStatus) {
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
      status: status(requestStatus),
      createdAt: item.createdAt,
      createdBy: "visual-review",
      savedAt: item.savedAt || now,
      savedBy: "visual-review",
      checks: {
        workStart: { targetConfirmed: true, requestActionable: true, scopeConfirmed: true, acceptanceSignalDefined: true, dependenciesRecorded: false },
        completion: { artifactUpdated: false, acceptanceSignalObserved: false, documentsAligned: false, openQuestionsPreserved: true, changedArtifactsRecorded: false },
      },
    };
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
  function syncPayload() {
    return { schema: "gqo.visual-review-state.v1", source: page(), actual: actualUrl(), savedAt: new Date().toISOString(), targets: targetManifest(), comments: state.items, changeRequests: changePayload(changeRequests()), markdown: markdown() };
  }
  function syncWorkspace() {
    writeStorage();
    fetch("/__gqo/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(syncPayload()) }).catch(() => {});
  }
  function refreshWorkspace() {
    fetch("/__gqo/state").then((response) => response.ok ? response.json() : {}).then((payload) => {
      if (Array.isArray(payload.comments)) {
        state.items = normalizeItems(payload.comments);
        writeStorage();
        render();
      }
    }).catch(() => { state.items = load(); render(); });
  }
  function createShell() {
    const toolbar = document.createElement("div");
    toolbar.className = "gqo-toolbar";
    const actual = actualUrl();
    toolbar.innerHTML = `<div class="gqo-toolbar-title"><strong>GIQO Visual Review</strong>${actual ? ` <a href="${attr(actual)}" target="_blank" rel="noreferrer">Actual screen</a>` : ""}<span id="gqo-sync">Auto-save ready</span></div><div class="gqo-toolbar-controls"><label>Mode <select id="gqo-mode"><option value="comment">Comment</option><option value="edit">Edit request</option></select></label><label>Status <select id="gqo-filter"><option value="all">All</option></select></label><label>Target <span id="gqo-target-slot"></span></label><button id="gqo-refresh" type="button">Refresh</button><button id="gqo-clear" type="button">Clear</button></div>`;
    document.body.prepend(toolbar);
    for (const status of statuses) byId("gqo-filter").append(new Option(statusLabels[status] || status, status));
    byId("gqo-target-slot").append(targetSelect());
    const panel = document.createElement("aside");
    panel.className = "gqo-panel";
    panel.hidden = true;
    panel.innerHTML = `<strong id="gqo-panel-title">GIQO comment</strong><p id="gqo-target-label"></p><label>Severity<select id="gqo-severity"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Comment<textarea id="gqo-comment" placeholder="Write feedback or requested edit"></textarea></label><div class="gqo-panel-actions"><button id="gqo-cancel" type="button">Cancel</button><button id="gqo-save" type="button">Save</button></div>`;
    document.body.append(panel);
    const list = document.createElement("aside");
    list.className = "gqo-comment-list";
    list.innerHTML = `<strong>Saved feedback</strong><div id="gqo-comments"></div>`;
    document.body.append(list);
    return panel;
  }
  function openPanel(panel, targetId) {
    state.targetId = targetId;
    byId("gqo-panel-title").textContent = state.mode === "edit" ? "GIQO edit request" : "GIQO comment";
    byId("gqo-target-label").textContent = targetId === "global" ? "Global project feedback" : targetId;
    byId("gqo-target").value = targetId;
    byId("gqo-comment").value = "";
    panel.hidden = false;
    byId("gqo-comment").focus();
  }
  function savePanel(panel) {
    const comment = byId("gqo-comment").value.trim();
    if (!state.targetId || !comment) return;
    state.items.push({ id: `comment-${Date.now()}`, targetId: state.targetId, page: page(), mode: state.mode, scope: scopeFor(state.targetId), type: state.mode === "edit" ? "change-request" : "question", severity: byId("gqo-severity").value, comment, createdAt: new Date().toISOString(), savedAt: new Date().toISOString(), status: "saved" });
    syncWorkspace();
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
      empty.textContent = state.filter === "all" ? "No saved comments or edit requests." : "No saved feedback matches this status.";
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
      card.append(title, body, picker);
      box.append(card);
    }
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
    byId("gqo-target").addEventListener("change", (event) => openPanel(panel, event.target.value));
    byId("gqo-comments").addEventListener("change", (event) => { const item = state.items.find((entry) => entry.id === event.target.dataset.gqoStatus); if (item) { item.status = event.target.value; syncWorkspace(); render(); } });
    byId("gqo-refresh").addEventListener("click", refreshWorkspace);
    byId("gqo-cancel").addEventListener("click", () => { panel.hidden = true; });
    byId("gqo-save").addEventListener("click", () => savePanel(panel));
    byId("gqo-clear").addEventListener("click", () => { state.items = []; state.filter = "all"; byId("gqo-filter").value = "all"; syncWorkspace(); render(); });
  }
  function init() { const panel = createShell(); document.body.dataset.gqoMode = state.mode; wire(panel); refreshWorkspace(); render(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
