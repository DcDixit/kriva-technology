# GA4 tracking and form test checklist

Property `G-FHG12KTF8C` (GA4 property 552202890). Prepared 2026-11-15 from the Oct 18 to Nov 14 reports.

Why this exists: GA4 showed 7 key events but only 3 leads, and about 30 of 73 users came from data-centre cities (Ashburn, Council Bluffs) or the office (Ahmedabad).

---

## 1. Fix key events (GA4 Admin, about 5 minutes)

The site sends two events for each successful inquiry: `generate_lead` and `form_submit`. Only `generate_lead` should count as a key event. (`contact_form_submit`, an exact duplicate of `generate_lead`, was removed from the code on 2026-11-19. The 28 days to Nov 18 showed 9 key events and 0 qualified leads, which fits 3 submissions counted 3 times each.)

- [ ] Go to **Admin → Data display → Events**.
- [ ] Find `generate_lead` and make sure **Mark as key event** is **on**.
- [ ] Find `form_submit` and turn **Mark as key event** **off**.
- [ ] Find `contact_form_submit` and turn **Mark as key event** **off** (the site no longer sends it; this stops old data being counted in key-event totals).
- [ ] Check every other event in the list (the site also sends `form_start`, `cta_click`, `contact_click`, `email_click`, `phone_click`, `select_content` and `page_not_found`). Turn **Mark as key event** off for all of them except `generate_lead`.
- [ ] Go to **Admin → Data streams → (web stream) → Enhanced measurement → gear icon** and turn **Form interactions** **off**. Otherwise GA4 sends its own `form_submit` on every submit click, including failed sends.
- [ ] Optional: on `generate_lead`, set the key event value to a default of **1 USD**. The site already sends `value: 1, currency: USD`.

Note: the change applies from now on. Past reports keep the inflated count.

## 2. Filter internal traffic

### 2a. Define your office IP addresses
- [ ] From the office network, open a "what is my IP" page and write down the IPv4 address. Also note the IPv6 address if one is shown.
- [ ] Repeat on any home or VPN connection the team uses to browse the site.
- [ ] Go to **Admin → Data streams → (web stream) → Configure tag settings → Show more → Define internal traffic → Create**.
  - Rule name: `KRIVA office`
  - `traffic_type` value: `internal` (leave the default)
  - Match type: **IP address equals** (or **begins with** for a range); add each address.
- [ ] Save.

If the office IP changes often (dynamic broadband), a better option is to ask the ISP for a static IP, or use the browser opt-out described in 2c.

### 2b. Turn the filter on
- [ ] Go to **Admin → Data collection and modification → Data filters**. The **Internal Traffic** filter appears in the **Testing** state.
- [ ] Leave it in Testing for 1 to 2 days. In **Reports → Realtime**, add a comparison on the dimension **Test data filter name = Internal Traffic** and confirm your own visits match it.
- [ ] Switch the filter to **Active**. This is permanent: filtered hits are never recorded. Make sure the rule is correct before you switch it on.

### 2c. People who browse from changing IPs (one link per browser)
Since 2026-11-19 the site has its own opt-out. On every browser and phone the team uses, open this link once:

`https://krivatechnologies.com/?kriva_internal=1`

That browser then sends nothing to GA4 or Clarity, on every page, until you open `?kriva_internal=0`. It is stored in the browser, so clearing site data or using a private window resets it. Add `?ga_debug=1` to a URL when you need to test tracking from a marked browser; those hits are flagged as debug traffic.

- [ ] Open the link on each office machine, laptop and phone.
- [ ] Alternative: Google's **Analytics Opt-out** add-on, or the browser's Global Privacy Control setting (both are respected too).

### 2d. Reporting by target market (no exclusion of real visitors)
India is not a target market, but Indian visitors are not excluded from GA4 or Clarity: raw data stays complete, and the office is removed by 2a-2c above. Read the target markets with GA4's own tools instead:

