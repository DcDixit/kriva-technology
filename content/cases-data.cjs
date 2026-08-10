/**
 * Verified case-study content from web/src/content/portfolio.ts (+ redesign IA).
 * Metrics rails are withheld for non-FleetFlow cases per KRIVA-HANDOFF /
 * REFERENCE-ADDENDUM (only FleetFlow has signed-off published metrics).
 * Source narrative fields are retained; outcome numeric claims are not rendered.
 * Phase 11: unique before/after H2s, honest outcome framing, no public TBD quotes.
 */
module.exports = {
  "order": [
    "fleetflow-dispatch",
    "payroll-pro-saas",
    "finance-sync-hub",
    "healthtrack-mobile",
    "brandlift-ecommerce",
    "crm-pulse-dashboard",
    "ai-support-automation",
    "marketplace-mvp"
  ],
  "cases": [
    {
      "slug": "payroll-pro-saas",
      "file": "kriva-case-payroll-pro.html",
      "shortName": "PayrollPro",
      "title": "PayrollPro — B2B SaaS onboarding",
      "titleLines": [
        "PayrollPro —",
        "B2B SaaS",
        "onboarding"
      ],
      "eyebrow": "Case study · SaaS",
      "description": "Progressive onboarding and permission clarity for a payroll platform after SSO rollout.",
      "tags": [
        "SaaS",
        "Product",
        "UX"
      ],
      "client": "PayrollPro · B2B SaaS · UK & EU",
      "sector": "UK & EU B2B payroll SaaS",
      "scope": "Onboarding paths, permissions, integration health",
      "problem": "Activation stalled after SSO — admins saw empty states while end users bounced between docs and support.",
      "research": "Funnel analysis, session replays, and eight stakeholder interviews across finance and IT buyers.",
      "challenges": "Conflicting KPIs between growth and compliance, noisy legacy segment data.",
      "solution": "Role-based onboarding paths, seeded templates per vertical, and integration health surfaced in-product.",
      "ui": "Parallel admin vs champion flows, clear permission copy, and progress indicators tied to real setup tasks.",
      "dev": "Experiment flags, Entra/Okta edge-case handling, and event taxonomy aligned to growth dashboards.",
      "approachH2": "Onboarding that mirrors how payroll teams actually set up.",
      "uxH2": "Parallel admin and champion flows — permission copy that explains missing access.",
      "contextH2": "SSO was live. Activation was not.",
      "buildH2": "Instrumented for growth, careful with identity.",
      "beforeCopy": "Admins landed in empty states; end users bounced between docs and support after SSO.",
      "afterCopy": "Role-based paths, seeded templates, and in-product integration health for admin and champion flows.",
      "heroSlot": "Slot · hero · 2400×1029 · PayrollPro onboarding console",
      "storySlots": [
        "Slot · 1600×1000 · role-based onboarding path",
        "Slot · 1600×1000 · permission clarity screens",
        "Slot · 1600×1000 · integration health panel"
      ],
      "beforeSlot": "Slot · 1920×1080 · empty-state onboarding after SSO",
      "afterSlot": "Slot · 1920×1080 · progressive onboarding with setup tasks",
      "pins": [
        {
          "left": "14%",
          "top": "32%",
          "note": "Admin path"
        },
        {
          "left": "48%",
          "top": "55%",
          "note": "Setup progress"
        },
        {
          "left": "72%",
          "top": "36%",
          "note": "Integration health"
        }
      ],
      "beats": [
        {
          "name": "Role paths",
          "n": "01 — Role-based onboarding",
          "h3": "Admin and champion flows run in parallel.",
          "body": "Role-based onboarding paths and seeded templates per vertical — not a single generic checklist."
        },
        {
          "name": "Permissions",
          "n": "02 — Permission clarity",
          "h3": "Copy that explains missing access instead of a dead end.",
          "body": "Clear permission copy and progress indicators tied to real setup tasks, not decorative steps."
        },
        {
          "name": "Integration health",
          "n": "03 — UI process",
          "h3": "Integration health surfaced in-product.",
          "body": "Parallel admin vs champion flows with integration status visible where operators need it."
        }
      ],
      "stack": {
        "Frontend": [
          "Experiment flags",
          "Event taxonomy"
        ],
        "Delivery": [
          "Entra / Okta edge cases",
          "Growth dashboard alignment"
        ],
        "Capabilities": [
          {
            "href": "/services/saas-platforms",
            "label": "SaaS product design"
          },
          {
            "href": "/services/ux-research",
            "label": "UX research"
          },
          {
            "href": "/services/product-design",
            "label": "Product design"
          }
        ],
        "Identity": [
          "Entra",
          "Okta"
        ]
      },
      "related": [
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS product solutions"
        },
        {
          "href": "/services/saas-platforms",
          "k": "Service",
          "label": "SaaS product design"
        },
        {
          "href": "/insights/saas-onboarding-patterns",
          "k": "Insight",
          "label": "SaaS onboarding patterns"
        }
      ],
      "testimonial": {
        "quote": "Activation moved within six weeks of the onboarding rebuild going live.",
        "initials": "·",
        "name": "Client attribution TBD",
        "role": "Internal · FlowLedger ↔ PayrollPro — do not publish until confirmed",
        "caveat": "Unverified person/company byline withheld from public. Confirm FlowLedger vs PayrollPro (and speaker) before republishing attribution."
      },
      "metricsSignedOff": false,
      "baH2": "Empty states after SSO — then role-based setup.",
      "outcomeH2": "What shipped for activation.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "finance-sync-hub",
      "file": "kriva-case-finance-sync.html",
      "shortName": "FinanceSync",
      "title": "FinanceSync — QuickBooks & Xero reconciliation hub",
      "titleLines": [
        "FinanceSync —",
        "QuickBooks & Xero",
        "reconciliation hub"
      ],
      "eyebrow": "Case study · Integrations",
      "description": "Built reliable QuickBooks/Xero reconciliation workflows with operator dashboards finance teams trust at month-end close.",
      "tags": [
        "Integrations",
        "Dashboard",
        "Automation"
      ],
      "client": "FinanceSync · FinOps platform · UK & US",
      "sector": "UK & US FinOps / accounting ops",
      "scope": "QB/Xero sync, anomaly triage, operator dashboards",
      "problem": "QuickBooks and Xero sync drifted silently across entities — finance stopped trusting automated accruals before month-end.",
      "research": "Three cycle reconciliations, connector log forensics, and controller interviews in US and UK entities.",
      "challenges": "Partial accounting schemas, rate limits, and multi-entity mapping across UK/US books.",
      "solution": "Idempotent QuickBooks/Xero sync workers, anomaly surfacing before close, and triage UI with human-readable deltas.",
      "ui": "Discrepancy cards with remediation steps — no raw JSON — optimized for outsourced finance teams.",
      "dev": "Queue-based workers, canary deployments, PagerDuty alerting with executive rollup views.",
      "approachH2": "Reconcile before close — not after the fire drill.",
      "uxH2": "Discrepancy cards with remediation steps — no raw JSON in the operator view.",
      "contextH2": "Silent drift, then a finance team that stopped trusting the sync.",
      "buildH2": "Workers, canaries, and alerts finance can act on.",
      "beforeCopy": "Silent sync drift across entities; controllers lost trust in automated accruals before month-end.",
      "afterCopy": "Idempotent workers, anomaly surfacing before close, and discrepancy cards with remediation steps.",
      "heroSlot": "Slot · hero · 2400×1029 · FinanceSync reconciliation hub",
      "storySlots": [
        "Slot · 1600×1000 · sync worker status",
        "Slot · 1600×1000 · anomaly triage",
        "Slot · 1600×1000 · discrepancy cards"
      ],
      "beforeSlot": "Slot · 1920×1080 · silent sync drift / opaque logs",
      "afterSlot": "Slot · 1920×1080 · operator reconciliation dashboard",
      "pins": [
        {
          "left": "16%",
          "top": "34%",
          "note": "Sync status"
        },
        {
          "left": "52%",
          "top": "48%",
          "note": "Anomaly queue"
        },
        {
          "left": "74%",
          "top": "30%",
          "note": "Delta cards"
        }
      ],
      "beats": [
        {
          "name": "Sync workers",
          "n": "01 — Idempotent sync",
          "h3": "QuickBooks and Xero workers that can be trusted to retry.",
          "body": "Idempotent QuickBooks/Xero sync workers designed for multi-entity UK/US books and rate limits."
        },
        {
          "name": "Anomalies",
          "n": "02 — Anomaly surfacing",
          "h3": "Exceptions before close — not after.",
          "body": "Anomaly surfacing before close, with triage UI that shows human-readable deltas."
        },
        {
          "name": "Discrepancy UI",
          "n": "03 — UI process",
          "h3": "Remediation steps, not raw JSON.",
          "body": "Discrepancy cards with remediation steps — optimized for outsourced finance teams."
        }
      ],
      "stack": {
        "Frontend": [
          "Operator dashboards",
          "Discrepancy cards"
        ],
        "Delivery": [
          "Queue-based workers",
          "Canary deployments",
          "PagerDuty alerting"
        ],
        "Capabilities": [
          {
            "href": "/services/api-integrations",
            "label": "Integrations & APIs"
          },
          {
            "href": "/services/dashboard-design",
            "label": "Dashboard design"
          },
          {
            "href": "/services/automation-systems",
            "label": "Automation workflows"
          }
        ],
        "Accounting": [
          "QuickBooks",
          "Xero"
        ]
      },
      "related": [
        {
          "href": "/solutions/accounting-integrations",
          "k": "Solution",
          "label": "QuickBooks & Xero integrations"
        },
        {
          "href": "/services/api-integrations",
          "k": "Service",
          "label": "Integrations & APIs"
        },
        {
          "href": "/services/dashboard-design",
          "k": "Service",
          "label": "Dashboard design"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "baH2": "Opaque logs — then reconciliation operators can act on.",
      "outcomeH2": "What shipped for month-end trust.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "healthtrack-mobile",
      "file": "kriva-case-healthtrack.html",
      "shortName": "HealthTrack",
      "title": "HealthTrack — patient mobile app",
      "titleLines": [
        "HealthTrack —",
        "patient mobile",
        "app"
      ],
      "eyebrow": "Case study · Mobile",
      "description": "Patient-facing iOS and Android UX for appointment booking, records, and care plan adherence.",
      "tags": [
        "Mobile",
        "Healthcare",
        "UI/UX"
      ],
      "client": "HealthTrack · Digital health · US",
      "sector": "US digital health",
      "scope": "Patient booking, records, care reminders",
      "problem": "Legacy patient portal frustrated booking and records access, and support volume was high.",
      "problemNote": "Source cited 2.1★ App Store rating — withheld pending verification",
      "research": "Patient interviews, support ticket taxonomy, and competitive audit of top-rated health apps.",
      "challenges": "Strict compliance reviews, offline edge cases, and provider-specific scheduling rules.",
      "solution": "Mobile-first IA with clear appointment flows, record access, and proactive care reminders.",
      "ui": "Accessible typography, calm visual language, and step-by-step flows tested with older patient cohorts.",
      "dev": "React Native app, biometric login, HIPAA-conscious data handling patterns, App Store optimization assets.",
      "approachH2": "Calm flows for booking, records, and reminders.",
      "contextH2": "A portal patients avoided — and support could not keep up with.",
      "buildH2": "React Native, with compliance reviews in the loop.",
      "beforeCopy": "Legacy portal friction around booking and records; high support volume.",
      "afterCopy": "Mobile-first appointment flows, record access, and proactive care reminders with accessible typography.",
      "heroSlot": "Slot · hero · 2400×1029 · HealthTrack patient mobile",
      "storySlots": [
        "Slot · 1600×1000 · appointment booking",
        "Slot · 1600×1000 · records access",
        "Slot · 1600×1000 · care reminders"
      ],
      "beforeSlot": "Slot · 1920×1080 · legacy patient portal",
      "afterSlot": "Slot · 1920×1080 · mobile-first HealthTrack flows",
      "pins": [
        {
          "left": "22%",
          "top": "28%",
          "note": "Book visit"
        },
        {
          "left": "48%",
          "top": "52%",
          "note": "Records"
        },
        {
          "left": "70%",
          "top": "40%",
          "note": "Reminders"
        }
      ],
      "beats": [
        {
          "name": "Booking",
          "n": "01 — Appointment flows",
          "h3": "Booking without the portal maze.",
          "body": "Mobile-first IA with clear appointment flows designed around how patients actually schedule care."
        },
        {
          "name": "Records",
          "n": "02 — Records access",
          "h3": "Records patients can find without calling support.",
          "body": "Record access patterns informed by support ticket taxonomy and patient interviews."
        },
        {
          "name": "Reminders",
          "n": "03 — UI process",
          "h3": "Calm, accessible steps for older cohorts.",
          "body": "Accessible typography, calm visual language, and step-by-step flows tested with older patient cohorts."
        }
      ],
      "stack": {
        "Frontend": [
          "React Native",
          "Biometric login"
        ],
        "Delivery": [
          "HIPAA-conscious patterns",
          "App Store optimization assets"
        ],
        "Capabilities": [
          {
            "href": "/services/mobile-applications",
            "label": "Mobile app design"
          },
          {
            "href": "/services/ui-ux-design",
            "label": "UI/UX design"
          },
          {
            "href": "/services/ux-research",
            "label": "UX research"
          }
        ],
        "Platforms": [
          "iOS",
          "Android"
        ]
      },
      "related": [
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS product solutions"
        },
        {
          "href": "/services/mobile-applications",
          "k": "Service",
          "label": "Mobile app design"
        },
        {
          "href": "/services/ui-ux-design",
          "k": "Service",
          "label": "UI/UX design"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "baH2": "Fragmented care tasks — then a patient flow that holds.",
      "outcomeH2": "What shipped for patients.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "brandlift-ecommerce",
      "file": "kriva-case-brandlift.html",
      "shortName": "BrandLift",
      "title": "BrandLift — D2C rebrand & storefront",
      "titleLines": [
        "BrandLift —",
        "D2C rebrand &",
        "storefront"
      ],
      "eyebrow": "Case study · Brand",
      "description": "Full brand refresh and Shopify storefront redesign for a growing consumer electronics label.",
      "tags": [
        "Branding",
        "E-commerce",
        "Web"
      ],
      "client": "BrandLift · D2C electronics",
      "sector": "D2C consumer electronics",
      "scope": "Brand system, Shopify theme, PDP templates",
      "problem": "Brand felt generic, Shopify conversion lagged competitors despite strong product reviews.",
      "research": "Brand audit, heatmaps, checkout funnel analysis, and customer perception interviews.",
      "challenges": "Large SKU catalog, frequent promotional campaigns, global shipping messaging.",
      "solution": "New visual identity, componentized Shopify theme, and PDP templates optimized for mobile conversion.",
      "ui": "Bold product photography system, trust badges near CTAs, and simplified checkout with fewer distractions.",
      "dev": "Custom Shopify theme, performance optimization, analytics events for merchandising decisions.",
      "approachH2": "Identity and storefront that sell the same story.",
      "contextH2": "Strong reviews. A storefront that did not earn them.",
      "buildH2": "Componentized Shopify, measured for merchandising.",
      "beforeCopy": "Generic brand presence; conversion lagged despite strong product reviews.",
      "afterCopy": "New visual identity, componentized Shopify theme, and mobile-optimized PDP templates.",
      "heroSlot": "Slot · hero · 2400×1029 · BrandLift storefront",
      "storySlots": [
        "Slot · 1600×1000 · brand system",
        "Slot · 1600×1000 · PDP template",
        "Slot · 1600×1000 · checkout simplification"
      ],
      "beforeSlot": "Slot · 1920×1080 · previous storefront",
      "afterSlot": "Slot · 1920×1080 · redesigned BrandLift storefront",
      "pins": [
        {
          "left": "18%",
          "top": "26%",
          "note": "Brand system"
        },
        {
          "left": "50%",
          "top": "58%",
          "note": "PDP"
        },
        {
          "left": "76%",
          "top": "34%",
          "note": "Trust near CTA"
        }
      ],
      "beats": [
        {
          "name": "Identity",
          "n": "01 — Visual identity",
          "h3": "A brand system built for product photography.",
          "body": "New visual identity with a bold product photography system — not a logo swap alone."
        },
        {
          "name": "PDP",
          "n": "02 — PDP templates",
          "h3": "PDPs optimized for mobile conversion.",
          "body": "Componentized Shopify theme and PDP templates shaped by heatmap and funnel analysis."
        },
        {
          "name": "Checkout",
          "n": "03 — UI process",
          "h3": "Fewer distractions at the moment of purchase.",
          "body": "Trust badges near CTAs and a simplified checkout with fewer distractions."
        }
      ],
      "stack": {
        "Frontend": [
          "Custom Shopify theme",
          "PDP templates"
        ],
        "Delivery": [
          "Performance optimization",
          "Analytics events"
        ],
        "Capabilities": [
          {
            "href": "/services/branding",
            "label": "Branding & graphic design"
          },
          {
            "href": "/services/web-development",
            "label": "Web design & development"
          },
          {
            "href": "/services/logo-design",
            "label": "Logo design"
          }
        ],
        "Commerce": [
          "Shopify"
        ]
      },
      "related": [
        {
          "href": "/services/branding",
          "k": "Service",
          "label": "Branding & graphic design"
        },
        {
          "href": "/services/web-development",
          "k": "Service",
          "label": "Web design & development"
        },
        {
          "href": "/work",
          "k": "Work",
          "label": "Full portfolio"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "baH2": "Inconsistent storefront — then a system the brand can run.",
      "outcomeH2": "What shipped for the brand system.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "crm-pulse-dashboard",
      "file": "kriva-case-crm-pulse.html",
      "shortName": "CRMPulse",
      "title": "CRMPulse — sales dashboard",
      "titleLines": [
        "CRMPulse —",
        "sales",
        "dashboard"
      ],
      "eyebrow": "Case study · CRM",
      "description": "Custom HubSpot dashboards and pipeline UX aligned to how the sales team actually works.",
      "tags": [
        "CRM",
        "Dashboard",
        "SaaS"
      ],
      "client": "CRMPulse · B2B sales org · 80 reps",
      "sector": "B2B sales operations",
      "scope": "Pipeline views, stage definitions, leadership dashboards",
      "problem": "HubSpot dashboards showed conflicting numbers — reps exported to Excel for every forecast call.",
      "research": "Sales stage workshops, CRM hygiene audit, and shadowing of weekly forecast meetings.",
      "challenges": "Historical data mess, conflicting definitions across regions, change management with senior reps.",
      "solution": "Custom pipeline views, stage definitions aligned to reality, and leadership dashboards with single source of truth.",
      "ui": "Role-specific home screens, deal health indicators, and mobile-friendly views for field reps.",
      "dev": "HubSpot custom objects, automation rules with rollback, and scheduled data quality alerts.",
      "approachH2": "One forecast truth — built around how reps actually sell.",
      "contextH2": "Conflicting dashboards. Excel for every forecast call.",
      "buildH2": "HubSpot objects and alerts with a rollback path.",
      "beforeCopy": "Conflicting HubSpot numbers; reps exported to Excel before every forecast.",
      "afterCopy": "Custom pipeline views, aligned stage definitions, and leadership dashboards as a single source of truth.",
      "heroSlot": "Slot · hero · 2400×1029 · CRMPulse sales dashboard",
      "storySlots": [
        "Slot · 1600×1000 · pipeline board",
        "Slot · 1600×1000 · deal health",
        "Slot · 1600×1000 · leadership rollup"
      ],
      "beforeSlot": "Slot · 1920×1080 · conflicting HubSpot exports",
      "afterSlot": "Slot · 1920×1080 · unified CRMPulse dashboard",
      "pins": [
        {
          "left": "12%",
          "top": "30%",
          "note": "Pipeline"
        },
        {
          "left": "46%",
          "top": "50%",
          "note": "Deal health"
        },
        {
          "left": "78%",
          "top": "28%",
          "note": "Leadership view"
        }
      ],
      "beats": [
        {
          "name": "Pipeline",
          "n": "01 — Pipeline views",
          "h3": "Stages that match how the team actually sells.",
          "body": "Custom pipeline views and stage definitions aligned to reality from sales workshops and forecast shadowing."
        },
        {
          "name": "Deal health",
          "n": "02 — Deal indicators",
          "h3": "Health signals for reps and leaders.",
          "body": "Role-specific home screens and deal health indicators — including mobile-friendly views for field reps."
        },
        {
          "name": "Leadership",
          "n": "03 — UI process",
          "h3": "One source of truth for forecast calls.",
          "body": "Leadership dashboards designed so forecast meetings stop starting in Excel."
        }
      ],
      "stack": {
        "Frontend": [
          "Role-specific home screens",
          "Mobile-friendly rep views"
        ],
        "Delivery": [
          "HubSpot custom objects",
          "Automation with rollback",
          "Data quality alerts"
        ],
        "Capabilities": [
          {
            "href": "/services/crm-development",
            "label": "CRM design"
          },
          {
            "href": "/services/dashboard-design",
            "label": "Dashboard design"
          },
          {
            "href": "/services/saas-platforms",
            "label": "SaaS product design"
          }
        ],
        "CRM": [
          "HubSpot"
        ]
      },
      "related": [
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS product solutions"
        },
        {
          "href": "/services/crm-development",
          "k": "Service",
          "label": "CRM design"
        },
        {
          "href": "/insights/crm-dashboard-ux-patterns",
          "k": "Insight",
          "label": "CRM dashboard UX patterns"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "slugNote": "Slug `/work/crm-pulse-dashboard` confirmed in live source (`portfolio.ts` / static params).",
      "baH2": "Forecast noise — then leadership views people open.",
      "outcomeH2": "What shipped for sales leadership.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "ai-support-automation",
      "file": "kriva-case-ai-support.html",
      "shortName": "SupportAI",
      "title": "SupportAI — ticket automation",
      "titleLines": [
        "SupportAI —",
        "ticket",
        "automation"
      ],
      "eyebrow": "Case study · AI",
      "description": "Make + Claude workflow that triages support tickets and drafts replies for human approval.",
      "tags": [
        "AI",
        "Automation",
        "SaaS"
      ],
      "client": "SupportAI · SaaS · 12k MAU",
      "sector": "SaaS customer support",
      "scope": "Triage workflow, draft replies, human approval console",
      "problem": "Tier-1 tickets consumed 60% of support capacity — response times slipped during product launches.",
      "research": "Ticket categorization study, macro analysis, and review of 500 closed conversations.",
      "challenges": "Tone consistency, PII handling, and agent trust in AI drafts.",
      "solution": "Make workflow with Claude triage, draft replies, and human approval before send.",
      "ui": "Internal review console for support leads with confidence scores and one-click edit/send.",
      "dev": "Make scenarios, Zendesk integration, logging for audit, fallback to manual queue on low confidence.",
      "approachH2": "AI drafts. Humans approve. Nothing sends itself.",
      "contextH2": "Tier-1 volume ate the queue every launch week.",
      "buildH2": "Make, Claude, Zendesk — with a manual fallback.",
      "beforeCopy": "Tier-1 volume dominated capacity; response times slipped during launches.",
      "afterCopy": "Make + Claude triage with draft replies and human approval before send, plus low-confidence fallback.",
      "heroSlot": "Slot · hero · 2400×1029 · SupportAI review console",
      "storySlots": [
        "Slot · 1600×1000 · triage workflow",
        "Slot · 1600×1000 · draft reply review",
        "Slot · 1600×1000 · confidence / fallback"
      ],
      "beforeSlot": "Slot · 1920×1080 · overloaded tier-1 queue",
      "afterSlot": "Slot · 1920×1080 · human-approval review console",
      "pins": [
        {
          "left": "15%",
          "top": "30%",
          "note": "Triage"
        },
        {
          "left": "48%",
          "top": "54%",
          "note": "Draft reply"
        },
        {
          "left": "74%",
          "top": "36%",
          "note": "Approve / edit"
        }
      ],
      "beats": [
        {
          "name": "Triage",
          "n": "01 — Ticket triage",
          "h3": "Claude routes; humans stay in control.",
          "body": "Make workflow with Claude triage informed by ticket categorization and macro analysis."
        },
        {
          "name": "Drafts",
          "n": "02 — Draft replies",
          "h3": "Drafts for approval — never auto-send.",
          "body": "Draft replies land in an internal review console with confidence scores and one-click edit/send."
        },
        {
          "name": "Fallback",
          "n": "03 — Engineering",
          "h3": "Low confidence falls back to the manual queue.",
          "body": "Zendesk integration, audit logging, and fallback to the manual queue when confidence is low."
        }
      ],
      "stack": {
        "Frontend": [
          "Internal review console",
          "Confidence scores"
        ],
        "Delivery": [
          "Make scenarios",
          "Audit logging",
          "Manual-queue fallback"
        ],
        "Capabilities": [
          {
            "href": "/services/ai-assisted-development",
            "label": "AI-assisted product development"
          },
          {
            "href": "/services/automation-systems",
            "label": "Automation workflows"
          },
          {
            "href": "/insights/ai-in-product-design-2026",
            "label": "AI in product design"
          }
        ],
        "Stack": [
          "Make",
          "Claude",
          "Zendesk"
        ]
      },
      "related": [
        {
          "href": "/services/ai-assisted-development",
          "k": "Service",
          "label": "AI-assisted development"
        },
        {
          "href": "/services/automation-systems",
          "k": "Service",
          "label": "Automation workflows"
        },
        {
          "href": "/insights/ai-in-product-design-2026",
          "k": "Insight",
          "label": "AI in product design 2026"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "slugNote": "Slug `/work/ai-support-automation` confirmed in live source (`portfolio.ts` / static params).",
      "baH2": "Ticket piles — then routed work with human gates.",
      "outcomeH2": "What shipped for support ops.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    },
    {
      "slug": "marketplace-mvp",
      "file": "kriva-case-marketplace.html",
      "shortName": "LocalServe",
      "title": "LocalServe — marketplace MVP",
      "titleLines": [
        "LocalServe —",
        "marketplace",
        "MVP"
      ],
      "eyebrow": "Case study · Marketplace",
      "description": "No-code marketplace MVP with vendor onboarding, bookings, and admin ops — validated before custom build.",
      "tags": [
        "No-Code",
        "Marketplace",
        "MVP"
      ],
      "client": "LocalServe · Services marketplace · Pre-seed",
      "sector": "Local services marketplace",
      "scope": "Vendor onboarding, bookings, payments hook, admin ops",
      "problem": "Founders needed to validate supply/demand fit before raising for a custom marketplace build.",
      "research": "Competitive scan, vendor interviews, and smoke tests for booking flows in two cities.",
      "challenges": "Manual vendor vetting at launch, payment edge cases, and scope control for MVP.",
      "solution": "Bubble marketplace with vendor onboarding, booking, payments hook, and lightweight admin ops.",
      "ui": "Clean mobile-first booking UX, vendor profiles, and admin views for ops without engineering.",
      "dev": "Bubble app, Stripe Connect setup, Make notifications, analytics for conversion tracking.",
      "approachH2": "Validate the marketplace before you rebuild it.",
      "contextH2": "Prove supply and demand — then decide what to custom-build.",
      "buildH2": "Bubble, Stripe Connect, Make — scoped for learning.",
      "beforeCopy": "No product yet — founders needed supply/demand proof before a custom build.",
      "afterCopy": "Bubble marketplace with vendor onboarding, booking, payments hook, and lightweight admin ops.",
      "heroSlot": "Slot · hero · 2400×1029 · LocalServe marketplace",
      "storySlots": [
        "Slot · 1600×1000 · vendor onboarding",
        "Slot · 1600×1000 · booking flow",
        "Slot · 1600×1000 · admin ops"
      ],
      "beforeSlot": "Slot · 1920×1080 · pre-MVP concept / smoke tests",
      "afterSlot": "Slot · 1920×1080 · LocalServe Bubble marketplace",
      "pins": [
        {
          "left": "18%",
          "top": "32%",
          "note": "Vendor profile"
        },
        {
          "left": "50%",
          "top": "56%",
          "note": "Booking"
        },
        {
          "left": "72%",
          "top": "28%",
          "note": "Admin ops"
        }
      ],
      "beats": [
        {
          "name": "Vendors",
          "n": "01 — Vendor onboarding",
          "h3": "Supply side first — without an engineering backlog.",
          "body": "Bubble marketplace with vendor onboarding shaped by vendor interviews and competitive scan."
        },
        {
          "name": "Booking",
          "n": "02 — Bookings",
          "h3": "Mobile-first booking to test demand.",
          "body": "Clean mobile-first booking UX and payments hook, smoke-tested in two cities."
        },
        {
          "name": "Admin",
          "n": "03 — Admin ops",
          "h3": "Ops views founders can run without engineers.",
          "body": "Lightweight admin ops and Make notifications so the MVP can be operated while learning."
        }
      ],
      "stack": {
        "Frontend": [
          "Bubble app",
          "Mobile-first booking UX"
        ],
        "Delivery": [
          "Stripe Connect",
          "Make notifications",
          "Conversion analytics"
        ],
        "Capabilities": [
          {
            "href": "/services/no-code-low-code",
            "label": "No-code / low-code solutions"
          },
          {
            "href": "/services/product-design",
            "label": "Product design"
          },
          {
            "href": "/insights/no-code-vs-custom-mvp",
            "label": "No-code vs custom MVP"
          }
        ],
        "Stack": [
          "Bubble",
          "Stripe Connect",
          "Make"
        ]
      },
      "related": [
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS product solutions"
        },
        {
          "href": "/services/no-code-low-code",
          "k": "Service",
          "label": "No-code / low-code"
        },
        {
          "href": "/insights/no-code-vs-custom-mvp",
          "k": "Insight",
          "label": "No-code vs custom MVP"
        }
      ],
      "testimonial": null,
      "metricsSignedOff": false,
      "slugNote": "Slug `/work/marketplace-mvp` confirmed in live source (`portfolio.ts` / static params). Published title is LocalServe.",
      "baH2": "Wishlist features — then an MVP that proves demand.",
      "outcomeH2": "What shipped to validate the market.",
      "outcomeNote": "Measured outcome metrics are not published on this case until signed off. The narrative above is from the verified case source.",
      "testimonialPublic": false
    }
  ]
};
