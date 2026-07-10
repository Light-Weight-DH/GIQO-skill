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

The generated HTML uses stable `data-gqo-id` attributes. Reviewers can click a visible element, add a comment, store comments in the browser, and export both `comments.json` and `review.md`. A later GIQO run can ingest those comments and update `06_UI_UX_SPEC.md` and `05_IMPLEMENTATION_PLAN.md`.

Open the review screen with the bundled launcher:

```bash
node scripts/open-visual-review.mjs templates/visual-review/mockup.html
```

Useful variants:

```bash
node scripts/open-visual-review.mjs templates/visual-review/wireframe.html
node scripts/open-visual-review.mjs ./ui-review/mockup.html --port 9000
node scripts/open-visual-review.mjs --no-open
```

## Platform support

GIQO is written as a platform-neutral skill. Use the same repository from:

- Claude / Claude Code
- Codex
- OpenCode
- Any agent that can read `SKILL.md` and the `references/` directory

## Suggested invocation

```text
Use GIQO on ./input and create only the design docs needed for implementation.
If something is unclear, ask the minimum questions; if I skip, make reasonable assumptions and record them.
```

For visual review feedback:

```text
Read ui-review/comments.json and update the UI/UX spec and implementation plan.
```

## Repository layout

```text
GIQO-skill/
├── SKILL.md
├── README.md
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
