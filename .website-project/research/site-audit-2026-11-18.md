# KRIVA Technologies: full website audit

**Site:** https://krivatechnologies.com · **Audited:** 18 November 2026 (live production) · **Type:** optimise (audit only, nothing changed)

---

## 0. How this audit was done, and what it does not cover

**Measured (real checks, not estimates)**
- Real-browser crawl (Chrome via Puppeteer) of **all 68 URLs** in the sitemap, following every internal link. No pages exist outside the sitemap; all 68 returned HTTP 200.
- Per page: title, description, canonical, robots, Open Graph, headings, word count, every image (alt, dimensions, real vs displayed size), every link, every form, structured data (JSON-LD), console errors, load timing, layout shift, page weight, desktop (1440px) and mobile (390px) screenshots, sideways-scroll check, tap-target and small-text counts.
- Automated accessibility scan (axe-core 4.10, WCAG 2.0/2.1 A/AA plus best practice) on all 68 pages.
- Lighthouse 12.8 (mobile, simulated slow 4G) on 12 template pages; anomalies re-run.
- Host checks: http→https, www→apex, trailing slash, old `.html` URLs, 404 status, robots.txt, sitemap, llms.txt, feed, exposed internal files, security headers, caching.
- All 23 external links checked; client domains checked with public DNS (Google).
- Full page text read for the homepage, About, Contact, FAQ, Work, ShiftRail, Services and Solutions hubs, Careers, the market pages and Pricing; headings and openings for every other page.

**Not measured (so not scored)**
- Real-user Core Web Vitals (Google field data / CrUX). The free PageSpeed API quota was used up for the day, and a site this new may not have field data anyway.
- Search Console data (impressions, queries, indexing coverage) and keyword volumes. These need your Search Console access or a paid SEO tool.
- End-to-end form delivery. The inquiry API is up (an empty test request was correctly rejected with "Name and a valid email are required"), but proving an email arrives means sending a real inquiry. **Do one manual test submission this week**, given the 502 outage on 7 November.
- Widths other than 390px and 1440px (320px, tablet), and browsers other than Chrome.
- Competitor comparison (optional for this kind of project; can be run next).

---

## 1. Verdict

### Overall rating: **6 / 10**

KRIVA's site is **technically better than most agency sites**: fast, clean, fully indexable and consistently designed. It has transparent starting prices, and its copy is specific to how dispatch desks and finance teams actually work. But **it does not yet give a buyer a reason to believe**. There is no testimonial, no named person, no verifiable outcome, and the eight product case studies are "representative projects". One of the seven real client sites it links to no longer exists. The positioning also stretches from US trucking websites to UK SaaS, payroll, healthcare apps, D2C fashion and logo design, which makes a two-year-old studio look like a generalist.

The site's ceiling is set by **trust and focus, not code**. The biggest gains come from content and proof decisions only the owner can make. Engineering polish is already near its limit.

### Scorecard (each score cites its evidence)

| Area | Score | Evidence |
|---|---|---|
| Technical SEO and on-page | **8.0** | Lighthouse SEO 100 on all 12 templates; 68/68 pages have a unique title, canonical, one H1, an OG image and JSON-LD; clean redirects; sitemap, robots and llms.txt present. Lost points: overlapping pages, organisation as author, `sameAs` = Instagram only, boilerplate keyword headings, 8 title/description length issues |
| GEO / AI-search readiness | **6.5** | Strong: llms.txt, FAQPage and Speakable schema, answer-first cost articles, AI crawlers allowed. Weak: no named experts, no third-party corroboration (LinkedIn, Clutch, Google Business Profile), no original data, and many disclaimers that weaken quotable claims |
| Performance | **7.5** | Lighthouse mobile performance 83–99 on 10 of 12 templates, LCP 1.8–3.1s, CLS 0. One page records no LCP at all (reproducible); /services ships about 1.1 MB of avoidable image weight; TBT up to 330ms. No field data |
| Accessibility | **7.0** | Lighthouse accessibility 96–100; every image has alt text and dimensions; forms labelled; honeypot correctly hidden. But axe finds color-contrast failures on **32 pages (241 elements, some at 1.9:1)** and text under 12px on every page |
| Responsiveness | **8.0** | 68/68 pages have no sideways scroll at 390px. Only 390px and 1440px tested |
| UI / visual design | **7.0** | Polished, consistent system. But every page uses the same hero formula (dark indigo glow, giant two-tone H1, mock-up, dot rail), and pages are very long (homepage about 22,400px desktop / 25,800px mobile) |
| Content and messaging | **5.5** | Specific, intelligent copy. But diluted positioning, defensive disclaimers, jargon ("fit call", "the desk", "works around") and repeated sections |
| Trust and conversion | **3.5** | 0 testimonials, 0 named people, 0 published outcomes, product case studies are representative, a dead client link, "Book a call" opens a form rather than a calendar, no phone number |

The overall figure is a judgement weighted toward trust and conversion, because that is what the site exists to do. It is not an average.

---

## 2. Strengths to keep (do not lose these in any rework)

1. **Transparent starting prices** (/pricing: Website from $4,800, Mobile app $18,000, UI/UX $6,500, Custom software $15,000, QuickBooks/Xero $8,000), each with "included / outside this scope". Most agencies hide prices, so this is a real differentiator.
2. **Specific, operator-level copy.** "Dispatch still runs on a spreadsheet beside your TMS" and "a failed push is a card with history, not a silent month-end surprise" are lines a buyer recognises.
3. **The "Follow one load" interactive section** and the live dispatch-board demo in the hero show product thinking instead of claiming it.
4. **Honest comparison table** ("If a boxed TMS fits, buy it, and we will say so"). It builds credibility.
5. **Clean technical foundation:** single host, correct 301/308s for old URLs, real 404, HSTS and security headers, Brotli, long-cache assets, internal files not exposed, AI crawler policy, llms.txt.
6. **Money pages exist for the right searches:** "trucking company website design", "moving company website design", "custom dispatch software cost", "build vs buy TMS", "how much does a trucking company website cost".
7. **Seven real client websites** for US carriers and movers. This is the only verifiable proof on the site, and today it is under-used (see T-03).

