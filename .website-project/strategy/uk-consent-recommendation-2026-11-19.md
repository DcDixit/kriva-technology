# Cookie consent for UK (and EEA) visitors: recommendation

Status: **recommendation only. Nothing is implemented; this waits for the owner's approval.** Prepared 2026-11-19. This is a technical and compliance summary, not legal advice. Have a UK privacy adviser confirm the final copy and setup.

## 1. Where the site stands today

| Item | Today |
|---|---|
| What stores or reads data on visitors' devices | **Only two tools: Google Analytics 4 and Microsoft Clarity.** Fonts are self-hosted, there are no video or map embeds, Instagram is a plain link, and Web3Forms runs only when someone submits a form. |
| GA4 | `analytics_storage` defaults to **granted** for everyone (denied only when the browser sends Global Privacy Control). Ads storage and personalisation are denied, and Google Signals is off. |
| Clarity | Loads for everyone (except GPC browsers). It records sessions and heatmaps. |
| Banner | None. |
| Clarity's own enforcement | "Starting October 31, 2025, Clarity begins enforcing consent signal requirements for page visits originating from the EEA, UK, and Switzerland." Without consent it runs "in no-consent mode (with limited tracking)", with no cookies and a new ID on every page view. Because the site sends no consent signal, UK and EEA visitors are **probably already** recorded in this limited mode. |

## 2. What the rules say (primary sources)

**UK: PECR as amended by the Data (Use and Access) Act 2025, plus ICO guidance**
- The Act added a **"statistical purposes" exception**: no consent is needed when the *sole* purpose is collecting statistics "about how the service is used with a view to making improvements to the service". Secondary sources report that it took effect on 5 Feb 2026 and that the ICO's final guidance was published on 29 Apr 2026; the ICO page itself gives no date.
- Even then, the site must give "clear and comprehensive information" and "a simple means of objecting, free of charge", and "must not solely rely on browser settings".
- **Third-party analytics can qualify only if** the provider acts as a **processor** (not a joint controller), uses the data only to help improve your site, and does **not link it with other information it holds**. Using it for anything else, such as advertising, needs consent.
- The exception "does not allow you to monitor or track individual visitors". The ICO says consent is needed for "logs or recordings of individual visitors to your website and the actions they took". **That is Clarity's session recording, so Clarity needs consent.**
- **GA4 is uncertain.** Google's standard terms let it use some data for its own purposes (service improvement, benchmarking if data sharing is on), and GA4 assigns per-visitor IDs. Relying on the exception for GA4 would need a legal sign-off and a review of the GA4 data-sharing settings. **The safe basis is consent.**
- **Banner rules** (ICO, "How do we manage consent in practice"):
  - Refusing must be as easy as accepting, and the ICO's good example gives Accept, Reject and Customise equal weight.
  - Nothing non-exempt may be set before a positive action, and "silence or inactivity doesn't qualify".
  - No pre-ticked or pre-enabled options, and no bundling consent into terms.
  - Third parties must be named.
  - Withdrawing must be as easy as giving consent, at any time; on withdrawal, stop processing and remove what was set.
  - Don't ask again repeatedly after a refusal; six months is "a suitable timeframe".
- PECR fines now reach UK GDPR levels (reported as up to £17.5m or 4% of global turnover).

**Other markets (brief; not a full legal review)**
- **EEA and Switzerland** (GA4 showed visitors from Germany and the Netherlands): GDPR and ePrivacy require consent for analytics cookies, with no equivalent of the UK exception. Treat them the same as the UK.
- **US:** no opt-in rule for analytics. State privacy laws are opt-out based, and the site already honours GPC.
- **Canada:** PIPEDA generally allows implied consent with clear notice. Quebec's Law 25 requires technologies that identify, locate or profile people to be off by default; a notice-plus-opt-out approach is low risk for this site.
- **Australia:** the Privacy Act has no cookie-banner rule; privacy-policy notice is enough today.
- **UAE:** PDPL is consent-based in principle. Not assessed in depth.

## 3. Options

