# Traffic investigation, consent assessment and `migrate/old-template` readiness

**Date:** 27 November 2026
**Scope:** GA4 drop after 22 Nov, independent traffic validation, consent strategy, full review of `origin/migrate/old-template` (1d0fa3d) against live `main` (e52f35f).
**Restrictions honoured:** no source edits, no consent changes, no merge, no push, no deploy. The branch was tested in a detached git worktree in the Claude scratchpad. GA4 and Clarity were stubbed during tests, so no test traffic reached Google or Microsoft.

Labels used below:
- **[V] Verified**: observed directly in a tool, API response, file or test run listed in the evidence section.
- **[A] Assumption or inference**: reasoning, outside knowledge or a legal reading that has not been checked against KRIVA's own data or a lawyer.

---

## Verdict up front

| Question | Answer |
|---|---|
| Did real traffic collapse after 22 Nov? | **Cannot be proven either way yet.** No data source independent of the consent banner exists for that period (see 2). The timing fits a measurement effect: GA4 went from about 30-57 views/day to about 2-3/day on the first full day after the banner went live **[V GA4 screenshot + deploy log]**. Search Console is the only independent source, and I have no access to it (see 1). |
| Is organic search demand down? | **Unknown until the GSC export is supplied.** |
| Merge `migrate/old-template`? | **NO-GO today. GO once conditions C1 to C3 below are met.** Consent behaviour passes 29 of 30 runtime checks. The blockers are scope and backup decisions, not broken code. |

---

## 1. Google Search Console (Phase 1): BLOCKED, not fabricated

**[V]** This machine has no Google credentials (`gcloud auth list` shows "No credentialed accounts"; no application-default credentials). No GSC data was retrieved, so this report contains **no GSC numbers**.

**What I need (pick one):**

**Option 1: export from the GSC UI (recommended, about 10 minutes)**
1. Search Console → *Performance → Search results*.
2. Date → *Compare* → *Custom*: 13 to 19 Nov 2026 vs 20 to 26 Nov 2026. Search type: Web.
3. Tick Clicks, Impressions, CTR and Position. Choose *Export → Download CSV* (one zip with Queries, Pages, Countries, Devices and Dates).
4. Repeat with *+ New → Country* filtered to United States, United Kingdom, Germany, India and Ireland, one export each (6 zips in total).
5. Put the zips in `.website-project/research/gsc-2026-11-27/`, or choose *Export → Google Sheets* and give me the sheet names (I can read Drive).

**Option 2: API.** You run `gcloud auth application-default login` with the `webmasters.readonly` scope in your own terminal and I query the Search Analytics API. This needs a browser sign-in only you can do, and Google may block that scope on gcloud's default client **[A]**.

**Data-freshness caveat [A, Google-documented behaviour]:** GSC data lags 2 to 3 days. Pull the export on or after **29 Nov** so 25 and 26 Nov are final rather than preliminary.

**What the analysis will answer:** totals, CTR and position per country for both weeks; top queries; pages gaining or losing impressions; position changes. One page to watch is `/services/product-design`, because it absorbed the old page-1 URL `/services/ui-ux-design` through a 308 redirect on 22 Nov, the same day as the banner **[V memory/commit e52f35f]**. That redirect is the one SEO change that could cause a real organic dip in this window.

---

## 2. Independent traffic validation (Phase 2): no independent record exists

| Source | Finding | Label |
|---|---|---|
| Vercel plan | Team `dixit812` is on **Hobby** | V (`/v2/teams` API) |
| Request logs | `vercel logs --environment production` returns **nothing** for 1h, 1d, 7d or since 10 Nov. Hobby keeps runtime logs for about 1 hour. | V (empty), A (retention reason) |
| Log drains | `"drains": []`. None configured, and drains need a paid plan. | V |
| Vercel Web Analytics | Project has an analytics ID but the script is **not installed**: `/_vercel/insights/script.js` returns **404** on live and no page references it | V |
| Speed Insights | `hasData: false` | V |
| Usage API | `vercel usage` → "Costs not found (404)" on Hobby | V |
| Production deploys | e52f35f live since **21 Nov 20:03 UTC = 22 Nov 01:33 IST** (latest READY production deploy) | V |

