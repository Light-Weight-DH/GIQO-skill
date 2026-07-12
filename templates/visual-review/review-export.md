# Visual Review Export

This file is generated from `comments.json`.

## Comment format

Each comment maps to an HTML element through `targetId`, which matches `data-gqo-id` in the wireframe or mockup.

## Change request format

Edit-mode feedback can also be exported as `change-requests.json` or `change-request-queue.json`.

Queued requests are ready for `/giqo-apply` or for a coding agent to read. Browser Apply only queues and exports requests in v1; it does not directly modify source code.

## Lifecycle

Requests use these statuses:

- `open`
- `queued`
- `running`
- `applied`
- `verified`
- `blocked`
- `rejected`

Unresolved `open`, `queued`, `running`, `blocked`, and `rejected` items must remain visible in the handoff docs.
