# GIQO Skill

GIQO means **Garbage In, Quality Out**: a planning skill that turns messy project inputs into implementation-ready design documents.

Drop rough requirements, screenshots, references, old project files, meeting notes, or partial ideas into an input folder. GIQO analyzes what is there, asks only the questions that matter, makes reasonable assumptions when the user skips, and generates only the documents the project actually needs.

## What GIQO creates

GIQO does not blindly create every possible planning document. It selects from these outputs based on the source material:

- `00_INDEX.md` - navigation map for the generated design package
- `01_REQUIREMENTS.md` - extracted requirements, constraints, and acceptance signals
- `02_ASSUMPTIONS.md` - decisions made when source material was incomplete
- `03_PRODUCT_SPEC.md` - user goals, scope, workflows, and non-goals
- `04_ARCHITECTURE.md` - system shape, modules, data flow, and integration points
- `05_IMPLEMENTATION_PLAN.md` - ordered work plan for an implementation agent
- `06_UI_UX_SPEC.md` - UI structure, states, accessibility, wireframe/mockup notes
- `07_DATA_MODEL.md` - entities, relationships, ERD, and persistence notes
- `08_API_SPEC.md` - endpoints, contracts, auth, errors, and examples
- `09_RISK_AND_DECISIONS.md` - tradeoffs, unresolved issues, and mitigation plan

When useful, GIQO also emits Mermaid diagrams:

- ERD for data-heavy systems
- Flowchart for complex user or business flows
- Sequence diagram for cross-system interactions
- Gantt chart for timeline-driven work

## Visual Review Mode

For UI-heavy projects, GIQO can generate a browser-openable review artifact:

```text
ui-review/
├── wireframe.html
├── mockup.html
├── review.css
├── review.js
├── comments.schema.json
└── review-export.md
```

The generated HTML uses stable `data-gqo-id` attributes. Reviewers can click a visible element or choose it from the Target list, then add comments or edit requests. When opened with the local launcher, feedback is saved automatically under `.giqo/ui-review/<screen>/`. A later GIQO run can ingest that saved feedback and update `06_UI_UX_SPEC.md`, `05_IMPLEMENTATION_PLAN.md`, and unresolved-risk notes.

Open the review screen with the bundled launcher:

```bash
node scripts/open-visual-review.mjs templates/visual-review/mockup.html
```

Open edit-request mode and link to the actual app screen:

```bash
node scripts/open-visual-review.mjs ./ui-review/mockup.html --mode edit --actual http://localhost:3000
```

Useful variants:

```bash
node scripts/open-visual-review.mjs templates/visual-review/wireframe.html
node scripts/open-visual-review.mjs ./ui-review/mockup.html --port 9000
node scripts/open-visual-review.mjs --no-open
```

Saved browser edit requests become work items in `.giqo/ui-review/<screen>/change-requests.json` for GIQO to read in the next step. Currently visible reviewable targets are also saved in `targets.json` so later runs can skip most initial UI mapping. Hidden or offscreen states are lazy-mapped only when the reviewer opens or requests them. Status is not a reviewer-controlled selector; the agent updates it to `saved`, `running`, `applied`, or `failed` as work progresses. The browser artifact does not directly mutate source code or send an AI-session message in v1; use `/giqo-apply` or ask naturally to apply the saved UI requests.

The `--actual` URL is a comparison link in v1. Commenting directly on the running app requires a separate bridge that can see the app's stable `data-gqo-id` values and satisfy browser security constraints.

## Existing projects and commands

For an existing repository, GIQO uses a `.giqo/` workspace for inputs, runs, and UI review artifacts while keeping application source files separate until an apply step is explicitly allowed.

Command specs live in `commands/`:

- `/giqo-init`
- `/giqo-plan`
- `/giqo-ui`
- `/giqo-apply`
- `/giqo-ingest`

## Platform support

GIQO is written as a platform-neutral skill. Use the same repository from:

- Claude / Claude Code
- Codex
- OpenCode
- Any agent that can read `SKILL.md` and the `references/` directory

## Installation and setup

GIQO is not a package that needs a build step. It is a **skill folder** for an agent to read. Installation means placing this repository somewhere the agent can access and keeping `SKILL.md`, `commands/`, `references/`, and `templates/` together.

### 1. Clone the repository

```bash
git clone <repo-url> GIQO-skill
cd GIQO-skill
```

### 2. Connect it to your agent

Use the option that matches your environment.

| Environment | Recommended setup |
|---|---|
| Claude / Claude Code | Register `GIQO-skill/` as a skill directory, or make the session read this folder's `SKILL.md`. |
| Codex | Place it next to the target repo or in a shared skills folder, then have the session use `GIQO-skill/SKILL.md` as the guiding instruction. |
| OpenCode | Put this folder on the skills path, or open this repository in the session and run GIQO requests from there. |
| Other agents | Read `SKILL.md` as the entry instruction and keep `references/`, `commands/`, and `templates/` available by relative path. |

### 3. Use it in a project

In a new or existing project, ask naturally:

```text
Use GIQO to analyze this project's inputs and create only the design docs needed for implementation.
```

For existing projects, GIQO uses `.giqo/` as its default workspace for inputs and run outputs. It does not modify application source files until an explicit apply step.

### 4. Prepare visual review

To open the Visual Review screen directly, Node.js is required. No package install is needed for the bundled launcher.

```bash
node scripts/open-visual-review.mjs templates/visual-review/mockup.html
```

To apply saved UI edit requests, ask naturally:

```text
Check any saved UI edit requests and apply the actionable ones.
```

If no saved requests or required documents exist, GIQO reports the current state and stops.

## Suggested invocation

```text
Use GIQO on ./input and create only the design docs needed for implementation.
If something is unclear, ask the minimum questions; if I skip, make reasonable assumptions and record them.
```

For visual review feedback:

```text
Read the UI review feedback saved under .giqo and update the UI/UX spec and implementation plan.
```

## Repository layout

```text
GIQO-skill/
├── SKILL.md
├── README.md
├── commands/
├── scripts/
├── references/
├── templates/
│   ├── docs/
│   ├── mermaid/
│   └── visual-review/
└── examples/
```

## Core principle

The final output must work as an index and handoff package for a real builder. If an implementation agent cannot tell what to build, what to ignore, and where to start, the GIQO run is incomplete.
