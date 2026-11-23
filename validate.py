#!/usr/bin/env python3
"""KRIVA structural validator. Stdlib only. Read-only.
Usage (from the repo root): python validate.py [files...]

Page list comes from sitemap.xml (plus vercel.json redirects), so it stays current.
Original rule set: KRIVA-REFERENCE-ADDENDUM.md section 7.2. Changes from that copy:
indentation restored (the addendum copy is flattened); known paths read from sitemap.xml;
links to redirecting URLs reported separately; only <a href> is checked (not <link> assets);
CSS baseline checks also read the page's linked /shared/*.css files."""
import sys, re, glob, json, os
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}

def load_known_paths():
    sm = open('sitemap.xml', encoding='utf-8').read()
    paths = {m or '/' for m in re.findall(r'<loc>https?://[^/<]+([^<]*)</loc>', sm)}
    redirects = set()
    if os.path.exists('vercel.json'):
        for r in json.load(open('vercel.json', encoding='utf-8')).get('redirects', []):
            src = r.get('source', '')
            if src.startswith('/') and ':' not in src and '(' not in src:
                redirects.add(src)
    return paths, redirects

KNOWN_PATHS, REDIRECTS = load_known_paths()
# Verified publication dates, inventory section 1.4
KNOWN_DATES = {'2026-05-22','2026-05-20','2026-01-15','2025-12-08','2025-11-20','2025-10-12','2025-09-05'}

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

def linked_css(src):
    """Text of local stylesheets the page links (/shared/*.css), for the CSS baseline checks."""
    out = []
    for href in re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="/([^"?#]+\.css)', src):
        if os.path.exists(href):
            out.append(open(href, encoding='utf-8').read())
    return '\n'.join(out)

def check(path):
    src = open(path, encoding='utf-8').read()
    clean = strip_code(src)  # markup only
    css = linked_css(src)
    p = V(); p.feed(src)
    fails = []

    # 1 tag balance + duplicate ids
    if p.stack: fails.append(f"unclosed tags: {[t for t,_ in p.stack][:5]}")
    fails += p.errors[:5]
    dupes = [k for k, v in p.ids.items() if v > 1]
    if dupes: fails.append(f"duplicate ids: {dupes}")

    # 2 internal anchors resolve
    for a in set(re.findall(r'href="#([^"]+)"', clean)):
        if a and a not in p.ids: fails.append(f"broken anchor #{a}")

    # 3 aria-controls targets exist
    for t in set(p.aria):
        if t not in p.ids: fails.append(f"aria-controls -> missing id '{t}'")

    # 4 placeholder / unverified links (page links only, not <link> assets)
    if re.search(r'href="#"', clean): fails.append('placeholder href="#" present')
    for h in set(re.findall(r'<a\b[^>]*\bhref="(/[^"#?]*)', clean)):
        if h in KNOWN_PATHS: continue
        if h in REDIRECTS: fails.append(f"links to a redirect: {h}")
        else: fails.append(f"UNVERIFIED path: {h}")

    # 5 exactly one h1, no skipped heading levels
    if p.headings.count(1) != 1: fails.append(f"h1 count = {p.headings.count(1)}")
    for a, b in zip(p.headings, p.headings[1:]):
        if b > a + 1: fails.append(f"heading jump h{a} -> h{b}")

    # 6 accessibility + motion baseline (inline or in linked stylesheets)
    for needed, label in [
        ('prefers-reduced-motion', 'reduced-motion block'), (':focus-visible', 'focus-visible styles'), ('class="skip"', 'skip link'), ('<main', '<main> landmark'), ]:
        if needed not in src and needed not in css: fails.append(f"missing {label}")

    # 7 legal pages only
    if 'privacy' in path or 'terms' in path:
        if '@media print' not in src and '@media print' not in css: fails.append('missing print stylesheet')
        if 'data-review' in src and 'body.review-off [data-review]' not in src:
            fails.append('review layer present without kill switch')

    # 8 invented-content tripwires, scan PROSE only.
    # Strip <style>, <script>, HTML comments and the [data-review] staging layer,
    # otherwise CSS percentages and review notes quoting banned strings drown the signal.
    prose = re.sub(r'<[^>]*\bdata-review\b.*?</div>', ' ', clean, flags=re.S)
    prose = re.sub(r'\sstyle="[^"]*"', ' ', prose)  # inline CSS is not prose
    # A date shown on the page is verified when it matches the page's own JSON-LD publish/modified date.
    page_dates = set(re.findall(r'"date(?:Published|Modified)"\s*:\s*"(\d{4}-\d{2}-\d{2})', src))
    for pat, msg in [
        (r'\b(?:19|20)\d{2}-\d{2}-\d{2}\b', 'DATE'), (r'\b\d{1,3}(?:\.\d)?\s?%', 'percentage: KRIVA publishes no outcome figures; confirm this is a sourced statistic or labelled sample data (section 1.1)'), (r'discovery call', 'banned CTA wording, use "Book a free 20-minute fit call"'), (r'(?:reply|respond|response|get back|hear back)[^.<]{0,40}\b24 hours|\b24 hours[^.<]{0,25}(?:reply|response)', 'banned response promise, use "one business day"'), (r'15\+ senior|Google 5\.0|8 reviews', 'unverified claim, see section 5'), ]:
        for m in set(re.findall(pat, prose, re.I)):
            if msg == 'DATE':
                if m not in KNOWN_DATES and m not in page_dates:
                    fails.append(f"UNVERIFIED date (not in inventory section 1.4): '{m}'")
            else:
                fails.append(f"{msg}: '{m}'")

    # 9 article dates agree: Open Graph article:modified_time vs JSON-LD dateModified
    og_mod = re.findall(r'<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})', src)
    ld_mod = set(re.findall(r'"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})', src))
    if og_mod and ld_mod and og_mod[0] not in ld_mod:
        fails.append(f"modified date mismatch: og {og_mod[0]} vs JSON-LD {sorted(ld_mod)}")

    print(('FAIL ' if fails else 'PASS ') + path)
    for f in dict.fromkeys(fails): print(' -', f)
    return not fails

files = sys.argv[1:] or sorted(glob.glob('kriva-*.html'))
sys.exit(0 if all([check(f) for f in files]) else 1)