---

## 3. Critical issues (fix before any further redesign work)

### C-01 · Proof: product case studies read as real delivery but are "representative" (Work, 8 case pages, homepage)
- /work states: *"The eight product case studies are representative projects… project names may be portfolio names."* Each case page carries "Representative project. Console UI is an illustrative reconstruction."
- Yet the same pages narrate real events ("Shadow sessions on the desk", "What shipped to the desk"), and Google sees meta descriptions written as fact: *"ShiftRail case: **modernized** a US trucking dispatch CRM…"*. A searcher sees a factual claim; a careful reader finds a disclaimer. That gap is the worst outcome on both counts: it isn't strong proof, and it can look misleading.
- The homepage features ShiftRail (representative) as its lead proof, above the real client sites.
- **Why it matters:** B2B buyers, especially US logistics owners hiring an offshore team, decide on proof. Presenting composite work as case studies is also a consumer-protection risk (US FTC rules on deceptive endorsements and claims). **Get a qualified review.**
- **Fix:** choose one honest frame per project. (a) Real client work, anonymised under NDA: say "Client: a 40-truck US carrier (name withheld under NDA)" and keep only facts that happened. (b) Concept work: move it to a clearly separate "Concepts / product thinking" section, retitle it, and stop calling it a case study. Rewrite every meta description to match.

### C-02 · Dead client link: elite-one.us does not exist (Work, Trucking company websites)
- Google DNS returns NXDOMAIN (non-existent domain) for `elite-one.us`. It is linked as "Visit live site ↗" on /work and /solutions/trucking-company-websites, and its screenshot is the **largest, twice-repeated thumbnail in the /work hero** and is cited on the trucking solution path ("ShiftRail · EliteOne · Schwarz").
- **Why it matters:** a buyer who clicks the first "live client site" and hits a browser error will doubt everything else.
- **Fix today:** find out whether the client moved domains. If so, relink. If not, keep the work as "Archived project (site no longer online)" with screenshots and no live link, and take it out of the hero.

### C-03 · Analytics and session recording run before consent (all pages)
- GA4 consent default sets `analytics_storage: 'granted'` (denied only when Global Privacy Control is on). Microsoft Clarity session recording loads on every page. There is no consent banner. Lighthouse reports 8 third-party cookies.
- The site actively targets the UK (a /markets/uk page and a UK SaaS guide), and Canada and Australia, where consent rules for analytics cookies and session replay are stricter. The privacy policy discloses both tools, which is good but does not replace consent where it is required.
- **Fix:** a consent banner with equal Accept/Reject; default analytics and Clarity to off until accepted for UK/EEA visitors (or for everyone, which is simpler). **Specialist territory: have the privacy policy and banner reviewed.**

### C-04 · Verify the inquiry form actually delivers (all 68 pages carry a form)
- Not a confirmed defect: the API is up today. But forms failed in production on 7 November, every page depends on one endpoint, and the fallback can show success when the send failed. **Submit one real test inquiry from /contact and one from a service page, and confirm both emails arrive** (studio inbox and auto-reply). Then add an uptime check on `/api/inquiry`.

---

## 4. Complete issue list

IDs are stable: each names the check and the page(s) it concerns.

### 4.1 Trust and conversion

| ID | Severity | Issue | Where | Why it matters / fix |
|---|---|---|---|---|
| T-01 | High | **No testimonials anywhere** (0 on 68 pages). | Site-wide | The single cheapest credibility lift. Ask the 6 live website clients for a 2–3 sentence quote with name, title, company and photo. Put one beside every main CTA. |
| T-02 | High | **No named humans.** "The founder leads design", but the founder is never named. No team page, no photos, articles bylined "KRIVA Technologies". | About, all articles, schema | An offshore studio founded in 2025 must show who you will talk to. Name the founder and leads, with photos, LinkedIn and short bios. Byline every article with a real person and add `Person` schema. |
| T-03 | High | **Real client work is under-used.** Seven real US transport and moving sites sit below eight representative ones; no screenshots-with-context, no before/after, no results. | Work, homepage | Lead with them: "Websites we designed for US carriers and movers" with a large screenshot, the client's goal and what changed (quote form, recruiting page). Ask for permission to share one real metric (quote requests per month before and after). |
| T-04 | High | **"Book a free 20-minute fit call" is a form, not a booking.** No calendar, no phone, no WhatsApp; the reply comes "within one business day". The label promises an action the page doesn't perform. | Every page (header and form button) | Add a real scheduler (Cal.com / Calendly / HubSpot Meetings) for US hours; keep the form for briefs. Or rename the button "Request a fit call". A US phone number (even a virtual one) also lowers the offshore-risk feeling. |
| T-05 | High | **Contact "fit call" form has no Website option**, though Websites ($4,800) is the #1 service on the homepage. Options: Trucking & logistics, SaaS, CRM, QuickBooks/Xero, "Custom web / mobile application", Car transport, Not sure. | /contact | Website leads are mis-sorted or abandon. Add "Trucking or moving company website" as the first option. |
| T-06 | Medium | **Six different inquiry-form variants** (phone field on some service and market pages but not others; budget and project type on website pages only). | Site-wide | Inconsistent data, harder lead routing. Standardise to two forms: Quick (name, email, company, project type, message) and Brief. |
| T-07 | Medium | **Defensive disclaimers everywhere:** 61 visible photo-credit lines ("Photograph via Pexels License. Not a KRIVA client or product."), plus "Sample data", "Illustrative sync, not live data", "Logos… do not imply a partnership", "Illustrative reconstruction". | Site-wide | Each is honest; together they tell the reader "nothing here is real". Unsplash and Pexels licences do not require attribution, so remove those lines (keep a credits page). Keep attribution only for CC BY images, in small captions. Keep one disclaimer per demo, not three. |
| T-08 | Medium | **No third-party credibility:** no LinkedIn company page link, no Clutch / GoodFirms / Google reviews, no partner listings (Intuit, Xero app partner), no certifications. Only Instagram in the footer and schema. | Footer, schema | B2B buyers check LinkedIn and Clutch before replying. Create or claim the profiles, link them, add them to `sameAs`. |
| T-09 | Low | **Odd-looking photo credit:** "Photo: Thank You (21 Millions+) views, CC BY 2.0" appears in the homepage body. *Corrected 18 Nov: this is the photographer's real Flickr display name, so the credit is valid and required by CC BY 2.0.* | Homepage | It still reads like an error to a buyer. Either swap in a photo whose licence needs no credit, or keep the caption and accept it. Do not delete the credit while this photo is used. |
| T-10 | Low | Live clocks for 5 cities on the homepage. | Homepage | Novelty with little value. Replace with "Calls 8am–2pm ET" (plain availability). |

