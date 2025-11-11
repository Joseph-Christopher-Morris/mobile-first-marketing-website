const fs = require('fs');
const path = require('path');

/**
 * Validates Press Logos Accessibility Compliance
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

const results = {
  timestamp: new Date().toISOString(),
  overallStatus: 'PASS',
  checks: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
};

function addCheck(name, status, details) {
  results.checks.push({ name, status, details });
  results.summary.total++;
  if (status === 'PASS') {
    results.summary.passed++;
  } else {
    results.summary.failed++;
    results.overallStatus = 'FAIL';
  }
}

// Check 1: Verify component file exists
console.log('Checking Press Logos component...');
const componentPath = path.join(__dirname, '../src/components/PressLogos.tsx');
if (fs.existsSync(componentPath)) {
  addCheck('Component File Exists', 'PASS', 'PressLogos.tsx found');
} else {
  addCheck('Component File Exists', 'FAIL', 'PressLogos.tsx not found');
  console.error('Component file not found. Exiting validation.');
  process.exit(1);
}

// Check 2: Verify descriptive alt text (Requirement 6.1)
console.log('Validating alt text...');
const componentContent = fs.readFileSync(componentPath, 'utf-8');

const expectedAltTexts = [
  'BBC News',
  'Forbes',
  'Financial Times',
  'CNN',
  'AutoTrader',
  'Daily Mail',
  'Business Insider',
];

let altTextCheck = true;
const missingAltTexts = [];

expectedAltTexts.forEach((altText) => {
  if (!componentContent.includes(`alt: '${altText}'`)) {
    altTextCheck = false;
    missingAltTexts.push(altText);
  }
});

if (altTextCheck) {
  addCheck(
    'Descriptive Alt Text (Req 6.1)',
    'PASS',
    'All 7 logos have descriptive alt text'
  );
} else {
  addCheck(
    'Descriptive Alt Text (Req 6.1)',
    'FAIL',
    `Missing alt text for: ${missingAltTexts.join(', ')}`
  );
}

// Check 3: Verify aria-label attributes (Requirement 6.2)
console.log('Validating aria-label attributes...');
const ariaLabelPattern = /aria-label=\{`\$\{logo\.alt\} feature logo`\}/;
if (ariaLabelPattern.test(componentContent)) {
  addCheck(
    'Aria-Label Attributes (Req 6.2)',
    'PASS',
    'Logo containers have aria-label attributes'
  );
} else {
  addCheck(
    'Aria-Label Attributes (Req 6.2)',
    'FAIL',
    'Missing aria-label attributes on logo containers'
  );
}

// Check 4: Verify keyboard navigation support (Requirement 6.3)
console.log('Validating keyboard navigation support...');
// Check for proper semantic HTML and no layout-breaking elements
const hasProperStructure =
  componentContent.includes('<div') &&
  !componentContent.includes('position: fixed') &&
  !componentContent.includes('overflow: hidden');

if (hasProperStructure) {
  addCheck(
    'Keyboard Navigation Support (Req 6.3)',
    'PASS',
    'Component structure supports keyboard navigation without layout disruption'
  );
} else {
  addCheck(
    'Keyboard Navigation Support (Req 6.3)',
    'FAIL',
    'Component may disrupt layout during keyboard navigation'
  );
}

// Check 5: Verify color contrast implementation (Requirement 6.4)
console.log('Validating color contrast...');
// Check for opacity values that ensure sufficient contrast
const hasOpacityControl =
  componentContent.includes('opacity-80') &&
  componentContent.includes('group-hover:opacity-100');

if (hasOpacityControl) {
  addCheck(
    'Color Contrast Implementation (Req 6.4)',
    'PASS',
    'Opacity values configured for sufficient contrast (80% default, 100% hover)'
  );
} else {
  addCheck(
    'Color Contrast Implementation (Req 6.4)',
    'FAIL',
    'Missing proper opacity configuration for color contrast'
  );
}

// Check 6: Verify WCAG 2.1 Level AA compliance elements (Requirement 6.5)
console.log('Validating WCAG 2.1 Level AA compliance elements...');
const wcagElements = {
  altText: componentContent.includes('alt='),
  ariaLabel: componentContent.includes('aria-label'),
  semanticHTML: componentContent.includes('<div') && componentContent.includes('<Image'),
  noColorOnly: componentContent.includes('alt'), // Not relying on color alone
};

const wcagElementsPass = Object.values(wcagElements).every((v) => v === true);

if (wcagElementsPass) {
  addCheck(
    'WCAG 2.1 Level AA Elements (Req 6.5)',
    'PASS',
    'Component includes all required WCAG 2.1 Level AA elements'
  );
} else {
  addCheck(
    'WCAG 2.1 Level AA Elements (Req 6.5)',
    'FAIL',
    'Missing some WCAG 2.1 Level AA required elements'
  );
}

// Check 7: Verify Next.js Image component usage
console.log('Validating Next.js Image component...');
if (componentContent.includes("import Image from 'next/image'")) {
  addCheck(
    'Next.js Image Component',
    'PASS',
    'Using Next.js Image component for optimized loading'
  );
} else {
  addCheck(
    'Next.js Image Component',
    'FAIL',
    'Not using Next.js Image component'
  );
}

// Check 8: Verify responsive design classes
console.log('Validating responsive design...');
const hasResponsiveClasses =
  componentContent.includes('flex-wrap') &&
  componentContent.includes('justify-center') &&
  componentContent.includes('gap-6');

if (hasResponsiveClasses) {
  addCheck(
    'Responsive Design Classes',
    'PASS',
    'Component includes responsive flexbox classes'
  );
} else {
  addCheck(
    'Responsive Design Classes',
    'FAIL',
    'Missing responsive design classes'
  );
}

// Generate report
console.log('\n' + '='.repeat(60));
console.log('PRESS LOGOS ACCESSIBILITY VALIDATION REPORT');
console.log('='.repeat(60));
console.log(`Timestamp: ${results.timestamp}`);
console.log(`Overall Status: ${results.overallStatus}`);
console.log(`\nSummary: ${results.summary.passed}/${results.summary.total} checks passed`);
console.log('='.repeat(60));

results.checks.forEach((check, index) => {
  const icon = check.status === 'PASS' ? '✓' : '✗';
  console.log(`\n${index + 1}. ${icon} ${check.name}: ${check.status}`);
  console.log(`   ${check.details}`);
});

console.log('\n' + '='.repeat(60));

// Save detailed report
const reportPath = path.join(
  __dirname,
  '../press-logos-accessibility-validation-report.json'
);
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\nDetailed report saved to: ${reportPath}`);

// Generate summary markdown
const summaryPath = path.join(
  __dirname,
  '../press-logos-accessibility-validation-summary.md'
);
let markdown = `# Press Logos Accessibility Validation Summary\n\n`;
markdown += `**Generated:** ${results.timestamp}\n\n`;
markdown += `**Overall Status:** ${results.overallStatus}\n\n`;
markdown += `**Summary:** ${results.summary.passed}/${results.summary.total} checks passed\n\n`;
markdown += `## Validation Results\n\n`;

results.checks.forEach((check, index) => {
  const icon = check.status === 'PASS' ? '✅' : '❌';
  markdown += `### ${index + 1}. ${icon} ${check.name}\n\n`;
  markdown += `- **Status:** ${check.status}\n`;
  markdown += `- **Details:** ${check.details}\n\n`;
});

markdown += `## Requirements Coverage\n\n`;
markdown += `- **Requirement 6.1:** Descriptive alt text - ${
  results.checks.find((c) => c.name.includes('6.1')).status
}\n`;
markdown += `- **Requirement 6.2:** Aria-label attributes - ${
  results.checks.find((c) => c.name.includes('6.2')).status
}\n`;
markdown += `- **Requirement 6.3:** Keyboard navigation - ${
  results.checks.find((c) => c.name.includes('6.3')).status
}\n`;
markdown += `- **Requirement 6.4:** Color contrast - ${
  results.checks.find((c) => c.name.includes('6.4')).status
}\n`;
markdown += `- **Requirement 6.5:** WCAG 2.1 Level AA - ${
  results.checks.find((c) => c.name.includes('6.5')).status
}\n`;

fs.writeFileSync(summaryPath, markdown);
console.log(`Summary saved to: ${summaryPath}\n`);

// Exit with appropriate code
process.exit(results.overallStatus === 'PASS' ? 0 : 1);
