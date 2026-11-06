# Go-live checklist

The redesign must not reach production until step 1 passes.

## 1. Restore email delivery (needs the account owner)
1. Sign in to the Google account `krivatechnlogies@gmail.com`, turn on 2-Step Verification if needed, and open https://myaccount.google.com/apppasswords
2. Create an app password named "KRIVA website". Copy the 16 letters.
3. Run `vercel env rm GMAIL_APP_PASSWORD production`, then `vercel env add GMAIL_APP_PASSWORD production`, and paste it when prompted. Never put it in a file.
4. At https://web3forms.com enter `hello@krivatechnologies.com` to receive an access key by email.
5. Run `vercel env add WEB3FORMS_ACCESS_KEY production` and paste the key.

## 2. Ship
Merge the open pull request into `main`. This deploys production automatically, and that deploy picks up the new variables.

## 3. Verify
1. Run `node _verify_inquiry_prod.cjs`. Expect `channel: gmail`.
2. Confirm the test email reached hello@krivatechnologies.com.
3. Submit one real form on the site with GA4 Realtime open. Expect one `generate_lead`.

## 4. Afterwards
- GA4: mark only `generate_lead` as a key event, and turn off Enhanced Measurement's form interactions.
- Search Console: resubmit the sitemap and request indexing for the two new solution pages and the homepage.
- DNS: add SPF and DMARC records through the domain's DNS provider.

If production breaks: redeploy the previous deployment from the Vercel dashboard, or `vercel rollback`.
