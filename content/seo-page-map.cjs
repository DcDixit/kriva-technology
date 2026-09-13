/**
 * Existing-page keyword clusters for GSC query mapping.
 * Used by seo/gsc_analyze.cjs — no new URLs; maps queries to pages already on site.
 */
module.exports = {
  markets: {
    US: { file: "kriva-market-us.html", path: "/markets/us", priority: 1 },
    GB: { file: "kriva-market-uk.html", path: "/markets/uk", priority: 2 },
    AE: { file: "kriva-market-uae.html", path: "/markets/uae", priority: 3 },
    CA: { file: "kriva-market-ca.html", path: "/markets/ca", priority: 4 },
  },
  clusters: [
    {
      id: "us-trucking-dispatch",
      priority: 1,
      pages: [
        { path: "/solutions/trucking-logistics", file: "kriva-solution-trucking.html" },
        { path: "/services/crm-development", file: "kriva-service-crm-development.html" },
        { path: "/insights/trucking-dispatch-crm-guide", file: "kriva-insight-trucking-dispatch-crm-guide.html" },
        { path: "/work/shiftrail-dispatch", file: "kriva-case-fleetflow.html" },
        { path: "/markets/us", file: "kriva-market-us.html" },
        { path: "/services/dashboard-design", file: "kriva-service-dashboard-design.html" },
        { path: "/services/mobile-applications", file: "kriva-service-mobile-applications.html" },
      ],
      querySignals: [
        "trucking dispatch crm",
        "dispatch crm",
        "tms",
        "fleet dispatch",
        "trucking software",
        "dispatch software",
        "carrier dispatch",
        "bulk assignment",
        "trucking logistics software",
      ],
    },
    {
      id: "saas-mvp",
      priority: 2,
      pages: [
        { path: "/solutions/saas", file: "kriva-solution-saas.html" },
        { path: "/services/saas-platforms", file: "kriva-service-saas-platforms.html" },
        { path: "/insights/saas-onboarding-patterns", file: "kriva-insight-saas-onboarding-patterns.html" },
        { path: "/insights/saas-mvp-uk-guide", file: "kriva-insight-saas-mvp-uk-guide.html" },
      ],
      querySignals: [
        "saas mvp",
        "b2b saas",
        "saas onboarding",
        "multi-tenant",
        "saas product design",
      ],
    },
    {
      id: "accounting-integrations",
      priority: 3,
      pages: [
        { path: "/solutions/accounting-integrations", file: "kriva-solution-accounting.html" },
        { path: "/services/api-integrations", file: "kriva-service-api-integrations.html" },
        { path: "/work/financesync-quickbooks", file: "kriva-case-finance-sync.html" },
      ],
      querySignals: [
        "quickbooks integration",
        "xero integration",
        "accounting integration",
        "reconciliation",
        "finance sync",
      ],
    },
    {
      id: "auto-transport",
      priority: 4,
      pages: [
        { path: "/solutions/car-transportation", file: "kriva-solution-car-transport.html" },
      ],
      querySignals: [
        "car transport software",
        "auto transport",
        "vehicle shipping",
        "carrier dispatch auto",
      ],
    },
  ],
  /** Future URL validation — do not create pages until a term passes one of these rules. */
  urlValidation: {
    ruleA: "Existing GSC impressions for the exact target query (any impressions count)",
    ruleB: "Related commercial-intent keyword ranking positions 11–20 with CPC > $8 (requires Ads/SEMrush export)",
    blockedUntilValidated: ["state pages", "city pages", "geo template URLs"],
  },
};
