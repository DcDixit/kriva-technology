# Release candidate — 28 Nov 2026

Status: **prepared, local, uncommitted.** Nothing has been committed, pushed, merged or deployed.

## 1. Branches and commits
| Item | Value |
|---|---|
| RC base | `integrate/article-layout` f6f23fad1c6205e0437eb2965cb6b0209a3d44cd |
| Clean baseline (untouched) | `migrate/old-template-clean` 2ee7bea79305c5443dbe7ce1c28ba1e5a7ec9f74 |
| RC location | worktree `../kriva-release`, detached at f6f23fa + 10 uncommitted files |
| Fix-only copy | worktree `../kriva-fixes` (2ee7bea + 9 files); patch `qa-evidence/2026-11-27/run-fixes/h1-m1-uncommitted.patch` |
| Homepage redesign branch | not touched |

## 2. Modified files in the RC (10)
Approved H-1 header fix and M-1 duplicate-section-link fix (9 files):
- `shared/careers.css`, `shared/stack.css`, `shared/graphic-design.css`, `shared/seo-marketing.css`: removed the forced `.mob-chips{display:flex !important}`
- `kriva-careers.html`, `kriva-technologies.html`, `kriva-service-graphic-design.html`, `kriva-service-seo-digital-marketing.html`: removed the duplicate mobChips nav and bumped the CSS cache key
- `kriva-service-ai-assisted-development.html`: removed the duplicate mobChips nav

Approved label (1 file):
- `kriva-case-ai-support.html`: added an "Illustrative data" label to the story bar of the "Login 62%" mockup. A scoped `.story-bar .flag` rule gives it 14.28:1 contrast. The page script is unaffected.

## 3. Build diff vs clean baseline: 23 built files, all accounted for
- 13 from f6f23fa (article single-column CSS; byte-identical to the f6f23fa build)
- 9 from H-1/M-1 (content-identical; the only byte differences are CRLF vs LF)
- 1 label (kriva-case-ai-support)

No other differences.

## 4. QA results (RC served on port 5196)
| Check | Result |
|---|---|
| Preview and production builds | both pass; identical (373 files) |
| 68 routes × 360/390/768/1440 | 272/272, 0 issues |
| Header visibility × 6 widths (360–1440) | 816/816 checks, 0 invisible (the baseline failed on 4 pages) |
| Nav menu and section anchors, 5 changed pages × 5 widths | 25/25 PASS |
| Articles: visibility | 60/60 |
| Articles: content/crawl/a11y/deep-link/no-JS/links | 10/12. The 2 FAILs are the known false positives in the a11y phrase sampler (a paragraph starts with `<strong>`/a link); the text is in the raw HTML and visible |
| Internal links and assets | 325/325 |
| SEO metadata and JSON-LD vs baseline | 0 problems, 0 changes; sitemap 68/68 |
| Consent (runtime + Chrome) | 25/25 + PASS |
| validate.py | 15 flagged, the same as the approved-fix state |
| Pricing | identical to baseline/live (old prices); `_qa_pricing.cjs` static checks PASS |

Evidence: `qa-evidence/2026-11-27/run-release/`.

## 5. Pricing investigation (25% cut)
- **Location:** main working tree `kriva-technology`, branch `migrate/old-template` @453b6d4, uncommitted, 18 files (pricing, FAQ, redesign, 5 services, 3 solutions, 3 insights + feed/data, build script, `_qa_pricing.cjs`).
- **Snapshot:** `run-release/pricing/price-cut-uncommitted-SNAPSHOT.patch`.
- **Status:** made by another session; no owner approval recorded. Not in the RC.
- **Completeness:** it also moves the homepage pricing section, which needs visual QA. $4,875 is a rounding to confirm.
- **Applying it:** a dry run applies cleanly onto the RC.
- **SEO impact:** visible prices and some meta descriptions change. JSON-LD has no prices, so there is no structured-data impact.

## 6. Outstanding decisions (nothing changed yet)
1. **/contact "Request received."** It is an h3 that appears before the first h2. Recommendation: make it an h2 and change the CSS selector to `.svx-ct .done :is(h2,h3)`. Focus and the aria-live behaviour stay as they are.
2. **Article dates**
   - choosing-a-digital-agency: set `og:modified` to 2026-11-06.
   - trucking-dispatch-crm-guide: set JSON-LD `dateModified` to 2026-09-12 (or 2026-11-06).
   - The 2026-11-06 date comes from commit 06b7821, not e52f35f; this corrects the earlier report.
3. **Pricing:** include it in this release or ship it separately.
4. Homepage redesign, DC logo and "M. Okafor"; privacy/terms legal copy.

## 7. Production risks
- Without the pricing change, the live site keeps the old prices.
- `consent.js` is cached by browsers (optional cache header).
- 23 pages still use the latent `threshold:.12` reveal setting. It only fails for elements taller than about 8 viewports; none exist today.
- `migrate/old-template` 453b6d4 still deletes the baseline backup. Do not deploy it.

## 8. Recommended deployment sequence (each step needs your approval)
1. Create a new branch from f6f23fa. Commit the H-1/M-1 fix (isolated commit), then the label commit.
2. Decide on pricing. If it is included, apply it as its own commit and rerun QA.
3. Apply any approved /contact or date changes as separate commits.
4. Rebuild and rerun the QA suite.
5. Deploy to a Vercel preview and smoke-test it.
6. Promote to production, keeping 2ee7bea as the rollback point.
