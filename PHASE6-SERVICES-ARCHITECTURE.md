# Phase 6 — Service architecture report (Steps 1–2)

**Status:** Audit only. **No service detail pages built.** Awaiting approval of build scope.

**Sources used:** `web/src/content/services.ts`, `web/src/app/services/[slug]/page.tsx`, `web/src/content/solutions.ts`, `web/src/content/navigation.ts`, redesign `kriva-services-index.html`, `KRIVA-HANDOFF.md`, `KRIVA-REFERENCE-ADDENDUM.md`, insights/case cross-links.

**Search Console:** Unavailable. All SEO-performance judgments are **`[TBD]`**. No redirects, renames, merges, or URL removals are recommended from assumptions.

---

## Step 1 — Audit summary

### What exists today

- **17 live URLs** under `/services/{slug}` — all generated from one Next.js template.
- Each page has the **same section skeleton**: hero (title + summary + 3 bullets) → challenges (3) → benefits (3) → deliverables (4) → FAQ (1–2) → related cases (tag-matched) → CTA.
- Content is **field-unique but structurally thin**. There is no long-form unique body copy. Depth is roughly equal across all 17.
- Redesign already has a strong **`/services` hub** (`kriva-services-index.html`) with 4 capability families and expandable rows — better suited for thin capabilities than 17 clone landing pages.

### URL structure

| Finding | Confidence |
|---|---|
| Preserve all 17 existing URLs; do not redirect/merge/remove without Search Console + stakeholder decision | `[Certain]` policy |
| Canonical labels already documented; `crm-development` naming collision with `dashboard-design` is known | `[Certain]` |
| Two taxonomies conflict (live Design/Dev/AI vs redesign Product Interfaces / Apps / Build / Brand / AI) | `[Certain]` |

### Content quality bands (from source fields, not SC)

| Band | Meaning | Services |
|---|---|---|
| **A — Distinct buyer intent + strong IA/proof** | Different job-to-be-done; linked from solutions/nav/work/insights | CRM, Dashboards, Integrations, Mobile, SaaS platforms, Automation, AI-assisted, Web development, No-code |
| **B — Real service, heavy overlap** | Unique FAQ/deliverables exist, but buyer question overlaps another service | Product Design ↔ UI/UX; Web Application Design ↔ SaaS/Product; Branding ↔ Logo |
| **C — Method/step services** | Often bought as a phase inside Product/UI work; weak solution-page linkage | UX Research, Wireframing & Prototyping, Design Systems |

### Overlap map (evidence-based)

- **Product Design ↔ UI/UX Design** — product FAQ literally asks “Is this different from UI/UX design?”; both list research/flows/UI; same template family.
- **CRM Design (`crm-development`) ↔ Dashboard Design** — live CRM title historically “CRM & Dashboard Design”; separate dashboard slug exists; redesign already prefers label **CRM Design**.
- **SaaS Product Design ↔ Web Application Design ↔ Product Design** — authenticated product UX vs multi-tenant SaaS vs general product; adjacent, not identical.
- **Branding ↔ Logo Design** — logo FAQ says it can be phase 1 of branding; logo is a subset.
- **AI-Assisted Development ↔ Automation Workflows** — adjacent (delivery method vs ops workflows); both have distinct stacks (Claude/Copilot vs Make/Zapier) and distinct case proof (SupportAI spans both).
- **No-Code ↔ Web Development** — complementary; insight `no-code-vs-custom-mvp` links both.

### Credibility flags in source (if/when built)

- `ai-assisted-development` benefit lists **“30-50% faster iteration”** — treat as **`[TBD]`**, do not present as signed-off metric.
- Several benefits use soft conversion/retention language without case linkage — keep factual or soften further; do not invent proof.

### SEO intent (without Search Console)

Meaningful **query-shaped** intents exist for CRM/TMS, dashboard UX, SaaS product design, QuickBooks/Xero integrations, mobile app design, no-code MVP, automation, AI-assisted delivery, web development, branding.

Weaker standalone SEO justification (often better as process/capability sections) for wireframing, UX research, logo-only, and possibly design systems — **but URL existence + indexing status is `[TBD]` without SC**.

---

## Step 2 — Canonical architecture recommendation

### Decision framework (proposed)

1. **Keep every existing URL in the IA** until Search Console proves otherwise. No redirects in Phase 6.
2. **Build full redesign standalone pages only where buyer intent is distinct and the hub alone would under-serve proof/IA.**
3. **For overlap / method services:** prefer `/services` expandable cards (already built) as primary UX; optional **lightweight standalone** later if SC shows demand — not 17 identical long landings.
4. After SC review, revisit merge candidates as a **separate SEO change request**.

### Architecture table

