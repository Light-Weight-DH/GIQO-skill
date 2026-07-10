# GIQO Skill: Garbage In, Quality Out

Use this skill when the user wants to turn rough source material into a practical design, specification, or implementation plan.

## Triggers

Use GIQO for requests like:

- `GIQO`
- `Garbage In Quality Out`
- `대충 자료 넣을 테니 설계 문서 만들어줘`
- `requirements folder 기반으로 계획서 만들어줘`
- `as-is 프로젝트 보고 설계 문서 만들어줘`
- `문서/이미지/reference 기반으로 구현 계획 만들어줘`
- `wireframe/mockup에 코멘트 반영해서 UI 문서 업데이트해줘`

Do not use GIQO for ordinary code edits, small bug fixes, or pure prose proofreading unless the user is asking for planning artifacts.

## Goal

Convert messy inputs into a selective, implementation-ready documentation package.

Inputs may include:

- requirements documents
- screenshots or images
- hand-written notes
- reference URLs or copied references
- existing project files
- exported review comments
- partial plans
- user corrections

Outputs must be useful to a real implementation agent, not merely descriptive.

## Operating workflow

1. Inventory the inputs.
2. Classify each input by type, trust level, and relevance.
3. Extract explicit requirements, implied requirements, constraints, and unknowns.
4. Decide which documents are necessary.
5. Ask only owner-level questions that materially change the result.
6. If the user skips questions, choose reasonable defaults and record them in assumptions.
7. Generate the selected documents.
8. Add Mermaid diagrams only when they clarify implementation.
9. Create or update `00_INDEX.md` so the output package is navigable.
10. End with the next implementation step.

## Selective document generation

Never create all possible documents by default. Generate a document only when its absence would make implementation ambiguous.

Always consider:

- `00_INDEX.md`
- `01_REQUIREMENTS.md`
- `02_ASSUMPTIONS.md`
- `05_IMPLEMENTATION_PLAN.md`

Generate conditionally:

- `03_PRODUCT_SPEC.md` when product scope, personas, or workflows matter.
- `04_ARCHITECTURE.md` when multiple modules, services, integrations, or migration choices exist.
- `06_UI_UX_SPEC.md` when screens, flows, visual design, accessibility, or UX states exist.
- `07_DATA_MODEL.md` when entities, persistence, schema, or relationships exist.
- `08_API_SPEC.md` when APIs, webhooks, CLI commands, RPC, or external contracts exist.
- `09_RISK_AND_DECISIONS.md` when tradeoffs, risks, irreversible decisions, or unresolved issues exist.

## Question policy

Ask questions only when all are true:

- The answer changes document selection, architecture, scope, data shape, or implementation order.
- The answer is not recoverable from the provided material.
- A reasonable default would be risky, irreversible, or likely wrong.

If the user says to skip questions, continue with assumptions and mark each assumption with:

- assumption
- reason
- impact if wrong
- how to revise later

## Diagram policy

Use Mermaid diagrams when they reduce ambiguity:

- ERD for entities and relationships.
- Flowchart for user journeys, business rules, or branching processes.
- Sequence diagram for interactions across actors, services, APIs, or agents.
- Gantt chart only when timeline, milestone, or dependency planning is requested or implied.

Do not include decorative diagrams.

## Visual Review Mode

When UI review is needed, generate a `ui-review/` package using the files in `templates/visual-review/`.

Requirements:

- Every reviewable element must have a stable `data-gqo-id`.
- Wireframes prioritize structure and hierarchy.
- Mockups prioritize visual direction, spacing, typography, color, and component feel.
- Comments are stored separately from the HTML as exportable JSON and Markdown.
- GIQO must be able to ingest exported comments and update `06_UI_UX_SPEC.md` and `05_IMPLEMENTATION_PLAN.md`.
- Prefer `node scripts/open-visual-review.mjs <html-file>` to launch a local review server and open the browser.

Prefer this flow:

```text
generate wireframe/mockup HTML
→ user runs `node scripts/open-visual-review.mjs ui-review/mockup.html`
→ user clicks elements and writes comments
→ user exports comments.json/review.md
→ GIQO ingests comments
→ docs are updated
```

## Output quality bar

Every generated package must answer:

- What are we building?
- Why does it matter?
- What is in scope?
- What is out of scope?
- What assumptions were made?
- What should be built first?
- Which files should an implementation agent read first?
- Which diagrams or review artifacts are authoritative?

If those questions are not answered, continue refining before returning.
