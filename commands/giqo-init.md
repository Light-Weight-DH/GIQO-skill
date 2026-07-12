# /giqo-init

Create or refresh a `.giqo` workspace for a project.

## Use when

1. Starting a new GIQO planning run.
2. Switching between greenfield and brownfield mode.
3. Preparing a repo to track inputs, assumptions, generated docs, or UI review comments.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `mode` | Yes | `greenfield` or `brownfield` |
| `projectRoot` | No | Defaults to current repo root |
| `outputDir` | No | Defaults to `.giqo/runs/<run-id>/outputs` |
| `applyPolicy` | No | Defaults to docs and review assets only |

## Reads

1. Current working directory.
2. Existing `.giqo/workspace.json`, if present.
3. Basic repo layout in brownfield mode.

## Writes

1. `.giqo/workspace.json`.
2. `.giqo/inputs/` when missing.
3. `.giqo/runs/<run-id>/` for the active run.

It must not edit application source.

## Behavior

1. Resolve the project root.
2. Create `.giqo/` if it does not exist.
3. Set workspace mode.
4. Create a new run id unless the user asks to reuse the active run.
5. Record defaults for output and apply policy.
6. In brownfield mode, record a short project inventory.

## Completion report

Report the workspace path, selected mode, run id, output directory, and recommended next command, usually `/giqo-plan`.