### 4.2 Content and copywriting

| ID | Severity | Issue | Where | Fix |
|---|---|---|---|---|
| CN-01 | High | **Positioning drift.** The homepage H1 is "Websites and software for US trucking, moving, and logistics", but /services says "trucking, SaaS, and finance", /about says "trucking software, B2B SaaS, and finance integrations", /markets/uk says "SaaS product design for UK teams", and the work includes healthcare (HealthTrack), D2C fashion in £ (BrandLift) and a UK no-code marketplace (LocalServe). | Site-wide | Pick one lead story: **"Websites and software for US trucking, moving and logistics companies."** Keep SaaS and accounting integrations as supporting practices that serve that buyer (for example, QuickBooks sync for carriers). Remove or de-emphasise off-niche work. |
| CN-02 | High | **Service sprawl:** 19 service pages + 8 solution pages + 5 market pages + an industries page for one small team. /services even says "Primary work, not a grid of seventeen" above a grid. | Services, Solutions | Merge to about 8–10 service pages (see §6). Thin craft pages (logo, graphic, wireframing, UX research, design systems) become sections of Branding and Product design. |
| CN-03 | Medium | **Boilerplate keyword blocks** bolted onto hubs: "KRIVA Technologies product design and development services / Who it's for / What we deliver / How we help", "KRIVA software solutions for trucking, SaaS, finance, and auto transport", "Technology stack for custom trucking software, SaaS platforms, and integrations". | /services, /solutions, /technologies, others | They read as written for crawlers. Rewrite as plain answers or delete; the pages already rank on their real content. |
| CN-04 | Medium | **In-house jargon repeated:** "fit call" (on every page), "the desk", "works around", "the shift". | Site-wide | Fine once; tiring on every CTA. Use "free 20-minute call" and plain verbs. |
| CN-05 | Medium | **Homepage repeats itself:** "Five services. One team." then "Three specialties", then "Also on the team" (8 more), then the services again in the FAQ. The pitch is told about four times across 13 sections. | Homepage | Cut to about 8 sections: hero → who it's for (4 problems) → real work → how it works and price → testimonials → FAQ → form. |
| CN-06 | Medium | **Experience framing raises a question it doesn't answer:** "launched in 2025… the team brings nine years of experience" (whose? where?). | Home, About | Answer it: name the people and where those nine years were spent. |
| CN-07 | Low | Case-study H1s carry no topic ("One hand. One next visit.", "SSO was live. Activation was not.", "BrandLift"). | 3 case pages | Keep the hook but add a sub-headline with the topic ("Patient booking app UX case study"). |

### 4.3 SEO and GEO

| ID | Severity | Issue | Where | Fix |
|---|---|---|---|---|
| S-01 | High | **Keyword cannibalisation** (several pages competing for one search): /solutions/saas vs /services/saas-platforms vs /markets/uk; /solutions/trucking-logistics vs /services/crm-development vs /markets/us vs /insights/trucking-dispatch-crm-guide; /industries vs /solutions; /services/web-development vs /solutions/trucking-company-websites; /services/ui-ux-design vs /services/product-design vs /services/web-application-design. | — | Give each search topic one owner page. Merge, then redirect the losers (301) to the winner (see §6). |
| S-02 | High | **No person entities:** BlogPosting `author` is the organisation; no `Person`, no founder in the Organization schema; `sameAs` only lists Instagram. | All 12 articles, global schema | AI answer engines and Google weigh identifiable experts. Add real authors with bio pages, a `founder`, and `sameAs` (LinkedIn, Clutch, GitHub). |
| S-03 | Medium | **Newest money articles barely linked:** /insights/trucking-company-website-cost and /moving-company-website-features have 2 contextual inbound links each; /services/seo-digital-marketing, /services/web-application-design, /services/logo-design and /services/graphic-design have 3. | — | Link the two website-cost articles from the homepage websites row, /pricing, both website solution pages and the website FAQ answers. |
| S-04 | Low | **Stray text inside an H1:** /services/product-design H1 reads "Product design for logistics software and SaaS, mapped before code **Frame · before code**". The label is `aria-hidden`, so screen readers skip it, but search engines read the heading's full text. | /services/product-design | Move the decorative label out of the `<h1>`. |
| S-05 | Medium | **Off-niche content leads Insights:** the featured article on /insights is "SaaS MVP guide for UK startups"; 6 of 12 articles are SaaS or product-design generic. | /insights | Feature trucking and moving content first; plan the next 6 articles around US carrier and mover buying questions (see §7). |
| S-06 | Medium | **Outbound links to competitors:** /insights/trucking-company-website-cost links to 4 competing agencies (digitrucksolutions, gatorbyte, vaylostudios, codeifydigital) as price sources, and /pricing links to a fifth (gilzor). *Corrected 18 Nov: the first version said all 5 were in the article.* | That article, /pricing | Citing sources is good for trust, but the buyer is one click from a competitor. Summarise the market range in a table, cite once in a "Sources" footnote, and add `rel="nofollow"`. |
| S-07 | Medium | **Schema inconsistent across solutions:** freight-broker and fleet-management pages emit a different graph (no WebSite / global ProfessionalService node) from the other solution pages. | 2 pages | Use the shared schema include. |
| S-08 | Low | **Lengths:** descriptions over 160 characters on / (163), /process (181), /careers (161), /services/web-development (168), /pricing (169), /solutions/moving-company-websites (169); /terms too short (107); titles of 63 characters on freight-broker and accounting-integrations. | 8 pages | Trim (Google truncates around 155–160 characters and 60 for titles). |
| S-09 | Low | **Careers is indexable with no roles** ("No open roles right now"); 465 words. | /careers | Keep the page but `noindex` it while there are no roles, or fold it into About. |
| S-10 | Low | Articles were published in bursts (3 on 5 Nov, 2 on 14 Nov) after gaps of months. | Insights | A steady 2 per month signals an active site better than bursts. |

