# KRIVA Technologies: Business Profile Kit

Ready-to-paste copy for Google Business Profile, Clutch, GoodFirms, LinkedIn, and Crunchbase.

**Why this matters:** searching "KRIVA Technologies" currently returns only *other* companies. Google has no external confirmation that KRIVA exists. Consistent profiles on trusted directories are the fastest way to fix that, and they are a prerequisite for ranking on competitive commercial terms.

Every fact below comes from the live website. Anything marked **[CONFIRM]** was not on the site and must be filled in by you. Do not guess these values; inconsistent details across profiles hurt more than missing ones.

---

## 1. Canonical business details (use identically everywhere)

| Field | Value |
|---|---|
| Business name | **KRIVA Technologies** (always the full name; see §7 on the name collision) |
| Website | https://krivatechnologies.com |
| Email | hello@krivatechnologies.com |
| City / region / country | Ahmedabad, Gujarat, India |
| Street address and postcode | **[CONFIRM]** (required for Google Business Profile verification) |
| Phone | **[CONFIRM]** (the site lists none; use one number everywhere if you add it) |
| Founded | 2025 |
| Team size | **[CONFIRM]** (the site says "small in-house team" only) |
| Markets served | United States, United Kingdom, United Arab Emirates, Canada, Australia |
| Delivery model | In-house design and engineering, no subcontracting, remote-first |
| Pricing model | Fixed-scope projects, sprints, or monthly retainers, scoped after a 1–2 week discovery |
| Min. project size / hourly rate | **[CONFIRM]** (Clutch and GoodFirms ask; the contact form's budget bands are not a published rate) |

Write the address in exactly the same format on every platform.

---

## 2. Descriptions

**Tagline (≤120 characters)**
> Custom dispatch software, B2B SaaS, and QuickBooks & Xero integrations, designed and built by one in-house team.

**Short (≤250 characters, for GBP and directory summaries)**
> KRIVA Technologies designs and builds custom trucking dispatch software, B2B SaaS products, and QuickBooks and Xero integrations for operators in the US, UK, UAE, Canada, and Australia. In-house design and engineering, weekly demos, code you own.

**Long (≈150 words, for Clutch, GoodFirms, LinkedIn About, Crunchbase)**
> KRIVA Technologies is a product design and software engineering company based in Ahmedabad, India, working with operators and SaaS teams in the United States, United Kingdom, UAE, Canada, and Australia.
>
> We build three things: dispatch CRMs, fleet dashboards, and driver apps for trucking, auto-transport, and logistics companies, usually beside an existing TMS rather than replacing it; B2B SaaS products, from MVP scope through onboarding and admin panels; and QuickBooks Online and Xero integrations with reconciliation views finance teams can trust at month end.
>
> Design and engineering stay in-house, with no subcontracting. Every engagement starts with a one-to-two-week discovery, then runs in phases with a weekly demo on a live URL and sign-off before the next phase. Clients own the code, designs, and documentation at handoff.
>
> The team brings nine years of product software experience; the company launched in 2025.

---

## 3. Services (for service lists and focus percentages)

Primary:
1. Custom dispatch CRM and TMS development
2. B2B SaaS product design and development
3. QuickBooks and Xero integration development
4. Fleet and operations dashboard design
5. Driver and field mobile app development
6. API integration and workflow automation

Secondary: UI/UX design, web development, UX research, design systems, no-code / low-code MVPs, branding.

Clutch and GoodFirms ask for service-focus percentages. **[CONFIRM]** them from your actual revenue mix; the site does not state them.

Industries: Transportation and logistics, Software / SaaS, Financial services (accounting integrations).

---

## 4. Platform notes

### Google Business Profile
- Primary category: **Software company**. Do not add categories for services you don't sell.
- If clients don't visit your office, set it up as a **service-area business** and hide the address. Google still needs the address for verification.
- Service areas: you can add countries, but GBP is mostly local, so expect little international lead flow from it. Its main value is entity confirmation.
- Website link: `https://krivatechnologies.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- Add the services from §3, the short description, and real photos of the team or office. No stock images.

### Clutch
- Clutch rankings depend on **verified client reviews**, which Clutch collects by interviewing your clients. Ask 3–5 recent clients first; a profile without reviews has little effect.
- Portfolio: add the 8 case studies from /work. Their visuals are labelled "illustrative reconstruction" on the site; keep that label on Clutch as well.
- Website link: `https://krivatechnologies.com/?utm_source=clutch&utm_medium=referral&utm_campaign=profile`

### GoodFirms
- Same approach as Clutch: profile, portfolio, then reviews.
- Website link: `https://krivatechnologies.com/?utm_source=goodfirms&utm_medium=referral&utm_campaign=profile`

### LinkedIn company page
- Claim the URL **`linkedin.com/company/kriva-technologies`**. The site previously linked there, but the page did not exist, so those links were removed.
- Industry: Software Development. Company size: **[CONFIRM]**. Headquarters: Ahmedabad.
- Use the tagline and the long description. Ask the team to list KRIVA as their employer so the page shows real people.
- Website link: `https://krivatechnologies.com/?utm_source=linkedin&utm_medium=social&utm_campaign=company_page`
- Content: repost each new guide from /insights with a 2–3 line summary.

### Crunchbase
- Organisation type: company. Founded 2025. HQ: Ahmedabad, Gujarat, India.
- Categories: Software, SaaS, Logistics, Information Technology.
- Use the long description and the plain website URL (no UTM).

---

## 5. After each profile goes live: update the website

The site's Organization schema `sameAs` currently lists only Instagram, because every other linked profile returned 404. Once a profile is **live and public**, add its URL in these places:

1. `shared/site.js`: the `SAME_AS` array (used by generators).
2. `apply_chrome.cjs`: the footer `fsocial` block (LinkedIn only; directories don't belong in the footer).
3. Every `kriva-*.html` page and `404.html`: the `"sameAs"` array in JSON-LD, plus the footer link for LinkedIn. A one-line script can do this; ask for it when you have the URLs.
4. `llms.txt` and `llms-full.txt`: the Contact section.

Never add a URL before the profile actually exists.

---

## 6. Review requests (template)

> Hi [Name], thanks again for working with us on [project]. We're building our profile on Clutch, and a short review from you would help other operators decide whether we're a fit. Clutch runs a 15-minute phone or online interview, so there's nothing to write. Would you be open to it? If not, no problem at all.

Only ask clients whose projects are complete and who were satisfied. Never offer incentives for reviews; Clutch and Google both prohibit it.

---

## 7. Name collision: important

Search results show another company called **"Kriva"**, a performance-marketing agency operating under Hostkro Technologies LLP. To avoid being merged with it in search results and directories:
- Always use **"KRIVA Technologies"**, never just "Kriva".
- Always include the website `krivatechnologies.com` and the Ahmedabad location.
- If a directory has already merged the two, use its "claim" or "report incorrect info" process.