**Consequences:**
- Page-request trends, human vs bot split, office traffic, Lighthouse/Puppeteer runs and country split **cannot be reconstructed** for 13 to 26 Nov from Vercel. Requests were not counted; I am not treating anything as a visitor proxy.
- Response or availability changes: the 27 Nov crawl in `site-review-2026-11-27.md` found 67/67 live pages returning 200 **[V, earlier today]**. That is a point-in-time check, not history.

**Reconciling GA4 with what is known:**

| GA4 observation (your screenshot) | Explanation | Label |
|---|---|---|
| Views drop from about 57/16/32 (20 to 22 Nov) to about 2 to 3/day from 23 Nov | Global opt-in banner live from 22 Nov 01:33 IST. GA4 and Clarity load only after Accept, so rejecters and ignorers send nothing. | V timing; A that this explains most of the drop |
| "Previous period" peak of about 125 views on 18 Nov | Our own 68-page Puppeteer/Lighthouse audit (documented 19 Nov: about 125 views that day) | V (analytics-seo-review-2026-11-19.md) |
| −51% to −78% changes | Compared against a week inflated by our own crawl, office traffic and (before 22 Nov) everyone, not just accepters | A |
| India 5 of 9 users | Ahmedabad team; India is not a target market | A (consistent with earlier city data: Ahmedabad 26 of 71 users in Oct/Nov) |
| Live site has **no bot filter** | e52f35f removed the webdriver/HeadlessChrome and `*.vercel.app` filters (0 matches on `main`). Under the banner, bots rarely click Accept, so the practical effect is small. | V code; A effect |
| Consent Mode modelling will not fill the gap | GA4 behavioural modelling needs far more daily consented and unconsented traffic than KRIVA has | A |

**Bottom line [A]:** the drop is mainly a measurement effect, but there is no hard proof. GSC is the deciding evidence.

---

## 3. Consent strategy (Phase 3): global vs region-specific

*Points marked "for legal review" are for your legal reviewer, not conclusions.*

| | **A. Global opt-in (live today)** | **B. Opt-in for UK/EEA/CH only, subject to legal approval** |
|---|---|---|
| UK | Meets PECR reg. 6 opt-in for non-essential cookies [A]. The Data (Use and Access) Act 2025 adds an analytics-cookie exemption; whether it has commenced and covers Clarity session recording is a **legal review** point. | Same as A |
| EU / Germany | ePrivacy art. 5(3) and Germany's TDDDG §25 require prior consent; A meets this [A] | Same as A, provided geo-detection fails closed (unknown country → banner) |
| US | Not legally required for GA4 in most states [A]. CCPA/CPRA applies only above revenue or volume thresholds KRIVA probably does not meet (**legal review**). **Session replay (Clarity) is a known California CIPA "wiretap" litigation target**, which is a reason to keep Clarity opt-in even in the US. | GA4 would load in the US without a click, with notice, opt-out through Cookie settings, and GPC still honoured. Clarity should stay opt-in (hybrid B, below). |
| GA4 measurement | Only visitors who accept, worldwide. The accept rate is **unknowable**, because rejecters send nothing. | US (the main market) almost fully measured. UK/EU same as A. |
| Clarity | Accepters only | Accepters only (recommended hybrid) |
| Storage and withdrawal | localStorage `kriva_consent`, footer Cookie settings, withdraw = deny + delete cookies + reload (branch, tested) | Same mechanism. Needs a stored "region" flag so a US visitor travelling to the EU sees the banner. |
| Implementation | Done (branch) | Medium: geo lookup through Vercel's `x-vercel-ip-country` header in Edge Middleware or a tiny `/api/geo` function, plus a fail-closed fallback, plus cache care, plus re-testing every page. About 1 to 2 days with QA [A]. |
| Main risk | Under-measurement of the US market, and slow, noisy decisions | Geo errors (VPN, roaming) could load GA4 for an EU visitor without consent. Mitigated by failing closed. Also: the US opt-out model must be described in the privacy notice. |

