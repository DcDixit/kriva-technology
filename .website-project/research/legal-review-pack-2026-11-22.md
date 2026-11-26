# KRIVA website: legal review pack (22 Nov 2026)

**For:** the KRIVA owner and the professional legal reviewer of `/privacy` and `/terms`.
**What this is:** the facts about what the website actually does, the company inputs still missing, and every point where the live legal pages disagree with the live site.
**What this is not:** legal advice or proposed legal wording. No clause here has been drafted, and nothing on the live pages has been changed. Where vendor behaviour is described (cookie lifetimes, retention defaults), confirm it against the vendor's current documentation or account settings.

Pages under review: https://krivatechnologies.com/privacy ("Last updated: November 2026") and https://krivatechnologies.com/terms ("Last updated: August 2026").

---

## 1. Missing company information (owner to supply)

| # | Input | Where it is needed | Current state |
|---|---|---|---|
| L1 | Legal entity name and type (e.g. sole proprietorship, LLP, private limited company) | Privacy s9 "Data controller"; Terms "Agreement"; Organization structured data on all 68 pages | Only the trading name "KRIVA Technologies" appears |
| L2 | Registered street address | Same | Only "Ahmedabad, Gujarat, India" |
| L3 | Company / registration number (and GSTIN if it should be shown) | Same | None |
| L4 | Business phone (optional) | Structured data, contact page | None published |

## 2. Legal decisions and inputs (reviewer, with owner)

| # | Question | Context from the site |
|---|---|---|
| L5 | Lawful basis for each purpose: answering inquiries, the confirmation email, analytics (GA4), session recording (Clarity) | Analytics and recording now run only after the visitor clicks Accept (section 4) |
| L6 | Is a UK representative and/or EU representative required? | KRIVA is based in India; the site markets to the UK (/markets/uk), and EU visitors can reach it |
| L7 | International transfer mechanism (e.g. UK IDTA or addendum, EU SCCs) | Processors in section 6; the team is in India |
| L8 | Retention periods for inquiry emails, GA4 data and Clarity recordings | Section 5 lists what is known |
| L9 | Does CCPA/CPRA apply (thresholds)? If so, what notices are required? | Privacy s11 (added 22 Nov, unreviewed) makes California statements; ads and data sale are off (section 3) |
| L10 | Position under India's DPDP Act 2023 | Not mentioned anywhere |
| L11 | Reviewer name and contact | — |

---

## 3. What the site does with personal data (facts, 22 Nov 2026)

### 3a. Forms and fields

All forms post to `/api/inquiry` (a Vercel serverless function). It sends the inquiry by email through Google Workspace SMTP, from the account `hello@krivatechnologies.com`, to the studio inbox set in the Vercel variable `INQUIRY_TO`.

| Form | Where | Fields (* required) | Hidden fields sent |
|---|---|---|---|
| Fit-call form | /contact#book | name*, email*, company, project type*, details*, timeline | inquiry_type, page, _subject |
| Project brief | /contact#brief | name*, email*, company, website URL, project type*, primary market*, service interest, budget, timeline*, details* | inquiry_type, page, _subject |
| Page inquiry | 64 pages (services, solutions, markets, insights, about…) | name*, email*, company, details*; **phone** on 23 of these pages | inquiry_type, page, service |
| Guide download | /insights/build-vs-buy-tms, **switched off** (no PDF configured) | email* | inquiry_type = lead_magnet |

- Every form has a hidden "honeypot" field (`website_hp`) that real visitors never see or fill. Submissions that fill it are dropped silently.
- **Confirmation email:** after a successful send, the submitter gets an automatic confirmation email from "KRIVA Technologies", with replies going to hello@krivatechnologies.com.
- **Backup channel:** the code can fall back to Web3Forms from the visitor's browser, but no Web3Forms key is configured in production, so this path is not used today.
- **No privacy notice at the point of collection:** no form links to /privacy near its submit button.
- Form data is not stored in a database by the site. It exists in the studio inbox and the submitter's confirmation email, and transiently in Vercel function processing.

### 3b. Analytics and session recording