### 4.4 Technical and performance

Lighthouse, mobile, simulated slow 4G, one run each (anomalies re-run):

| Page | Perf | A11y | Best pr. | SEO | LCP | TBT | Weight |
|---|---|---|---|---|---|---|---|
| / | 95 | 97 | 79 | 100 | 2.1s | 220ms | 364 KB |
| /about | 88 | 97 | 79 | 100 | 2.8s | 330ms | 317 KB |
| /services | 57 → **93, 96 on re-run** | 100 | 79 | 100 | 2.6–2.9s | 110–120ms | **1,474 KB** |
| /services/crm-development | 88 | 100 | 79 | 100 | 3.1s | 300ms | 339 KB |
| /solutions/trucking-logistics | **0 (no LCP recorded, 2 of 2 runs)** | 96 | 79 | 100 | — | — | 449 KB |
| /solutions/trucking-company-websites | 0 → 99 on re-run (flaky) | 100 | 79 | 100 | 1.9s | 70ms | 320 KB |
| /work | 94 | 97 | 79 | 100 | 2.6s | 170ms | 512 KB |
| /work/shiftrail-dispatch | 98 | 100 | 79 | 100 | 2.0s | 120ms | 316 KB |
| /insights | 99 | 97 | 79 | 100 | 1.8s | 90ms | 301 KB |
| /insights/dispatch-software-cost | 83 | 100 | 79 | 100 | 4.7s | 90ms | 288 KB |
| /pricing | 99 | 100 | 79 | 100 | 1.9s | 80ms | 309 KB |
| /contact | 95 | 100 | 79 | 100 | 2.8s | 70ms | 313 KB |

| ID | Severity | Issue | Fix |
|---|---|---|---|
| P-01 | High | **/solutions/trucking-logistics never records a Largest Contentful Paint**: reproduced in Lighthouse twice and in plain Chrome. On other templates the LCP element is the header logo, which means the hero text is hidden at first paint by reveal animations (`html.js [data-r]{opacity:0}`, `sx-fade`). Google may report this page's LCP as missing or late. | Render hero content (H1, intro, primary CTA) visible from first paint; animate only below-the-fold content; re-test. |
| P-02 | Medium | **No responsive images:** 1600px photos are displayed at 376–640px wide with no `srcset`, so phones download desktop images. /services alone: Lighthouse estimates 663 KB from responsive images and 1.1 MB total image savings. | Generate 480/800/1200 widths and add `srcset` + `sizes`; you already have `sharp` installed. |
| P-03 | Medium | **Best Practices 79 on every page:** third-party cookies (GA4 + Clarity) and console issues. | Fixed largely by C-03 (consent gating). |
| P-04 | Medium | **Main-thread work:** TBT 220–330ms on home, about, crm-development; Lighthouse flags about 62–69 KB of unused JavaScript per page and legacy JS polyfills; time-to-interactive 4.1–4.7s on mobile. | Split page-specific JS, defer Clarity until consent, drop polyfills. |
| P-05 | Medium | **Layout shift on desktop:** /faq CLS 0.133 and /work 0.132 (desktop crawl, above the 0.1 target). | Reserve space for accordion/filter content; check fonts. |
| P-06 | Low | **Very large pages:** homepage 22,437px tall (desktop) / 25,803px (mobile), DOM about 1,500 elements on several templates. | Content cuts in CN-05 fix this. |
| P-07 | Low | `/favicon.ico` returns 404 (SVG favicon is set, but some crawlers, email clients and Bing request the .ico). | Add a 32×32 favicon.ico. |
| P-08 | Low | `http://www.` takes 2 redirects to reach the apex (http→https www→apex). | Optional: single redirect at the edge. |

Clean, no action: HSTS, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy present; Brotli compression; 1-year immutable fonts; old `.html` URLs and `/work/fleetflow-dispatch` 308 to their new URLs; `.env`, `.md`, `package.json` and scripts are not publicly served; real 404 status; no broken internal links; no broken images; all images WebP or SVG with alt text and dimensions. A Content-Security-Policy header is the one missing security header (Low).

### 4.5 Accessibility

| ID | Severity | Issue | Fix |
|---|---|---|---|
| A-01 | High | **Color contrast fails on 32 of 68 pages (241 elements)**, worst cases 1.92:1 and 1.96:1 (`#3f4b5a` and `#4f4b3f` text on `#0f1c2e`), often at 8–11px. Mostly muted labels inside the dark demo panels. | Raise muted-label tokens to at least 4.5:1 on dark backgrounds. |
| A-02 | Medium | **Text under 12px on every page** (95 instances on /work, 45 on /markets): eyebrow labels, chips, mock-UI labels. | Set a 12px floor for real text (decorative mock-UI excepted, marked `aria-hidden`). |
| A-03 | Low | `<aside>` nested inside another landmark on 12 pages; invalid `role="listitem"` on 3 pages (/contact, /solutions/accounting-integrations, /services/dashboard-design). | Markup fixes. |
| A-04 | Low | 17–21 tap targets under 24px on home, about and process (mobile), mostly the right-hand section dot rail. | Hide the dot rail on touch devices or enlarge the targets. |

