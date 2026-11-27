# Live site review, krivatechnologies.com (2026-11-27)

Scope: every URL in the live sitemap (67 pages), plus every internal link found by following links from those pages. Live build = `main` e52f35f. The `migrate/old-template` branch (Germany market, consent "change choice") is pushed but **not merged**, so none of its fixes are live.

Method: (1) a static crawl of HTML, meta, links, assets and external links; (2) a headless Chrome render of each page at 390px mobile and 1440px desktop, recording console errors, failed requests, overflow, consent gating, LCP/CLS and H1 visibility; (3) a full copy read of all 67 pages in four groups; (4) a rendered-DOM recheck of each reported glitch. Analytics were not triggered, because Accept was never clicked and no tracker requests fired.

## Summary

The technical side is in good shape. Nearly all remaining problems are in the copy: trust wording, consistency between pages, and Germany not yet being live.

| Area | Result |
|---|---|
| Status codes | 67/67 sitemap URLs return 200, no redirect chains, no orphan pages, no unlinked pages outside the sitemap |
| Titles / descriptions / H1 | No duplicates, one H1 on every page, every H1 visible on render. 3 titles run 61–63 chars (dispatch-software-cost, accounting-integrations, freight-broker-software) |
| Canonical / robots | Every canonical is self-referencing, nothing is noindexed, robots.txt and the sitemap are clean |
| Structured data | All JSON-LD parses: Organization 67, BreadcrumbList 66, FAQPage 33, Article 12 |
| Images | 331 images, all with alt text and width/height, none broken |
| Assets | 206 internal assets, all 200 |
| Render | No JS page errors, no horizontal overflow at 390px, CLS ≤ 0.1 everywhere, LCP recorded on every page (the earlier no-LCP solutions issue stays fixed) |
| Consent | The banner shows on every page. GA4 and Clarity make no requests before Accept |
| External links | Client sites all return 200 (elite-one.us resolves). LinkedIn, Pexels, Unsplash and Wikimedia return 403/401/429 to bots, which is normal |

## Verified defects (fix first)

1. **`/content/features.json` returns 404 on every page.** [shared/features.js:201](../../shared/features.js) fetches it at runtime, but `.vercelignore` excludes the whole `content` folder, so it is never deployed. Today the file is all empty, so nothing visible is lost. But anything added later (founders, testimonials, scheduler URL, badges, lead magnet) will **never appear on live**, and each page logs a console error (this costs Lighthouse Best Practices points). Fix: replace `content` with `content/*` plus `!content/features.json` in `.vercelignore`, or move the file to `/shared/`.
2. **Germany is not live.** /markets/de, the footer entry, the contact "Primary market" option, hreflang de and the Germany country lists exist only on the unmerged branch. Live country lists also disagree with each other: FAQ, /careers, /industries, /technologies, /solutions and the /insights meta leave out Australia, and /contact says "UK, US, Australia, and other markets". After merging, use one canonical list everywhere.
3. **Two photo credits are cut off mid-sentence (confirmed on render):**
   - /process: "Photograph via Pexels License. or a KRIVA office." should be "…Not KRIVA staff or a KRIVA office."
   - /solutions/fleet-management-software, twice: "CC BY 2.0. or project." The fragment should be deleted.
4. **/about**, "AI for speed, people for ship": broken phrase. Suggested: "people for sign-off".
5. **/insights/saas-onboarding-patterns mockup**, "2 OF 3 COMPLETE 58%": 2 of 3 is 67%.
6. **/contact service dropdown** has both "UI/UX design" and "Product and UI/UX design" (the ui-ux-design page now 308-redirects to product-design), plus labels that don't match the nav. Dedupe it and match it to the nav.
7. **/privacy and /terms don't match.** /terms says only GA4 cookies are used and leaves out Clarity, which /privacy discloses. Neither page describes the opt-in banner or how to withdraw consent. There is also no EU GDPR section, which matters once Germany is targeted. Check whether the branch's "change choice" control covers the withdrawal link.

## Trust and claims (highest business risk)

This continues C-01 from the 18 Nov audit, which is still open.

- **The representative case studies still read as delivered work.**
  - /work: "they describe a real kind of problem and how we solved it" / "The layouts reflect what we designed and built".
  - /technologies: "In production… These are the tools behind our project work, not a wish list."
  - ShiftRail meta and teaser: "modernized a US trucking dispatch CRM". The same teaser also appears on /solutions/car-transportation and /work/marketplace-mvp.
