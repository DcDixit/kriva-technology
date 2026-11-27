# Migration blockers: resolution and final QA

**Date:** 27 November 2026
**Branches (all local, none pushed, nothing merged or deployed):**

| Branch | Base | Purpose |
|---|---|---|
| `hotfix/article-reveal` | `origin/main` e52f35f (live) | One commit: the invisible-article fix on its own, so it can ship to production ahead of the migration if you approve |
| `migrate/old-template-clean` | `origin/main` e52f35f | The migration rebuilt from approved, traceable commits. **This is the merge candidate.** |
| `review/homepage-loadflow` | `migrate/old-template-clean` | The homepage redesign and the DC Auto Transport logo, for separate approval. **Not for merge yet.** |

`origin/migrate/old-template` (1d0fa3d) is untouched and still holds the original work. Your working tree is also untouched: it stays on `migrate/old-template` with its uncommitted changes.

Labels: **[V]** verified by a tool, test or file in the evidence folder; **[A]** assumption or inference.

---

## 1. Four (actually five) invisible articles

### Root cause [V]
Each article body is one element, `<div class="ix-prose prose" data-r>`. A script fades it in when an `IntersectionObserver` reports it visible, with `threshold:.12` and a −6% bottom margin. A threshold of 0.12 means 12% of the element must be on screen at once. When the body is taller than about **8.3 viewport heights**, that can never happen, so the body stays at `opacity:0`.

All 15 hidden cases on live have a maximum visible ratio below 0.12, and every visible case is at or above 0.12 (`evidence/live_articles/live_probe.json`).

### Scope on live (e52f35f), after a full human-like scroll [V]
Scan of all 68 routes × 360/390/768/1440 px (`live_hidden_scan.json`). Nothing else on the site is affected:

| Article | Hidden at |
|---|---|
| saas-onboarding-patterns | 360, 390, 1366, 1440 |
| saas-mvp-uk-guide | 360, 390, 1366, 1440 |
| trucking-dispatch-crm-guide | 360, 390, 1366, 1440 |
| dispatch-software-cost | 360, 390 |
| **quickbooks-xero-integration-guide** | **360** (not in the earlier list of four) |

### Is it the migration? Partly [V]
The bug **predates** the 22 Nov template migration on mobile. On f7dfa94 (live 20–22 Nov) the old `div.prose[data-r]` was already hidden on the same 5 articles at 360 px and on 2 at 390 px (`evidence/pre_migration/hidden_scan.json`). `threshold:.12` dates from the initial commit (Aug). The migration's taller `ix` layout spread the bug to desktop for 3 articles. This is JavaScript reveal logic: content loading and the HTML are fine.

### Crawlability and accessibility on live [V]
- Raw HTML contains the full body text (checked without JavaScript), so crawlers that read HTML get it [V]. Googlebot's rendering behaviour is not something I can observe [A].
- The text is in the accessibility tree, so screen readers can reach it [V].
- **Sighted visitors see a blank column.** Links inside it stay focusable while invisible. Deep links (`#section`) land on blank space (`a11y_crawl_live.json`).

### Fix [V]
`threshold:.12` → `threshold:0` in the 11 articles that share this template: one token per file, 11 lines total (commit 519b0d8 / 1a0ba7a). The element now reveals as soon as any part of it enters the viewport. Identical to your working-tree change.

### Evidence on the staging build (`vercel build`, served locally) [V]
- 12 articles × 5 widths = **60/60 bodies visible** (`evidence/hotfix/probe.json`), including all 15 cases that were hidden.
- 5 affected articles: text in raw HTML, text in the accessibility tree, deep link to the last section shows content, no-JS render visible: **5/5 PASS** (`evidence/hotfix/a11y_crawl.json`).
- No horizontal overflow at any width. Before/after screenshots: `evidence/live_articles/*.png` vs `evidence/hotfix/*.png`.
- Console: only the known `/content/features.json` 404, which the hotfix branch deliberately does not touch. It is fixed on the clean branch.

### Latent risk (not fixed, outside the scope you set) [V]
23 other pages use the same `threshold:.12` observer (privacy, terms, FAQ, careers, market pages, several service pages). None has a reveal element tall enough to trigger the bug today (the full scan found none), but a long privacy or FAQ update could. If you want it prevented, it's the same one-token change on those pages.

---

## 2. Backup preserved (C1) [V]

- `.website-project/baseline/2026-11-18`: **312 files are present** on `migrate/old-template-clean`. The original branch deleted them (71542ac) and added a `.gitignore` rule for them. Neither change is carried over.
- Integrity: at creation (0ad6335) all **311 manifest entries match**. On live `main`, **8 text files no longer matched**, because e52f35f (22 Nov) changed one line in each, apparently through a site-wide text replacement. Commit `746516f` restores those 8 files byte-for-byte from 0ad6335. Nothing else in the backup is touched and nothing is deleted.
- After `746516f`: **311/311 match**, and the backup's git tree ID equals the original (`92967e7…`).
- Kept in its own commit, separate from all migration changes.
- Note: on Windows, a plain `sha256sum -c` of a checked-out copy reports false failures, because git converts text files to CRLF on checkout. The check above hashes the bytes stored in git.