No conformance claim is made. A WCAG 2.2 AA review by a specialist is recommended before advertising accessibility.

### 4.6 Structure and navigation

| ID | Severity | Issue | Fix |
|---|---|---|---|
| N-01 | High | **Two mega-menus with 18 overlapping links.** Solutions (8) and Services (10) use labels a buyer can't tell apart: "Trucking software" vs "Custom CRM development"; "SaaS product development" vs "SaaS platforms"; "Trucking company websites" vs "Web development". | One "What we do" menu grouped by buyer: **Websites** (trucking, moving), **Software** (dispatch/TMS, freight broker, fleet, driver apps), **Integrations** (QuickBooks/Xero, APIs), plus "All services". |
| N-02 | Medium | **Industries, Markets and Solutions overlap.** /industries ("trucking, SaaS, finance, operations") repeats /solutions; Markets sits in the footer with Industries filed under it. | Merge /industries into /solutions (301). Keep market pages but link them only from the footer and the About "where we work" section. |
| N-03 | Medium | **Header CTA label is long** ("Book a free 20-minute fit call", about 240px wide) and every hero repeats the same button, so there is no page-specific next step. | Header: "Book a call". In-page CTAs matched to intent: "Get a website quote", "See what a dispatch build costs". |
| N-04 | Low | Footer has no physical address line or phone, and its social links are "INSTAGRAM" only. | Add the address (Ahmedabad), LinkedIn and Clutch. |

### 4.7 UI / UX and visual design

| ID | Severity | Issue | Fix |
|---|---|---|---|
| U-01 | Medium | **One hero formula on every page** (eyebrow, giant two-tone H1 with lavender words, mock panel on the right, dot rail, indigo glow). It is polished, but it reads as a template, and the dark indigo gradient look is now widespread on AI-generated sites. | Vary heroes by page type: real client screenshots on Work and website pages; a clean light hero on articles; reserve the interactive dispatch demo for the homepage and the trucking software page. |
| U-02 | Medium | **H1s take most of the first screen** (homepage H1 about 300px tall at 1440); the value and the CTA sit at the fold line on 13" laptops. | Reduce the display size about 20–25% on inner pages so intro and CTA sit higher. |
| U-03 | Medium | **Insights article template is plainer than the rest** and leaves the right column empty at 1440px (no table of contents, author card or sticky CTA). | Apply the newer article layout (already built for trucking-company-website-cost) to all 12 articles: TOC, author card, related service CTA. |
| U-04 | Low | Mock-UI text inside demos is dense and tiny at mobile widths (see A-02). | Simplify demos on mobile to 3 rows and larger type. |

---

## 5. Page-by-page review (all 68 pages)

**Verdict key:** Keep = fine, minor polish · Tighten = keep, cut or fix specific items · Rewrite = substance needs to change · Merge = fold into another page and 301-redirect · Noindex = keep live but out of search.

### Core pages

| Page | Words | Verdict | What to do |
|---|---|---|---|
| / (Home) | 2,020 | **Rewrite** | Cut 13 sections to about 8 (CN-05). Keep the hero demo and "Follow one load". Replace "Five services / Three specialties / Also on the team" with one "What we build" block. Put real client websites and testimonials above ShiftRail (T-03, C-01). Replace clocks with call hours. Remove the odd photo credit (T-09). LCP element is the logo; render the hero text immediately (P-01). |
| /about | 1,602 | **Rewrite** | Lacks the one thing an About page is for: people. Add founder name, photo and bio, team leads, LinkedIn links, where the "nine years" came from (CN-06), and a real office photo instead of Pexels/Unsplash images labelled "Not KRIVA staff". TBT 330ms. |
| /contact | 711 | **Tighten** | Add a Website option to the fit form (T-05); add a real scheduler or rename the button (T-04); add a phone number; remove the duplicate "fit call vs brief" explanation. The live time widget is a nice touch; keep it. |
| /pricing | 1,271 | **Keep (polish)** | The strongest conversion page. Add one testimonial per tier, a "what a typical project costs" range for the dispatch platform, and payment terms (deposit and milestones). Description 169 characters → trim. Perf 99. |
| /process | 1,822 | **Tighten** | Clear, but long (13,367px desktop). Add a real example timeline from a client website project. Description 181 characters → trim. |
| /faq | 351 visible | **Tighten** | Renders correctly now. 16 good questions; add pricing-specific ones ("Do you require a deposit?", "Do you offer hosting and maintenance?", "Can we pay monthly?"). Fix CLS 0.133 and jump-link offset. |
| /work | 1,545 | **Rewrite** | Lead with the seven real client sites (fix EliteOne first, C-02); separate concept work from client work (C-01); remove off-niche items or move them to "Other work". CLS 0.132. 95 tiny-text instances. |
| /insights | 1,176 | **Tighten** | Feature trucking and moving content, not the UK SaaS guide (S-05). Add author filters once authors exist. |
| /technologies | 955 | **Merge or Tighten** | Low-intent page; 4 contextual inbound links. Fold the stack into About or Process, or keep it but remove the boilerplate H2 (CN-03). |
| /careers | 465 | **Noindex** | No open roles (S-09). |
| /industries | 884 | **Merge → /solutions** | Duplicates Solutions (N-02, S-01). |
| /privacy | 480 | **Keep (review)** | Discloses GA4 and Clarity, good. Must match the consent model after C-03. **Have it professionally reviewed.** |
| /terms | 400 | **Keep (review)** | Description too short (107 characters). Professional review recommended. |

### Solutions (8)