| | A. Lightweight first-party banner, UK + EEA + CH only (**recommended**) | B. Third-party consent platform (CookieYes, Cookiebot, Termly) | C. Use the UK statistics exception for GA4; consent only for Clarity | D. Do nothing |
|---|---|---|---|---|
| How it works | Small KRIVA-built banner (about 3–4 KB, no vendor script). For visitors from the UK, EEA and Switzerland, GA4 and Clarity stay off until "Accept". Everyone else is unchanged. | Vendor script with auto cookie scanning, geo rules and a hosted consent log | GA4 runs with an opt-out toggle and notice; Clarity waits for consent | Keep the current setup |
| Compliance | Meets the ICO checklist above; most conservative | Same, if configured correctly | **Uncertain for GA4** (processor and "own purposes" tests) | Not compliant for UK and EEA visitors |
| Effect on US/CA/AU/UAE data | None | None (with geo rules) | None | None |
| Effect on UK/EEA data | Visitors who decline are not measured | Same | GA4 keeps most UK data | n/a |
| Design | Built with existing KDS tokens; matches the site | Vendor look, limited styling | Toggle plus Clarity prompt | n/a |
| Cost and weight | No fee; small script | About $10–$50 a month; heavier script; another processor | No fee | n/a |
| When it's the better choice | Now: two tools, no advertising | If you start Google Ads or Microsoft Ads remarketing in the UK/EEA (Google requires a certified platform for that) | Only with written legal sign-off | Not recommended |

## 4. Recommended design (Option A)

**Who sees it.** Visitors whose country is UK, EEA or Switzerland. Two ways to detect that (decision needed):
1. **(Recommended)** A tiny Vercel Routing Middleware reads Vercel's `x-vercel-ip-country` header and sets a short-lived, strictly necessary `kriva_region` cookie on HTML responses. The head snippet reads it before GA4 or Clarity load. Server-side and accurate; small edge cost.
2. **No-backend fallback:** use the browser time zone (`Europe/*`, plus `Atlantic/Reykjavik` and similar). Free and instant, but misses VPN users and travellers. Use it only as a fail-safe when the cookie is missing.

**Behaviour**
- Before a choice: GA4 consent stays `denied` and no GA4 config call is made (Google Consent Mode "basic", so no cookieless pings), and Clarity is not loaded. Advanced mode is avoided because the ICO's view on cookieless pings is not settled.
- **Accept analytics:** `gtag('consent','update',{analytics_storage:'granted'})`, then GA4 config and page view; load Clarity and call `clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'granted'})`.
- **Reject:** nothing loads. Ask again only after 6 months.
- **Withdraw** (a "Cookie settings" link in every footer): consent is set to denied, `_ga*` cookies are deleted, `clarity('consent', false)` runs, and the choice is saved.
- The choice is stored in `localStorage` (`kriva_consent`, with version and date). Re-confirm accepted choices after 12 months.
- Ads storage and personalisation stay denied for everyone (as today).
- GPC and `?kriva_internal=1` keep working as they do now.

**First layer (draft copy for review)**
> We use Google Analytics and Microsoft Clarity to see how visitors use this site so we can improve it. Clarity can record how you move around a page. Nothing is used for advertising. [Cookie details](/privacy#cookies)
> **[Accept analytics]**  **[Reject]**  (same size, same style)

- Non-blocking bottom sheet (not a cookie wall), keyboard-accessible, with focus kept inside while open and an `aria-live` announcement.
- Must not cover the "Book a call" button on mobile.

**Also needed**
- /privacy: a "Cookies and analytics" section that names GA4 (Google) and Clarity (Microsoft), their purpose, retention, international transfer, and how to withdraw.

**Expected effect**
- UK and EEA visitors who decline won't appear in GA4. Read UK trends against that new baseline, and count leads from the inbox (every form still emails `hello@`), not only from `generate_lead`.

**Effort and files (estimate)**
- About 1 day to build and test.
- New: `shared/consent.js`, `shared/consent.css`, and `middleware.js` if detection option 1 is chosen.
- Changed: the GA and Clarity block in `apply_chrome.cjs` (all 69 pages), the footer link, `kriva-privacy.html`.
- Tests: tracking tests per region (UK/US/EEA, accept, reject, withdraw), the existing form, route and link suites, visual checks of the banner on mobile and desktop, and a check that no `_ga` or `_clck` cookie exists before Accept.

## 5. Decisions needed from you

1. Approve Option A (or choose B, C or D).
2. Country detection: middleware (recommended) or time zone only.
3. Cover EEA and Switzerland as well as the UK (recommended: yes).
4. Approve or edit the banner copy and the /privacy section.
5. Whether a UK privacy adviser reviews before go-live (recommended).

## Sources
- ICO, What are the exceptions? https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/
- ICO, How do we manage consent in practice? https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/
- Microsoft, Clarity Consent API v2: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
- Commencement and fine levels (secondary): A&O Shearman https://www.aoshearman.com/en/insights/ao-shearman-on-data/ico-sets-out-approach-to-storage-access-and-online-tracking ; Osborne Clarke https://marketinglaw.osborneclarke.com/advertising-regulation/new-exceptions-explained-in-ico-final-guidance-on-storage-and-access-technologies-could-online-advertising-be-next/ ; Practical Law https://uk.practicallaw.thomsonreuters.com/w-049-0580
