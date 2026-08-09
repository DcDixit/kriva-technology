# Phase 8 — Launch Readiness

**Date:** 2026-08-10  
**Scope:** P0/P1 launch fixes only. No new pages. No calendar integration. No deferred service pages. No invented assets, metrics, or attributions.  
**Stopping rule:** After this report — wait for your assets / attribution decisions before any further implementation phase.

---

## Final status (rollup)

| Item | Status |
|------|--------|
| Attribution demotion (no unverified publish) | **READY** (bylines withheld) |
| Attribution final bylines | **NEEDS MY INPUT** |
| Screenshot asset supply | **NEEDS MY INPUT** (slots kept) |
| OG image asset | **NEEDS MY INPUT** |
| OG system scaffolding | **READY** (`shared/og.js`; safe omit of `og:image`) |
| Analytics inventory | **READY** (documented) |
| Privacy/Terms factual update | **NEEDS MY INPUT** (exact flags listed; no invented legal text) |
| FAQ booking CTA wording | **READY** |
| Broader CTA consistency | **READY** (safe fixes only) |
| Mobile QA (13 pages × 4 widths) | **READY** (2 verified overflows fixed; recheck clean) |
| Deferred service URLs | **READY** (intentional; hosting requirement documented) |
| Calendar / new service pages / new metrics | **BLOCKED** by stopping rule (out of scope) |

---

## P0 — Attribution items requiring your confirmation

Unverified person/company bylines are **no longer published**. Quotes (where retained) show **Client attribution TBD** with an internal note only. Live Next already emptied `clientTestimonials` until verified — redesign now matches that policy for conflicting attributions.

### Confirm exactly

1. **FleetRoute ↔ FleetFlow**
   - Candidate (withheld): Marcus Cole · VP Operations · FleetRoute Logistics (US)  
   - Also appeared as: VP Operations · FleetFlow  
   - Locations: Homepage proof quote; FleetFlow case quote  
   - Confirm: publish name? role? company string? Or drop quote entirely?

2. **FlowLedger ↔ PayrollPro**
   - Candidate (withheld): Ravi Mehta · Head of Product · FlowLedger (UK B2B SaaS)  
   - Case study is published as **PayrollPro**  
   - Locations: Homepage proof quote; PayrollPro case quote  
   - Confirm: publish name? role? company = FlowLedger, PayrollPro, or other? Or drop quote?

3. **Meridian ↔ BrandLift**
   - Candidate (withheld / quote omitted): Anita Desai · Meridian D2C linked to BrandLift in older inventory  
   - Locations: BrandLift case TBD note only (no public quote)  
   - Confirm: approved speaker + company for BrandLift, or keep omitted?

4. **Third homepage quote (CarePath)**
   - Candidate (withheld): Tom Ashworth · CTO · CarePath Health  
   - Not in the three conflict pairs, but live testimonials were emptied site-wide  
   - Confirm: publish, withhold, or remove quote?

### Do not guess
No replacement names invented. Project titles (FleetFlow, PayrollPro, BrandLift) remain as case/product labels where they are portfolio names — separate from person/company attribution.

---

## P0 — Screenshot asset manifest

Placeholders (`.slot` / crop-slot / feat-slot) remain until you supply real assets. **Do not generate fake screenshots.**

Recommended path convention: `/work/{slug}/…` or `/brand/…` as you prefer.

### P0 — required for launch

| Page | Section | Required asset | Dims / ratio | Current slot | Priority |
|------|---------|----------------|--------------|--------------|----------|
| Homepage | Selected work — FleetFlow | Dispatch console screenshot | 1600×1000 · 16:10 | `Slot · 1600×1000 · console screenshot` | P0 |
| Homepage | Selected work — PayrollPro | Onboarding flow screenshot | 1600×1000 · 16:10 | `Slot · 1600×1000 · onboarding flow` | P0 |
| Homepage | Selected work — FinanceSync | Reconciliation view | 1600×1000 · 16:10 | `Slot · 1600×1000 · reconciliation view` | P0 |
| Work index | Featured | FleetFlow console | 1920×1080 · 16:9 | `Slot · 1920×1080 · dispatch console` | P0 |
| Work index | Grid thumbs (8) | One thumb per case | 1600×1000 · 16:10 | `Slot · 1600×1000` ×8 | P0 |
| FleetFlow case | Hero | Full-width console | 2400×1029 (~21:9) | `Slot · hero · 2400×1029 · dispatch console…` | P0 |
| FleetFlow case | Approach (3) | Load board / SLA / tablet | 1600×1000 · 16:10 | approach slots | P0 |
| FleetFlow case | Before / after | Legacy vs unified | 1920×1080 · 16:9 | before/after slots | P0 |
| PayrollPro case | Hero + story + before/after | Onboarding proof set | 2400×1029; 1600×1000; 1920×1080 | case slots | P0 |
| Trucking solution | Story slots A–C + proof | Dispatch / fleet / driver | 1600×1000; proof 1920×1080 | solution slots | P0 |
| SaaS solution | Story slots A–C + proof | Onboarding / admin / permissions | 1600×1000; proof 1920×1080 | solution slots | P0 |
| Sitewide | Share image | Branded OG default | **1200×630** · PNG/JPG | missing — see OG | P0 |

