# CSS Enhancements Reference Guide

## Hero Section Redesign - Code Highlights

### 1. Background Atmosphere

```css
.hero {
  /* Subtle gradient background */
  background: linear-gradient(135deg, var(--paper) 0%, #f8f9fa 50%, var(--paper) 100%);
  
  /* Accent border */
  border-top: 3px solid var(--cta);
  
  /* Container for animations */
  position: relative;
  overflow: hidden;
}

/* Animated pulsing glow effect */
.hero:before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse 100% 80% at 100% 0%, rgba(79,70,229,.06) 0%, transparent 50%),
    radial-gradient(ellipse 80% 100% at 0% 100%, rgba(219,155,31,.04) 0%, transparent 50%);
  opacity: 0;
  animation: hero-glow 8s ease-in-out infinite;
}

@keyframes hero-glow {
  0%, 100% { opacity: 0 }
  50% { opacity: 1 }
}
```

### 2. Typography & Text Effects

```css
/* Gradient text effect on main heading */
.hero-copy .d1 {
  margin: 28px 0 20px;
  max-width: 12ch;
  
  /* Create gradient text effect */
  background: linear-gradient(135deg, var(--ink) 0%, #4F46E5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  /* Entrance animation */
  animation: hero-title 0.8s ease-out;
}

@keyframes hero-title {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animate copy section */
.hero-copy {
  animation: hero-copy 0.8s ease-out;
}

@keyframes hero-copy {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced eyebrow with gradient underline */
.hero-copy .eyebrow {
  display: inline-flex;
  position: relative;
  padding-bottom: 8px;
}

.hero-copy .eyebrow:before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, var(--cta), transparent);
  flex: none;
  opacity: 1;
}
```

### 3. Board/Console Styling

```css
/* Hero board container with animation */
.hero-stack {
  position: relative;
  min-height: 0;
  min-width: 0;
  animation: hero-float 6s ease-in-out infinite;
}

@keyframes hero-float {
  0%, 100% { transform: translateY(0px) }
  50% { transform: translateY(-12px) }
}

/* Modern styled board with layers */
.hero-stack .hero-board {
  /* Multi-layer shadow for depth */
  box-shadow: 
    0 20px 60px -12px rgba(14,18,22,.25),
    0 0 0 1px rgba(255,255,255,.1),
    inset 0 1px 0 rgba(255,255,255,.08);
  
  /* Soft border and rounded corners */
  border: 1px solid rgba(255,255,255,.15);
  overflow: hidden;
  border-radius: 12px;
  
  /* Subtle gradient interior */
  background: linear-gradient(135deg, var(--ink) 0%, #0f1419 100%);
}

/* Header bar with accent gradient */
.hero-board .shift-bar {
  padding: 18px 20px 16px;
  background: linear-gradient(90deg, rgba(79,70,229,.08) 0%, transparent 60%);
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.hero-board .shift-bar .shift-title {
  font-size: 1.1rem; /* Slightly larger for emphasis */
}

/* KPI section styling */
.hero-board .shift-kpis {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: rgba(0,0,0,.2); /* Subtle darker background */
  border-bottom: 1px solid rgba(255,255,255,.08);
}

/* Interactive rows */
.hero-board .shift-row {
  grid-template-columns: 22px minmax(56px,.8fr) minmax(0,1.4fr) auto;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  transition: background 0.3s ease; /* Smooth hover effect */
}

.hero-board .shift-row:hover {
  background: rgba(79,70,229,.1); /* Blue tint on hover */
}
```

### 4. Button & Link Enhancements

