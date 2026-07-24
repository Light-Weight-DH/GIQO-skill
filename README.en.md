# GIQO Skill

<p align="center">
  <img src="git-readme/GIQO_logo.png" alt="GIQO logo" width="520">
</p>

<p align="center">
  <strong>Garbage In, Quality Out</strong><br>
  An agent skill that turns messy requirements, images, references, and existing projects into implementation-ready design docs and work plans.
</p>

<p align="center">
  <a href="README.md"><img alt="Docs: Korean" src="https://img.shields.io/badge/docs-Korean-blue"></a>
  <img alt="Platform: Agent Skill" src="https://img.shields.io/badge/platform-Agent%20Skill-4f46e5">
  <img alt="Visual Review" src="https://img.shields.io/badge/visual%20review-live%20UI-16a34a">
  <img alt="No build required" src="https://img.shields.io/badge/build-not%20required-64748b">
</p>

<p align="center">
  <a href="#core-workflow">Core workflow</a> ·
  <a href="#real-user-flows">Real user flows</a> ·
  <a href="#work-management">Work management</a> ·
  <a href="#visual-review-mode">Visual Review</a> ·
  <a href="#skill-commands-and-visible-ui">Skill commands</a> ·
  <a href="docs/visual-review.md">Visual Review details</a>
</p>

## What it does

GIQO does not require a polished spec. It reads rough project material and creates only the documents needed for implementation.

- Extract requirements, constraints, and acceptance signals
- Record assumptions when source material is incomplete
- Summarize product flows, UI/UX, data model, API, and architecture
- Produce an ordered work plan for an implementation agent
- Track implementation work as Plan/Phase/Task state with evidence
- Let reviewers select UI targets and save edit requests from the browser

It does not blindly generate every possible document. Output is selected from the project context.

## Core workflow

```text
rough inputs / existing repo / screenshots / review notes
→ GIQO classifies inputs and asks only necessary questions
→ selected docs are created or updated
→ implementation work is structured as Plans, Phases, and Tasks
→ Visual Review saves UI requests against stable targets
→ ingest/apply steps reflect saved requests and Tasks in docs or implementation work
```

Common outputs:

| Document | Purpose |
|---|---|
| `00_INDEX.md` | Navigation map for the generated package |
| `01_REQUIREMENTS.md` | Requirements, constraints, acceptance signals |
| `02_ASSUMPTIONS.md` | Assumptions made from incomplete material |
| `03_PRODUCT_SPEC.md` | Goals, scope, workflows |
| `04_ARCHITECTURE.md` | System shape and integration points |
| `05_IMPLEMENTATION_PLAN.md` | Ordered implementation and verification plan |
| `06_UI_UX_SPEC.md` | UI structure, states, accessibility decisions |
| `07_DATA_MODEL.md` | Entities, relationships, persistence notes |
| `08_API_SPEC.md` | APIs, commands, external contracts |
| `09_RISK_AND_DECISIONS.md` | Risks, decisions, unresolved issues |

## Real user flows

### Start from an existing project

From the project root, ask naturally:

```text
/giqo-skill Based on the current project in this directory, create implementation-ready design docs and a work plan while preserving the existing structure.
```

GIQO reads the repo structure, existing code, docs, and `.giqo/` state, then asks only questions that materially change the plan.
It creates only the needed docs and records unclear points as explicit assumptions when you ask it to proceed.

### Use references or source materials

After placing screenshots, competitor links, meeting notes, or old docs in an input folder, ask:

```text
/giqo-skill Read ./input together with the current project and update the UI/UX spec and implementation plan.
```

