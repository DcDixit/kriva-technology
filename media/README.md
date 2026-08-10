# Media drop folder — approved proof only

Mirror public paths. **Do not drop AI-generated or fabricated client screenshots.**

## Top-3 case studies (P0)

Drop JPG/PNG here, then run:

```bash
node apply_proof_assets.cjs
```

### FleetFlow → `media/work/fleetflow/`

| File | Host |
|------|------|
| `console-full.jpg` | Hero |
| `load-board.jpg` | Story 01 |
| `sla-burndown.jpg` | Story 02 |
| `tablet-density.jpg` | Story 03 |
| `before.jpg` | Before |
| `after.jpg` | After |

### PayrollPro → `media/work/payrollpro/`

| File | Host |
|------|------|
| `hero.jpg` | Hero |
| `role-path.jpg` | Story 01 |
| `permissions.jpg` | Story 02 |
| `integration-health.jpg` | Story 03 |
| `before.jpg` | Before |
| `after.jpg` | After |

### FinanceSync → `media/work/financesync/`

| File | Host |
|------|------|
| `hero.jpg` | Hero |
| `sync-workers.jpg` | Story 01 |
| `anomalies.jpg` | Story 02 |
| `discrepancy.jpg` | Story 03 |
| `before.jpg` | Before |
| `after.jpg` | After |

## Founder portrait

- Drop: `brand/founder-portrait.jpg` (1200×1500, 4:5)
- Then: `node apply_proof_assets.cjs`

## Other assets

See `content/asset-manifest.cjs`. After dropping:

```bash
node apply_launch_inputs.cjs --assets
```

Vercel maps `/work/*` → `/media/work/*` via `vercel.json`.