| Item | Fact |
|---|---|
| Tools | Google Analytics 4 (property `G-FHG12KTF8C`) and Microsoft Clarity (project `yjj9g3gojt`). No other analytics, tag manager, ad pixel, chat widget, embed or third-party font in the page HTML. |
| When they load | **Only after the visitor clicks Accept** in the banner. Before that, no request goes to Google or Microsoft. |
| Google Consent Mode defaults | ad_storage, ad_user_data, ad_personalization and analytics_storage all **denied**; changed to analytics granted only on Accept |
| Advertising | Google signals and ad personalisation are off in the GA4 configuration |
| Global Privacy Control | If the browser sends GPC, GA4 and Clarity never load, even after Accept |
| Not tracked at all | Automated browsers and known bots, local and preview sites (live on the site after the pending change in section 4), and devices the owner marks internal with `?kriva_internal=1` |
| GA4 events (after Accept) | page_view, generate_lead (after a confirmed send), form_start, form_submit, cta_click, contact_click, email_click, phone_click, select_content, page_not_found, lead_magnet_submit |
| Clarity | Session recording and heatmaps of how pages are used |

### 3c. Cookies and browser storage

| Name | Type | Set by | Purpose | Lifetime | Before consent? |
|---|---|---|---|---|---|
| `_ga` | Cookie (first-party) | GA4 | Distinguishes visitors | Vendor default about 2 years (confirm) | No |
| `_ga_FHG12KTF8C` | Cookie (first-party) | GA4 | Session state | Vendor default about 2 years (confirm) | No |
| `_clck` | Cookie (first-party) | Clarity | Visitor ID and settings | Vendor default about 1 year (confirm) | No |
| `_clsk` | Cookie (first-party) | Clarity | Links page views into one recording | Vendor default about 1 day (confirm) | No |
| Clarity cookies on `clarity.ms` (e.g. MUID) | Cookie (third-party) | Microsoft | Microsoft's own | Vendor-defined | No |
| `kriva_consent` | Browser localStorage | KRIVA | Remembers Accept or Reject | Until cleared by the visitor | Set when the visitor chooses |
| `kriva_internal` | Browser localStorage | KRIVA | Marks the owner's own devices as not tracked | Until cleared | Only via `?kriva_internal=1` |
| `kriva_ga_lead_*` | Browser sessionStorage | KRIVA | Stops one lead being counted twice | Until the tab closes | Only used after Accept |

The site itself (Vercel hosting) sets no cookies on these pages.

---

## 4. Consent banner: how it works

**Live today (commit e52f35f, since 22 Nov 2026):**
- Shown to every visitor worldwide on first visit, at the bottom of the screen.
- Text, unchanged and itself subject to review: *"Analytics stays off until you choose. Accept allows Google Analytics and Clarity. Reject keeps them off. Privacy"*
- Two buttons, Reject and Accept. Nothing loads until Accept.
- There is no way to change the choice later, and Accept is styled more prominently (filled blue) than Reject (outline).

**Built and tested locally, not deployed (pending owner approval):**
- A **"Cookie settings"** link in the footer of every page reopens the banner at any time.
- **Reject and Accept look identical.**
- **Withdrawing** (Accept, then Reject) does four things: switches Google consent to denied, tells Clarity consent is withdrawn, deletes the GA4 and Clarity first-party cookies, and reloads the page so no tracking code keeps running.
- A stored Reject also clears any leftover analytics cookies, including cookies from before the banner existed, when analytics ran by default.
- A choice made in one browser tab applies to the visitor's other open tabs.
- Banner wording is unchanged.

---

## 5. Data retention: what is known

| Data | Where it lives | Current retention | Needs |
|---|---|---|---|
| Inquiry emails | Studio Gmail inbox (`INQUIRY_TO`); sent copy in `hello@` Sent folder | Indefinite (no deletion routine) | A period (L8) |
| Confirmation emails | Submitter's inbox; sent copy in `hello@` | Indefinite | A period (L8) |
| GA4 | Google | Set in GA4 Admin → Data settings → Data retention (2 or 14 months for event data); current value not checked | Owner to read the setting |
| Clarity | Microsoft | Vendor defaults (recordings are kept for a limited period, heatmaps longer); confirm in Clarity settings and documentation | Confirm |
| Server logs | Vercel | Platform retention; no inquiry logs were found for the last 7–14 days | Confirm |

The privacy policy currently says only "as long as needed".

## 6. Processors and international transfers

