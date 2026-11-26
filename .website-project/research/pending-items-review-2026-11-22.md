# Pending items: findings and plans (22 Nov 2026)

Investigation only. No page, script, setting or Vercel value was changed. Branch `migrate/old-template` at `71542ac`. Live site = `main` at `e52f35f`. A separate homepage session is editing `kriva-redesign.html`, `shared/home-x.css`, `shared/home-x.js`, `shared/home.js`, `shared/home.bundle.css` and `brand/logos/clients/dc-auto-transport.webp`. Nothing below touches those files.

Contents: 1 Form delivery · 2 CSS bundle mismatch · 3 Generator risk · 4 Cookie Settings plan · 5 Legal pages · 6 Case studies · 7 TODO(kriva) plan · 8 QA tooling · 9 Decisions needed

---

## 1. Form delivery (C-04)

### What was checked (no secret values were read, printed or saved)

| Check | Result |
|---|---|
| Production env names and types | `GMAIL_USER` (encrypted), `GMAIL_APP_PASSWORD` (**sensitive**), `INQUIRY_TO` (**sensitive**). No `WEB3FORMS_ACCESS_KEY`, `INQUIRY_CC` or `INQUIRY_AUTOREPLY`. |
| Sender / SMTP login | `GMAIL_USER` = `hello@krivatechnologies.com` (created and updated 15 Nov 14:30–14:33 UTC). |
| Password | Last updated 15 Nov 14:33 UTC. Every production deploy since then uses it. |
| Step 0 (format + Gmail login, no email) | **Not possible from outside.** `vercel env run -e production` passed the settings in memory with no file written, but Vercel returns *sensitive* values as empty strings, by design. Only the deployed function can read them. |
| `INQUIRY_TO` (receiving inbox) | **Unknown to tooling** (sensitive). Set 15 Sep 2026 and never changed, which is before the 18 Nov switch to `hello@` everywhere. It may still point at an older inbox. |
| Auto-reply | On (no `INQUIRY_AUTOREPLY` override). It is skipped when the submitter address equals `INQUIRY_TO`. |
| Backup channel | Off (no Web3Forms key). A failed send shows the visitor an error, not a false success. |
| Live endpoint | Up: empty POST → 400 (rejected before any send), GET → 405. |
| Vercel logs | No logs at all for 7–14 days (not even page hits), so logs cannot prove delivery. Live streaming during a test still works. |

### How to find the receiving inbox without exposing anything
Open the Gmail account `hello@krivatechnologies.com` → **Sent**. Search `from:me subject:KRIVA`. Any earlier studio notification shows the `INQUIRY_TO` address in its **To:** line. If there are none, the first test below will show it there.

### Test process (waiting for your test address and submission method)

Before both tests: open each page with `?kriva_internal=1` and click **Reject** on the banner. That keeps the tests out of GA4. During the tests I stream production logs; the code logs only success/failure, the SMTP error code, or the password *length*.

| | Test 1: contact page brief | Test 2: service page inquiry |
|---|---|---|
| URL | `/contact?kriva_internal=1` → "Send a project brief" | `/services/crm-development?kriva_internal=1` → inquiry form |
| Name | `TEST 1 of 2 – KRIVA delivery check` | `TEST 2 of 2 – KRIVA delivery check` |
| Email | Your test address (must not be the `INQUIRY_TO` address) | same |
| Company | `KRIVA internal test` | `KRIVA internal test` |
| Required selects | Project type: Not sure yet · Market: any · Timeline: Flexible / exploring | none |
| Details | `INTERNAL TEST 1/2 (C-04), 22 Nov 2026. Please ignore. No reply needed.` | `INTERNAL TEST 2/2 (C-04), 22 Nov 2026. Please ignore. No reply needed.` |

**Pass:** (1) the page shows its success state; (2) the studio email arrives at `INQUIRY_TO` within 5 minutes, subject `KRIVA Project brief: KRIVA internal test (…)` / `KRIVA Page inquiry: KRIVA internal test (…)`, with Reply-To = test address (check spam); (3) the auto-reply arrives at the test address from "KRIVA Technologies", with Reply-To `hello@krivatechnologies.com`; (4) the log stream shows no `send failed` or `wrong_length`.

