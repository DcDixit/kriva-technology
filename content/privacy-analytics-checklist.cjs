/**
 * Privacy / analytics decision checklist: Phase 9 (internal).
 * Do not add tracking scripts here. Policy choice is yours.
 */

const detected = {
  redesignStaticHtml: {
    ga4: false,
    gtm: false,
    metaPixel: false,
    linkedInInsight: false,
    hotjar: false,
    clarity: false,
    vercelAnalytics: false,
    otherMarketingTrackers: false,
    analyticsCookies: false,
    analyticsLocalStorage: false,
    notes: "No tracking scripts in kriva-*.html / shared chrome.",
  },
  liveNextApp: {
    ga4: "optional: NEXT_PUBLIC_GA_MEASUREMENT_ID (empty in .env.local)",
    gtm: "optional: NEXT_PUBLIC_GTM_ID (empty in .env.local)",
    metaPixel: false,
    linkedInInsight: false,
    hotjar: false,
    clarity: false,
    vercelAnalytics: false,
    themeLocalStorage: true,
    contactEmailProcessor: "Privacy mentions Resend-class email: confirm actual provider",
    notes:
      "Scripts load only when env IDs are set. AnalyticsProvider is inert without gtag/dataLayer.",
  },
};

/**
 * Choose one decision key. apply_launch_inputs does not invent legal copy:
 * it only lists which Privacy/Terms TBD paragraphs to update.
 */
const decisions = {
  A_none_active: {
    label: "No analytics active on redesign (and keep Next IDs empty)",
    privacyChanges: [
      "Remove or rewrite claims that analytics data is collected for site performance",
      "Clarify third-party list: hosting + email (named provider) only; no analytics vendors",
      "Optionally note theme preference localStorage as non-tracking storage",
    ],
    termsChanges: ["Align cookie/analytics language with Privacy"],
  },
  B_ga4_only: {
    label: "Enable GA4 only (set NEXT_PUBLIC_GA_MEASUREMENT_ID; leave GTM empty)",
    privacyChanges: [
      "Name Google Analytics 4 explicitly",
      "Describe IP anonymization if kept (live config uses anonymize_ip: true)",
      "Describe cookies / storage GA uses",
      "Keep theme localStorage separate from analytics",
    ],
    termsChanges: ["Name GA4 in cookie inventory"],
  },
  C_gtm: {
    label: "Enable GTM (and configure tags inside GTM; avoid double-loading GA)",
    privacyChanges: [
      "Name Google Tag Manager",
      "List tags you will fire via GTM (GA4, etc.) once decided",
      "Describe associated cookies",
    ],
    termsChanges: ["Name GTM (+ nested tags) in cookie inventory"],
  },
};

const privacyPage = "kriva-privacy.html";
const termsPage = "kriva-terms.html";
const tbdFlagSelector = 'span.flag.tbd';

module.exports = { detected, decisions, privacyPage, termsPage, tbdFlagSelector };
