# GA4 tracking and form test checklist

Property `G-FHG12KTF8C` (GA4 property 552202890). Prepared 2026-11-15 from the Oct 18 to Nov 14 reports.

Why this exists: GA4 showed 7 key events but only 3 leads, and about 30 of 73 users came from data-centre cities (Ashburn, Council Bluffs) or the office (Ahmedabad).

---

## 1. Fix key events (GA4 Admin, about 5 minutes)

The site sends three events for each successful inquiry: `generate_lead`, `form_submit` and `contact_form_submit`. Only `generate_lead` should count as a key event. No code change is needed.

- [ ] Go to **Admin → Data display → Events**.
- [ ] Find `generate_lead` and make sure **Mark as key event** is **on**.
- [ ] Find `form_submit` and turn **Mark as key event** **off**.
- [ ] Find `contact_form_submit` and turn **Mark as key event** **off**.
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

### 2c. People who browse from changing IPs
- [ ] Install Google's **Analytics Opt-out** browser add-on on team machines. You can also turn on the browser's Global Privacy Control setting, which the site already respects for analytics.

### 2d. Bot traffic (can't be filtered at the source)
GA4 drops known bots, but traffic from data-centre cities still gets through. For reporting:
- [ ] Create a comparison or segment that excludes **City = Ashburn** and **City = Council Bluffs**. Use it when you read user and session counts.

## 3. Test the forms (production, after the Gmail App Password fix)

Send one real test and confirm all three steps of the chain: send, email and GA4.

**Before you start:**
- [ ] Confirm that `GMAIL_APP_PASSWORD` in Vercel (Production) is the new 16-letter Google App Password, with no spaces, and that the site was redeployed afterwards.
- [ ] Do **not** run `_qa_all_forms.cjs` or any other automated form script against production. The automated tests aren't safe to point at production: one run on 2026-11-08 sent real messages.
- [ ] If the internal-traffic filter is already **Active**, the test lead will not appear in GA4. Run this test while the filter is in **Testing**, or from outside the office network.

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
