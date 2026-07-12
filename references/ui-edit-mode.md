# UI Edit Mode

UI Edit Mode lets reviewers ask for screen changes from the browser artifact without making the browser artifact the source of truth.

Visual Review Mode records what people noticed. UI Edit Mode records what people want changed.

## Core model

Each edit has two states:

1. Proposed edit: the reviewer's requested change, stored as structured feedback against a stable target.
2. Actual screen: the current UI description in `06_UI_UX_SPEC.md` and the current generated HTML artifact.

The proposed edit is never treated as applied just because it was written in the browser. GIQO must ingest the request, decide whether it belongs in scope, update the design docs, then regenerate or revise the screen artifact.

## Editable units

Use stable semantic targets, not visual coordinates.

1. Screen: a full route, page, modal, or major state.
2. Section: a named region within a screen, such as header, sidebar, hero, filters, table, card group, or footer.
3. Element: a single reviewable control, content block, label, image, icon, input, button, row, or card.
4. Copy: visible user facing text attached to a screen, section, or element.
5. State: an empty, loading, error, success, disabled, selected, hover, focus, or validation state.
6. Flow: a sequence across screens, such as signup, checkout, onboarding, search, or settings.

Every editable unit should map to a `data-gqo-id` when it appears in HTML:

```html
data-gqo-id="screen.section.element"
```

Each exported editable unit should also carry enough metadata to reconnect the review action to the intended UI target:

1. `targetId`: the stable `data-gqo-id` value.
2. `targetPath`: the semantic hierarchy from project or flow down to screen, section, and element.
3. `unitType`: one of project, global, flow, screen, section, element, copy, or state.
4. `mode`: comment or edit request.
5. `bounds`: the observed browser bounding box for reviewer context.
6. `screenState`: the state shown when the feedback was created, such as default, empty, loading, error, success, disabled, hover, focus, or validation.

Bounds are review evidence, not identity. When the edit targets a screen or section rather than one element, use the nearest stable parent target. Do not create targets from layout position, color, or order.

## Scope levels

Each edit request must declare one scope.

### Global scope

Global edits change a pattern across more than one screen.

Examples include typography scale, primary button style, spacing rules, navigation labels, shared empty states, form validation tone, and common component behavior.

GIQO should apply global edits through `06_UI_UX_SPEC.md` as a design rule, then list affected screens in `05_IMPLEMENTATION_PLAN.md` when implementation work changes.

### Project scope

Project edits change the product direction, feature scope, platform choice, or release slice.

Examples include adding a new product area, removing a role from the experience, changing the target platform, or making an accessibility rule mandatory across the whole project.

GIQO should not treat project scope feedback as a simple UI edit. It should update the requirements, product spec, assumptions, risks, and implementation plan before changing UI screens.

### Flow scope

Flow edits change a journey that crosses more than one screen.

Examples include adding a confirmation step to checkout, changing onboarding order, adding a recovery path after payment failure, or changing how search filters carry into a results screen.

GIQO should update the flow narrative, affected screens, states, and implementation sequence. If the flow change alters product rules, promote it to project scope.

### Screen scope

Screen edits change one route, page, modal, or major state.

Examples include changing a dashboard layout, adding a filter area to one list screen, revising a checkout step, or changing the information hierarchy of one settings page.

GIQO should update the screen's structure, content, states, and acceptance notes in `06_UI_UX_SPEC.md`.

### Element scope

Element edits change one target inside a screen.

Examples include renaming a button, moving one card, changing helper text, adding a required marker, or changing one field's validation message.

GIQO should update the smallest matching unit in `06_UI_UX_SPEC.md`. If the request affects a shared component pattern, GIQO should promote it to global scope and record that choice.

## Comment mode and edit request mode

Comment mode and edit request mode are separate review intents.

### Comment mode

Use comment mode for observations, questions, concerns, and approval notes.

Comment mode answers, "What should the team know?"

Comment examples:

1. "This card feels too dense."
2. "Can we confirm whether this metric is available?"
3. "Legal needs to review this wording."

Comments may become risks, questions, or follow up tasks. They do not change the UI by themselves.

### Edit request mode

Use edit request mode for concrete changes the reviewer wants GIQO to apply.

Edit request mode answers, "What should change?"

Edit request examples:

1. "Rename this button to Start trial."
2. "Add an empty state to this table."
3. "Use this card layout for all pricing tiers."

An edit request should include target, scope, requested change, reason, and status. If the request lacks a clear target or change, ingest it as a comment, not an edit.

## Edit request status

Use these statuses when ingesting browser feedback:

1. Proposed: captured from the reviewer and not yet evaluated.
2. Accepted: approved for docs and artifact updates.
3. Applied: reflected in `06_UI_UX_SPEC.md` and any regenerated review artifact.
4. Deferred: valid, but outside the current version or delivery slice.
5. Rejected: not accepted, with a short reason.
6. Needs question: blocked by an owner decision.

Only accepted edits can become applied edits. Applied means the actual screen has changed in the authoritative docs, not only in exported browser feedback.

## Apply boundaries

### v1 boundary

Version 1 is queue and export first.

The browser artifact may capture edit requests, queue them, show their status, and export them for GIQO ingestion. Applying a request in v1 means moving it into an exported queue for later document processing, not changing project files.

After export, GIQO may ingest edit requests and update:

1. `06_UI_UX_SPEC.md`
2. `05_IMPLEMENTATION_PLAN.md`
3. `09_RISK_AND_DECISIONS.md` when a request is deferred, rejected, or blocked
4. regenerated `wireframe.html` or `mockup.html` when the workflow creates a fresh review artifact

Version 1 must not directly patch application source code. It must not treat browser edits as live DOM mutations that persist to project files. It must not claim an edit is applied to the actual screen until GIQO has ingested the exported queue and updated the authoritative docs or regenerated review artifact.

### v2 boundary

Version 2 may add a session bridge between exported edit requests and an implementation agent when the project has enough structure to do so safely.

Allowed v2 behavior:

1. map accepted element edits to known component files inside a controlled work session
2. hand queued requests to an agent as proposed work, not as already-applied changes
3. propose small source patches for copy, spacing tokens, or component props
4. keep a reviewable diff between proposed source changes and accepted edit requests
5. require a verification step before marking source changes complete

Version 2 still must keep proposed edits separate from actual screens. The bridge may coordinate work, but the actual screen changes only when the implementation session edits files, verifies the result, and reports completion. It should not apply broad layout or behavior changes without an implementation plan entry and a verification path.

## Ingestion rules

When GIQO receives edit requests, it should:

1. group requests by scope, then by target
2. merge duplicate requests only when they ask for the same outcome
3. keep conflicting requests separate and mark them needs question
4. promote element edits to screen or global scope when the change clearly affects a pattern
5. update the UI spec before the implementation plan
6. record deferred, rejected, and blocked items in risks and decisions

The final handoff must say which requested edits were applied, which were not, and where the actual screen definition now lives.
