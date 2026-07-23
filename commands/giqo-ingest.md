# /giqo-skill ingest

Legacy workflow name: `/giqo-ingest`.

Read new evidence into an active GIQO workspace and produce a planning delta.

## Use when

1. The user adds comments, corrections, screenshots, notes, or project facts after a plan exists.
2. Browser-saved review state needs to update UI docs.
3. A brownfield repo changed after the last plan.
4. Selected docs changed and existing tasks may need reconciliation.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `source` | Yes | File, folder, pasted text, saved review state, or repo path |
| `run` | No | Defaults to active run |
| `scope` | No | Global, screen, element, flow, or project |

## Reads

1. New source material.
2. Active run ledger and assumptions.
3. Existing selected docs.
4. `.giqo/ui-review/<screen>/` review state, when present.
5. `.giqo/plans/<plan-id>/plan.json` and `tasks.json`, when present.

## Writes

1. `.giqo/runs/<run-id>/ingest/` copy or summary.
2. Updated source ledger.
3. Planning delta for affected docs.
4. Task reconciliation proposal for affected Plans or Phases.

It must not edit application source.

## Behavior

1. Classify the new evidence.
2. Map comments or corrections to existing decisions.
3. Mark applied, failed, conflicting, and unresolved items.
4. Update assumptions and risks when evidence changes them.
5. Produce a delta for `/giqo-skill plan`, `/giqo-skill ui`, or `/giqo-skill apply`.
6. In brownfield mode, note whether repo facts have drifted.
7. If the requested feedback source is missing or empty, report the current state and recommended next action instead of creating placeholder deltas.
8. When docs or evidence affect an existing Phase, inspect non-terminal tasks before proposing task changes.
9. If tasks no longer match the changed docs, ask the user to keep, update, stash, cancel, or create a new Plan before writing task changes.
10. After the reconciliation action is clear, use `scripts/update-plan-state.mjs` to apply the approved task-state update.

## Completion report

Report ingested sources, affected docs, affected Plans/Phases, task reconciliation needs, conflicts, assumptions changed, and the recommended next command.

If no new feedback exists, say so directly, for example: `No saved review comments or UI edit requests were found for the current run.`