**Fail:** the log names the cause (password length or Gmail error code). The fix is yours: a new App Password on `hello@` (2-Step Verification on), update it in Vercel, then redeploy. I will not change Vercel or redeploy.

Note: running a Gmail login from a new machine can trigger a Google "new sign-in" alert to `hello@`. Real tests run from Vercel, so they won't.

---

## 2. CSS bundle mismatch

| Finding | Detail |
|---|---|
| Cause | `e52f35f` (live) edited source CSS/JS without re-running `npm run build:home-css`. `71542ac` adds no further drift (fresh builds at both commits are byte-identical). At `f7dfa94` the bundle was in sync. |
| Missing from the live bundle | `.crumbs` rules, `.flag`, `.quotes`. |
| Extra in the live bundle | 4 `.k-hero` rules. |
| Visible impact today | **None found.** The homepage has no `.crumbs` or `.flag` element, and both rules also live in `shared/chrome.css`, which the homepage loads separately. Testimonials use `.kriva-quotes` from `shared/features.css` (loaded on demand by `chrome.js`). The old `.quotes` rule only survives a rebuild because the word "quotes" appears in `features.js`. `.k-hero` has no element on the page (the homepage uses `k-hero-board`). |
| Real risk | Reproducibility: anyone who rebuilds gets an unexpected diff and a new cache-busting hash, which makes reviews confusing. |
| Current state | The homepage session has already rebuilt the bundle in the working tree. |
| Recommendation | Let the homepage session's commit include the rebuilt bundle. Before merging, check that a fresh `npm run build:home-css` gives byte-identical output, and compare homepage screenshots before and after. |

---

## 3. Hidden risk: the chrome generator still has pre-consent tracking

`apply_chrome.cjs` `JS_TAG` (lines 89+) is the **old** snippet: `analytics_storage` granted by default, Clarity loaded immediately, no `consent.js`. `e52f35f` updated the 68 pages by hand but not the generator. Re-running `apply_chrome.cjs`, or any script that imports it (`build_markets.cjs`, `build_priority3–6.cjs`, `build_supporting.cjs`), would **silently remove consent gating from every page**.

Recommendation: as part of the consent work, copy the live head snippet into `JS_TAG` verbatim. Then prove it is a no-op by running the generator on a scratchpad export and confirming the page heads come out byte-identical. No live change.

---

## 4. Cookie Settings: implementation and test plan (Option 1, approved in principle)

### Scope: two files only
`shared/consent.js` and `shared/consent.css`, plus the generator sync in §3. All 69 pages already load `consent.js` and have the identical footer row `<a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>`. So the control can be added at runtime, with no HTML edits and no overlap with the homepage work. Banner wording stays exactly as it is (legal wording untouched).

