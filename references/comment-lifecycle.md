# Comment And Change Request Lifecycle

Use this lifecycle when visual review feedback becomes implementation work. A comment records reviewer input. A change request is a comment that asks for a concrete product, UI, content, or flow change.

## Statuses

| Status | Meaning | Owner action |
| --- | --- | --- |
| `open` | Submitted and not yet triaged. | Confirm the target, scope, requested change, and acceptance signal. |
| `queued` | Accepted for work, ordered, and ready to start. | Assign it to an implementation batch or plan item. |
| `running` | Work has started. | Keep the linked task, files, and current blocker state current. |
| `applied` | The requested change has been made in the artifact. | Run completion checks and prepare reviewer verification. |
| `verified` | The applied change passed review against the request. | Preserve the decision and close the loop in the handoff package. |
| `blocked` | Work cannot continue without missing input or an external dependency. | Record the blocker, owner, and next check date. |
| `rejected` | The request will not be applied. | Record the reason and the person or rule that rejected it. |

## Required Fields

Every change request must include these fields:

- `id`, stable unique request ID.
- `sourceCommentId`, original comment ID when the request came from a comment.
- `targetId`, stable `data-gqo-id` or document target.
- `page`, reviewed page or artifact name.
- `scope`, one of `global`, `screen`, `element`, `flow`, or `project`.
- `requestedChange`, concrete change requested by the reviewer.
- `rationale`, why the change is needed.
- `acceptanceSignal`, observable result that proves the change is done.
- `priority`, one of `low`, `medium`, or `high`.
- `status`, one of the lifecycle statuses above.
- `createdAt`, ISO 8601 timestamp.
- `createdBy`, reviewer or agent that opened the request.
- `checks.workStart`, checklist used before moving to `running`.
- `checks.completion`, checklist used before moving to `applied` or `verified`.

For overall or global comments, set `scope` to `global` and set `targetId` to the reviewed artifact, such as `mockup`, `wireframe`, or `project`. Do not invent an element ID for feedback that applies to the whole screen or project.

Status specific fields are required when they apply:

- `queuedAt` and `queuedBy` for `queued`.
- `workStartedAt`, `assignedTo`, and `linkedTask` for `running`.
- `appliedAt`, `appliedBy`, and `changedArtifacts` for `applied`.
- `verifiedAt`, `verifiedBy`, and `verificationNotes` for `verified`.
- `blockedAt`, `blockedReason`, and `blockedOwner` for `blocked`.
- `rejectedAt`, `rejectedBy`, and `rejectionReason` for `rejected`.

## Work Start Checks

Complete these before moving a request from `queued` to `running`:

1. The target exists in the current artifact or the request names the missing target clearly.
2. The requested change is specific enough for one implementer to act on.
3. The scope matches the target and expected blast radius.
4. The acceptance signal is observable in the artifact, output doc, or review export.
5. Dependencies, blockers, and linked tasks are recorded.

If any check fails, keep the request `open` for triage or move it to `blocked` with a clear owner.

## Completion Checks

Complete these before moving a request to `applied`:

1. The changed artifact reflects the requested change.
2. The acceptance signal can be observed without guessing.
3. Related documents or review exports agree with the applied state.
4. No unresolved reviewer question was treated as an approved change.
5. The request records changed artifacts and implementation notes.

Unresolved comments must stay visible in the generated handoff. Report open, blocked, and rejected requests in `09_RISK_AND_DECISIONS.md` with their status, owner when known, and next action. Do not hide unresolved comments inside browser storage or review exports only.

Move `applied` to `verified` only after a reviewer or verification agent confirms that the result matches the original request. If the result is incomplete, move it back to `queued` or `running` with notes. If the request no longer fits the product direction, move it to `rejected` with the reason.

## Lifecycle Rules

- `open` can move to `queued`, `blocked`, or `rejected`.
- `queued` can move to `running`, `blocked`, or `rejected`.
- `running` can move to `applied`, `blocked`, or `rejected`.
- `applied` can move to `verified`, `queued`, `running`, or `blocked`.
- `blocked` can move back to `open`, `queued`, or `running` when the blocker clears.
- `verified` and `rejected` are terminal unless a new request is opened.

Do not mark a request `verified` just because the implementation step is complete. Verification belongs to the review loop, not the builder alone.
