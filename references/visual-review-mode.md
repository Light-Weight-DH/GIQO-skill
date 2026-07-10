# Visual Review Mode

Visual Review Mode makes wireframes and mockups commentable in the browser.

## MVP behavior

1. Open `wireframe.html` or `mockup.html` in a browser.
2. Hover reviewable elements to see a highlight.
3. Click a reviewable element to open a comment panel.
4. Write a comment and optional severity/type.
5. Store comments in `localStorage`.
6. Export `comments.json` for machine ingestion.
7. Export `review.md` for human review.

## Element contract

Every reviewable element must include:

```html
data-gqo-id="screen.section.element"
```

Use stable semantic IDs, not visual positions.

## Comment ingestion

When `comments.json` is provided later, GIQO should:

- map each comment to the target `data-gqo-id`
- update UI/UX decisions
- add implementation tasks for accepted change requests
- preserve unresolved comments in `09_RISK_AND_DECISIONS.md`

## Constraints

- Static HTML cannot reliably write local files directly.
- Use download export for MVP.
- Treat browser `localStorage` as temporary convenience, not canonical storage.