| Provider | Role | Data | Likely location |
|---|---|---|---|
| Vercel Inc. | Hosting, serverless form function | Page requests (IP, user agent), form contents in transit | US, plus global edge network |
| Google LLC (Workspace / Gmail) | Email delivery and mailbox | Form contents, submitter email | US / global |
| Google LLC (Analytics 4) | Analytics, after consent | Usage events, device and browser data, cookie IDs | US / global |
| Microsoft Corp. (Clarity) | Session recording, after consent | Page interactions, device data, cookie IDs | US / global |
| Web3Forms | Backup email route | Not active (no key configured) | — |
| KRIVA team | Reads inquiries | Form contents | India |

The privacy page says providers "may process data in other countries, including the United States", and that the team is in India. It names no transfer mechanism.

---

## 7. Factual inconsistencies: legal pages vs the live site

| # | Page | The page says | The site actually does | Severity |
|---|---|---|---|---|
| F1 | Privacy (body and bottom card) | Analytics runs; the only opt-out mentioned is Global Privacy Control | A consent banner: nothing loads until Accept. The banner is not mentioned. | High |
| F2 | Privacy | No way to change a choice is described | None live yet; the Cookie settings control is built but not deployed (section 4) | High |
| F3 | Privacy "Information we collect" | Name, email, company, project details, budget, timeline | Also collects phone (23 pages), website URL, project type, primary market and service interest, plus the page URL and inquiry type (hidden) | Medium |
| F4 | Privacy | Not mentioned | Every submitter gets a confirmation email | Low |
| F5 | Privacy | Cookies named: `_ga`, `_ga_*` | Clarity cookies (`_clck`, `_clsk`) not named; browser storage (`kriva_consent`, `kriva_internal`, session lead key) not mentioned | Medium |
| F6 | Privacy "Third-party services" | The browser may send the form through Web3Forms as a backup | No Web3Forms key in production, so the backup never runs | Low (over-discloses) |
| F7 | Privacy s9 to s11 | Data controller; UK GDPR rights; California (CCPA) | Added 22 Nov 2026 (commit e52f35f) without legal review; live | High |
| F8 | Privacy and forms | No privacy notice at the point of collection | No form links to /privacy near its submit button | Medium |
| F9 | Terms (cookie note) | "Google Analytics 4 first-party cookies… Advertising cookies are not used" | Clarity session recording and the consent banner are not mentioned; the privacy page does mention Clarity | Medium |
| F10 | Terms (cookie note) | "Scheduling embed cookies, if enabled" | No scheduler embedded (the booking-embed switch is empty). Conditional wording, so not false. | Low |
| F11 | Terms | "Last updated: August 2026" | Privacy says November 2026; set after review | Low |
| F12 | Terms "Disclaimers" | "Case studies may describe representative work" | Case-study search descriptions state delivery as fact (e.g. ShiftRail "modernized a US trucking dispatch CRM"); positioning is being decided separately | Medium |
| F13 | Both | No legal entity, address or registration number | See section 1 | High |

Confirmed consistent (no action): no advertising cookies; Google signals and ad personalisation off; GPC honoured; no third-party fonts, embeds or scripts in the page HTML; email through Google Workspace; hosting on Vercel; "We do not sell personal data".

---

## 8. Sections that need professional review

| Page | Section | Why |
|---|---|---|
| Privacy | s1 Overview, s2 Information we collect, s3 How we use information | F3, F4, F5; lawful basis (L5) |
| Privacy | s4 Third-party services | F6; transfers (L7) |
| Privacy | s5 Data retention | L8 |
| Privacy | s6 Your rights, s7 Security, s8 Contact | Generic; jurisdiction coverage (L6, L10) |
| Privacy | **s9 Data controller, s10 Your rights (UK GDPR), s11 California residents (CCPA)** | Added 22 Nov without review (F7); L1–L3, L6, L9 |
| Privacy | Bottom summary card (analytics, Clarity, GPC) | F1 |
| Terms | Agreement, Governing law, Limitation of liability | Entity (L1–L3); jurisdiction for US/UK/UAE/CA/AU clients |
| Terms | Disclaimers (case studies) | F12 |
| Terms | Cookie note | F9, F10 |
| Banner | Banner text | Wording, and whether the choice explanation is sufficient |
| Forms | Notice at the point of collection | F8 |

Owner's rule until the reviewer approves: no legal clause is written, added or published. Factual fixes (F3–F6, F9–F11) also wait for the reviewer, because they change legal text.
