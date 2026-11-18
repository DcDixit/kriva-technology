# Baseline: krivatechnologies.com, 18 November 2026

**Purpose:** a read-only "before" snapshot of the live site, for comparing against after each release in the action plan (`../../strategy/action-plan-2026-11-18.md`, §5). Do not edit or overwrite anything in this folder. A new baseline goes in a new dated folder (for example `../2026-12-02/`).

**Integrity:** every file is listed with its SHA-256 in `MANIFEST.sha256` and marked read-only. To verify, run from this folder in Git Bash: `sha256sum -c MANIFEST.sha256 --quiet` (no output means everything matches).

---

## 1. What the baseline represents

| Item | Value |
|---|---|
| Site | https://krivatechnologies.com (production, Vercel) |
| Live source | **Git commit `bfb12ab`** ("Finish the white background pass…", 17 Nov 2026 23:58 IST), the head of `origin/main`. All 68 live HTML pages were byte-identical to this commit when checked on 18 Nov (`derived/live-vs-commit-bfb12ab.csv`, 68/68 match). |
| Pages | 68 = every URL in `sitemap.xml`; crawling all internal links found no other pages |
| Collection date | 18 Nov 2026 (IST evening). Crawl and Lighthouse ran first; the `host/` files and `derived/` checks were captured later the same evening (exact UTC time is at the top of `host/host-checks.txt`). Production did not change between them (same commit). |
| Collected by | Claude Code, for the website audit (`../../research/site-audit-2026-11-18.md`) |

## 2. Folder contents

