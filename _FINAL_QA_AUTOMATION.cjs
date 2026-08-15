#!/usr/bin/env node
/**
 * FINAL QA AUTOMATION — Phases 10-15
 * Verify logo, colors, responsive design, and content on all pages
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5177';
const ROOT = __dirname;

// Test pages representing each category
const TEST_PAGES = {
  core: ['/', '/about', '/process', '/contact'],
  solutions: ['/solutions/trucking-logistics', '/solutions/saas'],
  services_design: ['/services/ui-ux-design', '/services/product-design'],
  services_dev: ['/services/web-development', '/services/api-integrations'],
  services_strategic: ['/services/ux-research', '/services/automation-systems'],
  cases: ['/work/fleetflow-dispatch', '/work/payroll-pro-saas'],
  insights: ['/insights/choosing-a-digital-agency', '/insights/saas-mvp-uk-guide'],
};

const ALL_TEST_PAGES = Object.values(TEST_PAGES).flat();

// QA Checks
const checks = {
  logoPresent: 0,
  brandBluePresent: 0,
  serviceCategoryPresent: 0,
  metadataComplete: 0,
  noConsoleErrors: 0,
};

const results = {};

console.log('FINAL QA AUTOMATION — PHASES 10-15\n');
console.log('=' .repeat(80));
console.log(`Testing ${ALL_TEST_PAGES.length} pages for:\n`);
console.log('  ✓ Logo SVG present and correct');
console.log('  ✓ Brand blue (#5B4FFF) in CSS variables');
console.log('  ✓ Service page categories applied');
console.log('  ✓ Metadata complete (title, description, OG tags)');
console.log('  ✓ Page loads without errors\n');
console.log('=' .repeat(80) + '\n');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = BASE_URL + url;
    const req = http.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, html: data });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000);
  });
}

function checkPage(url, html) {
  const checks_passed = [];
  const checks_failed = [];

  // Check 1: Logo SVG
  if (html.includes('kriva-wordmark.svg') || html.includes('fill="#0F4DFD"')) {
    checks_passed.push('Logo with blue accent');
  } else {
    checks_failed.push('Logo missing or incomplete');
  }

  // Check 2: Brand blue color
  if (html.includes('--blue:#5B4FFF')) {
    checks_passed.push('Brand blue (#5B4FFF)');
  } else {
    checks_failed.push('Brand blue color not updated');
  }

  // Check 3: Service category
  if (url.includes('/services/')) {
    if (html.includes('class="service ')) {
      checks_passed.push('Service category applied');
    } else {
      checks_failed.push('Service category missing');
    }
  }

  // Check 4: Metadata
  const hasTitle = /<title>[^<]+<\/title>/.test(html);
  const hasDescription = /name="description"/.test(html);
  const hasOG = /property="og:/.test(html);

  if (hasTitle && hasDescription && hasOG) {
    checks_passed.push('Metadata complete');
  } else {
    checks_failed.push('Missing: ' +
      (!hasTitle ? 'title ' : '') +
      (!hasDescription ? 'description ' : '') +
      (!hasOG ? 'og-tags' : '')
    );
  }

  // Check 5: No major console errors (look for common error patterns)
  if (!html.includes('console.error') && !html.includes('throw new Error')) {
    checks_passed.push('No obvious errors');
  }

  return { passed: checks_passed, failed: checks_failed };
}

async function runQA() {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const category of Object.keys(TEST_PAGES)) {
    const pages = TEST_PAGES[category];
    console.log(`\n${category.toUpperCase()}`);
    console.log('-'.repeat(40));

    for (const url of pages) {
      try {
        const { status, html } = await fetchPage(url);

        if (status === 200) {
          const { passed, failed } = checkPage(url, html);

          console.log(`\n  ${url}`);
          console.log(`    Status: ${status} ✓`);

          passed.forEach(p => {
            console.log(`    ✓ ${p}`);
            totalPassed++;
          });

          failed.forEach(f => {
            console.log(`    ✗ ${f}`);
            totalFailed++;
          });

          results[url] = { status, checks: passed.length, failed: failed.length };
        } else {
          console.log(`  ${url}`);
          console.log(`    Status: ${status} ✗`);
          totalFailed++;
        }
      } catch (err) {
        console.log(`  ${url}`);
        console.log(`    Error: ${err.message}`);
        totalFailed++;
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('FINAL QA SUMMARY\n');
  console.log(`Pages tested: ${ALL_TEST_PAGES.length}`);
  console.log(`Checks passed: ${totalPassed}`);
  console.log(`Checks failed: ${totalFailed}`);
  console.log(`Success rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%\n`);

  if (totalFailed === 0) {
    console.log('✓ ALL CHECKS PASSED — Ready for production!\n');
  } else {
    console.log(`⚠ ${totalFailed} checks failed — Review above\n`);
  }

  // Save results
  fs.writeFileSync(
    path.join(ROOT, '_qa_results_final.json'),
    JSON.stringify({ totalPages: ALL_TEST_PAGES.length, totalPassed, totalFailed, results }, null, 2)
  );

  console.log('Results saved to _qa_results_final.json');
  console.log(`\nNEXT STEPS:`);
  console.log('1. Review QA results above');
  console.log('2. Run responsive testing (mobile/tablet/desktop)');
  console.log('3. Final visual inspection');
  console.log('4. Rate all pages');
  console.log('5. Generate final report');
  console.log('6. Deploy to production\n');
}

runQA().catch(console.error);
