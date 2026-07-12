# /giqo-ui

Create or update UI planning docs and browser review artifacts.

## Use when

1. The project includes screens, flows, visual states, or layout decisions.
2. The user needs a clickable comment surface.
3. Existing review comments require a UI planning update.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `screen` | No | Screen or flow to focus |
| `source` | No | Existing plan, screenshots, comments, or repo UI files |
| `fidelity` | No | `wireframe`, `mockup`, or both |

## Reads

1. `06_UI_UX_SPEC.md`, if present.
2. Visual inputs and screenshots.
3. UI files in brownfield mode when needed for planning.
4. `ui-review/comments.json`, when provided.

## Writes

1. `06_UI_UX_SPEC.md` when UI decisions change.
2. `ui-review/` artifacts based on `templates/visual-review/`.
3. `.giqo/runs/<run-id>/ingest/` for imported comments.

It must not edit application source.

## Behavior

1. Define review scope by screen, element, flow, or project.
2. Assign stable `data-gqo-id` values for reviewable elements.
3. Generate wireframe or mockup artifacts when requested.
4. Preserve accepted comments and unresolved comments separately.
5. Update implementation tasks for accepted UI changes.
6. In brownfield mode, name affected existing screens and states.

## Completion report

Report changed UI docs, review artifact paths, comment coverage, and how to open the review screen.