**Recommendation [A]:** keep **A** for now. It is compliant and already built. Decide on **hybrid B** (GA4 opt-out for non-EU/UK, Clarity opt-in everywhere) only after legal review **and** after GSC shows how much real US demand is going unmeasured. Nothing should load before the required permission in either model.

**Accountability gap (both options) [A, legal review]:** consent is recorded only in the visitor's browser. There is no server-side consent log. That is common for small sites, but the reviewer should confirm it is acceptable.

---

## 4. Branch review (Phase 4): `origin/migrate/old-template` @ 1d0fa3d vs live `main` @ e52f35f

### 4.1 What the branch contains [V `git log`, `git diff --name-status`]

| Commit | Date (IST) | What it actually does |
|---|---|---|
| 71542ac | 22 Nov | Deletes **362 files**: 312 in `.website-project/baseline/2026-11-18/` (the 18 Nov audit baseline **backup**), plus 50 old media/logo files |
| a8295cb | 23 Nov | Consent rewrite (consent.js/css, `apply_chrome.cjs`, `_qa_consent_chrome.cjs`) **plus an unannounced homepage redesign** (load-flow console rebuilt: `kriva-redesign.html` +209/−, `home-x.css` +146) **plus a new client logo, DC Auto Transport**, plus fixes to `validate.py`, plus 3 research docs |
| ee6781d | 24 Nov | Germany market page, `areaServed` on all pages, hreflang, sitemap, llms, `vercel.json`, markets CSS |
| 1d0fa3d | 24 Nov | Removes the India time-zone exclusion. **The commit message says the opposite** ("exclude specific time zones"). The code is correct: 0 exclusions remain, and the 8 `Asia/Kolkata` hits are on-page clock widgets. |

Totals: 462 files changed (8 added, 92 modified, 362 deleted). Full list: `scratchpad/evidence/changed_files_main_to_branch.txt`.

**Modified, non-HTML:** `.gitignore`, `.vercelignore`, `_build_markets_x.cjs`, `_crawl_links.js`, `_shots_mkt.cjs`, `apply_chrome.cjs`, `content/markets-data.cjs`, `docs/GA4-TRACKING-AND-FORM-TEST-CHECKLIST.md`, `llms.txt`, `llms-full.txt`, `shared/consent.css`, `shared/consent.js`, `shared/home-x.css`, `shared/home-x.js`, `shared/home.bundle.css`, `shared/home.js`, `shared/markets-x.css`, `shared/schema.js`, `shared/seo.js`, `shared/site.js`, `sitemap.xml`, `validate.py`, `vercel.json`. **Modified HTML:** 69 pages (head analytics block, `areaServed`, Germany links). **Added:** `kriva-market-de.html`, `brand/og/markets-de.png`, `brand/logos/clients/dc-auto-transport.webp`, `_qa_consent_chrome.cjs`, `docs/backlog-own-product-visuals.md`, 3 research docs.

**Not on the branch:** today's 16 uncommitted working-tree fixes (Phase 1 of the 27 Nov site review): the `features.json` `.vercelignore` exception, the article reveal fix (`threshold:0`) that makes the **invisible article bodies on 4 live insight pages** visible again, the 67% figure, and others. List: `scratchpad/evidence/uncommitted_working_tree.txt`. **[V]** The branch still has `content` fully ignored and `threshold:.12` in 11 article files.

### 4.2 Runtime test results [V: 30 checks plus 1 preview-host check]

Harness: Puppeteer (system Chrome) serving the worktree as `https://krivatechnologies.com` through the `vercel.json` rewrites. GA and Clarity were stubbed and counted. Evidence: `scratchpad/evidence/results.json`.

