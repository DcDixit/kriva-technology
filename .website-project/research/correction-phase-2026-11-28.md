# Correction phase: H-1 / M-1 fixes, investigations and regression QA

**Date:** 27–28 November 2026
**Git state:** **no commits, no pushes, no merges, no deployments.** The fixes are **uncommitted** in the worktree `d:/Dixit/Our-Website/Website-Updated-v2/kriva-fixes`, which is detached at `2ee7bea`. The branch `migrate/old-template-clean` is untouched at 2ee7bea and stays the QA baseline. `review/homepage-loadflow`, `integrate/article-layout` and `migrate/old-template` were not modified.
**Evidence (permanent):** `.website-project/qa-evidence/2026-11-27/` (all earlier evidence plus `run-fixes/`, `run-article-layout/`, and every test script under `scripts/`). Patch of the fixes: `run-fixes/h1-m1-uncommitted.patch`.

Labels: **[V]** verified by a test or file. **[A]** inference.

---

## 1. Changes made (uncommitted, 9 files)

### H-1 Invisible header logo and menu button (approved)
Removed the one-line override that forced the section-chip row visible on 4 dark-hero pages, so they behave like the 18 sibling dark-hero pages. Each stylesheet is used by one page only, so its cache key was bumped.

| File | Change |
|---|---|
| `shared/careers.css` | − `body.page-careers .mob-chips{display:flex !important}` (inside `@media(max-width:768px)`) |
| `shared/stack.css` | − `body.page-stack .mob-chips{display:flex !important}` (inside `@media(max-width:768px)`) |
| `shared/graphic-design.css` | − `body.page-graphic-design .mob-chips{display:flex !important}` (inside `@media(max-width:1280px)`) |
| `shared/seo-marketing.css` | − `body.page-seo .mob-chips{display:flex !important}` (inside `@media(max-width:1280px)`) |
| `kriva-careers.html` | `careers.css?v=brand2` → `brand3` |
| `kriva-technologies.html` | `stack.css?v=brand1` → `brand2` |
| `kriva-service-graphic-design.html` | `graphic-design.css?v=brand1` → `brand2` |
| `kriva-service-seo-digital-marketing.html` | `seo-marketing.css?v=brand1` → `brand2` |

Every other rule in those media queries is unchanged.

### M-1 Duplicate section-links row (approved)
Deleted the one-line duplicate `<nav class="mob-chips" id="mobChips">` (added by e52f35f, 22 Nov) on 5 pages and kept the original nav. Verified beforehand that each pair carried **identical links** [V].
Files: `kriva-careers.html`, `kriva-technologies.html`, `kriva-service-graphic-design.html`, `kriva-service-seo-digital-marketing.html`, `kriva-service-ai-assisted-development.html`.

### M-2 /contact heading: NOT changed (needs a corrected approval)
My earlier report mis-identified the heading. The validator's "h1 → h3" jump on `/contact` is **`<h3 class="d3">Request received.</h3>`** (line 504). That is the success message of the fit-call form, hidden until the form is sent, and it sits between the H1 and the first H2. **"Get in touch" is the site-wide footer heading on all 70 pages** and is already correctly nested on /contact. Changing it would not remove the jump and would make one page's footer differ from the other 69, so I did not apply it.
**Corrected proposal for your approval:** change `Request received.` (line 504) from `<h3 class="d3">` to `<h2 class="d3">`. The look should stay the same because it is styled by the `.d3` class [A, to be checked with a screenshot]. The second success message, "Brief received." (line 766), comes after an H2 and needs no change.

---

## 2. Build results [V]

| Build | Result |
|---|---|
| Staging (`vercel build`) | **PASS** |
| Production (`vercel build --prod`) | **PASS** |
| Staging vs production static output | **Identical** (373 files); functions identical |
| Fixed build vs QA baseline build (2ee7bea) | **Exactly the 9 intended files differ**, nothing else |

---

