# Command Policy

GIQO commands are planning commands first. They prepare, update, or apply documentation and review artifacts. They should not surprise the user with source edits.

## Command set

| Workflow | Purpose | Primary output |
|---|---|---|
| `/giqo-skill init` | Create or update `.giqo` workspace state | `.giqo/workspace.json` |
| `/giqo-skill plan` | Analyze inputs and produce selected docs and task state | Design package and `.giqo/plans/<plan-id>/tasks.json` |
| `/giqo-skill ui` | Create or refresh reviewable UI or dashboard artifacts | `ui-review/` files, `06_UI_UX_SPEC.md`, or Plan Dashboard |
| `/giqo-skill apply` | Write approved GIQO outputs to the project | Docs, review assets, task evidence, or allowed source edits |
| `/giqo-skill ingest` | Read new evidence, comments, corrections, or doc changes | Updated ledger, task reconciliation proposal, and next plan delta |

Legacy workflow names such as `/giqo-plan` may appear in older docs or environments. Treat them as aliases for the `/giqo-skill` subword flow.

## Shared command contract

Each command must state:

1. Required inputs.
2. Optional flags or arguments.
3. Files it may read.
4. Files it may write.
5. Whether it can edit application source.
6. What it reports when complete.

If a command cannot safely continue, it should stop with a short reason and the smallest question needed to proceed.

## Workspace rules

Commands that persist state use `.giqo/` at the project root. A command may create `.giqo/` only when the user runs a GIQO command or clearly asks for a GIQO workspace.

Rules:

1. Keep source inputs, run ledgers, assumptions, and generated outputs traceable by run id.
2. Do not store secrets in `.giqo`.
3. Do not make `.giqo` the only copy of user facing docs.
4. Treat `.giqo/workspace.json` as state, not as the final plan.
5. In brownfield mode, record repo facts before proposing file changes.
6. Store implementation planning state under `.giqo/plans/<plan-id>/` when Plan/Phase/Task tracking is active.

## Plan and task boundary

Use `references/plan-task-model.md` when a command creates, branches, reconciles, applies, or visualizes implementation tasks.

Command responsibilities:

| Workflow | Plan/Task responsibility |
|---|---|
| `/giqo-skill init` | Prepare `.giqo/plans/` and keep workspace defaults traceable |
| `/giqo-skill plan` | Create or branch Plans, generate selected docs, and draft phases/tasks |
| `/giqo-skill ingest` | Detect document or evidence drift and ask before reconciling non-terminal tasks |
| `/giqo-skill apply` | Move attempted tasks through `running` to `applied` or `failed`, with evidence |
| `/giqo-skill ui` | Generate read-only Visual Review or Plan Dashboard artifacts |

Plan and Phase status are derived from Task status. Commands must not write separate Plan or Phase status fields.

If a Phase has `running` tasks, no command may rewrite that Phase's task list without an explicit user decision.

## Status display policy

Plan status checks are inline-first. A request such as "plan 상태 보여줘", "progress 알려줘", or "진행 상황 확인" should not create or open a browser dashboard by default.

Use this decision flow:

1. If the user only asks for status or progress, reply with an inline summary in the current chat or terminal. Use compact output for narrow contexts and standard output for normal terminal width.
2. If the user explicitly asks for a dashboard, browser view, preview URL, or visual progress screen, generate or refresh the read-only Plan Dashboard.
3. If the wording could mean either inline summary or browser dashboard, ask one narrow question: `여기서 요약으로 볼까요, 브라우저 dashboard로 열까요?`
4. After `/giqo-skill plan`, `/giqo-skill ingest`, or `/giqo-skill apply` changes Plan/Task state, append a short inline status footer to the completion report when a current Plan id is known.

`scripts/show-plan-status.mjs` is a read-only helper for inline status rendering. It reads `.giqo/plans/<plan-id>/plan.json` and `tasks.json`; it must not mutate Plan, Phase, Task, dashboard, or application state.

## Apply boundary

`/giqo-skill plan`, `/giqo-skill ui`, and `/giqo-skill ingest` propose changes unless their command spec says they write generated artifacts. `/giqo-skill apply` is the command that turns approved proposals into project files.

Source edits are off by default. They are allowed only when all are true:

1. The user requested applied changes.
2. The workspace apply policy permits source edits.
3. The plan names the target files or directories.
4. The command can verify the change through tests, build, or manual checks.

Without those conditions, write docs and review assets only.

## Greenfield and brownfield command behavior

Greenfield commands may create new planning shape. Brownfield commands must first respect existing project shape.

Brownfield requirements:

1. Treat the repo as source material.
2. Identify affected files or modules when possible.
3. Preserve existing behavior unless the user says to change it.
4. Mark any repo facts that were not verified.
5. Include regression checks in the implementation plan.

## Completion report

Every command ends with:

1. What changed.
2. Where outputs were written.
3. Assumptions added or changed.
4. Open questions, if any.
5. Recommended next command.