| Service | Existing URL | Unique intent? | Build standalone? | Notes |
|---|---|---|---|---|
| CRM Design | `/services/crm-development` | **Yes** — ops/sales CRM & TMS consoles | **Yes — Priority 1** | Strongest trucking + SaaS proof (FleetFlow, CRMPulse). Resolve H1 label to **CRM Design** (not “CRM & Dashboard Design”). Naming collision with dashboards is label-only — keep URL. |
| Dashboard Design | `/services/dashboard-design` | **Yes** — analytics/ops dashboard UX | **Yes — Priority 1** | Distinct from CRM pipelines; nav + FleetFlow/FinanceSync/CRMPulse. |
| Integrations & APIs | `/services/api-integrations` | **Yes** — connectors, sync, monitoring | **Yes — Priority 1** | Accounting solution primary proof (FinanceSync). |
| Mobile App Design | `/services/mobile-applications` | **Yes** — iOS/Android product UX | **Yes — Priority 1** | HealthTrack + driver-app IA. |
| SaaS Product Design | `/services/saas-platforms` | **Yes** — multi-tenant SaaS UX | **Yes — Priority 1** | SaaS solution + PayrollPro; overlaps Product Design but tenant/permissions angle is distinct. |
| Automation Workflows | `/services/automation-systems` | **Yes** — Make/Zapier ops automation | **Yes — Priority 1** | SupportAI + accounting automation links. |
| AI-Assisted Product Development | `/services/ai-assisted-development` | **Yes** — AI-augmented delivery | **Yes — Priority 1** | Insight + SupportAI. **Flag/remove “30–50% faster” until verified.** |
| Web Design & Development | `/services/web-development` | **Yes** — marketing sites / Next.js build | **Yes — Priority 2** | Distinct from app UX services; BrandLift + no-code insight. HANDOFF marked “needs evidence” for merge — **SC `[TBD]`**, still clear intent. |
| No-Code / Low-Code Solutions | `/services/no-code-low-code` | **Yes** — Bubble/Webflow/Framer MVP | **Yes — Priority 2** | LocalServe + dedicated insight. HANDOFF “deprioritise” was strategic, not lack of uniqueness. |
| Product Design | `/services/product-design` | **Partial** — overlaps UI/UX heavily | **Yes — Priority 2 (differentiated)** | Keep URL. Page must emphasize end-to-end product scope vs screen-level UI/UX; cross-link both; do **not** duplicate paragraphs. |
| UI/UX Design | `/services/ui-ux-design` | **Partial** — overlaps Product Design | **Yes — Priority 2 (differentiated)** | Keep URL. Emphasize flows, systems, handoff; FAQ already distinguishes from Product Design. |
| Branding & Graphic Design | `/services/branding` | **Yes** — brand systems | **Yes — Priority 2** | BrandLift proof; weak solution linkage but real commercial offer. |
| Design Systems | `/services/design-systems` | **Moderate** | **Defer / TBD** | Real deliverables, but often bought inside Product/SaaS work. Prefer hub card until SC or richer content. **Do not redirect.** |
| Web Application Design | `/services/web-application-design` | **Moderate** — overlaps SaaS/Product | **Defer / TBD** | FAQ only contrasts vs Web Development. High clone risk vs SaaS + Product pages. Prefer hub card + links into those two. **Do not redirect.** |
| UX Research | `/services/ux-research` | **Low as standalone commercial page** | **Defer / TBD** | Method service; no solution-page claim. Keep as hub expandable + link from Product/UI pages. **Do not redirect.** |
| Wireframing & Prototyping | `/services/wireframing-prototyping` | **Low as standalone commercial page** | **Defer / TBD** | Explicitly listed as UI/UX bullet already. Hub card sufficient unless SC shows demand. **Do not redirect.** |
| Logo Design | `/services/logo-design` | **Low** — subset of Branding | **Defer / TBD** | Prefer Branding page + hub card; logo as deliverable section. **Do not redirect.** |

### Recommended Phase 6 build scope (pending your approval)

| Tier | Count | Action |
|---|---|---|
| **Build now** | **12** | Priority 1 (7) + Priority 2 (5): CRM, Dashboard, Integrations, Mobile, SaaS platforms, Automation, AI-assisted, Web development, No-code, Product Design, UI/UX, Branding |
| **Hub-only for now** | **5** | Design Systems, Web Application Design, UX Research, Wireframing & Prototyping, Logo Design — remain on `/services` as expandable capabilities; URLs stay reserved/unchanged; no merge |
| **Later** | — | Search Console review → confirm whether deferred five deserve lightweight pages or 301s into parents |

### Explicitly out of scope until you approve

- Building any of the 17 pages
- Redirects / canonical consolidation
- Renaming slugs
- Inventing thicker copy, metrics, or testimonials to “fill” thin pages

### Implementation notes (for when approved)

- One reusable service-detail template aligned to Solutions/Work (not the old live SaaS-card template).
- Per-page specificity via: problem framing, deliverables, stack cues already in source, related Work/Solutions/Insights, and capability family context from the redesign hub.
- Shared chrome only; canonical CTA **Book a 20-minute fit call**.
- Soft/unverified benefits (esp. AI “30–50%”) marked TBD or omitted.
- Deferred five: ensure `/services` cards remain excellent and link to related Priority pages + Work proof — not dead ends.

---

## Ask

Approve one of:

1. **Recommended:** build **12** standalone pages; keep **5** as hub-only until SC  
2. **Minimal:** build **Priority 1 only (7)**  
3. **Full parity:** build all **17** (accept higher clone risk; differentiate aggressively)  
4. **Custom mix** — tell me which rows to flip

After your approval, Step 3 (build) will proceed only for the chosen set.
