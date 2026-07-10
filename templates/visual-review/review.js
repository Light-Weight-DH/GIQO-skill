(function () {
  const storageKey = `gqo-comments:${location.pathname}`;
  const state = {
    targetId: "",
    comments: loadComments(),
  };

  function loadComments() {
    let raw = null;
    try {
      raw = localStorage.getItem(storageKey);
    } catch {
      return [];
    }
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveComments() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.comments));
    } catch {
      return;
    }
  }

  function createPanel() {
    const panel = document.createElement("aside");
    panel.className = "gqo-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <strong>GIQO comment</strong>
      <p id="gqo-target-label"></p>
      <label>Type
        <select id="gqo-type">
          <option value="change-request">Change request</option>
          <option value="question">Question</option>
          <option value="approval">Approval</option>
          <option value="risk">Risk</option>
        </select>
      </label>
      <label>Severity
        <select id="gqo-severity">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label>Comment
        <textarea id="gqo-comment" placeholder="Write what should change or be clarified"></textarea>
      </label>
      <div class="gqo-panel-actions">
        <button id="gqo-cancel" type="button">Cancel</button>
        <button id="gqo-save" type="button">Save</button>
      </div>
    `;
    document.body.append(panel);
    return panel;
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "gqo-toolbar";
    toolbar.innerHTML = `
      <strong>GIQO Visual Review</strong>
      <div>
        <button id="gqo-export-json" type="button">Export comments.json</button>
        <button id="gqo-export-md" type="button">Export review.md</button>
        <button id="gqo-clear" type="button">Clear local comments</button>
      </div>
    `;
    document.body.prepend(toolbar);
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function escapeMarkdownText(text) {
    return text.replaceAll("`", "\\`").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function toMarkdown() {
    const lines = ["# Visual Review Comments", ""];
    for (const comment of state.comments) {
      lines.push(`## ${comment.targetId}`);
      lines.push("");
      lines.push(`- Type: ${comment.type}`);
      lines.push(`- Severity: ${comment.severity}`);
      lines.push(`- Page: ${comment.page}`);
      lines.push(`- Created: ${comment.createdAt}`);
      lines.push("");
      lines.push("```");
      lines.push(escapeMarkdownText(comment.comment));
      lines.push("```");
      lines.push("");
    }
    return lines.join("\n");
  }

  function renderPins() {
    document.querySelectorAll(".gqo-comment-pin").forEach((pin) => pin.remove());
    const counts = new Map();
    for (const comment of state.comments) {
      counts.set(comment.targetId, (counts.get(comment.targetId) || 0) + 1);
    }
    for (const [targetId, count] of counts.entries()) {
      const target = document.querySelector(`[data-gqo-id="${CSS.escape(targetId)}"]`);
      if (!target) {
        continue;
      }
      const pin = document.createElement("span");
      pin.className = "gqo-comment-pin";
      pin.setAttribute("aria-hidden", "true");
      pin.textContent = String(count);
      target.append(pin);
    }
  }

  function init() {
    createToolbar();
    const panel = createPanel();
    const targetLabel = document.getElementById("gqo-target-label");
    const typeInput = document.getElementById("gqo-type");
    const severityInput = document.getElementById("gqo-severity");
    const commentInput = document.getElementById("gqo-comment");

    document.querySelectorAll("[data-gqo-id]").forEach((element) => {
      element.addEventListener("mouseenter", () => element.classList.add("gqo-highlight"));
      element.addEventListener("mouseleave", () => element.classList.remove("gqo-highlight"));
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const element = target.closest("[data-gqo-id]");
      if (element) {
        event.preventDefault();
        event.stopPropagation();
        state.targetId = element.getAttribute("data-gqo-id") || "";
        targetLabel.textContent = state.targetId;
        commentInput.value = "";
        panel.hidden = false;
        commentInput.focus();
      }
    });

    document.getElementById("gqo-cancel").addEventListener("click", () => {
      panel.hidden = true;
    });

    document.getElementById("gqo-save").addEventListener("click", () => {
      const text = commentInput.value.trim();
      if (!state.targetId || !text) {
        return;
      }
      state.comments.push({
        id: `comment-${Date.now()}`,
        targetId: state.targetId,
        page: location.pathname.split("/").pop() || "review.html",
        type: typeInput.value,
        severity: severityInput.value,
        comment: text,
        createdAt: new Date().toISOString(),
        status: "open",
      });
      saveComments();
      renderPins();
      panel.hidden = true;
    });

    document.getElementById("gqo-export-json").addEventListener("click", () => {
      download("comments.json", JSON.stringify(state.comments, null, 2), "application/json");
    });

    document.getElementById("gqo-export-md").addEventListener("click", () => {
      download("review.md", toMarkdown(), "text/markdown");
    });

    document.getElementById("gqo-clear").addEventListener("click", () => {
      state.comments = [];
      saveComments();
      renderPins();
    });

    renderPins();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
