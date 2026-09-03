#!/usr/bin/env python3
"""Apply canonical KRIVA chrome (header mega menu + footer) to all redesign HTML pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Page key → which top-level nav item gets aria-current / is-active
PAGE_CURRENT = {
    "kriva-redesign.html": None,  # home — none
    "kriva-solution-trucking.html": "trucking",
    "kriva-solution-saas.html": "saas",
    "kriva-solution-accounting.html": "integration",
    "kriva-solution-car-transport.html": "trucking",
    "kriva-services-index.html": "services",
    "kriva-work-index.html": "work",
    "kriva-case-fleetflow.html": "work",
    "kriva-contact.html": None,
}

CSS_LINK = '<link rel="stylesheet" href="shared/chrome.css">'
JS_TAG = '<script src="shared/chrome.js" defer></script>'


def cur(key: str | None, name: str) -> str:
    return ' aria-current="page"' if key == name else ""


def active(key: str | None, name: str) -> str:
    return " is-active" if key == name else ""


def header_html(current: str | None) -> str:
    return f'''<header class="nav" id="nav">
  <div class="nav-shell">
    <div class="wrap nav-in">
      <a href="/" class="mark" aria-label="KRIVA Technologies home">
        <img class="mark-logo" src="/brand/logos/kriva-wordmark.svg" alt="" width="144" height="26">
      </a>
      <div class="nav-primary">
        <nav aria-label="Primary">
          <ul class="nav-links">
            <li class="nav-item{active(current, "trucking")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-trucking" aria-haspopup="true">Trucking<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-trucking" role="menu">
                <div class="mm-head"><b>Trucking &amp; logistics</b><span>Ops software</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/trucking-logistics"><strong>Trucking &amp; logistics solutions</strong><em>Dispatch, fleet, drivers, and logistics platforms.</em></a></li>
                  <li><a role="menuitem" href="/services/crm-development"><strong>Dispatch CRM &amp; TMS</strong><em>Consoles, bulk actions, supervisor oversight.</em></a></li>
                  <li><a role="menuitem" href="/services/dashboard-design"><strong>Fleet dashboards</strong><em>Route performance and exception handling.</em></a></li>
                  <li><a role="menuitem" href="/services/mobile-applications"><strong>Driver mobile apps</strong><em>Load acceptance, status updates, documents.</em></a></li>
                  <li><a role="menuitem" href="/solutions/car-transportation"><strong>Car transportation</strong><em>Quotes, tracking, and auto-transport ops.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/trucking-logistics">All trucking solutions <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item{active(current, "saas")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-saas" aria-haspopup="true">SaaS<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-saas" role="menu">
                <div class="mm-head"><b>SaaS products</b><span>UK &amp; US</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/saas"><strong>SaaS product solutions</strong><em>Onboarding, dashboards, and MVPs that stick.</em></a></li>
                  <li><a role="menuitem" href="/services/saas-platforms"><strong>SaaS product design</strong><em>Multi-tenant UX, admin panels, permissions.</em></a></li>
                  <li><a role="menuitem" href="/services/dashboard-design"><strong>Dashboards &amp; admin panels</strong><em>Analytics and operational views for daily use.</em></a></li>
                  <li><a role="menuitem" href="/services/product-design"><strong>Product design &amp; UX</strong><em>Research, flows, prototypes, launch-ready UI.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/saas">All SaaS solutions <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item{active(current, "integration")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-integration" aria-haspopup="true">Integration<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-integration" role="menu">
                <div class="mm-head"><b>Integrations</b><span>Finance &amp; APIs</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/solutions/accounting-integrations"><strong>QuickBooks &amp; Xero</strong><em>Sync and reconciliation finance teams trust.</em></a></li>
                  <li><a role="menuitem" href="/services/api-integrations"><strong>Integrations &amp; APIs</strong><em>Reliable connectors with clear error handling.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/solutions/accounting-integrations">Explore integrations <i>→</i></a></div>
              </div>
            </li>
            <li class="nav-item{active(current, "operations")}" data-mm>
              <button type="button" class="nav-trigger" aria-expanded="false" aria-controls="mm-operations" aria-haspopup="true">Operations<span class="nav-chev" aria-hidden="true"></span></button>
              <div class="mm" id="mm-operations" role="menu">
                <div class="mm-head"><b>Operations</b><span>Tooling &amp; delivery</span></div>
                <ul class="mm-list">
                  <li><a role="menuitem" href="/services/crm-development"><strong>CRM &amp; ops consoles</strong><em>Pipelines and internal tools matched to real desks.</em></a></li>
                  <li><a role="menuitem" href="/services/automation-systems"><strong>Automation workflows</strong><em>Human-gated triage, docs, and internal tooling.</em></a></li>
                  <li><a role="menuitem" href="/process"><strong>How we work</strong><em>Discovery through launch — clear gates, weekly demos.</em></a></li>
                </ul>
                <div class="mm-foot"><a href="/process">See the process <i>→</i></a></div>
              </div>
            </li>
            <li><a class="nav-link" href="/services"{cur(current, "services")}>Services</a></li>
            <li><a class="nav-link" href="/work"{cur(current, "work")}>Work</a></li>
            <li><a class="nav-link" href="/about"{cur(current, "about")}>About</a></li>
          </ul>
        </nav>
      </div>
      <div class="nav-cta">
        <a href="/contact#book" class="btn sm"><span>Book a 20-minute fit call</span><i>→</i></a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="sheet" aria-label="Open menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </div>
</header>

<div class="sheet" id="sheet" hidden>
  <div class="sheet-nav">
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-trucking">Trucking<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-trucking">
        <li><a href="/solutions/trucking-logistics"><strong>Trucking &amp; logistics</strong><span>Dispatch, fleet, drivers</span></a></li>
        <li><a href="/services/crm-development"><strong>Dispatch CRM &amp; TMS</strong><span>Consoles &amp; supervisor tools</span></a></li>
        <li><a href="/services/dashboard-design"><strong>Fleet dashboards</strong><span>Routes &amp; exceptions</span></a></li>
        <li><a href="/services/mobile-applications"><strong>Driver mobile apps</strong><span>Status, docs, acceptance</span></a></li>
        <li><a href="/solutions/car-transportation"><strong>Car transportation</strong><span>Quotes &amp; tracking</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-saas">SaaS<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-saas">
        <li><a href="/solutions/saas"><strong>SaaS product solutions</strong><span>Onboarding &amp; MVPs</span></a></li>
        <li><a href="/services/saas-platforms"><strong>SaaS product design</strong><span>Multi-tenant UX</span></a></li>
        <li><a href="/services/dashboard-design"><strong>Dashboards &amp; admin</strong><span>Daily-use views</span></a></li>
        <li><a href="/services/product-design"><strong>Product design &amp; UX</strong><span>Flows to launch UI</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-integration">Integration<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-integration">
        <li><a href="/solutions/accounting-integrations"><strong>QuickBooks &amp; Xero</strong><span>Sync &amp; reconciliation</span></a></li>
        <li><a href="/services/api-integrations"><strong>Integrations &amp; APIs</strong><span>Connectors that hold</span></a></li>
      </ul>
    </div>
    <div class="sheet-item">
      <button type="button" class="sheet-toggle" aria-expanded="false" aria-controls="sheet-operations">Operations<span class="plus" aria-hidden="true"></span></button>
      <ul class="sheet-sub" id="sheet-operations">
        <li><a href="/services/crm-development"><strong>CRM &amp; ops consoles</strong><span>Desk-matched tooling</span></a></li>
        <li><a href="/services/automation-systems"><strong>Automation workflows</strong><span>Human-gated pipelines</span></a></li>
        <li><a href="/process"><strong>How we work</strong><span>Process &amp; delivery</span></a></li>
      </ul>
    </div>
    <div class="sheet-item"><a class="big" href="/services">Services</a></div>
    <div class="sheet-item"><a class="big" href="/work">Work</a></div>
    <div class="sheet-item"><a class="big" href="/about">About</a></div>
    <div class="sheet-cta">
      <a href="/contact#book" class="btn on-dark"><span>Book a 20-minute fit call</span><i>→</i></a>
      <a href="/contact#brief" class="btn ghost on-dark"><span>Send a project brief</span><i>→</i></a>
    </div>
  </div>
  <div class="sheet-foot">
    <a href="mailto:krivatechnlogies@gmail.com">krivatechnlogies@gmail.com</a>
    <a href="tel:+919724454455">+91 97244 54455</a>
    <span>Ahmedabad, India · Remote-first</span>
  </div>
</div>'''


FOOTER_HTML = '''<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <h3>Get in touch</h3>
        <a href="mailto:krivatechnlogies@gmail.com">krivatechnlogies@gmail.com</a><br>
        <a href="tel:+919724454455">+91 97244 54455</a>
        <p class="f-blurb">Design and engineering for US trucking ops and SaaS product teams. Ahmedabad, India · Remote-first · Global clients.</p>
        <div class="fsocial">
          <a href="https://www.linkedin.com/company/kriva-technologies" rel="noopener noreferrer" target="_blank">LinkedIn</a>
          <a href="https://dribbble.com/krivatechnologies" rel="noopener noreferrer" target="_blank">Dribbble</a>
          <a href="https://www.instagram.com/krivatechnologies" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://x.com/krivatechnologies" rel="noopener noreferrer" target="_blank">X</a>
        </div>
      </div>
      <nav aria-label="Trucking and logistics"><h3>Trucking &amp; logistics</h3><ul>
        <li><a href="/solutions/trucking-logistics">Trucking &amp; logistics solutions</a></li>
        <li><a href="/services/crm-development">Dispatch CRM &amp; TMS</a></li>
        <li><a href="/services/dashboard-design">Fleet dashboards</a></li>
        <li><a href="/services/mobile-applications">Driver mobile apps</a></li>
        <li><a href="/solutions/car-transportation">Car transportation</a></li></ul></nav>
      <nav aria-label="SaaS and integrations"><h3>SaaS &amp; integrations</h3><ul>
        <li><a href="/solutions/saas">SaaS product solutions</a></li>
        <li><a href="/solutions/accounting-integrations">QuickBooks &amp; Xero</a></li>
        <li><a href="/services/saas-platforms">SaaS product design</a></li>
        <li><a href="/services/api-integrations">Integrations &amp; APIs</a></li>
        <li><a href="/services/automation-systems">Automation workflows</a></li></ul></nav>
      <nav aria-label="Company"><h3>Company</h3><ul>
        <li><a href="/services">Services</a></li>
        <li><a href="/work">Work</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/process">Process</a></li>
        <li><a href="/insights">Insights</a></li>
        <li><a href="/contact">Contact</a></li></ul></nav>
    </div>
    <p class="fmark" aria-hidden="true"><img src="/brand/logos/kriva-lockup-inverse.svg" alt="" width="560" height="143"></p>
    <div class="fbase">
      <span>© 2026 Kriva Technologies</span>
      <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span>
    </div>
  </div>
</footer>

<a class="wa" href="https://wa.me/919724454455?text=Hi%20KRIVA%2C%20I'd%20like%20to%20discuss%20a%20project." rel="noopener noreferrer" target="_blank" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/><path d="M12.04 2C6.5 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.29-1.39A9.96 9.96 0 0 0 12.04 22C17.6 22 22 17.52 22 12S17.6 2 12.04 2zm0 18.15c-1.57 0-3.03-.43-4.28-1.17l-.31-.18-3.14.82.84-3.06-.2-.32A8.1 8.1 0 0 1 3.9 12c0-4.47 3.65-8.1 8.14-8.1 4.48 0 8.13 3.63 8.13 8.1 0 4.47-3.65 8.15-8.13 8.15z"/></svg>
  <span>WhatsApp</span>
</a>'''

# Old inline nav CSS blocks vary; neutralize conflicting rules by stripping common selectors
NAV_CSS_START_PATTERNS = [
    re.compile(r"/\* ═══ NAV[^*]*\*+/.*?@media\(min-width:901px\)\{\.sheet\{display:none\}\}", re.S),
    re.compile(r"/\* ══ shared nav / sheet ══ \*/.*?@media\(min-width:901px\)\{\.sheet\{display:none\}\}", re.S),
    re.compile(r"/\*\s*══\s*shared nav.*?\*/.*?@media\(min-width:901px\)\{\.sheet\{display:none\}\}", re.S),
]

# Broader: from .nav{position:fixed through mobile sheet media queries before next major section
NAV_BLOCK = re.compile(
    r"/\*[^*]*nav[^*]*\*/\s*\.nav\{position:fixed.*?(?=\n/\*|\n\.hero|\n\.ph|\n\.crumbs|\n@media \(prefers-reduced-motion)",
    re.S | re.I,
)

FOOTER_CSS = re.compile(
    r"/\*\s*═══════════ FOOTER ═══════════\s*\*/.*?@media\(max-width:820px\)\{\.fgrid\{grid-template-columns:1fr 1fr\}\}",
    re.S,
)

NOTICE = re.compile(r"(?:<!--[^>]*[Dd]emo[^>]*-->\s*)?<div class=\"notice\">.*?</div>\s*", re.S)

HEADER_SHEET = re.compile(
    r"<header class=\"nav\" id=\"nav\">.*?</header>\s*<div class=\"sheet\" id=\"sheet\"[^>]*>.*?</div>\s*(?=<main)",
    re.S,
)

FOOTER = re.compile(r"<footer>.*?</footer>", re.S)

# Remove old burger/sheet handlers that conflict with chrome.js
OLD_NAV_JS = re.compile(
    r"/\*\s*───────── nav:.*?(?=/\*\s*───────── HERO|/\*\s*nav\s*\*/|const con |/\*\s*cases|/\*\s*accordion|/\*\s*form|/\*\s*filter|/\*\s*console|/\*\s*machine|/\*\s*chapters|/\*\s*scroll)",
    re.S,
)
OLD_NAV_JS2 = re.compile(
    r"/\*\s*nav\s*\*/\s*const nav = document\.getElementById\('nav'\);.*?sheet\.addEventListener\('click'.*?\);\s*addEventListener\('keydown'.*?\);\s*",
    re.S,
)
OLD_NAV_JS3 = re.compile(
    r"const nav = document\.getElementById\('nav'\);\s*let lastY = 0;.*?addEventListener\('keydown', e=>\{ if\(e\.key === 'Escape'.*?\}\);\s*",
    re.S,
)


def strip_old_nav_css(css_and_html: str) -> str:
    text = css_and_html
    text, n = NAV_BLOCK.subn("/* nav/sheet/footer chrome → shared/chrome.css */\n", text, count=1)
    if n == 0:
        for pat in NAV_CSS_START_PATTERNS:
            text, n = pat.subn("/* nav/sheet chrome → shared/chrome.css */\n", text, count=1)
            if n:
                break
    text = FOOTER_CSS.sub("/* footer chrome → shared/chrome.css */\n", text, count=1)
    # Drop obsolete notice styles
    text = re.sub(
        r"/\* build-note strip:.*?\*/\s*\.notice\{.*?\}\s*\.notice \.wrap\{.*?\}\s*",
        "",
        text,
        count=1,
        flags=re.S,
    )
    text = re.sub(r"\.notice\{[^}]+\}\s*\.notice \.wrap\{[^}]+\}\s*", "", text)
    return text


def ensure_assets(html: str) -> str:
    if "shared/chrome.css" not in html:
        html = html.replace("</head>", f"{CSS_LINK}\n</head>", 1)
    if "shared/chrome.js" not in html:
        # insert before first page script or before </body>
        if re.search(r"<script(?![^>]*shared/chrome)", html):
            html = re.sub(r"(<script(?![^>]*src=\"shared/chrome))", JS_TAG + r"\n\1", html, count=1)
        else:
            html = html.replace("</body>", f"{JS_TAG}\n</body>", 1)
    return html


def strip_old_nav_js(html: str) -> str:
    text = html
    for pat in (OLD_NAV_JS, OLD_NAV_JS2, OLD_NAV_JS3):
        text, _ = pat.subn("/* nav chrome → shared/chrome.js */\n", text, count=1)
    # Remove homepage section-spy that targeted #navLinks
    text = re.sub(
        r"const links = \[\.\.\.document\.querySelectorAll\('#navLinks a'\)\];.*?targets\.forEach\(t=>secIO\.observe\(t\)\);\s*",
        "",
        text,
        count=1,
        flags=re.S,
    )
    return text


def apply_file(path: Path) -> str:
    name = path.name
    current = PAGE_CURRENT.get(name)
    html = path.read_text(encoding="utf-8")

    html = strip_old_nav_css(html)
    html = NOTICE.sub("", html)

    if not HEADER_SHEET.search(html):
        return f"FAIL {name}: header/sheet block not found"
    html = HEADER_SHEET.sub(header_html(current) + "\n\n", html, count=1)

    if not FOOTER.search(html):
        return f"FAIL {name}: footer not found"
    html = FOOTER.sub(FOOTER_HTML, html, count=1)

    html = ensure_assets(html)
    html = strip_old_nav_js(html)

    # Ensure .btn styles remain (they live in page CSS) — chrome expects them
    path.write_text(html, encoding="utf-8", newline="\n")
    return f"OK   {name} (current={current})"


def main() -> int:
    results = []
    for name in PAGE_CURRENT:
        path = ROOT / name
        if not path.exists():
            results.append(f"MISS {name}")
            continue
        results.append(apply_file(path))
    print("\n".join(results))
    return 0 if all(r.startswith("OK") for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
