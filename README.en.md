# GIQO Skill

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

```text
Questions:
1. Should this plan target an MVP slice or the full redesign?
2. Should existing API and DB structure be preserved?
```

If you answer or say “make reasonable assumptions,” GIQO creates only the needed docs and records the next implementation steps in `05_IMPLEMENTATION_PLAN.md`.

### Use references or source materials

After placing screenshots, competitor links, meeting notes, or old docs in an input folder, ask:

```text
/giqo-skill Read ./input together with the current project and update the UI/UX spec and implementation plan.
```

GIQO classifies sources by trust and relevance, records conflicts as assumptions or risks, and creates or refreshes Visual Review when UI decisions matter.

### Start from a raw idea

You can begin without a repo or polished docs.

```text
/giqo-skill I want to build a tool that turns teammate requirements and screenshots into implementation-ready docs.
Ask only the minimum questions; if I skip, make reasonable assumptions.
```

GIQO narrows the scope, users, and core flow, selects the needed documents, and records missing context in `02_ASSUMPTIONS.md`.

### Apply saved UI requests

After saving requests in Visual Review, ask:

```text
/giqo-skill Check the UI requests saved under .giqo and apply the actionable ones.
```

GIQO reads saved requests and Tasks, then updates status through `saved → running → applied/failed` while reflecting the work in docs or UI implementation.

### Inspect work progress

Ask for a Plan Dashboard when you need a read-only progress view:

```text
/giqo-skill Show the current Plan/Phase/Task progress as a read-only dashboard.
```

The dashboard reads `.giqo/plans/<plan-id>/plan.json` and `tasks.json`, then shows columns per Plan, Phase markers, and Task status. It does not edit state directly; state changes go through `/giqo-skill plan`, `/giqo-skill ingest`, or `/giqo-skill apply`.

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
