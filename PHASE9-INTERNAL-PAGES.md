# Phase 9 — Internal pages complete

**Date:** 2026-08-10  
**Scope:** Eliminate redesign 404s; complete deferred service pages; link supporting pages; clean-URL preview.

## What was broken

1. **5 service URLs returned 404** on the redesign host:  
   `/services/ux-research` · `/services/wireframing-prototyping` · `/services/design-systems` · `/services/web-application-design` · `/services/logo-design`
2. **Careers / Industries** existed on live Next but not in the redesign set.
3. **Company footer / mobile sheet** omitted FAQ, Technologies, Careers, Industries.
4. Clean production paths need a rewrite layer for static HTML preview/deploy.

## What shipped

| Item | Result |
|------|--------|
| 5 deferred service pages | Built with Phase 6 template + live `services.ts` content |
| Services hub CTAs | Restored to **View service →** (no deferred notes) |
| `/careers` · `/industries` | New redesign pages + chrome |
| Footer + mobile sheet | Linked FAQ, Tools & stack, Careers, Industries |
| `vercel.json` | 50 clean-URL rewrites |
| `serve-preview.js` | Local preview with production paths |
| Next.js footer Company column | Same supporting links wired |

## Verification

- Static href crawl: **0 missing** targets across 50 HTML files / 52 unique internal hrefs  
- HTTP smoke (`PORT=5188 node serve-preview.js` + `_http_smoke.js`): **50/50 routes HTTP 200**; unknown path still 404  

## Preview

```bash
cd Website-Updated-v2/Updated-One
node serve-preview.js
# open http://localhost:5177/  (or PORT=5188)
```

## Rebuild helpers

```bash
node build_priority6.cjs      # all 17 services + hub restore
node build_supporting.cjs     # careers, industries, vercel.json, serve-preview
node apply_chrome.cjs         # re-stamp nav/footer sitewide
node _crawl_links.js          # static link audit
```
