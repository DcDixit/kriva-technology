# Privacy policy and terms: wording for legal review

**Status:** DRAFT for KRIVA's legal reviewer. **Not published and not in any commit.** Nothing on the site changes until the reviewer approves the wording.
**Prepared:** 27 November 2026, against the `migrate/old-template-clean` branch (same privacy and terms text as live, apart from a hidden HTML comment).
**How to read this:** each item quotes the **current visible wording** exactly, says what is wrong or missing, and gives **suggested copy**. `[CHECK: …]` marks a fact KRIVA must confirm in its own accounts (GA4, Clarity) before publishing. The suggested copy is a starting point for the reviewer, not legal advice.

What the site actually does today (verified in code and by tests, 27 Nov):
- A banner is shown to every visitor worldwide. GA4 and Microsoft Clarity do not load until the visitor clicks **Accept**. **Reject** keeps them off.
- The choice is stored in the visitor's browser (`localStorage`, key `kriva_consent`) and is remembered across pages and visits.
- A **"Cookie settings"** link in every page footer reopens the banner. Switching to Reject turns GA4 and Clarity off, deletes their cookies (`_ga`, `_ga_*`, `_gid`, `_gat*`, `_clck`, `_clsk`) and reloads the page.
- If the browser sends Global Privacy Control (GPC), GA4 and Clarity never load, even after Accept.
- GA4 runs with Google signals and ad personalisation off. Ad storage stays denied.
- Forms collect: name, email, company, phone (on 24 pages), company website, project type, service of interest, market/country (contact page), budget, timeline, project details, and the page the form was sent from.

---

## A. Privacy policy (`/privacy`)

### A1. "Information we collect": incomplete field list and cookie list

**Current:**
> When you submit our contact form, we collect your name, email address, company name, project details, budget range, timeline, and any message you provide. We use Google Analytics 4 to collect page URLs, referrers, device and browser type, and interaction events such as button clicks and form submissions. Analytics cookies may include _ga and _ga_*. Microsoft Clarity may record how a session moves through a page. We do not collect advertising identifiers or use ads personalization.

**Issues:** phone, company website, market/country, service of interest and the submitting page are collected but not listed. Clarity's cookies are not named. The text does not say analytics runs only after consent.

**Suggested:**
> **Forms.** When you send us an inquiry, we collect your name, email address, company name and, where the form asks for them, your phone number, company website, the country or market you work in, the service you are interested in, project type, budget range, timeline and project details. We also record which page of our site you sent the form from.
>
> **Analytics, only if you accept.** If you click Accept on our cookie banner, we use Google Analytics 4 to measure page views, referrers, device and browser type, approximate location, and interactions such as button clicks and form submissions. We also use Microsoft Clarity, which records how a visit moves through a page (clicks, scrolling and mouse movement) and produces heatmaps. [CHECK: confirm in the Clarity project settings that masking is set to "Balanced" or "Strict" so typed text is not captured.] These tools set first-party cookies: `_ga` and `_ga_*` (Google Analytics) and `_clck` and `_clsk` (Clarity). If you do not accept, these tools are not loaded and these cookies are not set. We do not use advertising cookies, advertising identifiers or ad personalisation.

### A2. New section: cookies and your choices (missing entirely)

The policy never mentions the banner, the **Cookie settings** link or how to withdraw consent. Suggested new section, placed after "How we use information":

> ## Cookies and your choices
> When you first visit, a banner asks whether you accept analytics. Google Analytics and Microsoft Clarity stay off until you click **Accept**. **Reject** keeps them off. Both buttons are equally available, and you can keep using the whole site either way.
>
> You can change your mind at any time: select **Cookie settings** at the bottom of any page and choose again. If you withdraw consent, we switch analytics off, delete the analytics cookies listed above and reload the page. Withdrawing does not affect processing that happened before.
>
> Your choice is stored in your browser on this device. Clearing your browser data, or using another browser or device, shows the banner again.
>
> If your browser sends a Global Privacy Control signal, analytics and session recording stay off even if you click Accept.

**For the reviewer:** the choice is recorded only in the visitor's browser, with no server-side consent log. Confirm this is sufficient for KRIVA's accountability obligations.

### A3. "Third-party services": state the consent condition and the transfer basis

**Current (end of section):**
> We use Google Analytics 4 (Google LLC) to measure site usage and Microsoft Clarity (Microsoft) for session recordings. Links to third-party sites are governed by those sites' policies. If your browser sends Global Privacy Control, we disable analytics storage and do not load session recording.

