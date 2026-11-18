# Project record: KRIVA Technologies website

- **Project:** krivatechnologies.com (static HTML on Vercel, repo = this folder)
- **Type:** optimise
- **Scope (2026-11-18):** full-site audit only; no changes to be made until the direction gate is approved
- **Goal:** better quality, usability, credibility, performance and conversions

## Step status
| Step | Status | Note |
|---|---|---|
| 01 Discovery | done | 2026-11-18 live crawl, 68 URLs |
| 02 Content and business research | done | in audit §1–2 |
| 03 Competitor research | pending (optional) | not run; offer next |
| 04 Site audit | done | research/site-audit-2026-11-18.md |
| 06 Improvement plan (direction gate) | done (v3), awaiting approval | strategy/action-plan-2026-11-18.md: sequenced tasks, SEO safeguards, test criteria, Phase 0 QA, rollback, exit criteria; decisions D1–D7 recommended |
| 05–08 Design | n/a | plan avoids redesign; U-01/U-02 deferred |
| 09–11 Fixes (code, wording, technical SEO) | pending | blocked on direction gate |
| 13 QA | pending | |
| 15 Staging review | pending | |
| 16 Production | pending | |

## Decisions
_(none recorded yet)_

## Assumptions
| Topic | Working value | Date |
|---|---|---|
| Primary market | US trucking, moving, logistics (from homepage H1 and llms.txt) | 2026-11-18 |

## Approvals
| Gate | Date | Owner's words |
|---|---|---|
| direction | — | awaiting |

## Issues (open)
| ID | Severity | Title | Status |
|---|---|---|---|
| C-01 | critical | Representative case studies read as real delivery (Work + 8 case pages) | open, needs owner decision |
| C-02 | critical | elite-one.us NXDOMAIN, linked as live client site (Work, trucking websites) | open |
| C-03 | critical | GA4 + Clarity run before consent; no banner (site-wide) | open, specialist review |
| C-04 | critical | Form delivery unverified after 2026-11-07 outage (site-wide) | open, needs test submission |
| P-01 | high | No LCP recorded on /solutions/trucking-logistics | open |
| A-01 | high | Contrast failures on 32 pages | open |
| T-05 | high | /contact fit form lacks a Website option | open |
| (rest) | — | see research/site-audit-2026-11-18.md §4 | open |

## Evidence
- Backup: n/a (no changes made). Live source = commit `bfb12ab` (68/68 live pages byte-identical, checked 18 Nov)
- SEO baseline preserved 2026-11-18: `baseline/2026-11-18/` (312 files, read-only, SHA-256 manifest verified; 301 copies verified identical to the originals). Missing: Search Console, GA4, Bing, field Core Web Vitals (see its README §4)
- Crawl complete: 68/68 sitemap URLs, 0 non-200, 0 pages outside the sitemap
- Not measured: field Core Web Vitals, Search Console, keyword volumes, 320px/tablet, non-Chrome browsers, end-to-end form delivery