- **Invented specifics on the case pages:**
  - /work/ai-support-automation: "500 closed conversations"
  - /work/payroll-pro-saas: "eight stakeholder interviews"
  - /work/marketplace-mvp: "smoke tests… in two cities"
  - /work/healthtrack-mobile: "tested with older patient cohorts", "Strict compliance reviews"
  - /work/brandlift-ecommerce: "Strong reviews." Its meta also says "consumer electronics" while the mockup shows clothing.
- **Articles present representative cases as real clients:**
  - crm-dashboard-ux-patterns: "On CRMPulse, an 80-rep sales org…"
  - no-code-vs-custom-mvp: "LocalServe… a marketplace we shipped, went live in six weeks"
  - saas-onboarding-patterns: "activation improved measurably"
  - trucking-dispatch-crm-guide: "patterns that held up on a US desk"
  - ai-in-product-design-2026: "In our own delivery tracking…"
  - saas-mvp-uk-guide: "every UK SaaS 20-minute fit call we run"
- **Pages contradict each other on the metrics policy.** /services says "We do not publish outcome numbers". /services/api-integrations says "Metrics on case pages are measured delivery outcomes". /services/product-design says "Published metrics appear on the ShiftRail case page". The two outliers need to change.
- **/markets hub** promises "proof from that region", then pairs UAE with CRMPulse, Canada with FinanceSync (UK/US books) and Australia with ShiftRail (US). Each card's "Outcome:" label is really a delivery promise. The hub also pairs Australia with ShiftRail while /markets/au links FinanceSync.
- **Compliance wording** ("PIPEDA-conscious", "Privacy Act-conscious", "UK GDPR in the admin panel") still reads like certification. Rephrase it as features that support the client's own obligations.
- **Unprovable experience claims:**
  - /faq: "we are used to compliance requirements", "reviewed by a senior team member"
  - /about: "people who have shipped these interfaces before"
  - /services/no-code-low-code: "Custom code is usually cheaper by month six."
  - /markets/au: "finance teams overwhelmingly run on Xero"

## Consistency

- **MVP timeline:** /markets/uk "12-week launch" vs /solutions/saas "6 to 10 weeks" vs the trucking guide's "Week one… Week three" rollout.
- **Pricing:**
  - /solutions/accounting-integrations says "starts at $8,000" (USD on a page aimed at UK and Australian Xero users), but its own FAQ says "scoped after discovery".
  - /solutions/moving-company-websites says "up to six of those pages", but "those" refers to a feature list.
  - /pricing: the "US onshore quote is often higher… 1.6–2×" claim rests on a single vendor source (Gilzor).
- **Process:** /work says "each phase ends with your written sign-off". /process gives hard sign-off only to Discover and Design.
- **Design-only service pages** (branding, logo, graphic, design-systems, ux-research, wireframing, web-application-design, SEO) carry the shared "Working software on a real URL every week" step. That's wrong for them.
- **Naming varies:**
  - "Workflow automation" / "Automation Workflows" / `/automation-systems`
  - "Auto transport" / "Car transportation"
  - "Integrations & APIs" / "API integrations"
  - "Kriva" / "KRIVA" (on /careers and /services/api-integrations)
- **Reply time:** "within one business day" everywhere except /markets/uae ("same-day replies"). /contact says the form takes "about two minutes", the homepage "about a minute".
- **/services/graphic-design vs the /services card:** the card lists "packaging and campaign kits"; the page says those are "not our focus".
- **/services/web-development:** "Marketing sites and web applications" contradicts "The login is where this service stops".
- **Shared footer:** "Websites and custom software for US trucking…" is US-only while the site markets the UK and Germany.

## SEO / content structure

- **Cannibalisation:**
  - /services/product-design still contains single-workflow UI/UX content ("Can you redesign just one screen… Yes, that is the usual brief"), which competes with the merged UI/UX intent and contradicts its own FAQ 01. Its FAQs 04/08 and 02/07 are duplicates.
  - /services/automation-systems and /services/ai-assisted-development use the same four logistics scenarios.
  - The three trucking articles (build-vs-buy-tms, trucking-dispatch-crm-guide, dispatch-software-cost) all re-explain "the layer beside the TMS". Give each one job: decision, definition, budget.
  - /markets/uk title vs /solutions/saas and saas-mvp-uk-guide.