### P1 — strongly recommended

| Page | Section | Required asset | Dims / ratio | Current slot | Priority |
|------|---------|----------------|--------------|--------------|----------|
| Remaining 6 cases | Hero + 3 approach + before/after + next thumb | Full case media set each | same as FleetFlow pattern | 7 slots × case | P1 |
| Services (12 built) | Hero / proof media | One representative UI each | 1600×1000 · 16:10 | service slots | P1 |
| Accounting / Car transport solutions | Story + proof | Solution screenshots | 1600×1000; 1920×1080 | solution slots | P1 |
| Insights index | Featured cover | Article cover | 1200×800 · 3:2 | `Slot · article cover · 1200×800` | P1 |
| About | Portrait | Founder portrait | 1200×1500 · 4:5 | `Slot · founder portrait · 1200×1500` | P1 |

### P2 — can remain placeholder

| Page | Section | Required asset | Dims / ratio | Notes | Priority |
|------|---------|----------------|--------------|-------|----------|
| Case “next project” thumbs | Related rail | Optional polish | 1280×800 | Nice-to-have continuity | P2 |
| Per-page OG images | Cases / solutions | Optional beyond default | 1200×630 | After default OG ships | P2 |
| Insight article covers (non-featured) | Cards | Optional | ~1200×800 | Index can ship with typography-only cards | P2 |

**Inventory count:** ~92 `.slot` instances across 26 HTML files (plus homepage crop-slots / insights feat-slot not all counted as `.slot`).

---

## P1 — OG image status

| Aspect | Status |
|--------|--------|
| Shared contract | **READY** — `shared/og.js` |
| Final branded asset | **NEEDS MY INPUT** — file missing |
| Safe fallback | **READY** — no fabricated image; pages omit `og:image` / `twitter:image` |
| Live Next note | `web/src/app/layout.tsx` references `/brand/og-default.png`, but **file is not in** `web/public/brand/` |

**Required asset**

- Path: `/brand/og-default.png`
- Size: **1200 × 630**
- Alt text target: `KRIVA — Trucking & SaaS product development`
- When supplied: set `assetReady` / enable tags per `shared/og.js` (and align live Next public file)

---

## P1 — Analytics / privacy inventory

### Redesign static HTML (`Updated-One`)

| Service | Present? |
|---------|----------|
| Google Analytics / GA4 | **No** |
| Google Tag Manager | **No** |
| Meta Pixel | **No** |
| LinkedIn Insight Tag | **No** |
| Hotjar / Clarity | **No** |
| Vercel Analytics / Speed Insights | **No** |
| Other marketing trackers | **No** |
| Analytics cookies | **No** |
| `localStorage` / `sessionStorage` for analytics | **No** |

### Live Next app (`web/`) — code present, activation gated

| Item | Finding |
|------|---------|
| GTM | Optional via `NEXT_PUBLIC_GTM_ID` in `layout.tsx` |
| GA4 | Optional via `NEXT_PUBLIC_GA_MEASUREMENT_ID` + `gtag` |
| Env (`.env.local`) | **Both IDs empty** → scripts **not loaded** in current local config |
| `AnalyticsProvider` | Client event mapper; only emits if `gtag` / `dataLayer` exist |
| Meta / LinkedIn / Hotjar / Clarity | **Not found** |
| `@vercel/analytics` | **Not found** in package usage searched |
| Theme `localStorage` | **Yes** — theme preference only (`theme-provider` / `theme.ts`) — **not marketing** |
| Contact email | Privacy mentions Resend-class email delivery (processor) — not a page tracker |

### Privacy / Terms — exact changes required (do not invent legal language)

Flagged on pages (awaiting your policy choice):

1. Privacy currently says analytics data “helps us understand site performance” and third parties may include “analytics”.  
   - If redesign ships with **no** trackers: say analytics are **not currently active**, or remove analytics claims.  
   - If live Next will enable GA4/GTM: **name** GA4 and/or GTM and describe cookies/`localStorage` accurately.  