### Behaviour
1. **Footer control:** `consent.js` adds ` · Cookie settings` after the Terms link on every page, as a `<button type="button">` styled like the neighbouring links. Any element with `data-consent-open` also opens it, so the privacy page can link to it later after legal review.
2. **Reopen:** clicking it shows the same banner. The current choice is marked (`aria-pressed="true"` plus a subtle visual state; no new wording). Focus moves into the banner; Esc closes without changing anything; focus returns to the footer control.
3. **Equal prominence:** Reject and Accept get identical styling (same fill, colour, border, weight, size). Order stays Reject, Accept.
4. **Accept:** stores `accept` → GA4 + Clarity load (unless excluded, see 8).
5. **Reject (first visit):** stores `reject` → nothing loads (as today).
6. **Withdraw (Accept → Reject):** stores `reject`; `gtag('consent','update',{analytics_storage:'denied'})`; tells Clarity consent is withdrawn (exact Clarity API call to be confirmed against Microsoft's current docs during build); deletes first-party `_ga`, `_ga_*`, `_clck` and `_clsk` cookies on the host and `.krivatechnologies.com`; then **reloads the page**, so no tracking script stays in memory.
7. **Reject → Accept:** stores `accept` and loads immediately, no reload.
8. **Exclusions restored** (as before `e52f35f`): no GA4/Clarity on `localhost`, `127.0.0.1` or `*.vercel.app` previews, or for automated browsers (`navigator.webdriver`, or a UA containing HeadlessChrome, Lighthouse, PTST, GTmetrix, Pingdom, Googlebot, bingbot, AdsBot, Google-InspectionTool). `?ga_debug=1` overrides, for QA. `?kriva_internal=1` keeps working. The banner still shows to excluded visitors, so QA can test it. Implemented in `consent.js` by setting `window.__krivaNoTrack` before any load; the head snippet and `analytics.js` already honour that flag.
9. **Unchanged:** Global Privacy Control still blocks loading even after Accept; the storage key stays `kriva_consent` (`analytics.js` reads it).
10. **Optional (not proposed unless you want it):** store a timestamp and ask again after 12 months.

### Inspection before build (22 Nov, approved for implementation the same day)
- **Storage:** one key, `localStorage.kriva_consent`, value `accept` or `reject`. No cookie, no expiry, no version. It is origin-wide, so all 69 pages share it. The only other reader is `shared/analytics.js` (`=== 'accept'`, checked at every event). **Kept exactly as is:** same key, same values, no version bump, so no existing visitor's choice is reset. Any other value is treated as "no choice yet" (banner shown), as today.
- **Loading:** only `consent.js` calls `window.krivaLoadAnalytics()` (head snippet). The head skips loading when `__krivaNoTrack` (internal) or GPC is set. Nothing else injects GA or Clarity.
- **Cookies written after Accept:** GA4 `_ga`, `_ga_<id>` (and legacy `_gid`, `_gat*` if present); Clarity `_clck`, `_clsk`. These are first-party, normally on `.krivatechnologies.com`, so the script can delete them. Clarity's own third-party cookies on `clarity.ms` can't be deleted by the site; they stop being used once Clarity no longer loads.
- **Exclusions, matching the pre-`e52f35f` behaviour:** bots and automated browsers set `__krivaNoTrack` (no load, no events). `localhost`, `127.0.0.1` and `*.vercel.app` skip loading only, so dev console event logs in `analytics.js` keep working. `?ga_debug=1` overrides both. All of this lives in `consent.js`; the head stays byte-identical to the generator's `JS_TAG`.
- **Withdrawal mechanics:** a loaded `gtag.js` or Clarity script can't be unloaded from a running page. So withdrawal (1) stores `reject`; (2) sends `gtag('consent','update',{analytics_storage:'denied'})` and sets `window['ga-disable-G-FHG12KTF8C']=true` (Google's documented opt-out flag); (3) calls Clarity's consent-revoke APIs (`consent` false and `consentv2` denied, wrapped in try/catch); (4) deletes the cookies; (5) reloads, so no tracking code runs afterwards. A `storage` listener applies a change made in another tab the same way.
- **Stored `reject` on page load:** the same cookie clean-up runs (idempotent). This also clears `_ga` cookies left from before the banner existed.

### Tests (all local, against a scratchpad export; every GA/Clarity request intercepted, so no real hits)
| # | Test | Pass |
|---|---|---|
| T1 | First visit | Banner shown; 0 requests to googletagmanager / clarity.ms; no `_ga` / `_cl*` cookies |
| T2 | Reject, then reload | Banner hidden; 0 tracking requests before or after reload |
| T3 | Accept (with `ga_debug=1`) | gtag.js and Clarity requested; consent update = granted |
| T4 | Footer control on 67 routes + 404 | Present once; reachable by Tab; opens banner; Esc closes; focus returns |
| T5 | Withdraw | Cookies removed; page reloads; 0 tracking requests after reload; no new GA events |
| T6 | Re-accept from settings | Loads without reload |
| T7 | GPC on, then Accept | Nothing loads |
| T8 | Exclusions | webdriver without `ga_debug` → nothing loads; with it → loads; `*.vercel.app` (host mapped to local) → nothing; localhost → nothing |
| T9 | Equal prominence | Computed styles of both buttons identical |
| T10 | Regression | Route QA (67×3), stubbed form QA (65 forms), no console errors, screenshots of banner and footer at 390 / 768 / 1280 |
| T11 | Generator | Generator run on a scratchpad export leaves page heads byte-identical |

