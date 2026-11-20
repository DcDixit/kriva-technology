# migrate/old-template: pre-existing issues parked for a later phase

Found during the 2026-11-20 migration work. None were introduced on this branch; none were fixed here.

| # | Issue | Where | Evidence | Suggested phase |
|---|---|---|---|---|
| 1 | Sub-24px tap targets at 390px width | /markets/us, /markets/uk, /markets/uae, /markets/ca, /markets/au | `_qa_all_routes.cjs` flags 1 per page. The elements are inline body-text links ("See the full process", "About the studio", "contact page") at 20-21px height. | Phase 3 (markets pages) or a later a11y pass |
| 2 | `validate.py` does not run | repo root | `IndentationError` at line 17 (`super().__init__` not indented). Unchanged since commit 00487a8. | Phase 5 QA, if the structural validator is wanted |
| 3 | `sync_cta_labels.cjs` would re-apply "Send a quick inquiry" to `href="#inquire"` buttons | repo root | `protectInquireButtons()` rewrites every `#inquire` anchor label to `CTA_INQUIRE_LABEL`. Re-running it would undo the Phase 1 relabel on graphic-design, product-design and seo-digital-marketing. | Phase 5, decide whether to retire the script or update its placeholder logic |
| 4 | Secondary "Send a quick inquiry" link next to a primary fit-call button | /services/automation-systems, /services/dashboard-design, /services/saas-platforms | Relabelling to "Book a free 20-minute fit call" would give two adjacent controls the same accessible name with different targets. Left unchanged pending owner decision. | Decide before Phase 3 |