| Path | Files | What it is | How it was produced |
|---|---|---|---|
| `crawl/pages.json` | 1 | Per page: HTTP status, final URL, title, meta description, canonical, robots, Open Graph, hreflang, all H1–H4 headings, word count, every image (src, alt, width/height, natural vs rendered size), every link (text, nav/footer flag, target), JSON-LD (raw + types), forms and fields, CTA texts, scripts, stylesheets, preloads, desktop timing (TTFB, LCP, CLS, request count, KB by type, third-party hosts), console errors, failed requests, axe violations (desktop), and mobile metrics (overflow, small targets, tiny text, page height) | `tools/crawl.cjs`: Puppeteer 25 + Chrome, 1440×900 desktop and 390×844 mobile (iPhone UA), `networkidle2`, scrolled to load lazy content |
| `crawl/links.json` | 1 | Every unique link URL → the pages that link to it | same crawl |
| `crawl/crawl.log` | 1 | Crawl run log: status, local LCP, words, axe count per page; ends `DONE 68` | same crawl |
| `crawl/external-links.txt` | 1 | The 23 external URLs found | same crawl |
| `crawl/page-text/*.txt` | 68 | Per page: title, description, heading outline, then the visible text of `<main>` | same crawl |
| `screenshots/*.jpg` | 204 | 3 per page: `__d-fold` (desktop 1440×900 first screen), `__d-full` (desktop full page), `__m-fold` (mobile 390×844 first screen). Filename = URL path with `/` → `__`; homepage = `home` | same crawl (JPEG quality 60, full page 35) |
| `lighthouse/*.json` | 15 | Full Lighthouse 12.8.2 reports, mobile, simulated throttling: 12 templates (home, about, contact, services, services_crm-development, solutions_trucking-logistics, solutions_trucking-company-websites, work, work_shiftrail-dispatch, insights, insights_dispatch-software-cost, pricing) + 3 re-runs prefixed `r_` | `npx lighthouse` (local Chrome, headless), categories performance, accessibility, best-practices, seo (re-runs: performance only) |
| `analysis/analysis.txt` | 1 | Aggregated tables used in the audit: title/description issues, word counts and schema, performance, console errors, images, axe totals, mobile, forms, above-the-fold CTAs, internal link graph, nav and footer links, external links | `tools/analyze.cjs` over `crawl/pages.json` |
| `derived/page-summary.csv` | 1 | **Derived** one-row-per-URL table for diffing: title and description (+ lengths), canonical, robots, H1, words, schema types, inbound links (all and contextual), axe counts, mobile metrics, local LCP/CLS, console error count | `tools/make-derived.cjs` (reads `crawl/pages.json` only) |
| `derived/live-vs-commit-bfb12ab.csv` | 1 | **Derived** SHA-256 of each live page vs the same file at commit `bfb12ab` | `tools/make-derived.cjs` (live fetch + `git show`) |
| `host/robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `feed.xml` | 5 | Live copies of the crawl-control and machine-readable files | `curl` on 18 Nov evening |
| `host/vercel.json.bfb12ab` | 1 | Redirects, rewrites and headers at commit `bfb12ab` | `git show bfb12ab:vercel.json` |
| `host/host-checks.txt` | 1 | Homepage response headers; status and redirect target of 24 URLs (http/https/www, trailing slash, old `.html`, case, 404, old slugs, favicon and manifest, internal files); `/api/inquiry` GET and empty-POST responses; client-domain DNS and HTTP; status of every external link | `curl` and Google DNS JSON API, read-only |
| `tools/*` | 9 | The exact scripts used (crawl, analysis, LCP and 404 probes, form inspection, the PageSpeed attempt, derived tables), kept so the baseline can be reproduced | — |

## 3. Key baseline numbers (for quick comparison)

- 68 pages, all HTTP 200; 0 broken internal links; 0 broken images; 0 pages with sideways scroll at 390px.
- All 68 pages: unique title, canonical, one H1, OG image, JSON-LD. Description length issues on 7 pages; 2 titles of 63 characters.
- axe (desktop): `color-contrast` 241 elements on 32 pages; `landmark-complementary-is-top-level` 12 pages; `aria-allowed-role` 3 pages.
- Lighthouse mobile performance: 83–99 on 10 templates; /solutions/trucking-logistics records **no LCP** (2/2 runs); /services 57 on the first run, then 93 and 96 on re-runs (only the 96 run is saved, see §4). Best Practices 79 everywhere (third-party cookies). SEO 100 everywhere.
- Client domains: `elite-one.us` NXDOMAIN; the other 6 resolve.
- `/favicon.ico` 404; `/api/inquiry` GET 405, empty POST 400.

## 4. Missing data and limitations (read before comparing)

**Not captured (no access during the audit)**
- **Google Search Console**: indexing status, clicks, impressions, queries, URL Inspection, sitemap status. Required by the action plan §5.1 before release 0B; export it into this folder's sibling `../2026-11-18-gsc/` (new folder; don't add to this one).
- **Google Analytics 4**: organic landing pages, leads, AI-referral sessions.
- **Bing Webmaster Tools**: indexed pages and traffic.
- **Real-user Core Web Vitals** (CrUX / PageSpeed Insights field data). The keyless PageSpeed API returned HTTP 429 (daily quota) for all 11 attempts; those error responses were not kept because they contain no data. Lighthouse lab data was used instead.
- **Raw HTML of each page** was not saved by the crawl. It isn't needed, because live HTML equals commit `bfb12ab` for all 68 pages, so `git show bfb12ab:<file>` reproduces it exactly.
- **End-to-end form delivery**: not tested (it would send real email). Only the API's GET/empty-POST responses are recorded.

**Limitations of what was captured**
- **Viewports:** desktop 1440px and mobile 390px only (no 320px or tablet); Chrome only.
- **Mobile pass** recorded overflow, tap targets, tiny text, height and a first-screen screenshot only, with no console capture and no axe run at mobile width.
- **Desktop full-page screenshots** of pages taller than about 16,384px tile and repeat the top of the page (a Chrome capture limit). The homepage `home__d-full.jpg` shows this. Don't use those as visual evidence; use fold shots or new per-section shots.
- **Timing and byte figures in `pages.json`** are unthrottled, from one desktop browser session on a local connection, and later pages benefited from cached shared assets (lower KB). Compare them only with a re-crawl made the same way, never with Lighthouse or field data.
- **Lighthouse** is one run per template (lab variance ±5 points is normal). For `/services` the second re-run (96) overwrote the first re-run (93); the original 57 run is `lighthouse/services.json`. The `r_solutions_trucking-company-websites.json` re-run scored 99 while the original recorded no LCP, so that page's LCP is intermittent.
- **axe** ran at desktop width with rules `wcag2a`, `wcag2aa`, `wcag21aa` and `best-practice` (axe-core 4.10.2 from cdnjs). Automated checks find only part of accessibility issues; there's no conformance claim.
- **Page text** is the visible `innerText` of `<main>` after scrolling; content inside closed accordions (for example FAQ answers) is not included, so FAQ word counts are low.
- **A console 404** logged on 67 pages could not be reproduced in a clean session or tied to a page request; it is most likely the browser's automatic `/favicon.ico` request (which does 404).
- **External links:** unsplash.com, pexels.com and cascadiacollection.com return 401/403 to scripts (bot protection) but work in a browser.
- `host/` files and `derived/live-vs-commit-bfb12ab.csv` were **re-captured** later on 18 Nov because the original checks existed only as terminal output. Production was on the same commit throughout.

## 5. How to compare after a release

1. Re-run `tools/crawl.cjs` into a new dated folder (`node tools/crawl.cjs <newDir>`; it needs the repo's Puppeteer and Chrome at the path in the script), then `tools/make-derived.cjs <newDir> <repoDir>`.
2. Diff the two `derived/page-summary.csv` files. Every changed title, description, H1, canonical, robots value or schema type must appear in `../../seo-change-log.md`; anything else is a regression.
3. Re-run Lighthouse on the same 12 templates and compare with `lighthouse/`.
4. Compare Search Console per page against the GSC export once it exists.

## 6. Repository note

This folder is untracked in git. `.vercelignore` excludes only `*.md` here, so **if `.website-project/` is ever committed, the JSON, images and text files in it would be deployed and publicly reachable** under `/.website-project/…`. Before committing, add `.website-project` to `.vercelignore`. Given the 60 MB of screenshots and reports, also consider keeping it out of git.
