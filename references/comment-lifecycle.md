# Comment And Change Request Lifecycle

Use this lifecycle when visual review feedback becomes implementation work. A comment records reviewer input. A change request is a comment that asks for a concrete product, UI, content, or flow change.

## Statuses

| Status | Meaning | Owner action |
| --- | --- | --- |
| `saved` | Captured in `.giqo/ui-review/<screen>/` and ready to inspect. | Confirm target, scope, requested change, and next action. |
| `running` | Work has started. | Keep linked task, files, and current notes up to date. |
| `applied` | The requested change has been reflected in docs, review artifacts, or source after an apply step. | Record changed artifacts and observable acceptance signal. |
| `failed` | The request is blocked, rejected, obsolete, or not actionable. | Record the reason and preserve it in handoff docs. |

`saved` replaces the old open/queued split. `failed` replaces blocked/rejected for the user-facing workflow. Verification is handled by the review loop and notes, not by a separate visible status.

## Required Fields

Every change request must include these fields:

- `id`, stable unique request ID.
- `sourceCommentId`, original comment ID when the request came from a comment.
- `targetId`, stable `data-gqo-id` or `global`.
- `page`, reviewed page or artifact name.
- `scope`, one of `global`, `screen`, `element`, `flow`, or `project`.
- `requestedChange`, concrete change requested by the reviewer.
- `rationale`, why the change is needed.
- `acceptanceSignal`, observable result that proves the change is done.
- `priority`, one of `low`, `medium`, or `high`.
- `status`, one of `saved`, `running`, `applied`, or `failed`.
- `createdAt`, ISO 8601 timestamp.
- `createdBy`, reviewer or agent that opened the request.
- `savedAt` and `savedBy` when captured by the browser review surface.
- `checks.workStart`, checklist used before implementation work starts.
- `checks.completion`, checklist used before marking work applied.

For overall or global comments, set `scope` to `global` and set `targetId` to `global`. Do not invent an element ID for feedback that applies to the whole screen or project.

## Work Start Checks

Complete these before moving a request from `saved` to `running`:

1. The target exists in the current artifact or the request names the missing target clearly.
2. The requested change is specific enough for one implementer to act on.
3. The scope matches the target and expected blast radius.
4. The acceptance signal is observable in the artifact, output doc, or review state.
5. Dependencies, blockers, and linked tasks are recorded when known.

If any check fails, move the request to `failed` with a clear reason, or keep it `saved` if it only needs triage.

## Completion Checks

Complete these before moving a request to `applied`:

1. The changed artifact reflects the requested change.
2. The acceptance signal can be observed without guessing.
3. Related documents and review state agree with the applied state.
4. No unresolved reviewer question was treated as an approved change.
5. The request records changed artifacts and implementation notes when source or docs changed.

Unresolved comments must stay visible in the generated handoff. Report `saved`, `running`, and `failed` requests in `09_RISK_AND_DECISIONS.md` with their status and next action. Do not hide unresolved comments inside browser storage only.

## Lifecycle Rules

- `saved` can move to `running`, `applied`, or `failed`.
- `running` can move to `applied` or `failed`.
- `applied` can move back to `running` or `failed` if the result is incomplete.
- `failed` can move back to `saved` or `running` when the reason is resolved.
