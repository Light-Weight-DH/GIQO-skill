# /giqo-apply

Apply approved GIQO outputs to the project.

## Use when

1. A plan or UI review result has been accepted.
2. Generated docs need to be copied into the project.
3. The user explicitly wants approved changes written.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `run` | No | Defaults to active run |
| `target` | No | Docs, review assets, or named source paths |
| `allowSourceEdits` | No | Defaults to false |

## Reads

1. `.giqo/workspace.json`.
2. Active run outputs.
3. Current target files.
4. Apply policy from `references/command-policy.md`.

## Writes

1. Approved docs.
2. Approved `ui-review/` artifacts.
3. Application source only when the apply boundary permits it.

## Behavior

1. Confirm the active run and target outputs.
2. Compare generated outputs with existing files.
3. Refuse source edits unless the apply boundary is satisfied.
4. Write approved docs and review assets.
5. For allowed source edits, make only the named changes.
6. Run the checks named in the plan when source edits occur.

## Completion report

Report files written, files skipped, checks run, and any apply items left for a human or implementation agent.