---

## 3. Homepage and logo, separated (C2) [V]

**Files from a8295cb** that belong to the homepage/logo change: `kriva-redesign.html`, `shared/home.bundle.css`, `shared/home.js`, `shared/home-x.js`, `shared/home-x.css`, `brand/logos/clients/dc-auto-transport.webp`. None of their changed lines touches consent or analytics.

- On the clean branch, the homepage is live `main` plus only the Germany metadata, the `areaServed` schema and a footer "Germany" link. **No redesign, no DC logo.**
- `review/homepage-loadflow` adds two commits on top:
  1. `f68ade9` **load-flow console redesign**: byte-identical to the original branch's version (verified by diff). Changes: the ticket/tab/panel console becomes a compact window with a status bar, a **"Sample data"** tag, "Where it breaks" / "What we build" cards and a "Load activity" log. New intro: "Eight handoffs sit between a tender and the books…"
  2. `5ac1cb0` **DC Auto Transport logo**, 7th of 8 (EliteOne first, Schwarz last kept). **Do not merge without the client's permission.**
- Preview: both builds pass. No console errors, no overflow at 390 or 1440. Screenshots: `evidence/homepage_review/home_flow_{clean,review}_{390,1440}.png` and `home_logos_*`.
- **Points to decide:** (a) the sample log names a person ("M. Okafor"). It is labelled sample data, but the site policy is no invented people. (b) The logo band heading reads "companies we have designed websites for", so adding DC Auto Transport also claims them as a client.
- **No work discarded:** `review/homepage-loadflow` contains every file of the original branch. The only differences are the intended fixes and the restored backup (0 missing files).

---

## 4. The uncommitted working-tree changes (C3)

Your working tree had **16** modified files when this session started. **Since 02:36 IST it has 18**: someone (you, Cursor or another session) added a new rule to `shared/insight-x.css` for articles without a contents rail, and bumped `?v=ix4` → `?v=ix6` on all 12 articles. That work was not part of the 16, has not been reviewed, and is **not included in any commit**. I left it untouched.

| # | File | What changed | Why | Fixes a verified issue? | Needed for migration? | Independent? | Decision → commit |
|---|---|---|---|---|---|---|---|
| 1–11 | 11 × `kriva-insight-*.html` | `threshold:.12` → `threshold:0` | Article bodies invisible | **Yes, critical** (live probe) | No (live bug), but must ship with or before it | Yes | **Committed**: `hotfix/article-reveal` 519b0d8, clean 1a0ba7a |
| 12 | `.vercelignore` | `content` → `content/*` + `!content/features.json` | `features.js` fetches it; 404 + console error on every page | **Yes** (404 on all 67 live routes) | Yes (clean console) | Yes | **Committed** a43fde2 |
| 13 | `kriva-insight-saas-onboarding-patterns.html` (second hunk) | mock-up "2 of 3 complete 58%" → 67% | Arithmetic error in visible UI | Yes (copy) | No | Yes (applied without the `ix6` line) | **Committed** e4355c6 |
| 14 | `kriva-about.html` | "people for ship" → "people for sign-off" | Broken phrase in an H3 | Yes (copy) | No | Yes | **Committed** e4355c6 |
| 15 | `kriva-process.html` | stray "or a KRIVA office." after a photo credit removed | Leftover fragment from e52f35f | Yes (copy) | No | Yes | **Committed** e4355c6 |
| 16 | `kriva-solution-fleet-management.html` | stray "or project." removed from 2 photo credits | Same leftover pattern | Yes (copy) | No | Yes | **Committed** e4355c6 |
| 17 | `kriva-contact.html` | duplicate "UI/UX design" option removed | Duplicates "Product and UI/UX design" since the 22 Nov 308 | Yes (UX) | No | Yes (API does not validate the value; nothing prefills it) | **Committed separately** 2ee7bea, so you can drop it |
| – | `shared/insight-x.css`, `kriva-insight-trucking-website-cost.html`, `?v=ix6` on 12 articles | New layout rule + cache bump | Unknown (not mine, made at 02:36) | Not verified | No | – | **Not committed. Left in your working tree.** |

(The table has 17 rows because the saas-onboarding file carries two separate changes.) Categories: **critical fixes**: 1–12. **Approved improvements** (Phase 1 of the 27 Nov review, which you authorised): 13–17. **Unrelated**: the 02:36 edits.

---

## 5. Clarity consent fix [V]

