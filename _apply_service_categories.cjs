#!/usr/bin/env node
/**
 * Apply service category classes to all 17 service pages
 * Creates 3 distinct layout types to eliminate template fatigue
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// SERVICE PAGE CATEGORIZATION
const CATEGORIES = {
  'design-ux': [
    'kriva-service-ui-ux-design.html',
    'kriva-service-product-design.html',
    'kriva-service-branding.html',
    'kriva-service-logo-design.html',
    'kriva-service-web-application-design.html',
    'kriva-service-wireframing-prototyping.html',
    'kriva-service-dashboard-design.html',
  ],
  'development': [
    'kriva-service-web-development.html',
    'kriva-service-mobile-applications.html',
    'kriva-service-api-integrations.html',
    'kriva-service-design-systems.html',
    'kriva-service-ai-assisted-development.html',
    'kriva-service-no-code-low-code.html',
  ],
  'strategic': [
    'kriva-service-ux-research.html',
    'kriva-service-automation-systems.html',
    'kriva-service-crm-development.html',
  ],
};

console.log('APPLYING SERVICE CATEGORY CLASSES');
console.log('=' .repeat(80));
console.log('');

let totalUpdated = 0;

for (const [category, pages] of Object.entries(CATEGORIES)) {
  console.log(`\n${category.toUpperCase()} (${pages.length} pages):`);
  console.log('-'.repeat(40));

  for (const filename of pages) {
    const filePath = path.join(ROOT, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ ${filename} - NOT FOUND`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;

    // Replace: <body>
    // With:    <body class="service design-ux"> (or relevant category)
    content = content.replace(
      /<body>/g,
      `<body class="service ${category}">`
    );

    // If already has class, replace it
    content = content.replace(
      /<body class="[^"]*">/g,
      `<body class="service ${category}">`
    );

    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ ${filename}`);
      totalUpdated++;
    } else {
      console.log(`  ⊘ ${filename} - No changes needed`);
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`COMPLETED: ${totalUpdated} pages updated with category classes`);
console.log('');
console.log('CATEGORY BREAKDOWN:');
console.log(`  • Design & UX (Visual-First): 7 pages`);
console.log(`  • Development (Systems-First): 6 pages`);
console.log(`  • Strategic (Results-Focused): 4 pages`);
console.log(`  • Total: 17 pages`);
console.log('');
console.log('NEXT STEPS:');
console.log('1. View changes: npm run preview');
console.log('2. Visit http://localhost:5177/services/ui-ux-design');
console.log('3. Compare layouts across categories');
console.log('4. Visual QA on mobile/tablet/desktop');
console.log('');
