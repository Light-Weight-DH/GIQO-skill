# /giqo-skill ui

Legacy workflow name: `/giqo-ui`.

Create or update UI planning docs, browser review artifacts, and read-only Plan Dashboard artifacts.

## Use when

1. The project includes screens, flows, visual states, or layout decisions.
2. The user needs a clickable comment surface.
3. Existing review comments require a UI planning update.
4. The user needs to inspect Plan/Phase/Task progress.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `screen` | No | Screen or flow to focus |
| `source` | No | Existing plan, screenshots, comments, or repo UI files |
| `fidelity` | No | `wireframe`, `mockup`, or both |
| `dashboard` | No | Generate or refresh the read-only Plan Dashboard |

## Reads

1. `06_UI_UX_SPEC.md`, if present.
2. Visual inputs and screenshots.
3. UI files in brownfield mode when needed for planning.
4. `.giqo/ui-review/<screen>/comments.json`, when present.
5. `.giqo/plans/<plan-id>/plan.json` and `tasks.json`, when dashboard output is requested.

## Writes

1. `06_UI_UX_SPEC.md` when UI decisions change.
2. `ui-review/` artifacts based on `templates/visual-review/`.
3. `.giqo/ui-review/<screen>/` for browser-saved review state.
4. `.giqo/plans/<plan-id>/dashboard.html` based on `templates/plan-dashboard/`.

It must not edit application source.

## Behavior

1. Define review scope by screen, element, flow, or project.
2. Assign stable `data-gqo-id` values for reviewable elements.
3. Generate wireframe or mockup artifacts when requested.
4. Preserve accepted comments and unresolved comments separately.
5. Update implementation tasks for accepted UI changes.
6. In brownfield mode, name affected existing screens and states.
7. If the user asks to continue UI edits but no saved comments or edit requests exist, report the current state instead of inventing work.
8. When dashboard output is requested, render Plan, Phase, and Task progress read-only from `.giqo/plans/<plan-id>/plan.json` and `tasks.json`.
9. Do not allow dashboard edits to mutate task state; use `/giqo-skill ingest`, `/giqo-skill plan`, or `/giqo-skill apply` for state changes.

## Completion report

Report changed UI docs, review artifact paths, dashboard paths, comment coverage, and how to open the review or dashboard screen.

If there is nothing to apply or ingest, say so directly, for example: `No saved UI edit requests were found for the current run.`