After any deploy you approve: one manual production check by you with `?kriva_internal=1`. Rollback = revert two files.

---

## 5. Privacy policy and terms

Existing content stays unchanged until legal review. No legal wording is proposed here.

### 5a. Company information and legal inputs needed
| # | Input | Used on |
|---|---|---|
| L1 | Legal entity name and type (e.g. sole proprietorship, LLP, Pvt Ltd) | Privacy "Data controller", terms "Agreement", JSON-LD on 68 pages |
| L2 | Registered street address | Same |
| L3 | Company / registration number (and GSTIN if you want it shown) | Same |
| L4 | Business phone (optional) | JSON-LD, contact |
| L5 | Lawful basis per purpose (inquiries, analytics, session recording) | Privacy |
| L6 | Whether a UK and/or EU representative is needed (non-UK/EU business serving those markets) | Privacy |
| L7 | International-transfer mechanism (UK IDTA / addendum, EU SCCs) for Google, Microsoft, Vercel and the India team | Privacy |
| L8 | Retention periods: inquiry emails; GA4 data-retention setting (GA4 Admin → Data retention); Clarity recordings | Privacy |
| L9 | Whether CCPA/CPRA applies at all (thresholds), and if so the required categories and notices | Privacy s11 |
| L10 | India DPDP Act 2023 position | Privacy |
| L11 | Reviewer name and contact | Process |

### 5b. Factual inconsistencies: site vs legal pages
| # | Page | Says | Reality on the live site | Severity |
|---|---|---|---|---|
| F1 | Privacy (body and bottom card) | Analytics runs; the only opt-out mentioned is Global Privacy Control | A consent banner: GA4 and Clarity load only after Accept. The banner is not mentioned. | High |
| F2 | Privacy | No way to change the choice is described | None exists yet (see §4) | High |
| F3 | Privacy "Information we collect" | Name, email, company, project details, budget, timeline | Forms also collect **phone** (23 pages), **website URL**, **project type**, **primary market**, **service interest**, plus the page URL and inquiry type (hidden). The guide-download form collects email only. | Medium |
| F4 | Privacy | Not mentioned | Each submitter gets a **confirmation email** | Low |
| F5 | Privacy | Cookies named: `_ga`, `_ga_*` | Clarity cookies (`_clck`, `_clsk`) not named; browser storage (`kriva_consent`, `kriva_internal`) not mentioned | Medium |
| F6 | Privacy "Third-party services" | Browser may send the form through Web3Forms as a backup | No Web3Forms key is set in production, so the backup never runs | Low (over-discloses) |
| F7 | Privacy s9–s11 | Data controller, UK GDPR rights, CCPA: live since `e52f35f` | Not legally reviewed. The page's own hidden note still says "Text below is unchanged; nothing here is published", which is no longer true. | High |
| F8 | Privacy, forms | No privacy notice at the point of collection | No form links to /privacy near its submit button | Medium (for reviewer) |
| F9 | Terms (cookie note) | "Google Analytics 4 first-party cookies… Advertising cookies are not used" | Clarity session recording and the consent banner are not mentioned; the privacy page does mention Clarity | Medium |
| F10 | Terms (cookie note) | "Scheduling embed cookies, if enabled" | No scheduler embedded (`schedulerUrl` empty). Conditional wording, so not false, but it is a reviewer item. | Low |
| F11 | Terms | "Last updated: August 2026" | Privacy says November 2026; check the date after review | Low |
| F12 | Terms "Disclaimers" | "Case studies may describe representative work" | Case-study meta descriptions state delivery as fact (see §6) | Medium (ties to C-01) |
| F13 | Both | No legal entity, address or registration | See 5a | High |
| F14 | Confirmed consistent | No advertising cookies; Google signals and ad personalisation off; GPC honoured; no third-party fonts, embeds or scripts in page HTML; email via Google Workspace; hosting on Vercel | ✓ | — |

The one approved-but-held fix: correct the hidden note at the top of the privacy page (F7). It is a comment-only change, held because it is in a production-facing file. It needs your go-ahead.

---

## 6. Case studies: comparison (no content changed)

