# Open issues found during the 2026-11-19 review

These were found while testing the 2026-11-19 analytics and SEO changes. **None of them was caused by those changes, and none has been fixed.** Each was checked against HEAD (21fa5f0) and behaves the same there. They are recorded here so they can be scheduled separately.

---

## OI-1. Market pages: one link under the 24px tap-target heuristic on mobile

| | |
|---|---|
| Pages | /markets/us, /markets/uk, /markets/uae, /markets/ca, /markets/au |
| Reported by | `_qa_all_routes.cjs` (mobile, 390px): "1 tap targets <24px" on each page |
| Element | The standalone link **"See the full process →"** (`<a href="/process">`) in the fit-call card. It renders 354 × 21px on mobile, 3px under the 24px threshold. |
| Present at HEAD? | Yes. Identical sizes on HEAD and the working tree for all five pages (checked side by side). |
| Severity | Low. WCAG 2.2 SC 2.5.8 (Target Size, Minimum) is also met when no other target sits inside a 24px circle around this one (the spacing exception). The neighbours are paragraphs, not links, so it most likely passes. The QA script's check is stricter than the standard. |
| Also on these pages (not counted by the QA script) | Inline text links inside sentences: "About the studio" (125 × 20), "contact page" (95 × 20) and, on /markets/uae, "delivery process" (116 × 19). Inline links in a sentence are exempt under SC 2.5.8. |
| Possible fix (not applied) | One CSS rule in `shared/markets-x.css` giving that card link `min-height:24px` (or 2px of block padding). This changes spacing by about 3px in one card, so it needs your sign-off as a design change. |

## OI-2. `_qa_journey.cjs` is out of date

| | |
|---|---|
| Symptom | Fails at step 1: `No element found for selector: .k-path[href="/solutions/freight-broker-software"]` |
| Cause | The script was last changed on 2026-11-06 (6a7377c). The homepage's `.k-path` links were removed in the 17 Nov redesign (297ee76). The script still targets the old homepage. |
| Present at HEAD? | Yes. HEAD's homepage has 0 `.k-path` elements. |
| Impact | The end-to-end GA4 journey test can't run, so it no longer guards against tracking regressions. For this review, the same behavior was tested with a separate script that serves the local build under the production hostname (results in the review report, §3). |
| Possible fix (not applied) | Update the step-1 selectors to the current homepage links (for example the solution links in the "What we build" section) and re-check the expected event list. `contact_form_submit` is no longer sent, but the script never asserted it. QA tooling only; no site change. |

## OI-3. Deep links on mobile solution pages often record no LCP (minor, for reference)

| | |
|---|---|
| Symptom | Opening a solution page on mobile at a section link (for example `/solutions/saas#faq`) usually records no Largest Contentful Paint. |
| Present at HEAD? | Yes: 0 of 3 runs on HEAD for /solutions/saas#faq, /car-transportation#faq and /trucking-company-websites#faq. The 2026-11-19 change keeps deep-link behavior exactly as it was. |
| Cause | Content below the hero reveals from `opacity:0` on scroll, and the section-chip strip runs a smooth scroll to the active chip. |
| Impact | Low. Search and ad visitors land at the top of the page, where LCP is now recorded on all 9 pages. |
| Possible fix (not applied) | Would need changes to the reveal animations. Not worth the design risk now. |
