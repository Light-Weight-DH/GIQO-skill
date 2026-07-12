# Existing Project Mode

Existing Project Mode lets GIQO work inside a real codebase without treating the repo as a blank slate. It separates greenfield planning from brownfield planning, stores run state in a `.giqo` workspace, and keeps generated decisions traceable.

## `.giqo` workspace

Create `.giqo/` at the project root when a command needs persistent GIQO state. Keep it outside application source paths.

Recommended layout:

```text
.giqo/
  workspace.json
  inputs/
  runs/
    <run-id>/
      source-ledger.md
      assumptions.md
      outputs/
      ingest/
  ui-review/
```

`workspace.json` records:

| Field | Purpose |
|---|---|
| `mode` | `greenfield` or `brownfield` |
| `projectRoot` | Path GIQO treats as the repo root |
| `currentRun` | Active run id, if one exists |
| `outputDir` | Folder for generated docs |
| `sourcePolicy` | What inputs are authoritative |
| `applyPolicy` | Whether GIQO may write files or only propose changes |

`inputs/` stores user supplied material. `runs/` stores each analysis pass. `ui-review/` stores generated review assets and exported comments when the project uses commentable UI review.

Do not hide decisions in `.giqo` only. Anything an implementer needs must also appear in the selected docs, usually `00_INDEX.md`, `02_ASSUMPTIONS.md`, `05_IMPLEMENTATION_PLAN.md`, or `09_RISK_AND_DECISIONS.md`.

## Greenfield flow

Use greenfield mode when the user is starting from rough ideas, references, screenshots, or planning notes and there is no existing implementation to respect.

Flow:

1. Run `/giqo-init` with `mode: greenfield`.
2. Put source material in `.giqo/inputs/` or point GIQO at an input folder.
3. Run `/giqo-plan` to create the smallest useful document set.
4. Run `/giqo-ui` only when screens, layout, or visual review matter.
5. Use `/giqo-apply` only to write the selected docs and review artifacts.

Greenfield output may define new architecture, data shape, routes, UI flows, and milestones. It must still mark assumptions clearly.

## Brownfield flow

Use brownfield mode when a codebase already exists. The current repo is source material and a constraint, not a suggestion.

Flow:

1. Run `/giqo-init` with `mode: brownfield`.
2. Capture project facts in `.giqo/runs/<run-id>/source-ledger.md`.
3. Run `/giqo-plan` to map desired changes onto existing modules, files, data, and flows.
4. Run `/giqo-ui` when the change affects screens or reviewable UI.
5. Use `/giqo-ingest` for comments, user corrections, or new project evidence.
6. Use `/giqo-apply` only after the plan states what files may change and what files are off limits.

Brownfield output must include:

1. Existing behavior to preserve.
2. Files or modules likely affected.
3. Migration notes when data, APIs, routes, or commands change.
4. Tests or manual checks needed after implementation.
5. Risks tied to unknown code paths.

## Greenfield versus brownfield defaults

| Topic | Greenfield default | Brownfield default |
|---|---|---|
| Source of truth | User inputs and assumptions | Existing repo plus user inputs |
| Architecture | May propose new shape | Must fit current structure unless told otherwise |
| Output docs | Planning package | Change plan tied to files and behavior |
| UI review | New screens are allowed | Review must name affected screens and preserved states |
| Apply behavior | May create docs and review assets | Must avoid source edits unless apply policy permits them |

## Existing project guardrails

1. Read project facts before proposing changes.
2. Do not assume a missing doc means missing behavior.
3. Prefer updating selected docs over creating a full package.
4. Record all uncertain repo facts as assumptions or risks.
5. Never edit implementation files from command planning mode unless `/giqo-apply` is explicitly configured for source edits.
