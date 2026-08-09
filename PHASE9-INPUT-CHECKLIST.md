# Phase 9 — Input Checklist

**Purpose:** Prepare the redesign so your final launch inputs apply cleanly.  
**Stopping rule:** After this checklist — wait for your inputs. No calendar, new pages, redirects, metrics, or redesign.

---

## How to apply inputs (once you send them)

| Input type | Where you put it | Command |
|------------|------------------|---------|
| OG image | `brand/og-default.png` (1200×630) | `node apply_launch_inputs.cjs --og` |
| Screenshots | `media/…` mirroring public path (see manifest) | `node apply_launch_inputs.cjs --assets` |
| Attributions | Fill `confirmed` + `status: "confirmed"` in `content/attribution-registry.cjs` | `node apply_launch_inputs.cjs --attribution` |
| Privacy policy | Tell me decision A / B / C from checklist | Next implementation pass (copy only) |
| Deferred hosting | Tell me option A / B / C | Hosting config only — no page builds |

Registries (internal):

- `content/attribution-registry.cjs`
- `content/asset-manifest.cjs`
- `content/privacy-analytics-checklist.cjs`
- `content/deferred-urls.cjs`
- `shared/og.js` · `shared/slot-assets.css` · `apply_launch_inputs.cjs`

---

## My inputs required

### 1. FleetRoute / FleetFlow attribution — **P0**

| | |
|--|--|
| **Provide** | Publish name, role, exact company string **or** `omit` |
| **Applied to** | Homepage proof (`data-attr-id="fleetroute-fleetflow"`); FleetFlow case quote block |
| **Registry** | `content/attribution-registry.cjs` → `fleetroute-fleetflow` |

### 2. FlowLedger / PayrollPro attribution — **P0**

| | |
|--|--|
| **Provide** | Publish name, role, exact company string **or** `omit` |
| **Applied to** | Homepage proof; PayrollPro case quote; `content/cases-data.cjs` testimonial |
| **Registry** | `flowledger-payrollpro` |

### 3. Meridian / BrandLift attribution — **P0**

| | |
|--|--|
| **Provide** | Approved quote + byline **or** confirm keep omitted |
| **Applied to** | BrandLift case note (`data-attr-id="meridian-brandlift"`); cases-data |
| **Registry** | `meridian-brandlift` |

### 4. CarePath quote attribution — **P0**

| | |
|--|--|
| **Provide** | Publish name/role/company **or** `omit` (and whether any case links) |
| **Applied to** | Homepage proof (`data-attr-id="carepath-quote"`) |
| **Registry** | `carepath-quote` |

**Current public state:** quotes may remain; **person/company bylines are not published.**

---

### 5. P0 screenshots — **P0**

| | |
|--|--|
| **Provide** | Real image files (no mocks) using filenames in `content/asset-manifest.cjs` |
| **Drop path** | `media/work/…`, `media/solutions/…` (mirrors `/work/…`, `/solutions/…`) |
| **Applied to** | Elements marked `data-asset="…"`. Placeholder `.slot` auto-hides when `<img>` is present (`shared/slot-assets.css`) |

**Minimum P0 set:** homepage trio · Work featured + 8 thumbs · FleetFlow case set · PayrollPro case set · Trucking + SaaS solution story/proof · (OG is item 6).

Full table: `content/asset-manifest.cjs` (`priority: "P0"`).

---

### 6. `/brand/og-default.png` — **P0**

| | |
|--|--|
| **Provide** | Branded share image **1200 × 630** PNG (or JPG named as specified) |
| **Drop path** | `brand/og-default.png` |
| **Applied to** | All `kriva-*.html` OG/Twitter tags via markers `KRIVA_OG_IMAGE_*` when file exists |

No fake fallback image is generated. Missing file → tags withheld.

---

### 7. Analytics / privacy decision — **P0**

Detected today (do not invent trackers):

| Tech | Redesign HTML | Live Next |
|------|---------------|-----------|
| GA4 | No | Optional env (empty) |
| GTM | No | Optional env (empty) |
| Meta / LinkedIn / Hotjar / Clarity / Vercel Analytics | No | No |
| Theme `localStorage` | No | Yes (theme only) |

**Choose one** (`content/privacy-analytics-checklist.cjs`):

- **A** — No analytics active → soften/remove Privacy analytics claims  
- **B** — GA4 only → name GA4 + cookies in Privacy/Terms  
- **C** — GTM → name GTM (+ nested tags) in Privacy/Terms  

| | |
|--|--|
| **Provide** | A, B, or C (+ Measurement/GTM IDs if B/C) |
| **Applied to** | `kriva-privacy.html`, `kriva-terms.html` TBD sections only — **no scripts added in this phase** |

---

### 8. Hosting decision for 5 deferred service URLs — **P0** (cutover)

URLs unchanged (no pages, no redirects):

`/services/design-systems` · `/services/web-application-design` · `/services/ux-research` · `/services/wireframing-prototyping` · `/services/logo-design`

**Choose one** (`content/deferred-urls.cjs`):

- **A** — Proxy/rewrite to live Next  
- **B** — Static host 404 until built later  
- **C** — Holding response later (not built now)

| | |
|--|--|
| **Provide** | A, B, or C |
| **Applied to** | Hosting/CDN config only |

---

## Prepared (no further architecture needed)

- [x] Central attribution registry + `data-attr-id` markers  
- [x] Asset manifest with filenames + `data-asset` hosts on P0 slots  
- [x] Slot CSS auto-hide when real `<img>` present  
- [x] OG auto-enable when `brand/og-default.png` exists  
- [x] Privacy analytics decision matrix  
- [x] Deferred URL hosting options documented  

**Status:** **NEEDS YOUR INPUT** on items 1–8. Then a focused apply pass — not another redesign.