## 3. Regression results [V]

| Check | Scope | Before (baseline 2ee7bea) | After (fixes) |
|---|---|---|---|
| Route QA (status, 4xx, console/JS errors, hidden content, overflow, one H1, broken images) | 68 routes × 360/390/768/1440 | 272/272 | **272/272** |
| Header logo + menu visible, top of page and after scrolling | 68 routes × 360/390/768/1440 × 2 | 532/544 (12 fail) | **544/544** |
| Header visible at 1024 and 1280 (widths not covered earlier) | 68 routes × 2 | 268/272 (**4 further failures found**: graphic-design and seo at 1024 and 1280) | **272/272** |
| Menu works: opens (`aria-expanded=true`, 26 links), a menu link navigates (200) | 5 changed pages × 360/390/768/1024 | pass | **pass** (unchanged) |
| In-page section links land with the target visible below the header | 5 pages × 5 widths (5–7 anchors each) | pass | **pass** (unchanged) |
| `<main>` content pixel comparison (header, banner and chips hidden) | 5 pages × 360/390/768/1024/1440 | — | **0 differing pixels in all 25** |
| Internal links and assets | 325 URLs | 325/325 | **325/325** |
| SEO (canonical, title, description, JSON-LD, OG, sitemap) | 68 routes | 0 problems | **0 problems, 0 changes** |
| Consent runtime / head block | 25 checks / 70 pages | pass | **25/25 / pass** |
| `validate.py` | 70 pages | 20 flagged | **15 flagged** (the 5 duplicate-ID findings are gone; nothing new) |

**What visitors see change** [V]: on /careers, /technologies, /services/graphic-design and /services/seo-digital-marketing at phone and tablet widths (and at 1024–1280 for the two service pages), the row of section-chip links under the header is gone. The dark hero now starts at the top, so the KRIVA logo and menu button show on it, matching the other 18 dark-hero pages. Pages are 106–134 px shorter. Nothing else on these pages changes: `<main>` is pixel-identical. At 1440 nothing changes at all. Before/after: `run-fixes/before-after/*.png` (4 pages × 390/768/1024).

**Trade-off to note:** on those pages, phone and tablet visitors no longer get the horizontal section-chip shortcut. The section anchors still work, and the 18 sibling pages already behave this way.

---

## 4. Article dates (not changed, decision needed)

| URL | Visible date | `article:published_time` | `article:modified_time` (OG) | JSON-LD `datePublished` | JSON-LD `dateModified` | Sitemap `lastmod` |
|---|---|---|---|---|---|---|
| https://krivatechnologies.com/insights/choosing-a-digital-agency | "September 2025" | 2025-09-05 | **2025-09-05** | 2025-09-05 | **2026-11-06** (set by e52f35f, 22 Nov) | 2026-11-14 |
| https://krivatechnologies.com/insights/trucking-dispatch-crm-guide | "May 2026" | 2026-05-20 | **2026-09-12** (set by 829d96a, 12 Sep) | 2026-05-20 | **2026-05-20** | 2026-11-14 |

Both files have been edited many times since publication (CTAs, layout, read times), but I can't tell from git whether the **article text** was revised on those dates. Options per article: (a) set both "modified" fields to the date of the last real content revision, which you need to give me; or (b) set both to the published date if the content hasn't been revised. The sitemap `lastmod` (2026-11-14) is a third date and should match whichever you choose.

---

## 5. Percentage content flags (not changed, decision needed)

`validate.py` raises **21 percentage flags on 12 URLs**. My earlier "20 flags on 15 pages" was wrong: 20 was the number of pages flagged for *any* reason. Context for each: `run-fixes/percentage_flags.json`.

**A. Not claims (validator false positives), recommend: no action**
| # | URL | Value | Context |
|---|---|---|---|
| 9 | /solutions/accounting-integrations | 100% | Rhetorical: "An honest 247 matched and 1 exception is more useful than a **"100% success"** that hides the problem." |
| 10 | /solutions/car-transportation | 0% | SVG gradient `offset="0%"` (not text) |
| 11 | /solutions/car-transportation | 100% | SVG gradient `offset="100%"` (not text) |

