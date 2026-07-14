# Visual Review Mode

Visual Review Mode makes wireframes and mockups commentable in the browser.

## Behavior

1. Open `wireframe.html` or `mockup.html` with `node scripts/open-visual-review.mjs`.
2. Hover reviewable elements to see a highlight.
3. Click a reviewable element, choose it from the Target dropdown, or choose Global.
4. Write a comment or edit request with severity.
5. Save feedback automatically to `.giqo/ui-review/<screen>/`.
6. Use Refresh to reload the latest agent-updated review state.
7. Reuse `.giqo/ui-review/<screen>/targets.json` to avoid remapping the same screen on every run.
8. Discover visible targets first; map hidden or offscreen states lazily when they become relevant.

## Element contract

Every reviewable element must include:

```html
data-gqo-id="screen.section.element"
```

Use stable semantic IDs, not visual positions.

## Comment ingestion

When `.giqo/ui-review/<screen>/comments.json` or `change-requests.json` exists, GIQO should:

- load `targets.json` first when present
- map each comment to the target `data-gqo-id`
- update UI/UX decisions
- add implementation tasks for actionable change requests
- preserve unresolved comments in `09_RISK_AND_DECISIONS.md`

## Constraints

- Static HTML cannot reliably write local files directly without the local launcher.
- Treat browser `localStorage` as a temporary cache.
- Treat `.giqo/ui-review/<screen>/` as the local canonical review state when the launcher is used.
- Treat `targets.json` as a cache for speed, not as the source of truth.
- Do not block initial review setup on hidden, collapsed, modal-only, or offscreen targets.
- Treat request status as read-only in the browser. Agents update status as work moves from `saved` to `running`, `applied`, or `failed`.
- Treat `--actual` as a comparison link in v1. Live commenting on the actual running app requires a separate same-origin or browser-bridge integration.
