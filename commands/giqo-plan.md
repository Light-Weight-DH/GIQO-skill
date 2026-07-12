# /giqo-plan

Analyze inputs and create the smallest useful GIQO document package.

## Use when

1. Turning rough material into implementation docs.
2. Planning a feature or product from source notes.
3. Mapping a requested change onto an existing repo.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `input` | No | Folder, file list, pasted material, or `.giqo/inputs/` |
| `mode` | No | Uses `.giqo/workspace.json` when present |
| `outputDir` | No | Uses workspace default when present |

## Reads

1. Input material.
2. `.giqo/workspace.json`, if present.
3. Existing docs in the output directory.
4. Repo structure and relevant files in brownfield mode.

## Writes

1. Selected docs from `templates/docs/`.
2. `.giqo/runs/<run-id>/source-ledger.md`.
3. `.giqo/runs/<run-id>/assumptions.md`.

It must not edit application source.

## Behavior

1. Build a source ledger.
2. Separate requirements, constraints, preferences, examples, and unknowns.
3. Apply `references/document-selection.md`.
4. Ask only owner-level questions from `references/interview-policy.md`.
5. Record assumptions when proceeding without answers.
6. Generate selected docs and `00_INDEX.md`.
7. In brownfield mode, tie implementation steps to existing files or modules when known.

## Completion report

Report generated docs, skipped docs with reasons, assumptions, unresolved questions, and the recommended next command.
