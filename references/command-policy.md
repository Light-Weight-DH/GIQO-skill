# Command Policy

GIQO commands are planning commands first. They prepare, update, or apply documentation and review artifacts. They should not surprise the user with source edits.

## Command set

| Command | Purpose | Primary output |
|---|---|---|
| `/giqo-init` | Create or update `.giqo` workspace state | `.giqo/workspace.json` |
| `/giqo-plan` | Analyze inputs and produce selected docs | Design package |
| `/giqo-ui` | Create or refresh reviewable UI artifacts | `ui-review/` files and `06_UI_UX_SPEC.md` |
| `/giqo-apply` | Write approved GIQO outputs to the project | Docs, review assets, or allowed source edits |
| `/giqo-ingest` | Read new evidence, comments, or corrections | Updated ledger and next plan delta |

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

## Apply boundary

`/giqo-plan`, `/giqo-ui`, and `/giqo-ingest` propose changes unless their command spec says they write generated artifacts. `/giqo-apply` is the command that turns approved proposals into project files.

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
