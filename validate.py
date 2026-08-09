#!/usr/bin/env python3
"""KRIVA structural validator. Stdlib only. Usage: python3 validate.py [files...]"""
import sys, re, glob
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
KNOWN_PATHS = {
 '/','/solutions','/services','/work','/about','/process','/insights','/contact',
 '/faq','/privacy','/terms','/technologies','/contact#book','/contact#brief',
 '/work/fleetflow-dispatch','/work/payroll-pro-saas','/work/finance-sync-hub','/work/brandlift-ecommerce',
 '/solutions/trucking-logistics','/solutions/saas','/solutions/accounting-integrations','/solutions/car-transportation',
 '/insights/saas-mvp-uk-guide','/insights/trucking-dispatch-crm-guide','/insights/ai-in-product-design-2026',
 '/insights/saas-onboarding-patterns','/insights/no-code-vs-custom-mvp','/insights/crm-dashboard-ux-patterns',
 '/insights/choosing-a-digital-agency',
}
# Verified publication dates — inventory §1.4
KNOWN_DATES = {'2026-05-22','2026-05-20','2026-01-15','2025-12-08','2025-11-20','2025-10-12','2025-09-05'}

KNOWN_PATHS |= {'/services/'+s for s in (
 'product-design','ui-ux-design','ux-research','wireframing-prototyping','design-systems',
 'mobile-applications','web-application-design','saas-platforms','dashboard-design','crm-development',
 'branding','logo-design','web-development','api-integrations','ai-assisted-development',
 'no-code-low-code','automation-systems')}

class V(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors, self.ids = [], [], {}
        self.headings, self.aria = [], []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if 'id' in d:
            self.ids[d['id']] = self.ids.get(d['id'], 0) + 1
        if re.fullmatch(r'h[1-6]', tag):
            self.headings.append(int(tag[1]))
        if 'aria-controls' in d:
            self.aria.append(d['aria-controls'])
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if tag in VOID: return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"unexpected </{tag}> at line {self.getpos()[0]}")

def strip_code(t):
    """Remove <style>, <script> and comments. CSS/JS are not page content;
    scanning them produces false positives (keyframe percentages, JS-built anchors)."""
    return re.sub(r'<style.*?</style>|<script.*?</script>|<!--.*?-->', ' ', t, flags=re.S)

def check(path):
    src = open(path, encoding='utf-8').read()
    clean = strip_code(src)          # markup only
    p = V(); p.feed(src)
    fails = []

    # 1 tag balance + duplicate ids
    if p.stack:  fails.append(f"unclosed tags: {[t for t,_ in p.stack][:5]}")
    fails += p.errors[:5]
    dupes = [k for k, v in p.ids.items() if v > 1]
    if dupes: fails.append(f"duplicate ids: {dupes}")

    # 2 internal anchors resolve
    for a in set(re.findall(r'href="#([^"]+)"', clean)):
        if a and a not in p.ids: fails.append(f"broken anchor #{a}")

    # 3 aria-controls targets exist
    for t in set(p.aria):
        if t not in p.ids: fails.append(f"aria-controls -> missing id '{t}'")

    # 4 placeholder / unverified links
    if re.search(r'href="#"', clean): fails.append('placeholder href="#" present')
    for h in set(re.findall(r'href="(/[^"#?]*)', clean)):
        if h not in KNOWN_PATHS: fails.append(f"UNVERIFIED path: {h}")

    # 5 exactly one h1, no skipped heading levels
    if p.headings.count(1) != 1: fails.append(f"h1 count = {p.headings.count(1)}")
    for a, b in zip(p.headings, p.headings[1:]):
        if b > a + 1: fails.append(f"heading jump h{a} -> h{b}")

    # 6 accessibility + motion baseline
    for needed, label in [
        ('prefers-reduced-motion', 'reduced-motion block'),
        (':focus-visible', 'focus-visible styles'),
        ('class="skip"', 'skip link'),
        ('<main', '<main> landmark'),
    ]:
        if needed not in src: fails.append(f"missing {label}")

    # 7 legal pages only
    if 'privacy' in path or 'terms' in path:
        if '@media print' not in src: fails.append('missing print stylesheet')
        if 'data-review' in src and 'body.review-off [data-review]' not in src:
            fails.append('review layer present without kill switch')

    # 8 invented-content tripwires — scan PROSE only.
    # Strip <style>, <script>, HTML comments and the [data-review] staging layer,
    # otherwise CSS percentages and review notes quoting banned strings drown the signal.
    prose = re.sub(r'<[^>]*\bdata-review\b.*?</div>', ' ', clean, flags=re.S)
    prose = re.sub(r'\sstyle="[^"]*"', ' ', prose)  # inline CSS is not prose
    for pat, msg in [
        (r'\b(?:19|20)\d{2}-\d{2}-\d{2}\b', 'DATE'),
        (r'\b\d{1,3}(?:\.\d)?\s?%', 'percentage — only FleetFlow may carry metrics (§1.1)'),
        (r'discovery call', 'banned CTA wording — use "20-minute fit call"'),
        (r'24 hours', 'banned response promise — use "one business day"'),
        (r'15\+ senior|Google 5\.0|8 reviews', 'unverified claim — see §5'),
    ]:
        for m in set(re.findall(pat, prose, re.I)):
            if msg == 'DATE':
                if m not in KNOWN_DATES:
                    fails.append(f"UNVERIFIED date (not in inventory §1.4): '{m}'")
            else:
                fails.append(f"{msg}: '{m}'")

    print(('FAIL ' if fails else 'PASS ') + path)
    for f in dict.fromkeys(fails): print('   -', f)
    return not fails

files = sys.argv[1:] or sorted(glob.glob('kriva-*.html'))
sys.exit(0 if all([check(f) for f in files]) else 1)