| # | Check | Result |
|---|---|---|
| T1a to h | First visit: banner shown; **0 GA/Clarity requests**; GA consent default = denied; no analytics cookies; Reject and Accept computed styles identical (white fill, 650 weight, 14px, 44px tall, 96px min width); footer "Cookie settings" injected; banner does not steal focus; Escape cannot dismiss an undecided banner | PASS |
| T2a,b,c,e,f | Accept: GA and Clarity each load once; `analytics_storage` updated to granted; choice stored; next page loads analytics with no banner; no JS errors | PASS |
| **T2d** | **Clarity receives `consentv2` granted on Accept** | **FAIL**: Clarity's queue is empty. The only `consentv2` call in the code sends *denied* on withdrawal. |
| T3 | Reject: nothing loads across navigation and reload | PASS |
| T4a to f | Cookie settings reopens the banner with current choice marked (`aria-pressed`), focus moves into it, Escape closes it and returns focus. Withdraw (Accept → Reject): page reloads; `_ga`, `_ga_*` and `_clck` deleted; unrelated cookie kept; no further loads; stored choice = reject. | PASS |
| T5 | Real automated browser (webdriver): Accept loads nothing | PASS |
| T6a to c | `?kriva_internal=1`: Accept loads nothing, flag persists, parameter stripped from URL (other parameters kept); `=0` clears it | PASS |
| T7 | GPC=true: Accept loads nothing | PASS. Note: the banner still says "Accept allows Google Analytics", so a GPC user's Accept silently does nothing (honest about the result, unclear in the UI). |
| T8 | Accept in one tab applies to an open second tab | PASS |
| H1 | `*.vercel.app` preview host: Accept loads nothing | PASS |
| T9 | **All 68 rewrite routes**: no missing local asset, no JS error, exactly one `<h1>`, valid JSON-LD, no horizontal overflow at 1366px | PASS |
| T10 | 360/390/768/1440 px × `/`, `/markets/de`, `/contact`, `/privacy`: no overflow; banner fully inside viewport; buttons ≥44px; footer control legible | PASS (screenshots `shot_*.png`) |
| T11 | `/markets/de` SEO: title 62 chars; description present; self canonical; `index, follow`; 7-tag hreflang cluster (US/GB/DE/AE/CA/AU/x-default), reciprocal on US, UK and hub; Organization + BreadcrumbList + FAQPage JSON-LD valid; OG image present; 1,781 words; **no "German clients" or certification claims**; in sitemap | PASS |

**Static checks [V]:**
- `_qa_consent_chrome.cjs`: 70/70 pages; 70/70 after chrome regeneration; 6/6 dependent build scripts. PASS.
- `validate.py` (branch): 20 pages flagged. Running the **branch validator against `main` gives the same 20 pages and messages** (order differs), so these are existing content flags, not regressions. `main`'s own `validate.py` crashes (IndentationError) and the branch fixes it.
- Deleted media: **0 references** by full path anywhere in branch HTML/CSS/JS/JSON/XML. Basename matches point to other folders.
- Homepage client logos: EliteOne first, Schwarz last (rule kept). DC Auto Transport added 7th of 8.

**LinkedIn and Intercom [V]:** neither exists on the branch or on `main`. There is no LinkedIn Insight Tag, no Intercom, and no Tawk. The only third-party trackers are GA4 and Clarity, so there is no LinkedIn or Intercom consent behaviour to test. If either is planned, it needs its own consent category before launch.

### 4.3 Issues found

| ID | Severity | Issue | Label |
|---|---|---|---|
| B-1 | **Decision** | 71542ac deletes the **18 Nov baseline backup** (312 files) from the working tree on merge. It survives in git history, but it disappears from the repo. This conflicts with "do not overwrite existing backups". | V |
| B-2 | **Decision** | The consent commit carries an **unreviewed homepage redesign** (load-flow console) and a **new client logo (DC Auto Transport)**. Neither is named in any commit message. You need to approve the design and confirm the client has agreed to the logo use. | V scope; A permission status unknown |
| B-3 | High (live today, not a regression) | 16 working-tree fixes are not on the branch, including the article reveal bug that hides the bodies of 4 articles on live. Merging the branch alone keeps that bug live. | V |
| B-4 | Medium | Clarity gets no `consentv2` *granted* after Accept. Microsoft announced that Clarity requires an explicit consent signal for EEA/UK/CH visitors from 31 Oct 2025; without it those sessions run cookieless (not stitched). It is a one-line fix in the head snippet and `apply_chrome.cjs` JS_TAG. It errs on the privacy-safe side, so it is not a compliance breach. | V missing call; A Clarity's enforcement behaviour |
| B-5 | Medium (legal review) | The privacy page body does not tell visitors about the banner, the **Cookie settings** link or how to withdraw. `/terms` mentions only GA4 cookies, not Clarity. The visible privacy text names GA4, Clarity and GPC. | V |
| B-6 | Low | GPC users see a banner whose Accept does nothing | V behaviour |
| B-7 | Low | Commit 1d0fa3d's message misdescribes the change. Cosmetic, but it misleads anyone reading history. | V |
| B-8 | Info | Live `main` has no bot or preview-host filter. The branch restores both (T5, H1). | V |

