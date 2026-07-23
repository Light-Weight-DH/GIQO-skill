# /giqo-skill plan

Legacy workflow name: `/giqo-plan`.

Analyze inputs and create the smallest useful GIQO document package, with Plan/Phase/Task state when implementation tracking is useful.

## Use when

1. Turning rough material into implementation docs.
2. Planning a feature or product from source notes.
3. Mapping a requested change onto an existing repo.
4. Creating a new Plan or branching from an existing Plan.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `input` | No | Folder, file list, pasted material, or `.giqo/inputs/` |
| `mode` | No | Uses `.giqo/workspace.json` when present |
| `outputDir` | No | Uses workspace default when present |
| `parentPlanId` | No | Existing Plan to branch from when the request changes direction but remains related |

## Reads

1. Input material.
2. `.giqo/workspace.json`, if present.
3. Existing docs in the output directory.
4. Repo structure and relevant files in brownfield mode.
5. Existing `.giqo/plans/<plan-id>/plan.json` and `tasks.json`, when present.

## Writes

1. Selected docs from `templates/docs/`.
2. `.giqo/runs/<run-id>/source-ledger.md`.
3. `.giqo/runs/<run-id>/assumptions.md`.
4. `.giqo/plans/<plan-id>/plan.json`.
5. `.giqo/plans/<plan-id>/tasks.json` when phases/tasks can be derived.

It must not edit application source.

## Behavior

1. Build a source ledger.
2. Separate requirements, constraints, preferences, examples, and unknowns.
3. Apply `references/document-selection.md`.
4. Ask only owner-level questions from `references/interview-policy.md`.
5. Record assumptions when proceeding without answers.
6. Generate selected docs and `00_INDEX.md`.
7. In brownfield mode, tie implementation steps to existing files or modules when known.
8. Apply `references/plan-task-model.md` to decide whether to update the current Plan, create a child Plan, or create a new root Plan.
9. Convert implementation phases from `05_IMPLEMENTATION_PLAN.md` into `tasks.json` when the work can be expressed as actionable tasks.
10. Do not rewrite non-terminal tasks in an existing Phase without first reporting the reconciliation choices to the user.

## Completion report

Report generated docs, skipped docs with reasons, Plan id, task count by Phase, assumptions, unresolved questions, and the recommended next command.
