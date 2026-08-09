/**
 * Phase 9/11 — all 17 standalone services.
 * Factual fields from web/src/content/services.ts.
 * Positioning / differentiation copy is editorial framing of those fields — not new claims.
 * Phase 11: outcome H1s, challenge title/body pairs, section H2 variance, brief visuals.
 */
module.exports = {
  "deferred": [],
  "services": [
    {
      "slug": "crm-development",
      "file": "kriva-service-crm-development.html",
      "h1": "CRM Design",
      "title": "CRM Design · Dispatch & sales consoles · KRIVA",
      "meta": "CRM and ops console design for dispatch, pipelines, and reporting teams actually trust — HubSpot, Salesforce, or custom.",
      "ogTitle": "CRM Design — Dispatch & sales consoles",
      "eyebrow": "Service · Product interfaces",
      "family": "Apps & dashboards",
      "bullets": [
        "Pipeline UX",
        "Custom dashboards",
        "Data visualization"
      ],
      "summary": "Sales pipelines, reporting views, and operational dashboards teams actually trust day to day.",
      "positioning": "Built for desks that live in the CRM — dispatch supervisors, sales leaders, and ops — not marketing-site mockups of a pipeline.",
      "contrast": "Separate from Dashboard Design: this service owns stage models, pipeline UX, and CRM-platform fit. Dashboards own scanability and widget hierarchy for analytics views.",
      "challenges": [
        {
          "title": "Pipeline distrust",
          "body": "Sales team doesn't trust pipeline data"
        },
        {
          "title": "Export dependency",
          "body": "Reports take manual exports and spreadsheet work"
        },
        {
          "title": "UI / process mismatch",
          "body": "CRM UI doesn't match how you actually sell"
        }
      ],
      "approachH2": "Design the CRM around how the team already works.",
      "approach": [
        {
          "n": "01",
          "title": "Stage reality workshop",
          "body": "Pipeline and stage model workshop so definitions match how deals and loads actually move — not the default CRM template."
        },
        {
          "n": "02",
          "title": "Console & pipeline UX",
          "body": "Custom dashboard designs and pipeline UX for the roles that open the tool every day."
        },
        {
          "n": "03",
          "title": "Automation map",
          "body": "Automation rule map with room for rollback — so ops trust the system after go-live."
        }
      ],
      "deliverables": [
        "Pipeline & stage model workshop",
        "Custom dashboard designs",
        "Automation rule map",
        "HubSpot / Salesforce UX improvements"
      ],
      "benefits": [
        "Better forecast accuracy",
        "Less time in spreadsheets",
        "Dashboards leadership uses weekly"
      ],
      "faq": [
        {
          "q": "Which CRM platforms?",
          "a": "HubSpot, Salesforce, Pipedrive, and custom CRM builds. We design for the tool you use or the one you're building."
        }
      ],
      "processNote": "Usually follows discovery on stage definitions, then UI, then automation rules — reviewed before engineering commits.",
      "heroSlot": "Slot · 1600×1000 · CRM pipeline / dispatch console",
      "ctaH2": "Need a CRM the floor will trust?",
      "heroAsset": "/work/fleetflow/console-full.jpg",
      "heroAssetAlt": "FleetFlow dispatch console — related CRM work",
      "proof": [
        {
          "href": "/work/fleetflow-dispatch",
          "k": "Work",
          "label": "FleetFlow — dispatch CRM"
        },
        {
          "href": "/work/crm-pulse-dashboard",
          "k": "Work",
          "label": "CRMPulse — sales dashboard"
        },
        {
          "href": "/solutions/trucking-logistics",
          "k": "Solution",
          "label": "Trucking & logistics"
        }
      ],
      "related": [
        {
          "href": "/services/dashboard-design",
          "label": "Dashboard Design"
        },
        {
          "href": "/services/automation-systems",
          "label": "Automation Workflows"
        },
        {
          "href": "/insights/crm-dashboard-ux-patterns",
          "label": "CRM dashboard UX patterns"
        }
      ],
      "chromeNav": "services",
      "h1Display": "A CRM the floor will trust.",
      "serviceLabel": "CRM Design",
      "challengesH2": "When the CRM becomes a spreadsheet again",
      "deliverablesH2": "What lands on the ops desk",
      "outcomesH2": "What changes on the floor",
      "visualMode": "brief"
    },
    {
      "slug": "dashboard-design",
      "file": "kriva-service-dashboard-design.html",
      "h1": "Dashboard Design",
      "title": "Dashboard Design · Analytics & ops views · KRIVA",
      "meta": "Analytics, admin, and operational dashboards designed for clarity, scanability, and daily use — not spreadsheet exports.",
      "ogTitle": "Dashboard Design — Analytics & ops views",
      "eyebrow": "Service · Product interfaces",
      "family": "Apps & dashboards",
      "bullets": [
        "KPI layouts",
        "Data visualization",
        "Filter & drill-down UX"
      ],
      "summary": "Analytics, admin, and operational dashboards designed for clarity, scanability, and daily use.",
      "positioning": "For teams who open a dashboard every morning — fleet exceptions, finance close, sales forecast — and need signal without another export.",
      "contrast": "Complements CRM Design: dashboards focus on widget hierarchy, filters, and drill-downs. CRM Design owns pipeline stages and CRM-platform workflows.",
      "challenges": [
        {
          "title": "Scan failure",
          "body": "Metrics are available but hard to scan quickly"
        },
        {
          "title": "Widget sprawl",
          "body": "Dashboards become cluttered as requests accumulate"
        },
        {
          "title": "Spreadsheet workaround",
          "body": "Teams export to spreadsheets because UI isn't trusted"
        }
      ],
      "approachH2": "Hierarchy first. Charts second.",
      "approach": [
        {
          "n": "01",
          "title": "IA & widget hierarchy",
          "body": "Dashboard information architecture so the first screen answers the shift question before the detail views."
        },
        {
          "n": "02",
          "title": "Chart & table patterns",
          "body": "Chart and table UI patterns that stay readable as metrics accumulate."
        },
        {
          "n": "03",
          "title": "Filter & drill-down",
          "body": "Filter, date-range, and drill-down flows designed for operators — not one-off report builders."
        }
      ],
      "deliverables": [
        "Dashboard IA and widget hierarchy",
        "Chart and table UI patterns",
        "Filter, date-range, and drill-down flows",
        "Dark/light theme-ready visual system"
      ],
      "benefits": [
        "Operational visibility without spreadsheet workarounds",
        "Dashboards leadership actually opens weekly",
        "Scalable layout patterns for new metrics"
      ],
      "faq": [
        {
          "q": "Do you design admin and analytics views?",
          "a": "Yes. We design internal admin consoles, customer analytics, and executive summary dashboards."
        }
      ],
      "processNote": "Starts from the questions operators ask on a shift, then maps widgets and filters — before visual polish.",
      "heroSlot": "Slot · 1600×1000 · operational dashboard",
      "ctaH2": "Need dashboards leadership actually opens?",
      "heroAsset": "/work/crmpulse/thumb.jpg",
      "heroAssetAlt": "CRMPulse sales dashboard — related dashboard work",
      "proof": [
        {
          "href": "/work/fleetflow-dispatch",
          "k": "Work",
          "label": "FleetFlow — SLA views"
        },
        {
          "href": "/work/finance-sync-hub",
          "k": "Work",
          "label": "FinanceSync — reconciliation"
        },
        {
          "href": "/work/crm-pulse-dashboard",
          "k": "Work",
          "label": "CRMPulse — leadership views"
        }
      ],
      "related": [
        {
          "href": "/services/crm-development",
          "label": "CRM Design"
        },
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        },
        {
          "href": "/insights/crm-dashboard-ux-patterns",
          "label": "CRM dashboard UX patterns"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Dashboards that answer the shift question first.",
      "serviceLabel": "Dashboard Design",
      "challengesH2": "When the dashboard becomes another export",
      "deliverablesH2": "What operators open every morning",
      "outcomesH2": "What changes in the morning scan",
      "visualMode": "brief"
    },
    {
      "slug": "api-integrations",
      "file": "kriva-service-api-integrations.html",
      "h1": "Integrations & APIs",
      "title": "Integrations & APIs · Reliable connectors · KRIVA",
      "meta": "Reliable connectors between your product, CRM, ERP, and third-party tools — with clear error handling and monitoring.",
      "ogTitle": "Integrations & APIs — Reliable connectors",
      "eyebrow": "Service · Build & integration",
      "family": "Build & integration",
      "bullets": [
        "REST & webhooks",
        "CRM / ERP sync",
        "Monitoring & alerts"
      ],
      "summary": "Reliable connectors between your product, CRM, ERP, and third-party tools, with clear error handling and monitoring.",
      "positioning": "For products where silent sync drift is more expensive than a slow feature — QuickBooks, Xero, CRM, payments, and ops tools that must stay honest.",
      "contrast": "Pairs with Automation Workflows when the job is Make/Zapier orchestration; this service owns connector architecture, error surfaces, and operator docs.",
      "challenges": [
        {
          "title": "Silent drift",
          "body": "Integrations break silently and data drifts"
        },
        {
          "title": "Manual reconciliation",
          "body": "Teams manually reconcile between systems"
        },
        {
          "title": "Blind failures",
          "body": "No visibility when sync jobs fail"
        }
      ],
      "approachH2": "Make failures visible before finance or ops notice.",
      "approach": [
        {
          "n": "01",
          "title": "Architecture map",
          "body": "Integration architecture map across entities, rate limits, and ownership — before writing connectors."
        },
        {
          "n": "02",
          "title": "Connector build",
          "body": "Connector implementation with idempotent patterns where the domain requires them."
        },
        {
          "n": "03",
          "title": "Alerting & docs",
          "body": "Error alerting, logs, and operator documentation so failures are triageable — not tribal knowledge."
        }
      ],
      "deliverables": [
        "Integration architecture map",
        "Connector implementation",
        "Error alerting & logs",
        "Operator documentation"
      ],
      "benefits": [
        "Reliable data across tools",
        "Less manual ops work",
        "Faster troubleshooting when issues arise"
      ],
      "faq": [
        {
          "q": "Do you integrate with payment or accounting systems?",
          "a": "Yes. QuickBooks Online, Xero, Stripe, Razorpay, Zoho, and common ERP APIs depending on your stack."
        }
      ],
      "processNote": "Discovery documents schemas and failure modes first; canary rollouts follow the FinanceSync-style pattern when stakes are high.",
      "heroSlot": "Slot · 1600×1000 · sync status / anomaly triage",
      "ctaH2": "Need integrations finance can trust?",
      "heroAsset": "/work/financesync/home-reconciliation.jpg",
      "heroAssetAlt": "FinanceSync reconciliation — related integrations work",
      "proof": [
        {
          "href": "/work/finance-sync-hub",
          "k": "Work",
          "label": "FinanceSync — QB/Xero hub"
        },
        {
          "href": "/solutions/accounting-integrations",
          "k": "Solution",
          "label": "QuickBooks & Xero"
        },
        {
          "href": "/technologies",
          "k": "Stack",
          "label": "Technologies"
        }
      ],
      "related": [
        {
          "href": "/services/automation-systems",
          "label": "Automation Workflows"
        },
        {
          "href": "/services/dashboard-design",
          "label": "Dashboard Design"
        },
        {
          "href": "/solutions/accounting-integrations",
          "label": "Accounting integrations"
        }
      ],
      "chromeNav": "integration",
      "h1Display": "Integrations that fail where operators can see them.",
      "serviceLabel": "Integrations & APIs",
      "challengesH2": "When sync drift shows up at month-end",
      "deliverablesH2": "What engineering and finance can own",
      "outcomesH2": "What changes when systems disagree",
      "visualMode": "brief"
    },
    {
      "slug": "mobile-applications",
      "file": "kriva-service-mobile-applications.html",
      "h1": "Mobile App Design",
      "title": "Mobile App Design · iOS & Android UX · KRIVA",
      "meta": "Native-quality mobile UX for iOS and Android — focused on clarity, onboarding, and retention for patient, driver, and field apps.",
      "ogTitle": "Mobile App Design — iOS & Android UX",
      "eyebrow": "Service · Product interfaces",
      "family": "Apps & dashboards",
      "bullets": [
        "App UX flows",
        "iOS & Android UI",
        "Prototype testing"
      ],
      "summary": "Native-quality mobile UX for iOS and Android, focused on clarity, onboarding, and retention.",
      "positioning": "Mobile-first product UX — booking, records, load acceptance, status — designed for thumbs and interrupted attention, not shrunk desktop layouts.",
      "contrast": "UI/UX Design covers cross-platform interface systems; this service owns mobile-specific flows, store assets, and iOS/Android pattern fidelity.",
      "challenges": [
        {
          "title": "Desktop shrink",
          "body": "Mobile UX copied from desktop and feels cramped"
        },
        {
          "title": "Slow time-to-value",
          "body": "Onboarding doesn't explain value quickly"
        },
        {
          "title": "Store friction",
          "body": "App store assets and flows aren't conversion-tuned"
        }
      ],
      "approachH2": "Flows for the hand, not the monitor.",
      "approach": [
        {
          "n": "01",
          "title": "Mobile UX flows",
          "body": "Mobile UX flows for iOS and Android — including offline and interruption-friendly paths where the domain needs them."
        },
        {
          "n": "02",
          "title": "High-fidelity UI",
          "body": "High-fidelity app UI with accessible typography and calm density for the audiences you serve."
        },
        {
          "n": "03",
          "title": "Prototype & store kit",
          "body": "Interactive prototype plus App Store / Play Store screenshot templates for handoff."
        }
      ],
      "deliverables": [
        "Mobile UX flows (iOS & Android)",
        "High-fidelity app UI",
        "Interactive prototype",
        "App store screenshot templates"
      ],
      "benefits": [
        "Higher activation and retention",
        "Clearer dev handoff for React Native or native teams",
        "Polished presence on App Store and Play Store"
      ],
      "faq": [
        {
          "q": "Do you also build the app?",
          "a": "Yes. We offer design-only or design and development with React Native, Flutter, or native paths."
        }
      ],
      "processNote": "Design-only or design-and-build. React Native, Flutter, or native paths are chosen with your constraints — not as a default slogan.",
      "heroSlot": "Slot · 1600×1000 · mobile app flows",
      "ctaH2": "Need a mobile app operators will use?",
      "heroAsset": "/work/healthtrack/thumb.jpg",
      "heroAssetAlt": "HealthTrack mobile — related app work",
      "proof": [
        {
          "href": "/work/healthtrack-mobile",
          "k": "Work",
          "label": "HealthTrack — patient mobile"
        },
        {
          "href": "/solutions/trucking-logistics",
          "k": "Solution",
          "label": "Driver mobile context"
        },
        {
          "href": "/services/ui-ux-design",
          "k": "Service",
          "label": "UI/UX Design"
        }
      ],
      "related": [
        {
          "href": "/services/ui-ux-design",
          "label": "UI/UX Design"
        },
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/work/healthtrack-mobile",
          "label": "HealthTrack case study"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Mobile UX built for interrupted attention.",
      "serviceLabel": "Mobile App Design",
      "challengesH2": "When mobile is just a shrunk desktop",
      "deliverablesH2": "What ships to the stores",
      "outcomesH2": "What changes in the hand",
      "visualMode": "brief"
    },
    {
      "slug": "saas-platforms",
      "file": "kriva-service-saas-platforms.html",
      "h1": "SaaS Product Design",
      "title": "SaaS Product Design · Multi-tenant UX · KRIVA",
      "meta": "Multi-tenant SaaS UX, admin panels, permissions, and release-friendly design systems for UK and US product teams.",
      "ogTitle": "SaaS Product Design — Multi-tenant UX",
      "eyebrow": "Service · Product interfaces",
      "family": "Apps & dashboards",
      "bullets": [
        "Tenant UX patterns",
        "Admin dashboards",
        "Scalable UI kits"
      ],
      "summary": "Multi-tenant SaaS UX, admin panels, permissions, and release-friendly design systems.",
      "positioning": "For B2B SaaS where admin and customer surfaces diverge, permissions confuse new users, and every UI change risks a tenant.",
      "contrast": "Narrower than Product Design: focused on tenant-aware patterns, admin vs end-user systems, and release-friendly components. Broader than single-surface UI/UX.",
      "challenges": [
        {
          "title": "Surface divergence",
          "body": "Admin and customer UX diverge over time"
        },
        {
          "title": "Permission fog",
          "body": "Permission models confuse new users"
        },
        {
          "title": "Tenant risk",
          "body": "Hard to ship UI improvements without breaking tenants"
        }
      ],
      "approachH2": "Tenant-aware patterns your roadmap can survive.",
      "approach": [
        {
          "n": "01",
          "title": "SaaS UX audit",
          "body": "SaaS UX audit across onboarding, permissions, and admin/end-user divergence."
        },
        {
          "n": "02",
          "title": "Tenant-aware UI",
          "body": "Tenant-aware UI patterns and an admin + end-user design system that can ship in phases."
        },
        {
          "n": "03",
          "title": "Release-friendly specs",
          "body": "Release-friendly component specs so improvements don't require a risky big-bang redesign."
        }
      ],
      "deliverables": [
        "SaaS UX audit",
        "Tenant-aware UI patterns",
        "Admin + end-user design system",
        "Release-friendly component specs"
      ],
      "benefits": [
        "Lower churn through clearer onboarding",
        "Faster feature shipping with shared patterns",
        "Enterprise-ready visual polish"
      ],
      "faq": [
        {
          "q": "Can you redesign an existing SaaS?",
          "a": "Yes. We typically roll out redesigns in phases to reduce risk and maintain continuity."
        }
      ],
      "processNote": "Phased rollouts are the default for live SaaS — continuity over big-bang launches.",
      "heroSlot": "Slot · 1600×1000 · SaaS admin / tenant UX",
      "ctaH2": "Need SaaS UX that activates?",
      "heroAsset": "/work/payrollpro/home-onboarding.jpg",
      "heroAssetAlt": "PayrollPro onboarding — related SaaS work",
      "proof": [
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro — onboarding"
        },
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS product solutions"
        },
        {
          "href": "/insights/saas-onboarding-patterns",
          "k": "Insight",
          "label": "SaaS onboarding patterns"
        }
      ],
      "related": [
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/services/dashboard-design",
          "label": "Dashboard Design"
        },
        {
          "href": "/insights/saas-mvp-uk-guide",
          "label": "SaaS MVP UK guide"
        }
      ],
      "chromeNav": "saas",
      "h1Display": "SaaS UX that activates after signup.",
      "serviceLabel": "SaaS Product Design",
      "challengesH2": "When tenants and admins fight the same UI",
      "deliverablesH2": "What your roadmap can reuse",
      "outcomesH2": "What changes after signup",
      "visualMode": "brief"
    },
    {
      "slug": "automation-systems",
      "file": "kriva-service-automation-systems.html",
      "h1": "Automation Workflows",
      "title": "Automation Workflows · Make, Zapier & human gates · KRIVA",
      "meta": "Make, Zapier, and custom automations that remove repetitive work while keeping humans in control of send and approve steps.",
      "ogTitle": "Automation Workflows — Make, Zapier & human gates",
      "eyebrow": "Service · AI & automation",
      "family": "AI & automation",
      "bullets": [
        "Make / Zapier",
        "CRM automation",
        "AI workflow design"
      ],
      "summary": "Make, Zapier, and custom automations that remove repetitive work while keeping humans in control.",
      "positioning": "For ops and support teams drowning in repeatable steps — with approval gates so automation never sends on its own.",
      "contrast": "Distinct from AI-Assisted Product Development (how we ship design/code) and from Integrations (connector reliability). This service owns workflow orchestration.",
      "challenges": [
        {
          "title": "Repeatable toil",
          "body": "Teams repeat the same manual steps daily"
        },
        {
          "title": "Tool gaps",
          "body": "Leads and data fall through cracks between tools"
        },
        {
          "title": "Orphaned workflows",
          "body": "No one owns workflow maintenance"
        }
      ],
      "approachH2": "Automate the queue. Keep humans on the send.",
      "approach": [
        {
          "n": "01",
          "title": "Workflow audit",
          "body": "Workflow audit of the steps people repeat — and where a human must stay in the loop."
        },
        {
          "n": "02",
          "title": "Make / Zapier build",
          "body": "Make / Zapier automation build with CRM and email triggers where they earn their place."
        },
        {
          "n": "03",
          "title": "Monitoring & fallback",
          "body": "Monitoring and fallback rules so low-confidence or failed runs return to a manual queue."
        }
      ],
      "deliverables": [
        "Workflow audit",
        "Make / Zapier automation build",
        "CRM & email triggers",
        "Monitoring & fallback rules"
      ],
      "benefits": [
        "Hours returned to high-value work",
        "Fewer missed follow-ups and data errors",
        "Scalable ops without hiring immediately"
      ],
      "faq": [
        {
          "q": "Can you automate AI steps too?",
          "a": "Yes. We chain LLM steps into Make workflows for summarization, routing, and draft generation, with approval gates throughout."
        }
      ],
      "processNote": "Human approval gates are default for anything customer-facing — same posture as SupportAI.",
      "heroSlot": "Slot · 1600×1000 · automation review console",
      "ctaH2": "Need automation with humans in the loop?",
      "heroAsset": "/work/supportai/thumb.jpg",
      "heroAssetAlt": "SupportAI automation — related workflow work",
      "proof": [
        {
          "href": "/work/ai-support-automation",
          "k": "Work",
          "label": "SupportAI — ticket automation"
        },
        {
          "href": "/solutions/accounting-integrations",
          "k": "Solution",
          "label": "Accounting ops"
        },
        {
          "href": "/services/ai-assisted-development",
          "k": "Service",
          "label": "AI-assisted development"
        }
      ],
      "related": [
        {
          "href": "/services/ai-assisted-development",
          "label": "AI-Assisted Development"
        },
        {
          "href": "/services/api-integrations",
          "label": "Integrations & APIs"
        },
        {
          "href": "/services/crm-development",
          "label": "CRM Design"
        }
      ],
      "chromeNav": "operations",
      "h1Display": "Automate the queue. Keep humans on the send.",
      "serviceLabel": "Automation Workflows",
      "challengesH2": "When the same steps burn every shift",
      "deliverablesH2": "What runs without babysitting",
      "outcomesH2": "What changes in the queue",
      "visualMode": "brief"
    },
    {
      "slug": "ai-assisted-development",
      "file": "kriva-service-ai-assisted-development.html",
      "h1": "AI-Assisted Product Development",
      "title": "AI-Assisted Product Development · Human oversight · KRIVA",
      "meta": "Ship with AI-augmented design, development, and QA — Claude, GPT, Copilot, and modern toolchains with human oversight at every step.",
      "ogTitle": "AI-Assisted Product Development — Human oversight",
      "eyebrow": "Service · AI & automation",
      "family": "AI & automation",
      "bullets": [
        "AI-accelerated delivery",
        "Smart prototyping",
        "Quality automation"
      ],
      "summary": "Ship faster with AI-augmented design, development, and QA. We use Claude, GPT, Copilot, and modern toolchains with human oversight at every step.",
      "positioning": "An engagement model for product teams who want AI speed without giving up craft — human review gates on every critical step.",
      "contrast": "Not the same as Automation Workflows (ops Make/Zapier). This is how we design and build product work with AI in the toolchain.",
      "challenges": [
        {
          "title": "Timeline slip",
          "body": "Delivery timelines slip despite growing teams"
        },
        {
          "title": "Craft inconsistency",
          "body": "Quality inconsistent across designers and developers"
        },
        {
          "title": "AI without gates",
          "body": "Unsure how to use AI without compromising craft"
        }
      ],
      "approachH2": "AI in the toolchain. Humans on the gate.",
      "approach": [
        {
          "n": "01",
          "title": "Workflow playbook",
          "body": "AI workflow playbook for your team — where assistants help and where they stay out."
        },
        {
          "n": "02",
          "title": "Accelerated sprints",
          "body": "Accelerated design and development sprints with prompt libraries and QA checklists."
        },
        {
          "n": "03",
          "title": "Documented process",
          "body": "Documentation of AI-assisted processes so the practice survives the engagement."
        }
      ],
      "deliverables": [
        "AI workflow playbook for your team",
        "Accelerated design + dev sprints",
        "Prompt libraries & QA checklists",
        "Documentation of AI-assisted processes"
      ],
      "benefits": [
        {
          "text": "Faster iteration on suitable workstreams",
          "tbd": "Source listed a numeric speed claim — withheld until verified"
        },
        "Consistent output with human review gates",
        "Modern positioning for investors and clients"
      ],
      "faq": [
        {
          "q": "Which AI tools do you use?",
          "a": "Claude, ChatGPT, GitHub Copilot, Figma AI plugins, and Cursor. Each is selected for the task at hand, always with human oversight."
        }
      ],
      "processNote": "Tool choice is task-specific. Oversight is not optional on customer-facing or production paths.",
      "heroSlot": "Slot · 1600×1000 · AI-assisted product workflow",
      "ctaH2": "Need AI-assisted delivery with clear ownership?",
      "heroAsset": "/work/supportai/thumb.jpg",
      "heroAssetAlt": "AI-assisted product workflow — related work",
      "proof": [
        {
          "href": "/work/ai-support-automation",
          "k": "Work",
          "label": "SupportAI"
        },
        {
          "href": "/insights/ai-in-product-design-2026",
          "k": "Insight",
          "label": "AI in product design 2026"
        },
        {
          "href": "/services/automation-systems",
          "k": "Service",
          "label": "Automation Workflows"
        }
      ],
      "related": [
        {
          "href": "/services/automation-systems",
          "label": "Automation Workflows"
        },
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/insights/ai-in-product-design-2026",
          "label": "AI in product design"
        }
      ],
      "chromeNav": "operations",
      "h1Display": "AI in the toolchain. Humans on the gate.",
      "serviceLabel": "AI-Assisted Product Development",
      "challengesH2": "When AI speed creates craft debt",
      "deliverablesH2": "What your team keeps after we leave",
      "outcomesH2": "What changes in delivery",
      "visualMode": "brief"
    },
    {
      "slug": "web-development",
      "file": "kriva-service-web-development.html",
      "h1": "Web Design & Development",
      "title": "Web Design & Development · Next.js sites · KRIVA",
      "meta": "Fast, accessible marketing sites and web apps with modern stacks, CMS flexibility, and SEO foundations — typically Next.js, React, TypeScript.",
      "ogTitle": "Web Design & Development — Next.js sites",
      "eyebrow": "Service · Build & integration",
      "family": "Build & brand",
      "bullets": [
        "Next.js / React",
        "Responsive UI",
        "Performance & SEO"
      ],
      "summary": "Fast, accessible marketing sites and web apps with modern stacks, CMS flexibility, and SEO foundations.",
      "positioning": "For teams who need a premium web presence that marketing can update — without waiting on a developer for every copy change.",
      "contrast": "Implementation-focused. Product Design / UI/UX own authenticated product UX; this service ships the marketing site or web surface with performance and SEO structure.",
      "challenges": [
        {
          "title": "Dated presence",
          "body": "Site feels slow or dated compared to competitors"
        },
        {
          "title": "CMS bottleneck",
          "body": "Marketing team can't update content without developers"
        },
        {
          "title": "Mobile conversion loss",
          "body": "Poor mobile experience hurts conversions"
        }
      ],
      "approachH2": "Ship a site your team can actually run.",
      "approach": [
        {
          "n": "01",
          "title": "Responsive Next.js build",
          "body": "Responsive Next.js implementation with a reusable component library."
        },
        {
          "n": "02",
          "title": "CMS when needed",
          "body": "CMS integration when marketing needs to publish without engineering tickets."
        },
        {
          "n": "03",
          "title": "Performance baseline",
          "body": "Performance and analytics baseline so you know what “good” looks like after launch."
        }
      ],
      "deliverables": [
        "Responsive Next.js implementation",
        "Reusable component library",
        "CMS integration (when needed)",
        "Performance & analytics baseline"
      ],
      "benefits": [
        "Premium web presence that loads fast",
        "Easier content updates for your team",
        "SEO-friendly structure out of the box"
      ],
      "faq": [
        {
          "q": "Which stack do you prefer?",
          "a": "Next.js, React, and TypeScript for most marketing and product sites. Chosen for speed, SEO, and maintainability."
        }
      ],
      "processNote": "Preferred stack is Next.js, React, and TypeScript for most marketing and product sites — confirmed in source FAQ.",
      "heroSlot": "Slot · 1600×1000 · marketing site / web app",
      "ctaH2": "Need a site or web app that holds up?",
      "heroAsset": "/work/brandlift/thumb.jpg",
      "heroAssetAlt": "BrandLift storefront — related web work",
      "proof": [
        {
          "href": "/work/brandlift-ecommerce",
          "k": "Work",
          "label": "BrandLift — storefront"
        },
        {
          "href": "/insights/no-code-vs-custom-mvp",
          "k": "Insight",
          "label": "No-code vs custom MVP"
        },
        {
          "href": "/technologies",
          "k": "Stack",
          "label": "Technologies"
        }
      ],
      "related": [
        {
          "href": "/services/branding",
          "label": "Branding"
        },
        {
          "href": "/services/no-code-low-code",
          "label": "No-Code / Low-Code"
        },
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Marketing sites your team can actually run.",
      "serviceLabel": "Web Design & Development",
      "challengesH2": "When the site can't keep up with marketing",
      "deliverablesH2": "What marketing can update next week",
      "outcomesH2": "What changes on the public site",
      "visualMode": "brief"
    },
    {
      "slug": "no-code-low-code",
      "file": "kriva-service-no-code-low-code.html",
      "h1": "No-Code / Low-Code Solutions",
      "title": "No-Code / Low-Code Solutions · MVP validation · KRIVA",
      "meta": "Webflow, Bubble, Framer, and Make-powered MVPs and internal tools — validate before months of custom build.",
      "ogTitle": "No-Code / Low-Code Solutions — MVP validation",
      "eyebrow": "Service · AI & automation",
      "family": "AI & automation",
      "bullets": [
        "Webflow & Framer",
        "Bubble apps",
        "Rapid MVPs"
      ],
      "summary": "Webflow, Bubble, Framer, and Make-powered MVPs and internal tools without months of custom build time.",
      "positioning": "For founders and operators who need to learn from a live product before committing to a custom build — marketplaces, landing systems, internal tools.",
      "contrast": "Complements Web Development and Product Design. We recommend no-code when validation speed wins; we say no when compliance or scale demands custom code.",
      "challenges": [
        {
          "title": "Need an MVP fast",
          "body": "Need an MVP fast but full custom build is too slow"
        },
        {
          "title": "Internal tools stuck in spreadsheets",
          "body": "Internal tools stuck in spreadsheets"
        },
        {
          "title": "Marketing wants landing pages",
          "body": "Marketing wants landing pages without dev bottlenecks"
        }
      ],
      "approachH2": "Validate the slice. Decide what to rebuild later.",
      "approach": [
        {
          "n": "01",
          "title": "Platform choice",
          "body": "Platform selection recommendation — Webflow, Framer, Bubble — matched to the risk you are testing."
        },
        {
          "n": "02",
          "title": "Build + hooks",
          "body": "Webflow / Framer / Bubble build with Make automation hooks where ops needs them."
        },
        {
          "n": "03",
          "title": "Handoff",
          "body": "Handoff documentation so non-technical teams can iterate after launch."
        }
      ],
      "deliverables": [
        "Platform selection recommendation",
        "Webflow / Framer / Bubble build",
        "Make automation hooks",
        "Handoff documentation"
      ],
      "benefits": [
        "Launch in weeks, not months",
        "Lower cost for validation-stage products",
        "Easy iteration for non-technical teams"
      ],
      "faq": [
        {
          "q": "When is no-code the wrong choice?",
          "a": "Highly custom logic, strict compliance, or massive scale usually need custom code. We'll tell you honestly in discovery."
        }
      ],
      "processNote": "LocalServe-style path: validate on no-code, then migrate the proven slice to custom when unit economics justify it.",
      "heroSlot": "Slot · 1600×1000 · no-code marketplace / MVP",
      "ctaH2": "Need a no-code MVP that can grow?",
      "heroAsset": "/work/localserve/thumb.jpg",
      "heroAssetAlt": "Marketplace MVP — related no-code work",
      "proof": [
        {
          "href": "/work/marketplace-mvp",
          "k": "Work",
          "label": "LocalServe — marketplace MVP"
        },
        {
          "href": "/insights/no-code-vs-custom-mvp",
          "k": "Insight",
          "label": "No-code vs custom MVP"
        },
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS solutions"
        }
      ],
      "related": [
        {
          "href": "/services/web-development",
          "label": "Web Design & Development"
        },
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/services/automation-systems",
          "label": "Automation Workflows"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Validate the MVP before months of custom build.",
      "serviceLabel": "No-Code / Low-Code Solutions",
      "challengesH2": "When custom build is premature",
      "deliverablesH2": "What you can learn from in weeks",
      "outcomesH2": "What changes before you commit",
      "visualMode": "brief"
    },
    {
      "slug": "product-design",
      "file": "kriva-service-product-design.html",
      "h1": "Product Design",
      "title": "Product Design · Strategy to launch-ready UI · KRIVA",
      "meta": "Full product design for SaaS, dashboards, and digital platforms — from concept through launch-ready UI, not just individual screens.",
      "ogTitle": "Product Design — Strategy to launch-ready UI",
      "eyebrow": "Service · Product & UX",
      "family": "Product & UX",
      "bullets": [
        "Product strategy",
        "UX architecture",
        "High-fidelity UI"
      ],
      "summary": "Full product design for SaaS, dashboards, and digital platforms, from concept through to launch-ready UI.",
      "positioning": "End-to-end product scope: strategy, flows, and UI for the whole product — so stakeholders share one prototype before engineering starts.",
      "contrast": "Different from UI/UX Design: Product Design spans strategy, flows, and UI for the full product, not just individual screens or marketing pages. UI/UX owns research-led flows, prototypes, and interface systems that stay coherent as features land.",
      "challenges": [
        {
          "title": "Product vision exists but",
          "body": "Product vision exists but UI execution lags"
        },
        {
          "title": "Stakeholders disagree on priorities",
          "body": "Stakeholders disagree on priorities without a shared prototype"
        },
        {
          "title": "Dashboards and settings feel",
          "body": "Dashboards and settings feel like an afterthought"
        }
      ],
      "approachH2": "One coherent product narrative before code.",
      "approach": [
        {
          "n": "01",
          "title": "Product UX map",
          "body": "Product UX map that covers core journeys — including the settings and dashboards that usually get left behind."
        },
        {
          "n": "02",
          "title": "Flows & edge cases",
          "body": "Core user flows plus edge cases, so priorities are visible in a shared prototype — not a slide deck."
        },
        {
          "n": "03",
          "title": "Launch-ready UI",
          "body": "Design system foundations and launch-ready UI screens engineering can build against."
        }
      ],
      "deliverables": [
        "Product UX map",
        "Core user flows + edge cases",
        "Design system foundations",
        "Launch-ready UI screens"
      ],
      "benefits": [
        "One coherent product narrative from day one",
        "Reduced rework before development starts",
        "Premium feel that supports pricing and trust"
      ],
      "faq": [
        {
          "q": "Is this different from UI/UX design?",
          "a": "Product design spans strategy, flows, and UI for the full product, not just individual screens or marketing pages."
        }
      ],
      "processNote": "Often the umbrella engagement. UI/UX, research, and prototyping capabilities may nest inside when the brief is narrower.",
      "heroSlot": "Slot · 1600×1000 · product UX map / launch UI",
      "ctaH2": "Need product design that ships?",
      "heroAsset": "/work/payrollpro/thumb.jpg",
      "heroAssetAlt": "PayrollPro product UX — related design work",
      "proof": [
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro"
        },
        {
          "href": "/work/fleetflow-dispatch",
          "k": "Work",
          "label": "FleetFlow"
        },
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS solutions"
        }
      ],
      "related": [
        {
          "href": "/services/ui-ux-design",
          "label": "UI/UX Design — sibling"
        },
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        },
        {
          "href": "/insights/choosing-a-digital-agency",
          "label": "Choosing a digital agency"
        }
      ],
      "chromeNav": "saas",
      "h1Display": "End-to-end product design — strategy to ship.",
      "serviceLabel": "Product Design",
      "challengesH2": "When screens ship without a product story",
      "deliverablesH2": "What the product team leaves with",
      "outcomesH2": "What changes in the product story",
      "visualMode": "brief"
    },
    {
      "slug": "ui-ux-design",
      "file": "kriva-service-ui-ux-design.html",
      "h1": "UI/UX Design",
      "title": "UI/UX Design · Flows, prototypes & systems · KRIVA",
      "meta": "Research-led flows, prototypes, and interface systems that stay intuitive as products grow — Figma-first with dev-ready specs.",
      "ogTitle": "UI/UX Design — Flows, prototypes & systems",
      "eyebrow": "Service · Product & UX",
      "family": "Product & UX",
      "bullets": [
        "User research",
        "Wireframes & prototypes",
        "Design systems"
      ],
      "summary": "Research-led flows, prototypes, and interface systems that stay intuitive as products grow.",
      "positioning": "For teams shipping features into a live product — keeping flows coherent, prototypes crisp, and handoffs fast as the interface grows.",
      "contrast": "Different from Product Design: UI/UX focuses on research-led flows, prototypes, and interface systems for screens and journeys. Product Design covers full-product strategy through launch-ready UI. See Product Design when you need the whole narrative, not a surface.",
      "challenges": [
        {
          "title": "New features make the",
          "body": "New features make the product feel inconsistent"
        },
        {
          "title": "Users drop off in",
          "body": "Users drop off in complex workflows"
        },
        {
          "title": "Design handoffs slow engineering down",
          "body": "Design handoffs slow engineering down"
        }
      ],
      "approachH2": "Flows and systems that survive the next release.",
      "approach": [
        {
          "n": "01",
          "title": "Research summary",
          "body": "User research summary so interface decisions are evidence-led — not opinion wars."
        },
        {
          "n": "02",
          "title": "IA & prototype",
          "body": "Information architecture map and interactive Figma prototype stakeholders can walk."
        },
        {
          "n": "03",
          "title": "UI kit & specs",
          "body": "UI kit with component specs — Figma-first, with optional FigJam workshops and tokens for engineering."
        }
      ],
      "deliverables": [
        "User research summary",
        "Information architecture map",
        "Interactive Figma prototype",
        "UI kit with component specs"
      ],
      "benefits": [
        "Faster stakeholder alignment",
        "Higher conversion and task completion",
        "Design system that scales with your roadmap"
      ],
      "faq": [
        {
          "q": "Do you work with our in-house team?",
          "a": "Yes. We embed alongside your designers or product managers and share Figma libraries your team owns."
        },
        {
          "q": "Which tools do you use?",
          "a": "Figma-first, with optional FigJam for workshops. We deliver dev-ready specs and tokens."
        }
      ],
      "processNote": "Often nests inside a Product Design or SaaS engagement — or stands alone when the product narrative already exists.",
      "heroSlot": "Slot · 1600×1000 · Figma flows / UI kit",
      "ctaH2": "Need UI/UX that clears the next release?",
      "heroAsset": "/work/payrollpro/permissions.jpg",
      "heroAssetAlt": "Permission clarity UI — related UX work",
      "proof": [
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro"
        },
        {
          "href": "/work/healthtrack-mobile",
          "k": "Work",
          "label": "HealthTrack"
        },
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS solutions"
        }
      ],
      "related": [
        {
          "href": "/services/product-design",
          "label": "Product Design — sibling"
        },
        {
          "href": "/services/mobile-applications",
          "label": "Mobile App Design"
        },
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        }
      ],
      "chromeNav": "saas",
      "h1Display": "Flows, systems, and UI teams can hand off.",
      "serviceLabel": "UI/UX Design",
      "challengesH2": "When interfaces look finished but feel stuck",
      "deliverablesH2": "What design and engineering share",
      "outcomesH2": "What changes in the interface",
      "visualMode": "brief"
    },
    {
      "slug": "branding",
      "file": "kriva-service-branding.html",
      "h1": "Branding & Graphic Design",
      "title": "Branding & Graphic Design · Identity systems · KRIVA",
      "meta": "Cohesive brand identity, visual systems, and marketing assets that elevate perception without trend-chasing.",
      "ogTitle": "Branding & Graphic Design — Identity systems",
      "eyebrow": "Service · Brand",
      "family": "Build & brand",
      "bullets": [
        "Brand identity",
        "Visual guidelines",
        "Marketing collateral"
      ],
      "summary": "Cohesive brand identity, visual systems, and marketing assets that elevate perception without trend-chasing.",
      "positioning": "For products and D2C brands that feel generic next to competitors — or whose marketing and product visuals no longer match.",
      "contrast": "Broader than logo-only work (logo remains a hub capability). Includes guidelines, templates, and systems marketing can reuse.",
      "challenges": [
        {
          "title": "Brand looks generic compared",
          "body": "Brand looks generic compared to competitors"
        },
        {
          "title": "Marketing and product visuals",
          "body": "Marketing and product visuals don't match"
        },
        {
          "title": "No reusable templates; everything",
          "body": "No reusable templates; everything built from scratch"
        }
      ],
      "approachH2": "Stabilize the system — or rebuild what has to change.",
      "approach": [
        {
          "n": "01",
          "title": "Mark & identity",
          "body": "Logo refinement or new mark, with color, type, and layout rules that hold across digital touchpoints."
        },
        {
          "n": "02",
          "title": "Guidelines",
          "body": "Brand guidelines PDF so marketing and product stop inventing one-off treatments."
        },
        {
          "n": "03",
          "title": "Templates",
          "body": "Social and deck templates so production speed improves after the system lands."
        }
      ],
      "deliverables": [
        "Logo refinement or new mark",
        "Color, type, and layout rules",
        "Brand guidelines PDF",
        "Social & deck templates"
      ],
      "benefits": [
        "Stronger first impression with clients",
        "Consistent visuals across touchpoints",
        "Faster production for marketing assets"
      ],
      "faq": [
        {
          "q": "Do you only do full rebrands?",
          "a": "No. We often stabilize existing brands with a focused visual system refresh."
        }
      ],
      "processNote": "Full rebrand or focused visual-system refresh — confirmed in source FAQ. Logo-only work can run standalone or as phase one.",
      "heroSlot": "Slot · 1600×1000 · brand system / storefront",
      "ctaH2": "Need branding that earns trust?",
      "heroAsset": "/work/brandlift/thumb.jpg",
      "heroAssetAlt": "BrandLift brand system — related branding work",
      "proof": [
        {
          "href": "/work/brandlift-ecommerce",
          "k": "Work",
          "label": "BrandLift — D2C rebrand"
        },
        {
          "href": "/services/web-development",
          "k": "Service",
          "label": "Web Design & Development"
        },
        {
          "href": "/work",
          "k": "Work",
          "label": "Full portfolio"
        }
      ],
      "related": [
        {
          "href": "/services/web-development",
          "label": "Web Design & Development"
        },
        {
          "href": "/services/logo-design",
          "label": "Logo Design"
        },
        {
          "href": "/work/brandlift-ecommerce",
          "label": "BrandLift case study"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Brand systems that survive real product surfaces.",
      "serviceLabel": "Branding & Graphic Design",
      "challengesH2": "When brand lives only in a PDF",
      "deliverablesH2": "What the brand system includes",
      "outcomesH2": "What changes in brand consistency",
      "visualMode": "brief"
    },
    {
      "slug": "ux-research",
      "file": "kriva-service-ux-research.html",
      "h1": "UX Research",
      "title": "UX Research · Evidence before build · KRIVA",
      "meta": "Interviews, usability tests, and journey mapping that turn assumptions into evidence-backed product decisions.",
      "ogTitle": "UX Research — Evidence before build",
      "eyebrow": "Service · Product interfaces",
      "family": "Product & UX",
      "bullets": [
        "User interviews",
        "Usability testing",
        "Journey & persona maps"
      ],
      "summary": "Interviews, usability tests, and journey mapping that turn assumptions into evidence-backed product decisions.",
      "positioning": "For teams about to rebuild dispatch, onboarding, or a core workflow — when opinions are loud and evidence is thin.",
      "contrast": "Feeds Product Design and Wireframing & Prototyping. Research owns the evidence; those services own the flows and UI that follow.",
      "challenges": [
        {
          "title": "Product decisions rely on",
          "body": "Product decisions rely on opinions instead of evidence"
        },
        {
          "title": "Usability issues surface only",
          "body": "Usability issues surface only after launch"
        },
        {
          "title": "Teams lack shared understanding",
          "body": "Teams lack shared understanding of user goals"
        }
      ],
      "approachH2": "Ask the desks that live in the product.",
      "approach": [
        {
          "n": "01",
          "title": "Plan & recruit",
          "body": "Research plan and recruitment guide scoped to the decision you need to make — not a generic study."
        },
        {
          "n": "02",
          "title": "Sessions & synthesis",
          "body": "Interviews or usability tests with notes and recordings your team can revisit."
        },
        {
          "n": "03",
          "title": "Prioritized readout",
          "body": "Insight report with prioritized recommendations, plus journey maps or persona snapshots when they clarify the system."
        }
      ],
      "deliverables": [
        "Research plan & recruitment guide",
        "Interview or test recordings & notes",
        "Insight report with prioritized recommendations",
        "Journey maps or persona snapshots"
      ],
      "benefits": [
        "Clearer roadmap priorities backed by user evidence",
        "Fewer expensive rework cycles",
        "Shared language across product, design, and leadership"
      ],
      "faq": [
        {
          "q": "How long does a research sprint take?",
          "a": "Most focused studies run 2-4 weeks from kickoff to readout, depending on recruitment and scope."
        }
      ],
      "processNote": "Usually runs before wireframes or as a focused check before a high-risk rebuild.",
      "heroSlot": "Slot · 1600×1000 · research workshop / journey map",
      "ctaH2": "Need research before the next build?",
      "heroAsset": "/work/payrollpro/role-path.jpg",
      "heroAssetAlt": "Onboarding research path — related research work",
      "proof": [
        {
          "href": "/work/fleetflow-dispatch",
          "k": "Work",
          "label": "FleetFlow — ops research"
        },
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro — activation"
        },
        {
          "href": "/services/product-design",
          "k": "Service",
          "label": "Product Design"
        }
      ],
      "related": [
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/services/wireframing-prototyping",
          "label": "Wireframing & Prototyping"
        },
        {
          "href": "/services/ui-ux-design",
          "label": "UI/UX Design"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Evidence before the expensive build.",
      "serviceLabel": "UX Research",
      "challengesH2": "When opinions replace evidence",
      "deliverablesH2": "What decisions get evidence",
      "outcomesH2": "What changes before build",
      "visualMode": "brief"
    },
    {
      "slug": "wireframing-prototyping",
      "file": "kriva-service-wireframing-prototyping.html",
      "h1": "Wireframing & Prototyping",
      "title": "Wireframing & Prototyping · Align before code · KRIVA",
      "meta": "Low- and high-fidelity prototypes that align stakeholders and de-risk development before code starts.",
      "ogTitle": "Wireframing & Prototyping — Align before code",
      "eyebrow": "Service · Product interfaces",
      "family": "Product & UX",
      "bullets": [
        "Wireframes",
        "Interactive prototypes",
        "Stakeholder walkthroughs"
      ],
      "summary": "Low- and high-fidelity prototypes that align stakeholders and de-risk development before code starts.",
      "positioning": "For founders and product leads who need something tangible before engineering commits — MVP scope, onboarding, or a contested workflow.",
      "contrast": "Sits between UX Research and UI/UX Design. Prototypes prove the flow; visual systems and production UI come next.",
      "challenges": [
        {
          "title": "Stakeholders can't align on",
          "body": "Stakeholders can't align on scope without something tangible"
        },
        {
          "title": "Engineering starts before flows",
          "body": "Engineering starts before flows are validated"
        },
        {
          "title": "Iterations are slow when",
          "body": "Iterations are slow when feedback is scattered"
        }
      ],
      "approachH2": "Make the flow visible before the pixels get precious.",
      "approach": [
        {
          "n": "01",
          "title": "Structure first",
          "body": "Low-fidelity wireframes that lock information architecture and primary paths."
        },
        {
          "n": "02",
          "title": "Clickable prototype",
          "body": "Interactive Figma prototype for walkthroughs — including mobile and web when both matter."
        },
        {
          "n": "03",
          "title": "Annotated handoff",
          "body": "Annotated flows and iteration notes so engineering inherits decisions, not debates."
        }
      ],
      "deliverables": [
        "Low-fidelity wireframes",
        "Clickable Figma prototype",
        "Annotated flows for engineering",
        "Iteration notes from review sessions"
      ],
      "benefits": [
        "Faster alignment before build",
        "Lower cost to explore alternatives",
        "Clearer handoff into development"
      ],
      "faq": [
        {
          "q": "Do you prototype for mobile and web?",
          "a": "Yes. We prototype for the platform your product targets, including responsive web and native mobile patterns."
        }
      ],
      "processNote": "Often paired with a short research pass, then hands into UI/UX or product design for production fidelity.",
      "heroSlot": "Slot · 1600×1000 · wireframe / prototype board",
      "ctaH2": "Need wireframes and prototypes that decide?",
      "heroAsset": "/work/fleetflow/load-board.jpg",
      "heroAssetAlt": "Load board prototype frame — related wireframe work",
      "proof": [
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro — onboarding"
        },
        {
          "href": "/work/marketplace-mvp",
          "k": "Work",
          "label": "Marketplace MVP"
        },
        {
          "href": "/services/ux-research",
          "k": "Service",
          "label": "UX Research"
        }
      ],
      "related": [
        {
          "href": "/services/ux-research",
          "label": "UX Research"
        },
        {
          "href": "/services/ui-ux-design",
          "label": "UI/UX Design"
        },
        {
          "href": "/services/product-design",
          "label": "Product Design"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Align the room before you write code.",
      "serviceLabel": "Wireframing & Prototyping",
      "challengesH2": "When engineering starts from a verbal brief",
      "deliverablesH2": "What stakeholders can click",
      "outcomesH2": "What changes in alignment",
      "visualMode": "brief"
    },
    {
      "slug": "design-systems",
      "file": "kriva-service-design-systems.html",
      "h1": "Design Systems",
      "title": "Design Systems · Tokens & components · KRIVA",
      "meta": "Scalable component libraries, tokens, and documentation that keep product teams shipping consistent UI.",
      "ogTitle": "Design Systems — Tokens & components",
      "eyebrow": "Service · Product interfaces",
      "family": "Product & UX",
      "bullets": [
        "Component libraries",
        "Design tokens",
        "Dev-ready specs"
      ],
      "summary": "Scalable component libraries, tokens, and documentation that keep product teams shipping consistent UI.",
      "positioning": "For SaaS and multi-surface products where every feature reinvents buttons, tables, and forms — and design-to-dev drift is slowing releases.",
      "contrast": "Complements SaaS Product Design and UI/UX Design. Those own product flows; this service owns the shared language that keeps them consistent.",
      "challenges": [
        {
          "title": "UI inconsistencies multiply as",
          "body": "UI inconsistencies multiply as the team grows"
        },
        {
          "title": "Design and engineering interpret",
          "body": "Design and engineering interpret components differently"
        },
        {
          "title": "Every new feature reinvents",
          "body": "Every new feature reinvents basic patterns"
        }
      ],
      "approachH2": "Consolidate what you have. Document what you keep.",
      "approach": [
        {
          "n": "01",
          "title": "Audit & tokens",
          "body": "Token and typography scale that matches how the product already behaves — or how it needs to."
        },
        {
          "n": "02",
          "title": "Component library",
          "body": "Figma component library with clear variants, states, and usage rules."
        },
        {
          "n": "03",
          "title": "Docs & mapping",
          "body": "Usage documentation and optional code component mapping so engineering ships the same system."
        }
      ],
      "deliverables": [
        "Token and typography scale",
        "Component library in Figma",
        "Usage documentation",
        "Optional code component mapping"
      ],
      "benefits": [
        "Faster feature delivery with reusable patterns",
        "More consistent brand and UX quality",
        "Easier onboarding for new designers and developers"
      ],
      "faq": [
        {
          "q": "Can you extend an existing system?",
          "a": "Yes. We audit what you have, consolidate duplicates, and expand components without disrupting live product work."
        }
      ],
      "processNote": "Often follows a product redesign phase, or runs in parallel once core flows stabilize.",
      "heroSlot": "Slot · 1600×1000 · design system / component board",
      "ctaH2": "Need a design system teams will keep?",
      "heroAsset": "/work/payrollpro/after.jpg",
      "heroAssetAlt": "Product UI kit frame — related design system work",
      "proof": [
        {
          "href": "/solutions/saas",
          "k": "Solution",
          "label": "SaaS solutions"
        },
        {
          "href": "/work/payroll-pro-saas",
          "k": "Work",
          "label": "PayrollPro"
        },
        {
          "href": "/services/saas-platforms",
          "k": "Service",
          "label": "SaaS Product Design"
        }
      ],
      "related": [
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        },
        {
          "href": "/services/product-design",
          "label": "Product Design"
        },
        {
          "href": "/services/ui-ux-design",
          "label": "UI/UX Design"
        }
      ],
      "chromeNav": "saas",
      "h1Display": "Tokens and components that survive releases.",
      "serviceLabel": "Design Systems",
      "challengesH2": "When every feature invents its own UI",
      "deliverablesH2": "What the design system ships",
      "outcomesH2": "What changes across releases",
      "visualMode": "brief"
    },
    {
      "slug": "web-application-design",
      "file": "kriva-service-web-application-design.html",
      "h1": "Web Application Design",
      "title": "Web Application Design · Authenticated product UX · KRIVA",
      "meta": "Complex web app UX for authenticated products, multi-step flows, and data-heavy interfaces.",
      "ogTitle": "Web Application Design — Authenticated product UX",
      "eyebrow": "Service · Apps & dashboards",
      "family": "Apps & dashboards",
      "bullets": [
        "App UX architecture",
        "Responsive layouts",
        "Interaction patterns"
      ],
      "summary": "Complex web app UX for authenticated products, multi-step flows, and data-heavy interfaces.",
      "positioning": "For authenticated products where marketing-site patterns fail — ops portals, customer apps, and multi-step workflows that must stay clear on every breakpoint.",
      "contrast": "Different from Web Design & Development (marketing sites / build) and from Dashboard Design (analytics hierarchy). This service owns app IA and interaction patterns.",
      "challenges": [
        {
          "title": "Marketing-site patterns don't fit",
          "body": "Marketing-site patterns don't fit authenticated product UX"
        },
        {
          "title": "Complex workflows feel overwhelming",
          "body": "Complex workflows feel overwhelming to new users"
        },
        {
          "title": "Responsive behavior breaks down",
          "body": "Responsive behavior breaks down on data-heavy screens"
        }
      ],
      "approachH2": "Architecture first. Screens second.",
      "approach": [
        {
          "n": "01",
          "title": "App IA",
          "body": "Information architecture for signed-in experiences — navigation, roles, and primary jobs-to-be-done."
        },
        {
          "n": "02",
          "title": "Workflow UI",
          "body": "Core workflow screens with empty states, errors, and edge cases designed in — not bolted on."
        },
        {
          "n": "03",
          "title": "Responsive specs",
          "body": "Responsive layout and interaction specs ready for React or Next.js handoff."
        }
      ],
      "deliverables": [
        "App information architecture",
        "Core workflow UI screens",
        "Responsive layout specs",
        "Interaction and empty-state patterns"
      ],
      "benefits": [
        "Product UX that scales beyond landing pages",
        "Clearer paths through multi-step tasks",
        "Better handoff for React or Next.js builds"
      ],
      "faq": [
        {
          "q": "Is this different from web development?",
          "a": "Yes. This service focuses on UX and UI for web applications. We also offer implementation through our development services."
        }
      ],
      "processNote": "Pairs with SaaS Product Design for multi-tenant products, or Web Development when you need the build too.",
      "heroSlot": "Slot · 1600×1000 · authenticated web app UI",
      "ctaH2": "Need authenticated web app UX?",
      "heroAsset": "/work/fleetflow/console-full.jpg",
      "heroAssetAlt": "Ops console UI — related web application work",
      "proof": [
        {
          "href": "/solutions/car-transportation",
          "k": "Solution",
          "label": "Car transportation"
        },
        {
          "href": "/work/finance-sync-hub",
          "k": "Work",
          "label": "FinanceSync"
        },
        {
          "href": "/services/saas-platforms",
          "k": "Service",
          "label": "SaaS Product Design"
        }
      ],
      "related": [
        {
          "href": "/services/saas-platforms",
          "label": "SaaS Product Design"
        },
        {
          "href": "/services/dashboard-design",
          "label": "Dashboard Design"
        },
        {
          "href": "/services/web-development",
          "label": "Web Design & Development"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Authenticated product UX — not a marketing site.",
      "serviceLabel": "Web Application Design",
      "challengesH2": "When the app UX is treated like a brochure",
      "deliverablesH2": "What authenticated users navigate",
      "outcomesH2": "What changes inside the product",
      "visualMode": "brief"
    },
    {
      "slug": "logo-design",
      "file": "kriva-service-logo-design.html",
      "h1": "Logo Design",
      "title": "Logo Design · Marks that scale · KRIVA",
      "meta": "Distinctive marks and logo systems that work across digital, print, and social touchpoints.",
      "ogTitle": "Logo Design — Marks that scale",
      "eyebrow": "Service · Brand",
      "family": "Build & brand",
      "bullets": [
        "Logo concepts",
        "Mark refinement",
        "Usage guidelines"
      ],
      "summary": "Distinctive marks and logo systems that work across digital, print, and social touchpoints.",
      "positioning": "For products whose mark fails at favicon size, feels forgettable in a crowded category, or is used inconsistently across teams.",
      "contrast": "Can stand alone or open a Branding & Graphic Design engagement. Logo owns the mark system; branding owns the wider visual language.",
      "challenges": [
        {
          "title": "Current mark doesn't scale",
          "body": "Current mark doesn't scale across digital sizes"
        },
        {
          "title": "Brand feels forgettable in",
          "body": "Brand feels forgettable in a crowded market"
        },
        {
          "title": "Logo usage is inconsistent",
          "body": "Logo usage is inconsistent across teams"
        }
      ],
      "approachH2": "Explore widely. Lock usage tightly.",
      "approach": [
        {
          "n": "01",
          "title": "Concept exploration",
          "body": "Concept exploration deck across directions that fit your category and naming — not trend templates."
        },
        {
          "n": "02",
          "title": "Lockups",
          "body": "Primary and secondary logo lockups refined for clarity at small and large sizes."
        },
        {
          "n": "03",
          "title": "Usage kit",
          "body": "Clear space, minimum size rules, and an export kit for web, print, and social."
        }
      ],
      "deliverables": [
        "Concept exploration deck",
        "Primary and secondary logo lockups",
        "Clear space and minimum size rules",
        "Export kit for web, print, and social"
      ],
      "benefits": [
        "Stronger recognition in sales and marketing",
        "Consistent logo usage across touchpoints",
        "Foundation for broader brand identity work"
      ],
      "faq": [
        {
          "q": "Is logo design part of a full rebrand?",
          "a": "It can be standalone or the first phase of a broader branding engagement, depending on your needs."
        }
      ],
      "processNote": "Standalone mark work or phase one of a broader branding engagement — confirmed in source FAQ.",
      "heroSlot": "Slot · 1600×1000 · logo lockups / brand mark",
      "ctaH2": "Need a logo system that scales?",
      "heroAsset": "/work/brandlift/thumb.jpg",
      "heroAssetAlt": "Brand mark frame — related logo work",
      "proof": [
        {
          "href": "/work/brandlift-ecommerce",
          "k": "Work",
          "label": "BrandLift"
        },
        {
          "href": "/services/branding",
          "k": "Service",
          "label": "Branding & Graphic Design"
        },
        {
          "href": "/services/web-development",
          "k": "Service",
          "label": "Web Design & Development"
        }
      ],
      "related": [
        {
          "href": "/services/branding",
          "label": "Branding & Graphic Design"
        },
        {
          "href": "/services/web-development",
          "label": "Web Design & Development"
        },
        {
          "href": "/work/brandlift-ecommerce",
          "label": "BrandLift case study"
        }
      ],
      "chromeNav": "services",
      "h1Display": "Marks that scale from favicon to fleet.",
      "serviceLabel": "Logo Design",
      "challengesH2": "When the mark breaks the moment it scales",
      "deliverablesH2": "What you get beyond a single PNG",
      "outcomesH2": "What changes in recognition",
      "visualMode": "brief"
    }
  ]
};