2. Terms TBD note: align cookie/analytics language with Privacy after the same decision.  
3. Confirm whether theme `localStorage` should be mentioned under “necessary / preference storage.”  
4. Confirm Resend (or actual email provider) naming for contact form processing.

**Status:** inventory **READY**; legal copy update **NEEDS MY INPUT**.

---

## P1 — CTA wording status

### FAQ (booking action)

| Before | After | Status |
|--------|-------|--------|
| “an hour for a discovery call” | “a 20-minute fit call” | **READY** (body + JSON-LD + `build_priority4.cjs`) |

Kept intentionally (not booking CTAs): “Discovery sprints”, process “Discovery”, “after discovery”, nav “Discovery through launch”.

### CTA crawl classification

| Pattern | Classification | Action |
|---------|----------------|--------|
| **Book a 20-minute fit call** → `/contact#book` | Canonical | Keep |
| **Send a project brief** → `/contact#brief` | Canonical secondary | Keep |
| Section eyebrow **Start a project** | Keep intentionally | Not a button label |
| FAQ **discovery call** (booking) | Replace | **Done** |
| Process / phase **Discovery** | Keep intentionally | Different meaning |
| Insight link **Book a fit call** | Keep intentionally | Same action; short form |
| Contact `<title>` / OG “Book a Call” | Keep intentionally | Document title shorthand; optional later polish |
| **Build Demo** / **Schedule a call** buttons | — | **None found** on redesign HTML |
| Live analytics helper default label “Schedule a call” | TBD (live Next only) | Out of redesign scope this phase |

---

## P1 — Mobile QA results

**Pages tested:** Homepage, Solutions, Trucking, SaaS, Services, CRM service detail, Work, FleetFlow case, Insights, SaaS MVP article, Contact, About, Process.  
**Widths:** 320 · 375 · 430 · 768.

### Verified issues fixed

1. **Homepage @320** — hero console min-content width expanded the page (~49px).  
   - Fix: `min-width:0` on hero grid children; `console` max-width/overflow; small-screen hero facts + tab scroll; allow `em` wrap.
2. **Work @320–430** — industries grid (2-col) overflowed at narrow widths.  
   - Fix: single-column `.inds` ≤520px; chips/`filters` `min-width:0`.

### Recheck

Document horizontal overflow on the 13×4 matrix: **0 issues** after fixes.

### Observed OK (no code change)

- Header / mobile sheet patterns present; desktop CTA hidden ≤1099px  
- Sticky filters / family rails use intentional `overflow-x: auto`  
- Case chapter rails hidden ≤1280px  
- Contact form stacks fields ≤760px  
- Footer collapses 4→2→1 columns  

---

## P1 — Deferred URL status

**Five reserved service URLs — no redesign pages, no redirects (intentional):**

| URL | Redesign file | Behavior intent |
|-----|---------------|-----------------|
| `/services/design-systems` | none | Hub-only card + “Canonical URL reserved” |
| `/services/web-application-design` | none | same |
| `/services/ux-research` | none | same |
| `/services/wireframing-prototyping` | none | same |
| `/services/logo-design` | none | same |

### Hosting requirement (document only — not implemented)

On a **static redesign host**, these paths will **404** unless you configure one of:

1. **Reverse-proxy / rewrite** those five URLs to the live Next app (or existing CMS pages), **or**  
2. Keep them as **soft 404 / hub deep-link** until pages are built later, **or**  
3. Serve a **shared non-indexable holding response** (only if you explicitly request it later — not built in Phase 8).

**Do not 301** into parent services without Search Console review (per Phase 6/7).  
Inbound redesign links to these URLs remain intentional.

**Status:** **READY** (documented). Hosting choice **NEEDS MY INPUT** before production cutover.

---

## Changes made this phase (code)

- Withheld unverified attributions on homepage, FleetFlow case, PayrollPro case; BrandLift note clarified  
- FAQ booking wording → fit call (HTML + schema source)  
- Privacy/Terms TBD flags updated with inventory-accurate prompts  
- `shared/og.js` OG contract + homepage comment for safe fallback  
- Mobile CSS fixes on homepage + work index  
- `content/cases-data.cjs` attribution fields aligned for PayrollPro / BrandLift  

---

## What I still need from you before the next phase

1. Attribution decisions for the four confirmation items above  
2. P0 screenshot set (at least homepage trio + FleetFlow + Work featured)  
3. `/brand/og-default.png` (1200×630)  
4. Analytics policy for Privacy/Terms (none vs GA4/GTM naming)  
5. Hosting choice for the five deferred service URLs  

**Stopped here.** No calendar embed, no new service pages, no additional metrics, no further redesign.