- **Comparisons (any standard report):** Reports → click **Add comparison** → Dimension *Country*, match type *exactly matches*, values *United States*, *United Kingdom*, *Germany* (one comparison each, or one combined). Comparisons stay on while you move between reports in the session.
- **Saved segments for repeat use:** Explore → Blank → Segments → **+** → User segment → *Country* exactly matches *United States*; repeat for *United Kingdom* and *Germany*, plus one "Target markets" segment with all three. Save each segment, then build a free-form exploration with Dimensions *Session default channel group*, *Landing page + query string*, *Country* and Metrics *Active users*, *Sessions*, *Engaged sessions*, *Key events*. Segments saved in an exploration are reusable in other explorations in the same property.
- **Audiences (optional, for the Home cards):** Admin → Audiences → New audience → *Country* exactly matches *Germany* (and one each for the US and UK). Audiences populate from the day they are created, so create them now.
- **Search Console (source of truth for search visibility):** Performance → Search results → filter **Country** = Germany / United Kingdom / United States; export Queries and Pages to `seo/gsc/data/` as described in `seo/gsc-baseline-workflow.txt`.

### 2e. Bot traffic
Since 2026-11-19 the site no longer sends GA4 or Clarity data from automated browsers: `navigator.webdriver` (Puppeteer, Playwright, Selenium; this covers our own QA and audit crawls), HeadlessChrome, Lighthouse and PageSpeed Insights, WebPageTest, GTmetrix, Pingdom, and Google or Bing crawlers that run JavaScript. Data-centre bots that pretend to be a normal browser can still get through. For reporting:
- [ ] Create a comparison or segment that excludes **City = Ashburn**, **City = Council Bluffs** and **City = Groningen** (all data-centre locations). Use it when you read user and session counts.

Why: in the 28 days to Nov 18, Ahmedabad (26), Ashburn (17), Council Bluffs (2) and Groningen (2) made up 47 of 71 users. The spike on Nov 18 (about 125 page views) matches the 68-page Puppeteer and Lighthouse audit run that day.

## 3. Test the forms (production, after the Gmail App Password fix)

Send one real test and confirm all three steps of the chain: send, email and GA4.

**Before you start:**
- [ ] Confirm that `GMAIL_APP_PASSWORD` in Vercel (Production) is the new 16-letter Google App Password, with no spaces, and that the site was redeployed afterwards.
- [ ] Do **not** run `_qa_all_forms.cjs` or any other automated form script against production. The automated tests aren't safe to point at production: one run on 2026-11-08 sent real messages.
- [ ] If the internal-traffic filter is already **Active**, the test lead will not appear in GA4. Run this test while the filter is in **Testing**, or from outside the office network.
- [ ] If this browser was marked with `?kriva_internal=1`, nothing is sent. Open `https://krivatechnologies.com/contact?ga_debug=1` instead and watch **Admin → DebugView**, not Realtime.

**Send the test:**
- [ ] Open `https://krivatechnologies.com/contact` in a normal browser window (no ad blocker).
- [ ] Open **GA4 → Reports → Realtime** in another tab.
- [ ] Submit the fit-call form with Name `TEST - ignore`, a mailbox you can read, and Details `Form test YYYY-MM-DD`.
- [ ] The page shows **"Inquiry accepted"**. If it shows the "could not send" message instead, the backend is still failing: stop here and check the Vercel logs.

**Check the results:**
- [ ] The email arrives at `hello@krivatechnologies.com` within a few minutes.
- [ ] GA4 Realtime → "Key events by Event name" shows **exactly one** `generate_lead`.
- [ ] Vercel logs show a successful call:
      `vercel logs --no-branch --environment production --since 1h --query inquiry --expand`
- [ ] Repeat once with the project brief form on /contact and once with the inquiry form on one solution page (for example `/solutions/trucking-logistics`). Expect one email and one `generate_lead` each.

**Clean up:**
- [ ] Delete or label the test emails so nobody follows up on them as leads.

## 4. After the redirect fix is deployed

- [ ] `https://krivatechnologies.com/solutions/fleet-management` redirects with 308 to `/solutions/fleet-management-software`.
- [ ] `https://krivatechnologies.com/solutions/freight-broker` redirects with 308 to `/solutions/freight-broker-software`.
- [ ] In **Search Console → Indexing → Pages → Not found (404)**, check the list for any other old URLs, and send them over for a redirect.
- [ ] In Search Console, use **URL Inspection** on `/solutions/fleet-management-software` and click **Request indexing**.
