# Brand drop folder

## Required for launch polish

### OG image (already present)
- `og-default.png` — **1200 × 630**
- Sync tags: `node apply_launch_inputs.cjs --og`

### Founder portrait (awaiting approved photo)
- Drop: `founder-portrait.jpg` — **1200 × 1500** (4:5 crop)
- Real photo only — no stock, no AI-generated people
- Then: `node apply_proof_assets.cjs`

The `/about` page already has a `data-proof="founder"` host sized to the current design system. When the JPG is present, the applicator injects it and clears the “Portrait pending” label.

## Client logos
Approved logos live in `brand/logos/clients/`. Do not invent logos.
