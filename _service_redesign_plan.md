# SERVICE PAGE REDESIGN — 3 DISTINCT LAYOUTS

## Problem
All 17 service pages use identical template → visual fatigue on every page visit

## Solution
Categorize services into 3 types, each with unique visual treatment

---

## CATEGORY 1: DESIGN & UX SERVICES (7 pages)

Layout: "Visual-First" with 2-column showcase

**Pages:**
1. UI/UX Design
2. Product Design
3. Branding
4. Logo Design
5. Web Application Design
6. Wireframing & Prototyping
7. Dashboard Design

**Unique Layout Features:**
- Hero: Large visual mockup on right (2-column grid)
- Copy on left with clear problem statement
- "Gallery" section showing before/after examples
- Process flowchart
- "Why this matters" section (business value)
- CTA at bottom

**Visual Treatment:**
- Use brand blue accent on left side
- Large hero image/mockup
- Emphasis on visual outcomes
- Before/after comparisons

---

## CATEGORY 2: DEVELOPMENT & TECHNICAL SERVICES (6 pages)

Layout: "Systems-First" with code/architecture focus

**Pages:**
1. Web Development
2. Mobile Applications
3. API Integrations
4. Design Systems
5. AI-Assisted Development
6. No-Code / Low-Code

**Unique Layout Features:**
- Hero: Technical diagram/architecture on right
- Copy explaining technical challenge
- "Technical Approach" section with detailed explanation
- Tech stack/tools callout
- Integration examples
- Performance/reliability metrics
- CTA

**Visual Treatment:**
- Use code blocks or architecture diagrams
- Technical callouts and specs
- Performance indicators
- Integration showcase

---

## CATEGORY 3: STRATEGIC & OPERATIONS SERVICES (4 pages)

Layout: "Results-Focused" with outcome emphasis

**Pages:**
1. UX Research
2. Automation Systems
3. CRM Development
4. Consulting/Strategy (if exists)

**Unique Layout Features:**
- Hero: Outcome metrics/results on right
- Copy focused on business problem
- "Engagement Model" section
- Client story/testimonial
- "Typical Outcomes" section
- ROI/efficiency gains
- Case study link
- CTA

**Visual Treatment:**
- Emphasis on numbers/metrics
- Process timeline
- Results visualization
- Testimonial/proof

---

## CSS ADDITIONS FOR EACH LAYOUT TYPE

```css
/* CATEGORY 1: Design & UX (Visual-First) */
.service.design-ux .hero-grid {
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
}
.service.design-ux .showcase {
  display: grid;
  gap: 20px;
  margin-top: 60px;
}
.service.design-ux .showcase-item {
  border: 1px solid var(--rule);
  padding: 30px;
}

/* CATEGORY 2: Development (Systems-First) */
.service.development .hero-grid {
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
}
.service.development .tech-callout {
  background: var(--paper-2);
  border-left: 3px solid var(--blue);
  padding: 24px;
  margin: 40px 0;
}
.service.development .code-block {
  background: var(--ink);
  color: #fff;
  padding: 20px;
  overflow: auto;
  border-radius: 4px;
}

/* CATEGORY 3: Strategic (Results-Focused) */
.service.strategic .hero-grid {
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}
.service.strategic .outcomes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 40px 0;
}
.service.strategic .outcome-card {
  text-align: center;
  padding: 20px;
}
.service.strategic .outcome-card b {
  display: block;
  font-size: 2rem;
  color: var(--blue);
  margin-bottom: 8px;
}
```

---

## HTML STRUCTURE DIFFERENCES

### Category 1: Design & UX (Visual-First)

