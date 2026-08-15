# KRIVA · Photography brief and insertion guide

Nothing on the site currently uses a photograph of a person. That is deliberate — stock
or AI-generated people would undo the credibility the rest of the site is working for.
This document specifies exactly what to shoot and how it drops in.

The CSS component is already built and shipped (`shared/home.css` → `EDITORIAL
PHOTOGRAPHY`). Empty figures stay hidden until an `<img>` is present. No layout
work is needed when the files arrive.

Design tokens now live in `shared/tokens.css` and load first on every page.

---

## 1. What to supply

Three images, in priority order. One good photograph beats three mediocre ones — if only
the first is possible, ship only the first.

| # | Slot | Subject | Ratio | Min width | Where it goes |
|---|------|---------|-------|-----------|---------------|
| 1 | Founder portrait | Dixit Panchal, working — not a posed headshot | 4:5 | 1600px | `/about`, beside the founder paragraph |
| 2 | Working moment | Two or three people at a screen mid-discussion; real work visible | 21:9 | 2400px | Homepage, between the working-model band and the prospects section |
| 3 | Craft detail | Hands, a whiteboard, a sketch, a screen with real UI | 4:5 | 1600px | `/process`, beside the weekly-cadence section |

### Art direction

The site is editorial, ink-on-paper, restrained. Photography must match, not fight it.

- Available light. No flash, no studio seamless, no coloured gels.
- Neutral or desaturated colour. Anything close to the paper tone (`#EAEAE4`) or ink
  (`#0E1216`) will sit naturally.
- Candid over posed. Someone mid-sentence beats someone smiling at the lens.
- Real screens with real work. Do not stage a fake dashboard.
- Leave breathing room around the subject so the crop has options.
- No motivational-poster framing, no crossed arms, no handshake, no laptop-in-a-cafe.

### Do not supply

AI-generated people. Stock photography. Fake office interiors. Team photos that include
people who are not on the team. Client logos you do not have written permission to use.

---

## 2. Technical spec

- **Format:** supply original JPEG or HEIC at full resolution. Conversion is handled here.
- **Delivery on site:** AVIF with WebP fallback, plus 1x/2x variants.
- **Colour:** sRGB.
- **Strip EXIF GPS** before sending.
- **Naming:** `founder-portrait.jpg`, `working-moment.jpg`, `craft-detail.jpg`.

---

## 3. How insertion works

Drop an `<img>` in as the first child of the figure. `shared/slot-assets.css` already
hides any placeholder frame automatically when a real image is present.

```html
<figure class="figure figure--wide">
  <img src="/media/photography/working-moment.avif"
       alt="Two KRIVA engineers reviewing an exception queue on a dispatch console"
       width="2400" height="1029"
       loading="lazy" decoding="async">
  <figcaption>Weekly review, dispatch console</figcaption>
</figure>
```

Rules that are already enforced by the QA scripts and must stay true:

- `width` and `height` must be the real pixel dimensions — this is what keeps CLS at zero.
- `loading="lazy"` and `decoding="async"` on everything except a hero image.
- `alt` describes what is happening and who is in frame. It is not a keyword slot.
  Write "Dixit Panchal reviewing dispatch wireframes", not "web design agency India".
- If an image is purely decorative, use `alt=""` — never omit the attribute.

Aspect ratios are locked in CSS (`--wide` 21:9, `--portrait` 4:5) and drop to 16:10 on
narrow screens, so the crop is predictable. Supply generous margins around the subject.

---

## 4. What is still missing from the site, and only you can provide it

These are the credibility gaps that photography alone will not close.

| Gap | Why it matters to a US/UK buyer | Status |
|-----|--------------------------------|--------|
| Formspree form ID | The contact form currently falls back to `mailto:`. Until the real ID replaces `YOUR_FORM_ID`, submissions depend on the visitor having a mail client configured. | **Blocking** |
| A named client reference | Every case study is currently unattributed. One named client, or one quote with a real name and company, changes the trust equation more than any design change. | **Blocking for enterprise buyers** |
| Signed-off metrics beyond FleetFlow | Only FleetFlow publishes numbers. Two more would make the outcomes section credible rather than exceptional. | High value |
| A US or UK phone number | The only number is +91. A forwarding number in either market removes a real objection. Do not add one until it genuinely rings. | High value |
| Companies House / incorporation detail | If a UK entity exists, publishing the number is a strong, cheap trust signal. Do not invent one. | Optional |

Everything in this table was left out of the build rather than faked.
