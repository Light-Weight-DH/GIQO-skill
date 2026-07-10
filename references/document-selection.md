# Document Selection Policy

Generate the smallest document set that preserves implementation clarity.

| Signal in input | Generate |
|---|---|
| Any non-trivial request | `00_INDEX.md`, `01_REQUIREMENTS.md`, `02_ASSUMPTIONS.md`, `05_IMPLEMENTATION_PLAN.md` |
| Product goals, users, journeys, scope debate | `03_PRODUCT_SPEC.md` |
| Multiple components, integrations, migration, existing code | `04_ARCHITECTURE.md` |
| Screens, layout, design references, UX comments | `06_UI_UX_SPEC.md`, possibly `ui-review/` |
| Entities, database, storage, records, ownership | `07_DATA_MODEL.md`, ERD Mermaid |
| API, CLI command contracts, webhooks, agents, protocols | `08_API_SPEC.md` |
| High uncertainty, irreversible choices, security/performance risk | `09_RISK_AND_DECISIONS.md` |
| Timeline or milestone planning | Gantt Mermaid section |

Do not generate a document solely because a template exists.
