# KRIVA — Production deployment

This folder is the **static production source** for krivatechnologies.com.

## Deploy to Vercel

1. Import this repository (or this folder) as a **Static Site** project.
2. **Root directory:** `Updated-One` (or repo root if this is the repo root).
3. **Build command:** leave empty (static HTML).
4. **Output directory:** `.` (project root).
5. `vercel.json` provides 50 clean-URL rewrites + media path aliases.

```bash
npx vercel --prod
```

## Local preview (matches production routing)

```bash
npm run preview
# → http://localhost:5177/
```

## Asset pipeline

| Step | Command |
|------|---------|
| Regenerate interface visuals | `npm run generate:visuals` |
| Inject into HTML | `npm run inject:visuals` |
| Sync OG tags + slot CSS | `npm run launch:apply` |

Real client screenshots: drop into `media/` mirroring public paths, then re-run inject.

## QA before cutover

```bash
npm run qa:links   # internal link crawl
npm run qa:http    # 50-route HTTP smoke (start preview first)
```

## What ships

- **50 pages** via clean URLs
- **No analytics** (Privacy/Terms reflect this)
- **Contact:** mailto brief + WhatsApp/email booking
- **OG image:** `brand/og-default.png`
- **Media:** `/work/*`, `/solutions/*`, `/insights/*` → `media/` via rewrite

Replace stylized SVG interface patterns with real product screenshots when available.