**B. Mock-up UI values inside containers visibly labelled "Illustrative" / "sample data", recommend: keep**
| # | URL | Value | Context |
|---|---|---|---|
| 1, 2 | /work/ai-support-automation | 94%, 88% | Review-queue mock-up (ticket confidence), labelled "Illustrative" |
| 4 | /work/shiftrail-dispatch | 94% | Load-board mock-up "On time 94%" |
| 5 | /insights/saas-onboarding-patterns | 67% | "Setup health · 2 of 3 complete 67%" mock-up |
| 6 | /markets | 94% | ShiftRail dispatch mock-up, labelled "Illustrative" |
| 7 | /services/dashboard-design | 94.2% | "On-time 94.2%" in dashboard mock-up labelled "Illustrative dashboard · sample data" |
| 8 | /services | 86% | "Morning scan" mock-up labelled "Illustrative" |
| 12–15 | /solutions/freight-broker-software | 16.5%, 14.2%, 13.1%, 11.8% | Load-board margins, labelled "Illustrative design with sample data. Not client software or client data." |
| 16 | /solutions/saas | 100% | "Setup checklist 100% · First value reached" mock-up |
| 17 | /solutions | 64% | Onboarding "Activation 64%" in a board labelled "Illustrative previews with sample data, not client software" |
| 18 | /solutions | 94% | ShiftRail dispatch mock-up, labelled "Illustrative" |
| 19, 20, 21 | /work | 94%, 88%, 62% | SupportAI review-queue mock-up, labelled "Illustrative" |

**C. Mock-up value with no visible label in its section, decision needed**
| # | URL | Value | Context |
|---|---|---|---|
| 3 | /work/ai-support-automation | 62% | Triage mock-up: "Triage · Claude routes 94% billing … Login **62%** Manual". No "Illustrative" or "sample" label found in the section. Options: add the same "Illustrative" tag used on the other mock-ups, or keep as is. |

---

## 6. Branch investigation [V]

| Branch | Tip | Relationship |
|---|---|---|
| `migrate/old-template-clean` | **2ee7bea** | QA baseline (10 commits on live main e52f35f) |
| `integrate/article-layout` | **f6f23fa** | **= 2ee7bea + f6f23fa exactly** (patch-ids match) |
| `migrate/old-template` | **453b6d4** (local; origin still 1d0fa3d) | 1d0fa3d + 453b6d4 |
| `hotfix/article-reveal` | 519b0d8 | e52f35f + reveal fix |
| `review/homepage-loadflow` | 5ac1cb0 | 2ee7bea + homepage redesign + DC logo |

**453b6d4** (DcDixit, 27 Nov 22:15): the 18 working-tree changes committed onto `migrate/old-template`: reveal fix (11 articles), `features.json` deploy, the 4 copy fixes, contact dropdown, **plus** the article single-column CSS (`shared/insight-x.css` +3 lines, `?v=ix6` on 12 articles). Compared with `integrate/article-layout`, `migrate/old-template` **still** deletes the 312-file backup and ignores it in `.gitignore`, **still** carries the homepage redesign and DC logo, and **lacks** the Clarity consent fix and `_qa_consent_runtime.cjs`. Its commit message describes the CSS as `max(84px, 6vw)`, but the committed CSS is `max(0px, calc(84px - 6vw))`, byte-identical to f6f23fa. Only the message is inaccurate.

**f6f23fa** (DcDixit, 27 Nov 22:24): `shared/insight-x.css` +3 lines (articles whose body comes first in `.ix-body`, i.e. no contents rail, span the full grid at ≥1081 px; related-reads margin `max(0px, calc(84px - 6vw))`) and `?v=ix4 → ix6` on all 12 articles. 13 files.