- Defect: after Accept, GA4 got `analytics_storage: granted`, but Clarity received **no consent signal**. Microsoft requires an explicit signal for EEA/UK/CH visitors, otherwise Clarity runs without cookies [A: Microsoft's published requirement].
- Fix (`983e69c`, `shared/consent.js` only, +6 lines): after the loader actually runs, once per page, `clarity('consentv2', {ad_Storage:'denied', analytics_Storage:'granted'})`. Never sent for bots, the internal flag, GPC or preview hosts, because nothing loads for them.
- **Regression tests added:** `_qa_consent_runtime.cjs`, 25 checks with GA4/Clarity stubbed so nothing leaves the machine. Run with `node _qa_consent_runtime.cjs`.
  - **Before the fix: 20/25** (C10, C12, C18, C19 and C25 fail, all of them Clarity-consent checks). **After: 25/25.** Output: `evidence/consent/runtime_{before,after}_fix.txt`.
  - Covered: blocked before consent (including after navigation); blocked after Reject across 3 pages and a reload; Accept grants GA4 and Clarity on every page; Cookie settings withdrawal (denied signals, `_ga`/`_ga_*`/`_clck`/`_clsk` deleted, other cookies kept, reload, nothing afterwards, re-consent works); **full browser restart** keeps Accept and Reject; bots, `?kriva_internal=1`, GPC and `*.vercel.app` never load; cross-tab.
- Rollout note [V headers / A effect]: `/shared/*` is cached for 1 day plus 7 days stale-while-revalidate, and `consent.js` has no version query. Returning visitors pick up the new file on a later visit. Old and new versions are compatible (same key and loader). Optional hardening for your approval: give `/shared/consent.js` the same `max-age=300, must-revalidate` rule that `analytics.js` already has.

---

## 6. Privacy and terms

Exact current wording, the problems and suggested copy are in `.website-project/research/privacy-terms-suggested-copy-2026-11-27.md`. **Nothing has been published or committed.** Main points:
- The privacy policy never mentions the banner, **Cookie settings** or withdrawal (new section drafted).
- The field list omits phone, website, market, service and the source page. The cookie list omits `_clck`/`_clsk`. It doesn't say analytics runs only after consent.
- No retention periods; no lawful basis; no transfer mechanism; no EU GDPR section although Germany is now targeted (EU representative question for the reviewer).
- Small print on both pages: the terms page mentions GA4 only, not Clarity or consent.
- `[CHECK]` items for you: GA4 retention setting, Clarity masking level, Clarity retention, cookie lifetimes, legal entity and address.

---

## 7. Commit history

**`hotfix/article-reveal`** (1 commit on e52f35f)
1. `519b0d8` fix(insights): reveal long article bodies at any viewport size

**`migrate/old-template-clean`** (10 commits on e52f35f)
1. `1a0ba7a` fix(insights): reveal long article bodies at any viewport size
2. `69bac7a` chore: remove 50 unreferenced media files; keep unused sources out of deploys *(71542ac minus the backup deletion)*
3. `746516f` chore(backup): restore 8 baseline files to their 18 Nov originals
4. `a43fde2` fix(deploy): ship content/features.json
5. `e06deea` feat(consent): Cookie settings, equal choices, withdrawal, tracking filters *(a8295cb minus homepage and logo)*
6. `6ca5f8c` International SEO: add Germany market, areaServed schema… *(ee6781d, provenance note added)*
7. `8daa1e8` fix(analytics): remove the India time-zone exclusion *(1d0fa3d, message corrected)*
8. `983e69c` fix(consent): send Clarity its consent signal after Accept; add runtime tests
9. `e4355c6` fix(copy): repair four broken visible phrases
10. `2ee7bea` fix(contact): remove duplicate "UI/UX design" service option

**`review/homepage-loadflow`** (= clean + 2)
11. `f68ade9` feat(home): rebuilt load-flow console (FOR REVIEW, not approved)
12. `5ac1cb0` feat(home): add DC Auto Transport to the client logo band (NEEDS CLIENT PERMISSION)

Each commit can be reverted or dropped on its own. If the hotfix ships first, rebasing the clean branch drops its identical first commit automatically.

---

## 8. Final QA on `migrate/old-template-clean`

Full results in **`final-qa-2026-11-27.md`** (run 27 Nov, 22:00–23:00 IST, on 2ee7bea). Summary: staging and production builds pass; **272/272** route checks pass; 325/325 internal links and assets resolve; 0 console errors; articles 60/60 visible and 12/12 content checks pass; SEO 0 problems (only the intended Germany/UI-UX changes); consent 25/25 and 70/70. One **pre-existing** high-priority defect found, also live: the logo and menu button are invisible at the top of 4 pages on phone and tablet (H-1). It is not caused by this branch.

---

## 9. GO / NO-GO

**`migrate/old-template-clean` @ 2ee7bea: technically GO.** No regressions, and C1 (backup), C2 (homepage and logo separated) and C3 (fixes reviewed and committed) are resolved. Merging still needs your explicit approval, and it should wait for:
1. Your decision on H-1 / M-1 (fix before or after the merge; both are pre-existing).
2. Legal review of the privacy and terms wording (can follow the merge, but the policy will then describe the banner incompletely).
3. If `integrate/article-layout` (f6f23fa) is the branch you now intend to merge, it needs the article and route QA re-run first.

**`review/homepage-loadflow`: NO-GO** until you approve the redesign, confirm DC Auto Transport's permission, and decide on the "M. Okafor" sample name.

**`hotfix/article-reveal`: GO for production** on your approval. It is the fastest way to fix the invisible articles live.
