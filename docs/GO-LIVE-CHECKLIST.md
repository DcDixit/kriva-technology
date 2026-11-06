# Go-live checklist

Run these in order. Merging into `main` deploys production. Paste credentials only at the terminal prompts, never into a file, a chat, or GitHub.

## 1. Fix form delivery (blocks everything else)

Production forms return 502. Vercel logs show `GMAIL_APP_PASSWORD wrong_length (length 13)`, and neither backup channel is set.

**Gmail App Password**
1. Sign in to `krivatechnlogies@gmail.com` at https://myaccount.google.com/apppasswords. Turn on 2-Step Verification first if Google asks.
2. Create an app password named "KRIVA website" and copy the 16 letters.
3. In this project folder, run:
   ```
   vercel env rm GMAIL_APP_PASSWORD production
   vercel env add GMAIL_APP_PASSWORD production
   ```
   Paste the password when prompted.

**Web3Forms backup**
1. At https://web3forms.com, enter `hello@krivatechnologies.com`. The key arrives by email.
2. Run `vercel env add WEB3FORMS_ACCESS_KEY production` and paste the key at the prompt.

## 2. Ship the pending branch

Merge the open pull request into `main`. This also redeploys, so the new credentials take effect.

## 3. Test on production

1. Run `node _verify_inquiry_prod.cjs`. Expect `channel: gmail`. **Stop here if it fails.**
2. Confirm the test email reaches hello@krivatechnologies.com.
3. Submit the fit-call form and the project brief form on /contact, plus one form on a solution page, with GA4 Realtime open. Expect one `generate_lead` each.
4. Check the headline on /work/finance-sync-hub, the homepage, and one market page.

If production breaks, roll back with `vercel rollback` or from the Vercel dashboard.

## 4. Clear the business and legal items

Work through `docs/CLAIMS-TO-CONFIRM.md`.

## 5. After launch

- **GA4:** mark only `generate_lead` as a key event, and turn off form interactions in Enhanced Measurement.
- **Search Console:** resubmit the sitemap, check indexing and canonical reports, and request indexing for the homepage and the two new solution pages.
- **DNS:** add SPF and DMARC records with your domain provider.
- **Repository:** consider making it private, since internal documents are visible in it.