I did not merge f6f23fa into the clean branch or the fix worktree.

### Separate QA of f6f23fa [V]
| Check | Result |
|---|---|
| Staging + production builds | **PASS**. 13 files differ from 2ee7bea, as expected |
| Route QA, 68 × 4 widths | **272/272** |
| Links/assets | **325/325** |
| SEO vs baseline | **0 problems, 0 changes** |
| Article visibility, 12 × 5 widths | **60/60** |
| Article content/crawl/a11y/deep-link/no-JS | Same as baseline (2 known accessibility-sample false positives, same paragraphs) |
| Layout, 12 articles × 390/1024/1080/1081/1280/1440/1600 | The 7 articles without a contents rail go from a **236 px-wide body** to **831 px** at ≥1081 px. Below 1081 px and on the 5 articles with a rail: **no change**. No overflow, no errors. |

**Finding:** f6f23fa fixes a real live defect. On the baseline, and therefore live (`insight-x.css` and article markup are identical to live main [V files; live not re-measured]), those 7 articles put the body and "Related insights" into the 236 px rail column on desktop, with titles wrapping one word per line (`run-article-layout/layout/saas-mvp-uk-guide_1440_base_related.png` vs `_cand_related.png`). The larger "gap" figure in my measurement is the related-pages tag row, which now appears full width between the body and "Related insights". It is not extra whitespace.

**f6f23fa and the H-1/M-1 fixes share no files**, so they can be combined without conflicts [V].

---

## 7. Remaining issues

| Priority | Item | Status |
|---|---|---|
| Critical (live) | Article bodies invisible on 5 articles | Fixed on all branches; **still live until a deploy** |
| High (live) | 7 article bodies squeezed to 236 px on desktop | Fixed by f6f23fa (approved, QA'd above); still live |
| High (live) | H-1 invisible header on 4 pages | **Fixed, uncommitted** in kriva-fixes |
| Medium | M-1 duplicate section nav | **Fixed, uncommitted** in kriva-fixes |
| Medium | /contact heading jump | Corrected proposal above, awaiting approval |
| Low | 2 article date mismatches | Your decision (§4) |
| Low | 1 unlabelled mock-up percentage (#3) | Your decision (§5) |
| Info | Privacy and terms wording | Legal review (`privacy-terms-suggested-copy-2026-11-27.md`) |
| Info | `migrate/old-template` (453b6d4) still deletes the backup and carries the homepage redesign | Not a merge candidate |
| Info | 23 non-article pages still use `threshold:.12` | Latent only; no page affected today |

---

## 8. Recommended production-ready branch

**Recommended content:** `2ee7bea` (clean baseline) **+ f6f23fa** (article layout, approved) **+ the H-1/M-1 fix** (this phase, once you approve it).

When you approve, the clean way to get there (I will run none of this without your go-ahead):
1. Commit the 9-file H-1/M-1 change as **one isolated commit** on a new local branch from 2ee7bea (for example `fix/header-chips`). Message drafted from §1.
2. Create the release branch from `integrate/article-layout` (f6f23fa) and cherry-pick that one commit. No conflicts are expected (no shared files).
3. Rebuild and re-run the header and route checks on the combined tip, then hand it over for your review.
4. Deploy only on your explicit approval. The alternative fastest live fix is `hotfix/article-reveal` (519b0d8) on its own.

**Exact commits today:**
- QA baseline: `migrate/old-template-clean` = `2ee7bea79305c5443dbe7ce1c28ba1e5a7ec9f74` (unchanged)
- Approved article layout: `integrate/article-layout` = `f6f23fad1c6205e0437eb2965cb6b0209a3d44cd`
- H-1/M-1: **no commit yet** (uncommitted in `kriva-fixes`, patch saved in evidence)
- Not for merge: `migrate/old-template` 453b6d4, `review/homepage-loadflow` 5ac1cb0 (pending design and logo decisions)