| Page | Words | Verdict | What to do |
|---|---|---|---|
| /solutions | 1,030 | **Rewrite** | Becomes the single "What we do" hub (N-01). Remove the boilerplate "KRIVA software solutions for…" block. |
| /solutions/trucking-logistics | 1,624 | **Tighten (priority)** | Main money page for "custom trucking software / TMS development". **Fix the missing LCP (P-01).** Remove EliteOne from the proof list. Add a testimonial and a real "what it costs" range linking to /insights/dispatch-software-cost. Absorb /services/crm-development content (S-01). |
| /solutions/trucking-company-websites | 937 | **Tighten (priority)** | Strong concept (shipper vs driver view). Replace "Ridgeline Freight" mock with real client screenshots; remove the EliteOne live link; add client quotes and a link to the website-cost article. Flaky LCP (1 of 2 runs). |
| /solutions/moving-company-websites | 751 | **Tighten** | Same as above for Keep Moving / Extra Mile / Xmile. Description 169 characters. |
| /solutions/freight-broker-software | 1,748 | **Keep** | Good topic page. Fix schema graph (S-07); title 63 characters. No proof yet; add one. |
| /solutions/fleet-management-software | 1,883 | **Keep** | Same as freight broker: fix schema (S-07), add proof. |
| /solutions/car-transportation | 2,432 | **Tighten** | Longest solution page. Tie it to the real Xmile Auto Transport website project, the only real auto-transport proof. |
| /solutions/saas | 1,848 | **Keep, demote** | Keep as a secondary practice; take it out of the primary nav group. Absorb /services/saas-platforms. |
| /solutions/accounting-integrations | 2,295 | **Keep, reframe** | Reframe for carriers and brokers first ("QuickBooks sync for trucking companies"), SaaS second. Title 63 characters. |

### Services (19) → recommended about 9

| Page | Words | Verdict | What to do |
|---|---|---|---|
| /services | 1,704 | **Rewrite** | Fix heavy images (P-02: about 1.1 MB). Remove the "grid of seventeen" contradiction and the boilerplate block. Becomes a short list of the about 9 remaining services. |
| /services/crm-development | 1,911 | **Merge → /solutions/trucking-logistics** (dispatch content) or keep as "Custom CRM" for non-trucking only | Cannibalises the trucking solution (S-01). |
| /services/saas-platforms | 2,255 | **Merge → /solutions/saas** | Same topic. |
| /services/mobile-applications | 1,775 | **Keep** | Rename to "Driver and field apps". |
| /services/web-development | 1,830 | **Merge → website solution pages** | Overlaps trucking/moving websites; description 168 characters. |
| /services/api-integrations | 1,751 | **Keep** | Link from accounting-integrations. |
| /services/automation-systems | 2,001 | **Keep** | Good; long. |
| /services/product-design | 1,547 | **Keep, absorb** | Fix the H1 stray text (S-04). Absorb ui-ux-design, ux-research, wireframing-prototyping, design-systems, web-application-design as sections. |
| /services/ui-ux-design | 1,299 | **Merge → product-design** | Overlap (S-01). |
| /services/ux-research | 774 | **Merge → product-design** | Thin standalone demand. |
| /services/wireframing-prototyping | 822 | **Merge → product-design** | Same. |
| /services/design-systems | 912 | **Merge → product-design** | Same. |
| /services/web-application-design | 831 | **Merge → product-design** | 3 contextual inbound links; overlaps. |
| /services/dashboard-design | 1,735 | **Keep** | "Fleet dashboards" is a real trucking search. |
| /services/branding | 1,347 | **Keep, absorb** | Absorb logo-design and graphic-design as sections. Prove it with real client logos/brands if any exist; BrandLift is representative. |
| /services/logo-design | 814 | **Merge → branding** | Off-strategy for a software studio; thin. |
| /services/graphic-design | 941 | **Merge → branding** | Same. |
| /services/seo-digital-marketing | 1,034 | **Keep only if delivered; reframe** | Reframe as "SEO for trucking and moving websites" (an add-on to website builds). If it isn't actively sold, remove it. |
| /services/no-code-low-code | 745 | **Keep, demote** | Niche; link from SaaS. |
| /services/ai-assisted-development | 904 | **Merge → /process or About** | It describes *how* you work, not something buyers search to buy. |

### Markets (6)

| Page | Words | Verdict | What to do |
|---|---|---|---|
| /markets | 834 | **Tighten** | Fine as a footer hub. |
| /markets/us | 1,207 | **Keep (priority)** | The primary market; should mirror the homepage story and carry the strongest US proof. |
| /markets/uk | 1,064 | **Keep, low priority** | Genuinely localised (MTD, UK GDPR); but it pulls the brand toward UK SaaS. Keep, link only from the footer. Required before promoting it: C-03 consent. |
| /markets/ca | 1,028 | **Keep** | Good localisation (provincial tax, Quebec bilingual). |
| /markets/au | 1,071 | **Keep, low priority** | — |
| /markets/uae | 1,288 | **Keep, low priority** | Has an Arabic toggle; check the Arabic copy was written or reviewed by a native speaker. |

### Case studies (8)

| Page | Words | Verdict | What to do |
|---|---|---|---|
| /work/shiftrail-dispatch | 959 | **Rewrite** | Resolve C-01 (real-anonymised or concept). Meta description currently states as fact "modernized a US trucking dispatch CRM". |
| /work/finance-sync-hub | 703 | **Rewrite** | Same framing decision. In-niche; keep. |
| /work/payroll-pro-saas | 523 | **Rewrite or move to Concepts** | Thin (523 words); off-niche. |
| /work/crm-pulse-dashboard | 713 | **Move to Concepts or remove** | HubSpot sales dashboard; off-niche. |
| /work/ai-support-automation | 708 | **Move to Concepts or remove** | Off-niche. |
| /work/marketplace-mvp | 690 | **Move to Concepts or remove** | UK Leeds/Manchester marketplace; off-niche. |
| /work/healthtrack-mobile | 434 | **Remove** (or Concepts) | Healthcare patient app; thin; contradicts transport positioning. |
| /work/brandlift-ecommerce | 369 | **Remove** (or Concepts) | Thinnest page on the site; D2C fashion in £. |