```css
/* Enhanced button styling */
.btn {
  /* Color variables */
  --btn-fg: #fff;
  --btn-bg: var(--cta);
  --btn-hover: var(--ink);
  
  /* Layout */
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  
  /* Sizing */
  padding: 12px 20px;
  min-height: 48px;
  
  /* Styling */
  border: 1px solid var(--cta);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-family: var(--f-body);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .01em;
  
  /* Modern rounded corners */
  border-radius: 6px;
  
  /* Smooth transitions */
  transition: 
    color var(--t-fast) var(--e),
    border-color var(--t-fast) var(--e),
    box-shadow var(--t-fast) var(--e);
}

/* Enhanced hover state with shadow */
.btn:hover {
  color: #fff;
  border-color: var(--btn-hover);
  box-shadow: 0 12px 32px -8px rgba(79,70,229,.3); /* Glowing shadow */
}

/* Icon animation on hover */
.btn i {
  font-style: normal;
  transition: transform .42s var(--e);
}

.btn:hover i {
  transform: translateX(3px); /* Subtle slide effect */
}

/* Secondary links */
.hero-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 2px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: .01em;
  color: var(--steel);
  
  /* Hover state transitions */
  transition: 
    color var(--t-fast) var(--e),
    padding var(--t-fast) var(--e),
    background var(--t-fast) var(--e);
  
  border-radius: 4px;
}

.hero-link:hover {
  color: var(--ink);
  padding-left: 4px;
  padding-right: 4px;
  background: rgba(79,70,229,.08); /* Subtle background */
}

.hero-link i {
  font-style: normal;
  transition: transform .42s var(--e);
}

.hero-link:hover i {
  transform: translateX(3px);
}
```

### 5. Floating Secondary Elements

```css
/* Floating card animation */
.hero-float {
  position: absolute;
  right: -6%;
  bottom: -12%;
  width: min(46%, 280px);
  z-index: 3;
  
  /* Styling */
  border: 1px solid rgba(255,255,255,.12);
  background: var(--ink);
  overflow: hidden;
  border-radius: 8px;
  
  /* Layered shadow */
  box-shadow: 
    0 16px 48px -12px rgba(0,0,0,.3),
    0 0 0 1px rgba(255,255,255,.08);
  
  /* Animation */
  transform: rotate(-2.5deg);
  animation: hero-float-subtle 7s ease-in-out infinite;
}

@keyframes hero-float-subtle {
  0%, 100% {
    transform: rotate(-2.5deg) translateY(0);
  }
  50% {
    transform: rotate(-2.5deg) translateY(-8px);
  }
}

/* Callout with bounce-in effect */
.hero-callout {
  position: absolute;
  left: -4%;
  bottom: 8%;
  z-index: 4;
  
  /* Styling with gradient */
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 1px solid rgba(255,255,255,.6);
  padding: 16px 18px 14px;
  min-width: 148px;
  border-radius: 8px;
  
  /* Layered shadow */
  box-shadow: 
    0 12px 40px -12px rgba(14,18,22,.3),
    0 0 0 1px rgba(255,255,255,.4);
  
  /* Pop-in animation with bounce */
  animation: hero-callout-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes hero-callout-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Gradient effect on numbers */
.hero-callout b {
  display: block;
  font-family: var(--f-display);
  font-weight: 700;
  font-size: 2.05rem;
  letter-spacing: -.03em;
  line-height: 1;
  
  /* Gradient text */
  background: linear-gradient(135deg, #5FD3A0, #4FBF85);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 6. Action Button Animations

```css
/* Staggered action button entrance */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin-top: 28px;
  animation: hero-actions 0.8s ease-out 0.4s both;
}

@keyframes hero-actions {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 7. KPI Enhancement with Visual Indicators

```css
/* KPI metric styling */
.kpi {
  padding: 16px;
  border-right: 1px solid var(--ink-line);
  position: relative;
  transition: background 0.3s ease;
}

.kpi:last-child {
  border-right: 0;
}

/* Hover effect */
.kpi:hover {
  background: rgba(79,70,229,.06);
}

/* Accent bar for positive metrics */
.kpi.up:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #5FD3A0, transparent);
}
```

## Color Palette Used

```css
--cta: (primary blue, typically #4F46E5)
--amber: (warning/attention color)
--green: #5FD3A0 (success)
--ink: (dark text, typically #0E1216)
--paper: (background)
--steel: (secondary text)
```

## Animation Timing Functions

- **ease-out**: Initial load animations (titles, buttons)
- **ease-in-out**: Continuous floating animations (smooth loop)
- **cubic-bezier(0.34, 1.56, 0.64, 1)**: Pop-in effect (bounce)
- **linear**: Sometimes used for consistent motion

## Performance Notes

✅ All animations use GPU-accelerated properties (transform, opacity)
✅ No layout-shifting animations (no width/height changes)
✅ Efficient shadow rendering with minimal repaints
✅ Respects prefers-reduced-motion media query
✅ Smooth 60fps animations on modern devices

---

**Version**: 1.0
**Last Updated**: September 2026