**Suggested:**
> If you accept analytics, we use Google Analytics 4 (Google LLC / Google Ireland Limited) to measure site usage and Microsoft Clarity (Microsoft Corporation) for session recordings and heatmaps. Links to third-party sites are governed by those sites' policies. If your browser sends Global Privacy Control, analytics and session recording are never loaded.

**For the reviewer:** the section already says data may be processed "in other countries, including the United States" and that the team is in India, but it names no transfer mechanism (EU SCCs, UK IDTA/Addendum, or the EU-US Data Privacy Framework certifications of Google and Microsoft).

### A4. "Data retention": no periods

**Current:**
> We retain inquiry records for as long as needed to respond, maintain business records, and comply with legal obligations. You may request deletion of marketing-related data where applicable law allows.

**Suggested:**
> We keep inquiry emails for [CHECK: e.g. 24 months after our last contact] unless they become part of a client engagement, in which case the engagement agreement applies. Google Analytics keeps event-level data for [CHECK: GA4 Admin → Data collection and modification → Data retention: 2 or 14 months]. Microsoft Clarity keeps session recordings for [CHECK: about 30 days per Microsoft's documentation] and aggregated heatmap data for [CHECK: about 13 months]. Analytics cookies expire after [CHECK: `_ga` and `_ga_*` up to 2 years; `_clck` 1 year; `_clsk` 1 day] or when you withdraw consent.

### A5. Lawful basis is not stated (UK GDPR and EU GDPR)

**For the reviewer:** no lawful basis is given per purpose. Typical position, to confirm: **consent** for analytics and session recording (and for the cookies under PECR and ePrivacy/TDDDG); **steps prior to a contract / legitimate interests** for answering inquiries; **legal obligation** for business records.

### A6. EU / Germany: no EU GDPR section

**Current:** only "Your rights (UK GDPR)" and "California residents (CCPA)" exist. The site now has a Germany market page (`/markets/de`, on this branch).

**Suggested new section (for review):**
> ## Your rights (EU GDPR)
> If EU data protection law applies to you, you can ask KRIVA Technologies for access to your personal data, and for correction, deletion, restriction or portability, and you can object to processing based on legitimate interests. Where we rely on consent, for analytics, you can withdraw it at any time through **Cookie settings**. You can also complain to your local data protection authority. Email hello@krivatechnologies.com to make a request.

**For the reviewer:** whether KRIVA, based outside the EU and now targeting German customers, needs an EU representative under GDPR Art. 27.

### A7. Small-print box at the bottom of the privacy page

**Current:**
> This site uses Google Analytics 4 first-party cookies for usage measurement. Advertising cookies and ads personalization are off. Microsoft Clarity may record sessions to see how pages are used. If your browser sends Global Privacy Control, analytics storage and session recording stay off. Contact form data is emailed to us directly.

**Suggested:**
> Google Analytics 4 and Microsoft Clarity run only if you accept them in the cookie banner. Change your choice any time under Cookie settings at the bottom of the page. Advertising cookies and ad personalisation are off. With Global Privacy Control on, analytics and session recording stay off. Contact form data is emailed to us directly.

### A8. Missing entity details (unchanged open item)

"Data controller: KRIVA Technologies, Ahmedabad, Gujarat, India" has no legal entity type and no full registered address. [CHECK: legal entity name and registered address.]

### A9. Date

Set "Last updated" to the date the reviewed text is published.

---

## B. Terms & Conditions (`/terms`)

### B1. Small-print box at the bottom of the terms page: omits Clarity and consent

**Current:**
> This site uses Google Analytics 4 first-party cookies to measure usage. Advertising cookies are not used. Details are in the privacy policy. Scheduling embed cookies, if enabled, are governed by the scheduler provider's terms.

**Suggested:**
> With your consent, this site uses Google Analytics 4 and Microsoft Clarity to measure and improve how pages are used. You can change your choice any time under Cookie settings at the bottom of the page. Advertising cookies are not used. Details are in the privacy policy. Scheduling embed cookies, if enabled, are governed by the scheduler provider's terms.

### B2. Date

"Last updated: August 2026" predates the consent banner. Update it when B1 is published.

### B3. No other tracking wording

The main terms sections (Agreement, Website use, Professional services, IP, Confidentiality, Disclaimers, Liability, Governing law, Contact) contain no tracking or cookie statements, so no other changes are needed for consent.

---

## C. Banner text (no change proposed, listed for completeness)

**Current:** "Analytics stays off until you choose. Accept allows Google Analytics and Clarity. Reject keeps them off. Privacy"
**For the reviewer:** (1) whether the banner should say Clarity records sessions; (2) for GPC visitors, Accept does nothing. Optional extra line: "Your browser's privacy signal keeps analytics off."
