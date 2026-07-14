# Visual Review State

When the review screen is opened through `scripts/open-visual-review.mjs`, feedback is saved automatically under `.giqo/ui-review/<screen>/`.

Generated state files:

- `state.json` - full browser review state
- `targets.json` - reviewable target manifest for faster future mapping
- `comments.json` - saved comments and edit requests
- `change-requests.json` - edit requests for GIQO ingestion or apply work
- `review.md` - human-readable review summary

## Comment format

Each comment maps to an HTML element through `targetId`, which matches `data-gqo-id` in the wireframe or mockup. Global feedback uses `targetId: "global"`.

## Change request format

Edit-mode feedback is saved as UI change requests.

Saved requests are ready for `/giqo-apply` or for a coding agent to read. Browser save only records the requests; it does not directly modify source code.

## Lifecycle

Requests use these statuses:

- `saved` - captured and ready for review or implementation
- `running` - work has started
- `applied` - the requested change was reflected in docs, review artifacts, or source after an apply step
- `failed` - blocked, rejected, or otherwise not applied; the reason must remain visible

Unresolved `saved`, `running`, and `failed` items must remain visible in the handoff docs.
