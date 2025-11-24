#!/usr/bin/env node
/**
 * WCAG 2.1 & Microsoft Clarity Content Validation
 * Validates that all required content blocks are present
 * November 23, 2025
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('WCAG 2.1 & Clarity Content Validation');
console.log('========================================\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// File paths
const files = {
  websiteDesign: 'src/app/services/website-design/page.tsx',
  adCampaigns: 'src/app/services/ad-campaigns/page.tsx',
  analytics: 'src/app/services/analytics/page.tsx'
};

// Validation checks
const checks = {
  websiteDesign: [
    { name: 'WCAG 2.1 Section', pattern: /WCAG 2\.1 Accessibility Standards/i },
    { name: 'WCAG Feature Cards', pattern: /Keyboard Navigation/i },
    { name: 'Screen Reader Compatible', pattern: /Screen Reader Compatible/i },
    { name: 'Color Contrast', pattern: /Color Contrast Compliance/i },
    { name: 'Microsoft Clarity Card', pattern: /Microsoft Clarity Insights/i },
    { name: 'Clarity Content', pattern: /scroll depth.*click behaviour/i }
  ],
  adCampaigns: [
    { name: 'Microsoft Clarity Section', pattern: /Understanding Visitor Behaviour with Microsoft Clarity/i },
    { name: 'Heatmaps Feature', pattern: /Heatmaps & Click Tracking/i },
    { name: 'Scroll Depth Feature', pattern: /Scroll Depth Analysis/i },
    { name: 'Session Recordings', pattern: /Session Recordings/i },
    { name: 'Why This Matters', pattern: /Why this matters/i }
  ],
  analytics: [
    { name: 'Microsoft Clarity Section', pattern: /Behaviour Insights with Microsoft Clarity/i },
    { name: 'User Behaviour Analysis', pattern: /User Behaviour Analysis/i },
    { name: 'Conversion Funnel', pattern: /Conversion Funnel Insights/i },
    { name: 'GA4 Integration', pattern: /GA4 Integration/i },
    { name: 'Why This Matters', pattern: /Why this matters/i }
  ]
};

// Validate each file
Object.keys(files).forEach(key => {
  const filePath = path.join(process.cwd(), files[key]);
  const fileName = files[key].split('/').pop();
  
  console.log(`\n📄 Validating: ${fileName}`);
  console.log('─'.repeat(50));
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    results.failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileChecks = checks[key];
  
  fileChecks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
      results.passed++;
    } else {
      console.log(`❌ ${check.name} - NOT FOUND`);
      results.failed++;
    }
  });
});

// Summary
console.log('\n========================================');
console.log('Validation Summary');
console.log('========================================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log('');

if (results.failed === 0) {
  console.log('🎉 All content blocks validated successfully!');
  console.log('✅ Ready for deployment\n');
  process.exit(0);
} else {
  console.log('⚠️  Some content blocks are missing or incorrect');
  console.log('❌ Please review and fix before deployment\n');
  process.exit(1);
}