---

## 5. Final recommendations (Phase 5)

1. **Actual traffic:** not measurable for 13 to 26 Nov outside GA4 **[V]**. The GA4 collapse lines up exactly with the banner launch, and the comparison week was inflated by our own crawl **[V]**, so a measurement effect is the most likely explanation **[A]**.
2. **Organic search:** pending the GSC export (section 1). Watch `/services/product-design` because of the 22 Nov 308 redirect.
3. **Country demand:** India = office **[A]**. US/UK/IE each showed 1 accepting user this week **[V screenshot]**. The true number of US, UK and DE visitors is unknown.
4. **AI referrals:** 7 "AI Assistant" sessions this week (−12.5%), nearly equal to Organic Search (8) **[V screenshot]**, and still the best-engaged channel in the 19 Nov review **[V]**. These are also accepters only.
5. **Consent:** keep global opt-in now. Take hybrid B to legal review once GSC shows how much US demand GA4 is missing.
6. **GA4 limits:** counts accepters only; rejecters are invisible; no modelling at this volume; no bot filter on live until the branch merges.
7. **Vercel (each needs your approval, none done):** (a) enable **Vercel Web Analytics**. It is cookieless and included on Hobby, and gives a consent-independent page-view baseline. Whether it needs consent under ePrivacy is a **legal review** point [A]. (b) No change to log drains or the plan is needed for this question. Pro would add only short log retention.
8. **Branch readiness:** consent mechanics are solid (29/30). Germany page SEO is clean. No broken routes, assets or JS errors across 68 routes.
9. **Decisions needed from you:**
   - **C1:** Keep or restore the `.website-project/baseline/2026-11-18/` backup (recommend: restore it, i.e. do not carry 71542ac's baseline deletion).
   - **C2:** Approve the homepage load-flow redesign and confirm DC Auto Transport logo permission, or ask for them to be split out.
   - **C3:** Approve committing the 16 working-tree fixes (article bodies, features.json) to this branch before merge.
   - C4 (recommended, not blocking): the B-4 Clarity consentv2 one-liner.
   - C5 (legal): privacy and terms wording on the banner, withdrawal and Clarity; hybrid B; Web Analytics.
   - C6: run the GSC export (section 1).

### GO / NO-GO for merging `migrate/old-template`

**NO-GO as it stands today.** The code is not broken, but merging now would delete a backup, ship a homepage redesign and a client logo you have not signed off, and leave the invisible-article bug live. **GO once C1, C2 and C3 are resolved.** C4 should ride along in the same merge, and C5 can follow after legal review.

---

## Evidence index

All in the Claude scratchpad: `C:\Users\Admin\AppData\Local\Temp\claude\c28316615d2711bd\c3f6ac22-ef6d-449a-84a0-53334a70970b\scratchpad\`
- `branch_consent_test.cjs`: test harness (read-only, stubs GA/Clarity)
- `evidence\results.json`, `evidence\results_preview.json`: raw results for each check
- `evidence\shot_home_*.png`, `shot_de_*.png`, `shot_de_full_*.png`, `shot_footer_*.png`: 360/390/768/1440
- `evidence\changed_files_main_to_branch.txt`, `evidence\uncommitted_working_tree.txt`
- `validate_branch.txt`, `validate_main_by_branchrule.txt`: validator outputs

The scratchpad can be cleared by a reboot. Copy the evidence folder if you need to keep it.
