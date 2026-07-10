# GIQO Workflow

## Phase 1: Input inventory

Create a source ledger before drafting. For each source, record:

- path or identifier
- source type
- likely intent
- confidence
- extracted facts
- unresolved questions

## Phase 2: Interpretation

Separate material into:

- explicit requirements
- implied requirements
- constraints
- preferences
- examples to emulate
- anti-examples to avoid
- unknowns

## Phase 3: Document selection

Use `references/document-selection.md` to choose only necessary documents.

## Phase 4: Clarification or assumptions

Use `references/interview-policy.md`. Ask fewer questions than a human analyst would; record assumptions aggressively.

## Phase 5: Draft package

Generate selected docs from `templates/docs/`, diagram snippets from `templates/mermaid/`, and UI review assets from `templates/visual-review/` when needed.

## Phase 6: Index and handoff

`00_INDEX.md` is mandatory for every non-trivial run. It must tell the implementer what to read first and how the files relate.