When removing, 301-redirect to /work.

### Insights (12)

| Page | Words | Verdict | What to do |
|---|---|---|---|
| /insights/trucking-company-website-cost | 941 | **Keep (priority)** | Best commercial article. Link it from home, pricing and website pages (S-03); handle competitor links (S-06). |
| /insights/moving-company-website-features | 774 | **Keep (priority), expand** | 4 H2s and 774 words; expand to about 1,500 with a feature checklist and examples from real mover sites you built. Only 2 contextual inbound links. |
| /insights/dispatch-software-cost | 1,686 | **Keep** | LCP 4.7s on mobile; check the hero image. |
| /insights/build-vs-buy-tms | 1,358 | **Keep** | Strong buyer question. |
| /insights/trucking-dispatch-crm-guide | 2,143 | **Keep** | Pillar article; cannibalisation watch with the trucking solution page. |
| /insights/quickbooks-xero-integration-guide | 1,495 | **Keep, reframe** | Title says "for SaaS"; add a carrier/broker angle. |
| /insights/choosing-a-digital-agency | 735 | **Keep, expand** | Ideal place for honest comparison and proof. |
| /insights/saas-onboarding-patterns | 1,334 | **Keep, demote** | Off-niche but fine. |
| /insights/saas-mvp-uk-guide | 1,373 | **Keep, demote** | Stop featuring it on /insights. |
| /insights/no-code-vs-custom-mvp | 766 | **Keep** | — |
| /insights/crm-dashboard-ux-patterns | 766 | **Keep or refresh** | Oldest article (Oct 2025). |
| /insights/ai-in-product-design-2026 | 719 | **Refresh or remove** | Generic topic, 3 contextual inbound links, low buyer intent. |

All 12 need: a named author, an author bio box, the newer article layout (U-03) and a related-service CTA.

---

## 6. Fix · Improve · Remove · Add

**Fix (broken or wrong)**
- EliteOne dead link and hero thumbnail (C-02)
- Consent before analytics and Clarity (C-03)
- Contact form missing the Website option (T-05)
- Missing LCP on /solutions/trucking-logistics; hero hidden at first paint (P-01)
- Contrast failures on 32 pages (A-01)
- Product-design H1 stray text (S-04)
- Case-study meta descriptions claiming delivery (C-01)
- favicon.ico 404 (P-07)

**Improve**
- Positioning: one lead story for US trucking, moving and logistics (CN-01)
- Navigation: one buyer-grouped menu (N-01)
- Homepage: about 8 sections, proof first (CN-05)
- About page: people (T-02)
- Images: responsive sizes (P-02)
- Article template, authors, internal links (U-03, S-02, S-03)
- Form consistency (T-06)