- **/insights/dispatch-software-cost never gives a dollar figure** ("estimate in weeks, not dollars"), although that is the search intent. Add ranges or link the /pricing figures in the first paragraph.
- **Weak H1s:**
  - /markets: "Built for operators in five markets."
  - Case-study one-liners: "One console. Every route. No second sheet.", "SSO was live. Activation was not.", "BrandLift"
  - /services/saas-platforms says "product design" while its title says development
  - /services/web-development leaves out "trucking" even though its title targets it
- **/services/seo-digital-marketing:** the title has neither "SEO services" nor "digital marketing", and the body says "US focus".
- **Wrong CTAs and labels:**
  - The QuickBooks/Xero guide ends with a trucking CTA ("workflow your desk runs outside the TMS").
  - The trucking-dispatch-crm-guide is labelled "Product Design & UI/UX".
- **Dated titles:**
  - ai-in-product-design-2026 has "2026" in its title and H1.
  - trucking-dispatch-crm-guide (May 2026) has no "Updated" date.
  - Competitor prices in trucking-company-website-cost need a "last checked" date and a quarterly re-check.
- **Factual checks:**
  - HMRC advance assurance is free to apply for, but the page says "costs little".
  - Verify "Xero keeps those keys for only six minutes" against Xero's current docs.
  - /saas-mvp-uk-guide uses US spellings (prioritizing, recognize).
- **Boilerplate repetition:**
  - "Mutual NDA available on request…" appears 4–6 times per page, "We reply within one business day" 5–8 times, and long pages end with three stacked CTA bands.
  - About 10 service pages repeat the hero paragraph word for word in the photo section below it.
  - /industries labels "CRM & Automation" as one of "Five industries", although it is a capability.

## Minor

- **Mockup and visual details:**
  - /solutions shows "SaaS SaaS product design →" (eyebrow plus link label).
  - Marquee tickers ("Industries · Industries…") are exposed to screen readers; mark the duplicates `aria-hidden`.
  - "Capabilities for Australia/Canada teams" should read "Australian/Canadian teams".
- **Minor copy issues:**
  - Comma splices across the articles.
  - "and We reply" (dispatch-software-cost, QuickBooks guide).
  - Mixed date formats ("November 14, 2026" vs "November 2026").
  - The trucking-company-website-cost article has a duplicated step "3".
- **/contact JS:** an inline script builds `'<a href="' + inquiryMailto(payload) + '">'`. Some crawlers read this as the URL `/'%20+%20inquiryMailto(payload)…`, which returns 404 and may show in GSC as a crawl 404. It is harmless to users.
- **Homepage photo credit** "Thank You (21 Millions+) views, CC BY 2.0" is correct: it is the photographer's real Flickr name. It reads oddly, so consider "Photo by Thank You (21 Millions+) views".

## Not issues (checked and dismissed)

- **Raw HTML entities** (`&ldquo;`, `&rarr;`, `&pound;`, `&times;`): these were artefacts of the text extractor. They render correctly on live.
- **/insights counters** ("90 minutes", "5 notes"): the rendered page shows 12 notes / 70 minutes / Trucking 4, which is correct.
- **"Acme Freight" and similar names:** labelled sample data in mockups. Intentional.
- **/services "Starting prices."**: link text followed by a full stop. Renders fine.

## Recommended order

1. Fix `.vercelignore` for features.json, and fix the two cut-off credits, "people for ship" and the 58%: trivial and verified.
2. Merge the Germany branch, then sweep every page to one country list (footer, /contact select, FAQ, careers, industries, technologies, solutions, insights meta).
3. One trust pass on /work, its 8 cases, /technologies, /markets and the 6 articles: conditional wording, invented counts removed, the one metrics policy applied everywhere (C-01).
4. Align /privacy and /terms (Clarity, consent opt-in and withdrawal, EU GDPR section).
5. Consistency pass: timelines, pricing currency, sign-off wording, service names, the shared "real URL every week" step.
6. SEO structure: remove the UI/UX content from product-design, split the three trucking articles by job, add a dollar answer to dispatch-software-cost, rework the weak H1s.