> **Superseded by §6A below** (owner asked on 22 Nov for a per-case decision, not a default to Concept). The original table is kept for the record.

All 8 are labelled "Representative project" on the page. All visuals are SVG illustrations; the repo has **no client names, quotes, screenshots or metrics** for any of them (`features.json` → `testimonials` and `caseOutcomes` are empty). Evidence can only come from you.

| Case (URL) | Current positioning | Claims that need verifying | Real evidence in the repo | Recommended framing |
|---|---|---|---|---|
| **ShiftRail** `/work/shiftrail-dispatch` | Meta: "**modernized** a US trucking dispatch CRM…". Lede: "rebuilt… for a US trucking desk that had outgrown the TMS plus spreadsheet". Sections "What shipped to the desk", "Shipped behind flags". Shown on the homepage. Note: "Representative project. Console UI is an illustrative reconstruction." | A real US carrier; a phased rollout beside a live TMS; shadow sessions; shipped behind flags | None (9 SVGs) | **Real client work (anonymised)** only if you delivered this for a US trucking desk; otherwise **Concept**. Decide first: it is the homepage's lead proof and the clearest C-01 case. |
| **SupportAI** `/work/ai-support-automation` | "a Make + Claude workflow that triages tickets, drafts replies…". "Tier-1 volume ate the queue every launch week." Stack: Make, Claude, Zendesk. | A SaaS client; a workflow built and in use | None | **Concept** unless real |
| **BrandLift** `/work/brandlift-ecommerce` | "Full brand refresh and Shopify storefront redesign… consumer electronics D2C brand". "Strong reviews." About 450 words. | A real brand and store; the reviews claim | None. The mock shows a **linen overshirt (£128)** on an electronics brand. | **Concept**, or move to "Other work" (off-niche). TODO(dixit) needs scope, deliverables, timeline if real. |
| **CRMPulse** `/work/crm-pulse-dashboard` | "Custom HubSpot dashboards, real-time pipeline tracking…". "Conflicting dashboards. Excel for every forecast call." | A B2B sales client on HubSpot | None | **Concept** unless real |
| **FinanceSync** `/work/finance-sync-hub` | "QuickBooks and Xero reconciliation…". Facts: "FinOps platform · UK & US". "A finance team that stopped trusting the sync." | A UK/US FinOps client; workers, canaries and alerts in production | None | **Concept** unless real (it supports /solutions/accounting-integrations) |
| **HealthTrack** `/work/healthtrack-mobile` | "Patient-facing iOS and Android UX for appointment booking, clinical records…" | A healthcare client; a patient app | None | **Concept**, or "Other work" (off-niche, and a regulated sector if presented as real) |
| **LocalServe** `/work/marketplace-mvp` | "No-code marketplace MVP… validated before custom development." Stack: Bubble, Stripe Connect, Make. | A marketplace client; validation happened | None. The "After" column repeats the Approach lede (known issue #7). | **Concept** unless real |
| **PayrollPro** `/work/payroll-pro-saas` | "progressive onboarding and permission clarity after SSO…". "Admins saw empty states." Also cited on /services/product-design. | A payroll SaaS client | None | **Concept** unless real |

What "Real client work (anonymised)" requires from you, per case: confirmation that you did the work; which claims match what happened; NDA or permission limits; a one-line client descriptor (e.g. "a 40-truck US carrier").

What "Concept work" means in practice (later, on approval): move to a clearly labelled "Concepts" section, stop calling it a case study, and rewrite the meta description and narrative tense ("we would…" or "the concept…").

### 6A. Per-case decision table (22 Nov, revised)

**Rule:** no case is treated as Concept by default, and none is presented as a verified client result without evidence. Each case gets one of two honest frames:
- **Real client work (anonymised):** you confirm the engagement happened and which statements are true. Only those statements stay. The client is described, not named, unless they have given permission.
- **Concept work:** the project is presented as KRIVA's own product thinking, with no claim that it shipped.

**Shared facts:**
- All 8 pages say "Representative project". All visuals are SVG illustrations.
- The repo has no client names, quotes, screenshots or metrics for any case (`features.json` `testimonials` and `caseOutcomes` are empty).
- The validator's 21 percentages are all sample figures inside mock UIs, not outcome claims. The one to watch is ShiftRail's **"On time 94%"** KPI tile, which a reader can take as a result.
- **URLs:** keep every URL under both frames, to protect search rankings and existing links; no redirects needed.
- **Structured data:** keep `CreativeWork`.

| Case · URL · current title | Current positioning | Claims needing verification | Evidence available (repo) / evidence that would qualify it as real | If **Real (anonymised)**: content + SEO | If **Concept**: content + SEO |
|---|---|---|---|---|---|
| **ShiftRail** · `/work/shiftrail-dispatch` · "Trucking Dispatch CRM Case Study: ShiftRail \| KRIVA" | Meta: "**modernized** a US trucking dispatch CRM…". Lede: "rebuilt… for a US trucking desk". Sections "What shipped to the desk", "Shipped behind flags". Lead proof on the homepage. Note: "Representative project. Console UI is an illustrative reconstruction." | A US carrier client; phased rollout beside a live TMS; shadow sessions; flags; the "On time 94%" tile | Repo: none. Would qualify: a signed SOW, invoice or contract (kept private); your confirmation of scope; whether the NDA allows "a US carrier" plus fleet size | Title "Trucking Dispatch CRM Case Study (US carrier, NDA)"; meta keeps only confirmed facts; replace the "Representative project" note with "Client name withheld under NDA. Screens rebuilt with sample data."; relabel the 94% tile "Sample data" unless real | Title "Trucking Dispatch CRM Concept: ShiftRail"; meta "A dispatch console concept…"; headings in conditional tense ("What we would ship"); remove "shipped" claims; move off the homepage lead slot or label it "Concept" there |
| **SupportAI** · `/work/ai-support-automation` · "AI Support Ticket Automation Case Study: SupportAI \| KRIVA" | "a Make + Claude workflow that triages tickets, drafts replies…". "Tier-1 volume ate the queue every launch week." Stack: Make, Claude, Zendesk | A SaaS client on Zendesk; workflow built and used; launch-week volumes | Repo: none. Would qualify: a delivered automation (Make scenario or export, client confirmation) | Title "AI Support Triage Case Study (SaaS client, NDA)"; meta states what was built; keep the human-approval point | Title "AI Support Triage Concept: SupportAI"; meta "A concept workflow…"; present it as a blueprint the reader can commission |
| **BrandLift** · `/work/brandlift-ecommerce` · "D2C Rebrand & Shopify Store Case Study: BrandLift \| KRIVA" | "Full brand refresh and Shopify storefront redesign… consumer electronics D2C brand". "Strong reviews." About 450 words (TODO(dixit)). The mock shows a linen overshirt (£128) | A real D2C electronics brand; the reviews claim; the store redesign | Repo: none; sample product contradicts the sector. Would qualify: the live store URL (or archive), client permission | Needs TODO(dixit) inputs (scope, deliverables, timeline); fix the sample product; title keeps "Case Study" | Title "D2C Brand & Storefront Concept: BrandLift"; consider moving to an "Other work" group (outside the logistics/SaaS focus); fix the sample product either way |
| **CRMPulse** · `/work/crm-pulse-dashboard` · "HubSpot Sales Dashboard Case Study: CRMPulse \| KRIVA" | "Custom HubSpot dashboards, real-time pipeline tracking…". "Conflicting dashboards. Excel for every forecast call." | A B2B sales client on HubSpot; dashboards built; rollback path | Repo: none. Would qualify: a HubSpot engagement record or client confirmation | Title "HubSpot Sales Dashboard Case Study (B2B sales team, NDA)" | Title "HubSpot Pipeline Dashboard Concept: CRMPulse" |
| **FinanceSync** · `/work/finance-sync-hub` · "QuickBooks & Xero Reconciliation Case Study \| KRIVA" | "QuickBooks and Xero reconciliation…". Facts: "FinOps platform · UK & US". "A finance team that stopped trusting the sync." | A UK/US FinOps client; workers, canaries and alerts in production | Repo: none. Would qualify: an integration engagement (QuickBooks/Xero app credentials history, SOW) | Title "QuickBooks & Xero Reconciliation Case Study (FinOps platform, NDA)"; it supports /solutions/accounting-integrations, so it is high-value if real | Title "QuickBooks & Xero Reconciliation Concept: FinanceSync"; keep it linked from the accounting solution as a worked example |
| **HealthTrack** · `/work/healthtrack-mobile` · "Patient Mobile App UX Case Study: HealthTrack \| KRIVA" | "Patient-facing iOS and Android UX for appointment booking, clinical records…" | A healthcare client; a patient app with clinical records | Repo: none. Would qualify: client confirmation. If real, health data raises compliance questions (HIPAA in the US) for any detail published | Title keeps "Case Study" with "(healthcare provider, NDA)"; publish UX scope only, no data-handling claims | Title "Patient App UX Concept: HealthTrack"; outside the core niche, so "Other work" fits |
| **LocalServe** · `/work/marketplace-mvp` · "No-Code Marketplace MVP Case Study: LocalServe \| KRIVA" | "No-code marketplace MVP… validated before custom development." Stack: Bubble, Stripe Connect, Make. "After" column repeats the Approach lede (known issue #7) | A marketplace client; validation happened; Stripe Connect payments | Repo: none. Would qualify: a Bubble app or client confirmation | Title "No-Code Marketplace MVP Case Study (local services, NDA)"; supply real "After" copy (#7) | Title "No-Code Marketplace MVP Concept: LocalServe"; the "After" column becomes "Intended outcome" |
| **PayrollPro** · `/work/payroll-pro-saas` · "B2B SaaS Onboarding Case Study: PayrollPro \| KRIVA" | "progressive onboarding and permission clarity after SSO…". "Admins saw empty states." Cited on /services/product-design | A payroll SaaS client; SSO onboarding redesign | Repo: none. Would qualify: design-engagement confirmation | Title "B2B SaaS Onboarding Case Study (payroll SaaS, NDA)" | Title "SaaS Onboarding Concept: PayrollPro"; adjust the /services/product-design citation to say concept |

**Applies under either frame (after your decision):**
- Rewrite each meta description so it never states delivery as fact unless confirmed.
- Remove the "Representative project" wording in favour of the chosen frame.
- Update the /work intro sentence ("The eight product case studies are representative projects…") to describe the split.
- Mirror the changes in `content/cases-data.cjs`, `_build_work_x.cjs` and `_case_x_main.html` so a rebuild does not restore the old copy.
- Keep the terms "Disclaimers" line consistent (legal review, F12).

**Decision needed per case:** Real (anonymised) or Concept, plus for Real cases: the confirmed facts, the client descriptor, and any NDA limits.

---

## 7. TODO(kriva) cleanup plan (nothing removed yet)

138 comments in 69 files, all visible in the public page source.

| Group | Count | Where | Status | Proposed action (on approval) |
|---|---|---|---|---|
| A. "Organization legal name, street address, phone, and logo are not in the approved facts" | 69 (every page incl. 404) | Before the JSON-LD block on every page | **Resolvable with approved company information** (§5a L1–L4; legal pack §1). HTML only: no generator writes it, though `shared/schema.js` / `apply_schema.cjs` build the Organization JSON-LD it refers to. | When L1–L4 arrive: add `legalName` and `address` to the Organization JSON-LD through the schema generator, then remove all 69. Until then: tracked in the legal pack; removal from public HTML awaits your approval. |
| B. "replace with own product UI" | 49 | Next to 42 stock/CC photo credits, 6 "illustrative / sample data" UI captions, 1 other sample visual; one is on `kriva-service-ui-ux-design.html` (not served, 301) | Visible captions are already honest; the comment is backlog. **Moved to `docs/backlog-own-product-visuals.md` (all 49 locations with routes).** Written by `_build_work_x.cjs` (2) and `_build_markets_x.cjs` (1). | On approval: remove from HTML **and** from those two generators. |
| C. "dedicated 1200×630 article image" | 12 | Insight articles | **10 are stale**: those articles already have their own `/brand/og/insights-*.png`. Only `trucking-company-website-cost` and `moving-company-website-features` still use `og-default.png`. | Remove the 10 stale comments; keep 2 in the backlog until images exist. |
| D. BrandLift sample product | 4 | brandlift case (3), /work (1); also written by `_build_hub_services.cjs` (2) | Waits for the C-01 / BrandLift decision | Resolve with §6A |
| E. Privacy legal-review comments | 4 | privacy header (inside the TODO(dixit) note), s9, s10, s11 | Your rule: keep until legal review | **Keep.** (The header note's inaccurate sentences were corrected on 22 Nov, comment only.) |

Totals: 69 + 49 + 12 + 4 + 4 = **138**.

**Stale now (safe to remove on approval):** the 10 article-image comments whose article already has its own image (group C).
**Resolvable once company information arrives:** all 69 in group A.
**Backlog, not a defect:** group B, now recorded in `docs/backlog-own-product-visuals.md`.
**Waiting for decisions:** group D (case positioning) and group E (legal review).
| (TODO(dixit)) | 5 | privacy, terms, process ×2, brandlift | Your rule: keep | Keep |

Method when approved: one scripted pass that removes only the exact comment strings; a byte diff proving nothing else changed; the same edit in the generators; route and form QA re-run. Homepage comments only after the homepage session is merged.

---

## 8. QA tooling

### `validate.py` (structural validator)
- **Cause:** every line lost its indentation, so Python stops at line 17. The copy in `KRIVA-REFERENCE-ADDENDUM.md` §7.2 is flattened the same way, so there is no clean original to restore.
- **Trial:** a re-indented copy (logic unchanged) runs cleanly. It is in the scratchpad, not the repo.
- **Stale configuration:** the route list predates the redesigns (1,869 "unverified path" hits). It also checks `<link href>` for stylesheets and icons, which accounts for all remaining path hits even after adding the sitemap. Its rule text still names FleetFlow.
- **Useful findings once that noise is removed:** duplicate `id="mobChips"` on careers, AI-assisted development, graphic design and SEO (and possibly more); h1 → h3 heading jump on /contact; /markets index has no reduced-motion block. Likely false positives: "24 hours" in the CRM article (legitimate copy), homepage focus-visible (its styles live in external CSS), 21 percentages in articles (cited stats).
- **Recommended fix:** restore the indentation; build known paths from `sitemap.xml` plus `vercel.json` redirects; check only `<a href>`; update the ShiftRail wording. The real findings above would be raised as separate items for approval, not fixed silently.

### `_qa_journey.cjs` (GA4 journey test)
- **Safe:** every external send is stubbed (GA hits captured with a 200, Clarity 204, `/api/inquiry` stubbed, Web3Forms stubbed). It targets `localhost:5177` by default.
- **Broken:** step 1 clicks `.k-path[href="/solutions/freight-broker-software"]` on the homepage and `.k-actions a.btn[href="#inquire"]` on the freight-broker page; neither selector exists any more. Steps 2a–2b expect GA hits, but since the banner GA loads only after Accept, so they would fail now.
- **Recommended fix:** (1) set `localStorage.kriva_consent='accept'` before page load (`evaluateOnNewDocument`) for the "consented" journeys; (2) add a "no consent → zero GA requests" assertion; (3) update the step-1 selectors **after** the homepage session is finished, since those selectors are changing now; (4) re-check the expected event list against `shared/analytics.js`.

---

## 9. Decisions needed

1. Form tests: your test email address; who submits (you in your browser, recommended, or me with an automated browser); the `INQUIRY_TO` inbox (check `hello@` → Sent).
2. Cookie Settings: approve the behaviour in §4 (including reload-on-withdraw and the 2-file approach) and the label "Cookie settings".
3. Generator sync in §3: approve (no live change).
4. Privacy hidden-note correction (§5b F7): approve (comment only).
5. Legal inputs L1–L11 and a reviewer.
6. Case studies: real or concept, per row in §6.
7. TODO(kriva) plan in §7: approve groups A–C now; D and E wait.
8. QA tooling fixes in §8: approve.
9. Homepage session: tell me when it is merged, so homepage-dependent work (journey selectors, homepage comments, bundle check) can follow.