```html
<body class="service design-ux">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Visual Design</p>
        <h1>Service Name</h1>
        <p class="lede">Problem statement & value prop</p>
      </div>
      <div class="hero-visual">
        <figure class="hero-showcase">
          <img src="/work/example.svg" alt="Example UI">
          <figcaption>Illustrative design example</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="showcase">
    <div class="wrap">
      <h2>Design Examples</h2>
      <div class="showcase-grid">
        <article class="showcase-item">
          <figure>
            <img src="/work/before.svg" alt="">
            <figcaption>Before</figcaption>
          </figure>
          <h3>Challenge</h3>
          <p>What was broken...</p>
        </article>
        <article class="showcase-item">
          <figure>
            <img src="/work/after.svg" alt="">
            <figcaption>After</figcaption>
          </figure>
          <h3>Outcome</h3>
          <p>What we fixed...</p>
        </article>
      </div>
    </div>
  </section>

  <section class="process">
    <div class="wrap">
      <h2>Our Design Process</h2>
      <!-- Process timeline -->
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Ready to improve your design?</h2>
      <a href="/contact" class="btn">Start a project</a>
    </div>
  </section>
</body>
```

### Category 2: Development (Systems-First)

```html
<body class="service development">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Technical Implementation</p>
        <h1>Service Name</h1>
        <p class="lede">Technical challenge & solution</p>
      </div>
      <div class="hero-diagram">
        <figure>
          <svg viewBox="0 0 400 300">
            <!-- Architecture diagram -->
          </svg>
          <figcaption>System architecture overview</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="approach">
    <div class="wrap">
      <h2>Technical Approach</h2>
      <div class="tech-callout">
        <h3>Key Technical Decisions</h3>
        <ul>
          <li>Decision 1 and why</li>
          <li>Decision 2 and why</li>
        </ul>
      </div>
      
      <h3>The Implementation</h3>
      <p>How we build this...</p>
      
      <div class="code-block">
        <code>// Example code showing approach</code>
      </div>
    </div>
  </section>

  <section class="integrations">
    <div class="wrap">
      <h2>Integration Examples</h2>
      <!-- Integration examples -->
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Build something reliable</h2>
      <a href="/contact" class="btn">Discuss your project</a>
    </div>
  </section>
</body>
```

### Category 3: Strategic (Results-Focused)

```html
<body class="service strategic">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Strategic Engagement</p>
        <h1>Service Name</h1>
        <p class="lede">Business problem & solution</p>
      </div>
      <div class="hero-outcomes">
        <div class="outcomes">
          <div class="outcome-card">
            <b>2.5x</b>
            <span>Faster launch</span>
          </div>
          <div class="outcome-card">
            <b>40%</b>
            <span>Cost savings</span>
          </div>
          <div class="outcome-card">
            <b>3 mo</b>
            <span>To ROI</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="engagement">
    <div class="wrap">
      <h2>How We Work Together</h2>
      <!-- Engagement model -->
    </div>
  </section>

  <section class="results">
    <div class="wrap">
      <h2>Typical Outcomes</h2>
      <blockquote class="testimonial">
        <p>"Quote from actual client..."</p>
        <cite>Client Name, Title</cite>
      </blockquote>
      <!-- More outcomes -->
    </div>
  </section>

  <section class="case-study">
    <div class="wrap">
      <h2>See it in action</h2>
      <a href="/work/case-study">Read case study</a>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Let's transform your business</h2>
      <a href="/contact" class="btn">Book a consultation</a>
    </div>
  </section>
</body>
```

---

## IMPLEMENTATION MAPPING

### Category 1: Design & UX (7 pages)
- kriva-service-ui-ux-design.html
- kriva-service-product-design.html
- kriva-service-branding.html
- kriva-service-logo-design.html
- kriva-service-web-application-design.html
- kriva-service-wireframing-prototyping.html
- kriva-service-dashboard-design.html

### Category 2: Development (6 pages)
- kriva-service-web-development.html
- kriva-service-mobile-applications.html
- kriva-service-api-integrations.html
- kriva-service-design-systems.html
- kriva-service-ai-assisted-development.html
- kriva-service-no-code-low-code.html

### Category 3: Strategic (4 pages)
- kriva-service-ux-research.html
- kriva-service-automation-systems.html
- kriva-service-crm-development.html
- (1 more if available)

---

## NEXT STEPS

1. Create CSS for 3 layouts in shared/chrome.css
2. Add class to each service page: `<body class="service design-ux">` etc.
3. Restructure HTML content per category (keeping existing content, reorganizing)
4. Visual QA on all 17 pages
5. Test responsiveness

Expected impact: **5.5/10 → 7.5/10** for service pages (eliminate template fatigue)
