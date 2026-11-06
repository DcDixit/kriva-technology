# Go-live checklist

Run these in order. Merging anything into `main` deploys production. Paste credentials only at the terminal prompts, never into a file, a chat, or GitHub.

## 1. Add the credentials

**Gmail App Password**
1. Sign in to `krivatechnlogies@gmail.com` at https://myaccount.google.com/apppasswords. Turn on 2-Step Verification first if Google asks.
2. Create an app password named "KRIVA website" and copy the 16 letters.
3. In this project folder, run:
   ```
   vercel env rm GMAIL_APP_PASSWORD production
   vercel env add GMAIL_APP_PASSWORD production
   ```
   Paste the password when prompted.

**Web3Forms key**
1. At https://web3forms.com, enter `hello@krivatechnologies.com`. The key arrives by email.
2. Run these and paste the key at each prompt:
   ```
   vercel env add WEB3FORMS_ACCESS_KEY production
   vercel env add WEB3FORMS_ACCESS_KEY preview transform/2026-11-website
   ```

## 2. Merge the security fix (PR #2)

Merging redeploys the current site with internal files blocked and picks up the new Gmail password, so live forms should start working here, before the redesign ships.

Then run `node _verify_inquiry_prod.cjs`. Expect `channel: gmail`, and confirm the test email reaches hello@krivatechnologies.com. **Stop here if it fails.**

## 3. Test the Web3Forms backup

Preview deployments have no Gmail password, so server delivery fails there and the backup takes over.
1. Redeploy the preview so it picks up the key: `vercel redeploy <latest preview URL>`.
2. Open that preview URL in a browser signed in to Vercel, and submit a form.
3. Confirm you see the thank-you message and the email reaches hello@krivatechnologies.com.

## 4. Clear the business and legal items

Work through `docs/CLAIMS-TO-CONFIRM.md`.

## 5. Ship the redesign (PR #3)

Mark the draft ready and merge it. Then:
1. Run `node _verify_inquiry_prod.cjs` again.
2. Submit one real form with GA4 Realtime open, and expect one `generate_lead`.
3. Click through the homepage, one solution page, and the contact page.

If production breaks, roll back with `vercel rollback` or from the Vercel dashboard.

## 6. After launch

- **GA4:** mark only `generate_lead` as a key event, and turn off form interactions in Enhanced Measurement.
- **Search Console:** resubmit the sitemap, and request indexing for the homepage and the two new solution pages.
- **DNS:** add SPF and DMARC records with your domain provider.
- **Repository:** consider making it private, since internal documents are visible in it.