GIQO classifies sources by trust and relevance, records conflicts as assumptions or risks, and creates or refreshes [Visual Review](#visual-review-mode) when UI decisions matter.

### Start from a raw idea

You can begin without a repo or polished docs.

```text
/giqo-skill I want to build a tool that turns teammate requirements and screenshots into implementation-ready docs.
Ask only the minimum questions; if I skip, make reasonable assumptions.
```

GIQO narrows the scope, users, and core flow, then selects only the needed document set. Missing context is recorded as assumptions with reasons.

For the detailed policy, see [existing-project mode](references/existing-project-mode.md), [document selection](references/document-selection.md), and [interview policy](references/interview-policy.md).

## Work management

GIQO outputs can also manage implementation work units so a builder can follow the plan directly. The workflow follows the [Plan/Phase/Task model](references/plan-task-model.md).

| Concept | Role |
|---|---|
| Plan | One implementation goal or direction. Example: `UI componentization test plan` |
| Phase | A logical step inside a Plan. Example: `UI boundary survey`, `Static layout component split` |
| Task | The actual unit with status. Allowed statuses are `saved`, `running`, `applied`, `failed`, `stashed`, and `cancelled`. |

State is stored in `.giqo/plans/<plan-id>/plan.json` and `tasks.json`. Plan and Phase status are not stored separately; they are derived from Task status.

### Check in chat or terminal

For a quick status check, ask:

```text
/giqo-skill Show the current Plan status.
```

The default response is an inline summary in the current chat or terminal.

```text
UI 컴포넌트화 테스트 계획
1 / 6 applied · running 0 · saved 5

Phase                          Progress
─────────────────────────────────────────
UI 경계 조사                   1 / 2
정적 레이아웃 컴포넌트 분리    0 / 1
인터랙티브 보드 컴포넌트 분리  0 / 2
계획과 UI 동작 검증            0 / 1
```

Agents can use the read-only helper [`scripts/show-plan-status.mjs`](scripts/show-plan-status.mjs) to render that inline status. Users usually do not need to run it directly, but it is available:

```bash
node scripts/show-plan-status.mjs --plan-id plan-ui-components --format compact
node scripts/show-plan-status.mjs --plan-id plan-ui-components --format standard
node scripts/show-plan-status.mjs --plan-id plan-ui-components --format rich --color
```

### Check in a dashboard

Ask explicitly when you want a browser dashboard:

```text
/giqo-skill Open the current Plan/Phase/Task progress as a read-only dashboard.
```

Plan Dashboard is a read-only screen with a sidebar, summary cards, Phase list, Task list, and detail panel. It does not mutate state directly; state changes go through `/giqo-skill plan`, `/giqo-skill ingest`, or `/giqo-skill apply`.

![GIQO Plan Dashboard example](git-readme/GIQO_dashboard.png)

Agents use [`scripts/generate-plan-dashboard.mjs`](scripts/generate-plan-dashboard.mjs) to write dashboard files. The generator embeds current Plan/Task state into `dashboard.html` and copies CSS/JS from [`templates/plan-dashboard/`](templates/plan-dashboard/).

For status display and dashboard generation rules, see [Command Policy](references/command-policy.md#status-display-policy).

### Apply saved UI requests

After saving requests in Visual Review, ask:

```text
/giqo-skill Check the UI requests saved under .giqo and apply the actionable ones.
```

GIQO reads saved requests and Tasks, then updates status through `saved → running → applied/failed` while reflecting the work in docs or UI implementation.

For Visual Review request to Task linkage, see [UI edit mode](references/ui-edit-mode.md) and [`scripts/link-review-requests.mjs`](scripts/link-review-requests.mjs).

## Visual Review Mode

Visual Review lets reviewers select a component or region on a generated mockup or real app screen, then save an edit request against that target, similar to selecting components in Claude Design.

![GIQO Visual Review demo](git-readme/GIQO_UI_view_3.gif)

Users do not need to remember Node commands. Ask through the agent prompt:

```text
/giqo-skill Open UI edit mode for the current screen.
```

```text
/giqo-skill Open http://localhost:3000 in Visual Review so I can save UI edit requests.
```

Visible browser controls:

- `Status`: filter saved requests by `saved`, `running`, `applied`, or `failed`.
- `Target`: choose the UI target for the request.
- `Refresh`: reload state updated by the agent.
- `Hide feedback` / `Show feedback`: collapse or expand the saved request panel.
- `Edit` / `Delete` on saved request cards: update or remove existing requests.

The browser does not directly mutate source code. To apply saved requests, ask the agent again:

```text
/giqo-skill Apply the UI requests I just saved.
```

Quick terms:

| Term | Meaning |
|---|---|
| Target | Stable UI ID for a request. Example: `home.hero.primary-cta` |
| `saved` | Captured, not started yet |
| `running` | Agent work has started |
| `applied` | Reflected in docs, artifacts, or source |
| `failed` | Not actionable, rejected, blocked, or failed |

For storage files, iframe live shell, proxying, and target mapping details, see [Visual Review details](docs/visual-review.md).

## Skill commands and visible UI

In environments like OpenCode, this skill usually appears as the native `/giqo-skill` command. GIQO expects these standard workflow units:

| Example request | Role | User-visible result |
|---|---|---|
| `/giqo-skill init` | Create or refresh `.giqo/` workspace | Current project state and storage location |
| `/giqo-skill plan` | Analyze inputs and create selected docs | Selected docs, questions, assumptions, work plan |
| `/giqo-skill ui` | Create or refresh UI docs, Visual Review, and Plan Dashboard | Reviewable screen, actual-screen connection, or dashboard path |
| `/giqo-skill ingest` | Ingest saved comments, requests, or new materials | Updated docs and remaining questions |
| `/giqo-skill apply` | Apply approved plans, Tasks, or saved UI requests | Progress status and applied/failed results |

Exact subwords are optional. Put the natural-language request after `/giqo-skill`, and GIQO routes it to the closest workflow.

Agents use `scripts/update-plan-state.mjs` to write structured Plan/Phase/Task input into real state files. The script only creates or updates `.giqo/plans/<plan-id>/plan.json` and `tasks.json`; it does not edit application source.

Agents use `scripts/link-review-requests.mjs` when saved Visual Review requests should become Task sources. The script links Task `sourceReviewRequests` and request `linkedTask`; it does not mark requests applied or edit source code.

The Visual Review browser UI only exposes `Status`, `Target`, `Refresh`, `Hide/Show feedback`, and saved-card `Edit/Delete`. Users do not need to handle internal storage files, iframe proxy details, or the Node launcher directly.

The Plan Dashboard is read-only. When Task state must change, the agent reads Plan/Task state, proposes the needed action, and updates state only after the decision is clear.

## Existing-project principles

- GIQO uses `.giqo/` as the workspace for inputs, runs, and UI review state.
- GIQO uses `.giqo/plans/` for Plan/Phase/Task state and dashboard artifacts.
- Application source files stay untouched until an apply step is explicitly allowed.
- If no saved UI requests exist, GIQO reports that state instead of pretending to work.
- The handoff is complete only when a builder can tell what to build, what to skip, and where to start.

## Installation

GIQO is not a buildable package. It is a skill folder read by an agent.

```bash
git clone <repo-url> GIQO-skill
cd GIQO-skill
```

Connect the folder so your agent can read `SKILL.md`, `commands/`, `references/`, and `templates/` together.

| Environment | Recommended setup |
|---|---|
| Claude / Claude Code | Register `GIQO-skill/` as a skill directory |
| Codex | Place it next to the target repo or in a shared skills folder |
| OpenCode | Put it on the skills path or open this repository in a session |
| Other agents | Read `SKILL.md` and preserve relative paths |

## Repository layout

```text
GIQO-skill/
├── SKILL.md
├── README.md
├── README.en.md
├── commands/
├── scripts/
├── references/
├── templates/
│   ├── plan-dashboard/
│   └── state/
└── git-readme/
```