**Remove or merge** (each with a 301 redirect to the named page)
- /industries → /solutions
- /services/ui-ux-design, /ux-research, /wireframing-prototyping, /design-systems, /web-application-design → /services/product-design
- /services/logo-design, /graphic-design → /services/branding
- /services/saas-platforms → /solutions/saas
- /services/web-development → /solutions/trucking-company-websites (or a new /websites hub)
- /services/crm-development → /solutions/trucking-logistics (if you don't sell non-trucking CRM)
- /services/ai-assisted-development → /process
- /work/healthtrack-mobile, /work/brandlift-ecommerce (and possibly the other off-niche cases) → /work
- About 55 of the 61 stock-photo disclaimer lines
- Boilerplate keyword blocks on hubs (CN-03)
- Homepage clocks

This takes the site from 68 to about 52 pages, each with one clear job.

**Add**
- Testimonials (6 real clients), named founder and team, LinkedIn and Clutch
- Real scheduler and a phone number
- A "Websites we built" showcase with real screenshots and client goals
- Consent banner
- Author pages and `Person` schema
- A "Concepts" section for the representative product work, clearly labelled

---

## 7. Missing content, features and opportunities

1. **A real client story, end to end.** One website client (Schwarz Logistics or Keep Moving): goal, what was built, a quote, and one number the client approves (quote requests, driver applications, page speed before and after). One real story outweighs eight representative ones.
2. **Founder-led content.** A named founder writing "What we learned building quote forms for 7 carriers and movers" is unique, quotable by AI answer engines, and impossible for competitors to copy.
3. **Free tools for trucking buyers** (lead magnets that fit the niche): a trucking-website checklist PDF, a "dispatch software cost estimator" (inputs: users, integrations, apps → range), or a website audit offer for carriers ("We'll review your quote form in 48 hours").
4. **Article plan around US carrier and mover questions:** "Trucking company website examples", "Driver recruiting page: what converts", "FMCSA/DOT details on a carrier website", "Moving company quote form best practices", "Moving company SEO", "TMS integrations explained (McLeod, Tailwind, Aljex)", "QuickBooks for trucking companies". Validate volumes in Search Console or an SEO tool first; this audit has no keyword volume data.
5. **Comparison and alternative pages** buyers search: "Custom TMS vs McLeod / Tailwind / Rose Rocket", "Website agency vs template (Wix, Squarespace) for trucking companies".
6. **Google Business Profile, Clutch, LinkedIn company page.** These are entity corroboration for Google and AI answers, and review platforms for buyers.
7. **Retention offer:** a website care / SEO retainer for the carriers you've built for (recurring revenue, and a reason to stay in touch for testimonials).
8. **Partner listings:** if you build on Intuit and Xero APIs, apply for their app/developer partner directories (only claim a partnership once it's real).
9. **Measurement:** after consent, track `generate_lead` by form and source; review GA4 data quality first (bots and office traffic were inflating users as of 15 Nov).

---

## 8. Prioritised action plan

Effort: S = under a day, M = 1–3 days, L = a week or more. **Owner input** marks items only the owner can unblock.

### Critical (this week)
| # | Action | Effort | Owner input |
|---|---|---|---|
| 1 | Resolve EliteOne: relink or archive; remove from /work hero and trucking proof lists (C-02) | S | Did the client move domains? |
| 2 | Test-submit both forms; confirm studio and auto-reply emails arrive; add an uptime check on /api/inquiry (C-04) | S | Check inbox |
| 3 | Decide the case-study framing (real-anonymised vs concept); rewrite the 8 meta descriptions and narratives to match (C-01) | M | **Yes**: which projects are real? |
| 4 | Consent banner; default analytics and Clarity off until accepted; align the privacy policy (C-03) | M | **Yes**: approve banner; professional review |

### High (next 2–4 weeks)
| # | Action | Effort | Owner input |
|---|---|---|---|
| 5 | Collect 3–6 testimonials from real website clients; place beside CTAs and on Pricing, Work and the website pages (T-01) | M | **Yes**: request from clients |
| 6 | About page with named founder, team, photos and LinkedIn; real authors on articles; `Person` + `sameAs` schema (T-02, S-02) | M | **Yes**: names, photos, bios |
| 7 | Lock positioning to US trucking, moving and logistics; demote SaaS, UK and accounting to supporting practices (CN-01) | M | **Yes**: confirm strategy |
| 8 | Consolidate services 19 → about 9 and merge /industries, with 301 redirects (CN-02, S-01, N-02) | L | Approve the merge list |
| 9 | Rebuild navigation as one buyer-grouped menu (N-01) | M | — |
| 10 | Add a real scheduler (or rename the CTA) and a phone number; add the Website option to the contact form (T-04, T-05) | S–M | Pick a tool; get a number |
| 11 | Make hero content visible at first paint; fix the missing LCP on trucking-logistics (P-01) | M | — |
| 12 | Raise contrast on the muted-label tokens; 12px text floor (A-01, A-02) | M | — |
| 13 | Homepage cut to about 8 sections, real work first (CN-05, T-03) | L | Approve the design |

### Medium (1–2 months)
| # | Action | Effort |
|---|---|---|
| 14 | Responsive images (`srcset`) site-wide, starting with /services (P-02) | M |
| 15 | Remove Unsplash/Pexels disclaimer lines; credits page; shorten CC captions (T-07, T-09) | S |
| 16 | Remove boilerplate keyword blocks; plain-language CTA copy (CN-03, CN-04) | S |
| 17 | Article template upgrade, internal links to the website-cost articles, competitor-link handling (U-03, S-03, S-06) | M |
| 18 | Standardise to two inquiry forms (T-06) | M |
| 19 | LinkedIn, Clutch and Google Business Profile; link them and add to `sameAs` (T-08) | S | 
| 20 | Vary hero layouts; reduce H1 scale on inner pages (U-01, U-02) | M |
| 21 | Fix CLS on /faq and /work; reduce unused JS (P-04, P-05) | M |
| 22 | Schema consistency on freight-broker and fleet pages (S-07) | S |
| 23 | Feature trucking content on /insights; expand the moving-features article (S-05) | S |

### Low (backlog)
| # | Action | Effort |
|---|---|---|
| 24 | Trim 6 descriptions and 2 titles; lengthen /terms description (S-08) | S |
| 25 | `noindex` /careers while there are no roles (S-09) | S |
| 26 | favicon.ico; single-hop www redirect; CSP header (P-07, P-08) | S |
| 27 | Landmark and ARIA markup fixes; dot rail on touch (A-03, A-04) | S |
| 28 | Replace clocks with call hours; footer address and socials (T-10, N-04) | S |
| 29 | Steady publishing cadence, 2 articles/month (S-10) | ongoing |

---

## 9. Quick wins (each under a day, no design approval needed)

1. Remove or relink the EliteOne card, thumbnail and mentions (3 pages).
2. Add "Trucking or moving company website" to the /contact fit-call dropdown.
3. Rewrite the 8 case-study meta descriptions so they don't assert delivery.
4. Fix the /services/product-design H1 ("…mapped before code Frame · before code").
5. ~~Fix the homepage photo credit~~ (corrected: the credit is valid; see T-09).
6. Delete the Unsplash/Pexels "Not a KRIVA client" lines (licences don't require attribution).
7. Link /insights/trucking-company-website-cost and /moving-company-website-features from the homepage websites row, /pricing and both website solution pages.
8. Trim the 6 long descriptions and 2 long titles.
9. Add favicon.ico.
10. `noindex` /careers.
11. Rename the header button to "Book a call" (shorter, and closer to what it does), or wire it to a scheduler.
12. Add `rel="nofollow"` to the 4 competitor links in the website-cost article and the 1 on /pricing.

---

## Appendix: evidence

- **Crawl data** (68 pages, per-page JSON, page text, 272 screenshots): `%TEMP%\claude\…\scratchpad\audit\out\` (session scratchpad; copy it if you want to keep it).
- **Contextual inbound links** (excluding nav and footer), lowest: /privacy 0, /terms 0, / 1, /careers 1, /industries 1, /markets 1, /insights/trucking-company-website-cost 2, /insights/moving-company-website-features 2, /insights/ai-in-product-design-2026 3, /services/graphic-design 3, /services/logo-design 3, /services/seo-digital-marketing 3, /services/web-application-design 3.
- **External links:** 23 checked. All resolve except elite-one.us (NXDOMAIN via Google DNS). Unsplash, Pexels and cascadiacollection.com return 401/403 to scripts (bot protection) but work in a browser.
- **Host checks:** http→https 308; www→apex 308; `/about/`→`/about` 308; `/kriva-about.html`→`/about` 308; `/work/fleetflow-dispatch`→`/work/shiftrail-dispatch` 308; `/solutions/fleet-management`→`…-software` 308; unknown URL → 404; `/api/inquiry` GET 405, empty POST 400 (validation, no email sent).
- **Consent:** `gtag('consent','default',{… analytics_storage: GPC ? 'denied' : 'granted'})`; Clarity tag `yjj9g3gojt` loads unconditionally.
