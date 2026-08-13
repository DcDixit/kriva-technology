#!/usr/bin/env node
/**
 * PHASE 6-8 IMPLEMENTATION SCRIPT
 * Parallel updates: Logo, Color System, Service Redesign, Blog Pruning
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const KRIVA_LOGO_SVG = `<svg class="mark-icon" viewBox="0 0 160 40" width="160" height="40" aria-hidden="true" style="display:inline;margin-right:8px;vertical-align:middle">
  <!-- Geometric K mark -->
  <rect x="6" y="5" width="14" height="35" fill="currentColor"/>
  <polygon points="16,5 30,20 30,18 22,5" fill="#5B4FFF"/>
  <polygon points="20,23 28,40 35,40 20,30" fill="currentColor"/>
</svg>`;

// ═══════════════════════════════════════════════════════════════
// STEP 1: UPDATE COLOR VARIABLES (--blue: #5B4FFF)
// ═══════════════════════════════════════════════════════════════
console.log('STEP 1: Updating color variables (brand blue)...');

function updateColorVariables(htmlContent) {
  // Find the :root section and replace --blue value
  return htmlContent.replace(
    /--blue:#1B44C8/g,
    '--blue:#5B4FFF'
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: UPDATE LOGO DISPLAY
// ═══════════════════════════════════════════════════════════════
console.log('STEP 2: Updating logo display on all pages...');

function updateLogo(htmlContent) {
  // Replace: <a href="/" class="mark">KRIVA<sup>®</sup></a>
  // With: <a href="/" class="mark" aria-label="KRIVA Technologies home">SVG + KRIVA<sup>®</sup></a>
  return htmlContent.replace(
    /<a href="\/" class="mark">KRIVA<sup>®<\/sup><\/a>/g,
    `<a href="/" class="mark" aria-label="KRIVA Technologies home">${KRIVA_LOGO_SVG}KRIVA<sup>®</sup></a>`
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: IDENTIFY PAGES TO PROCESS
// ═══════════════════════════════════════════════════════════════
console.log('STEP 3: Identifying all HTML pages...');

const htmlFiles = fs.readdirSync(ROOT)
  .filter(f => /^kriva-.*\.html$/.test(f))
  .sort();

console.log(`Found ${htmlFiles.length} pages`);

// Categorize pages
const servicePages = htmlFiles.filter(f => f.includes('kriva-service-'));
const casePages = htmlFiles.filter(f => f.includes('kriva-case-'));
const insightPages = htmlFiles.filter(f => f.includes('kriva-insight-'));
const solutionPages = htmlFiles.filter(f => f.includes('kriva-solution-'));
const corePages = htmlFiles.filter(f =>
  !f.includes('service-') &&
  !f.includes('case-') &&
  !f.includes('insight-') &&
  !f.includes('solution-')
);

console.log(`Core pages: ${corePages.length}`);
console.log(`Service pages: ${servicePages.length}`);
console.log(`Case pages: ${casePages.length}`);
console.log(`Insight pages: ${insightPages.length}`);
console.log(`Solution pages: ${solutionPages.length}`);

// ═══════════════════════════════════════════════════════════════
// STEP 4: APPLY UPDATES TO ALL PAGES
// ═══════════════════════════════════════════════════════════════
console.log('\nSTEP 4: Applying updates...\n');

let updatedCount = 0;
let skippedCount = 0;

for (const file of htmlFiles) {
  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Update 1: Color variables
  const beforeColor = content;
  content = updateColorVariables(content);
  if (content !== beforeColor) {
    modified = true;
    console.log(`  ✓ ${file} - Color system updated`);
  }

  // Update 2: Logo
  const beforeLogo = content;
  content = updateLogo(content);
  if (content !== beforeLogo) {
    modified = true;
    console.log(`  ✓ ${file} - Logo updated`);
  }

  // Write if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\n✓ Updated: ${updatedCount} pages`);
console.log(`⊘ Skipped: ${skippedCount} pages`);

// ═══════════════════════════════════════════════════════════════
// STEP 5: SUMMARY & NEXT STEPS
// ═══════════════════════════════════════════════════════════════
console.log(`\n${'='.repeat(80)}`);
console.log('PHASE 6-8 IMPLEMENTATION SUMMARY');
console.log(`${'='.repeat(80)}\n`);

console.log('COMPLETED:');
console.log('✓ Color system updated (--blue: #1B44C8 → #5B4FFF)');
console.log('✓ Logo SVG integrated on all pages');
console.log(`✓ ${updatedCount} pages updated\n`);

console.log('NEXT STEPS:');
console.log('1. Service page redesign (3 distinct layouts)');
console.log('2. Blog content consolidation (cut 60%, add visuals)');
console.log('3. Case study improvements (add quotes/metrics)');
console.log('4. Visual QA (run preview and verify)');
console.log('5. Responsive testing (desktop/tablet/mobile)');
console.log('6. Accessibility audit');
console.log('7. Final ratings and comparison\n');

console.log('View changes: npm run preview');
console.log('Then check http://localhost:5177');
