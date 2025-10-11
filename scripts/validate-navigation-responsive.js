#!/usr/bin/env node

/**
 * Navigation Responsive Behavior Validation Script
 *
 * This script validates that the navigation responsive breakpoints are correctly implemented:
 * - Desktop navigation visible at md+ breakpoint (768px and above)
 * - Mobile hamburger menu visible below md breakpoint (below 768px)
 */

const fs = require('fs');
const path = require('path');

function validateHeaderComponent() {
  const headerPath = path.join(
    __dirname,
    '../src/components/layout/Header.tsx'
  );

  if (!fs.existsSync(headerPath)) {
    console.error('❌ Header component not found at:', headerPath);
    return false;
  }

  const headerContent = fs.readFileSync(headerPath, 'utf8');

  const validations = [
    {
      name: 'Desktop Navigation uses md:flex',
      pattern:
        /className=['"].*hidden md:flex.*['"].*role=['"]navigation['"]|role=['"]navigation['"].*className=['"].*hidden md:flex.*['"]/s,
      description: 'Desktop navigation should use "hidden md:flex" classes',
    },
    {
      name: 'Desktop CTA Button uses md:flex',
      pattern:
        /className=['"].*hidden md:flex.*['"].*Get Started|Get Started.*className=['"].*hidden md:flex.*['"]/s,
      description:
        'Desktop CTA button container should use "hidden md:flex" classes',
    },
    {
      name: 'Mobile Menu Button uses md:hidden',
      pattern:
        /className=['"].*md:hidden.*['"].*Toggle mobile menu|Toggle mobile menu.*className=['"].*md:hidden.*['"]/s,
      description: 'Mobile menu button should use "md:hidden" class',
    },
    {
      name: 'Comment updated for 768px breakpoint',
      pattern: /768px and above|768px\+/,
      description:
        'Comments should reference 768px breakpoint instead of 1024px',
    },
  ];

  let allValid = true;

  console.log('🔍 Validating Header component responsive breakpoints...\n');

  validations.forEach(validation => {
    const isValid = validation.pattern.test(headerContent);
    const status = isValid ? '✅' : '❌';

    console.log(`${status} ${validation.name}`);
    if (!isValid) {
      console.log(`   ${validation.description}`);
      allValid = false;
    }
  });

  // Additional check for old lg: breakpoints
  const lgBreakpoints = headerContent.match(/lg:hidden|hidden lg:flex/g);
  if (lgBreakpoints && lgBreakpoints.length > 0) {
    console.log('❌ Found old lg: breakpoints that should be updated to md:');
    lgBreakpoints.forEach(match => {
      console.log(`   - ${match}`);
    });
    allValid = false;
  } else {
    console.log('✅ No old lg: breakpoints found');
  }

  return allValid;
}

function validateTestFile() {
  const testPath = path.join(
    __dirname,
    '../src/components/layout/__tests__/Header.test.tsx'
  );

  if (!fs.existsSync(testPath)) {
    console.log('⚠️  Header test file not found, skipping test validation');
    return true;
  }

  const testContent = fs.readFileSync(testPath, 'utf8');

  const testValidations = [
    {
      name: 'Test expects md:hidden for mobile button',
      pattern: /expect.*md:hidden/,
      description: 'Tests should expect md:hidden class on mobile menu button',
    },
    {
      name: 'Test expects md:flex for desktop elements',
      pattern: /md:flex/,
      description: 'Tests should expect md:flex class on desktop elements',
    },
  ];

  let allValid = true;

  console.log('\n🧪 Validating Header component tests...\n');

  testValidations.forEach(validation => {
    const isValid = validation.pattern.test(testContent);
    const status = isValid ? '✅' : '❌';

    console.log(`${status} ${validation.name}`);
    if (!isValid) {
      console.log(`   ${validation.description}`);
      allValid = false;
    }
  });

  return allValid;
}

function generateValidationReport() {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    validation: 'Navigation Responsive Behavior',
    breakpointChange: {
      from: 'lg (1024px)',
      to: 'md (768px)',
    },
    expectedBehavior: {
      desktop: 'Navigation visible at 768px and above (md+ breakpoint)',
      mobile: 'Hamburger menu visible below 768px (below md breakpoint)',
    },
    changes: [
      'Desktop navigation: hidden lg:flex → hidden md:flex',
      'Desktop CTA button: hidden lg:flex → hidden md:flex',
      'Mobile menu button: lg:hidden → md:hidden',
      'Updated comments to reference 768px instead of 1024px',
    ],
  };

  const reportPath = path.join(
    __dirname,
    '../navigation-responsive-validation-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Validation report saved to: ${reportPath}`);

  return report;
}

function main() {
  console.log('🚀 Navigation Responsive Behavior Validation\n');
  console.log(
    'This validation ensures the navigation hamburger is removed from desktop'
  );
  console.log('and appears only on mobile devices (below 768px breakpoint).\n');

  const headerValid = validateHeaderComponent();
  const testsValid = validateTestFile();

  const report = generateValidationReport();

  console.log('\n📊 Validation Summary:');
  console.log('='.repeat(50));

  if (headerValid && testsValid) {
    console.log('✅ All validations passed!');
    console.log('✅ Desktop navigation will show at 768px and above');
    console.log('✅ Mobile hamburger menu will show below 768px');
    console.log('✅ Navigation responsive behavior is correctly implemented');

    console.log('\n🎯 Next Steps:');
    console.log('1. Test the navigation at different screen sizes');
    console.log('2. Verify hamburger menu functionality on mobile');
    console.log('3. Ensure accessibility attributes work correctly');
    console.log('4. Deploy and test on actual devices');

    process.exit(0);
  } else {
    console.log('❌ Some validations failed');
    console.log('❌ Please review and fix the issues above');

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Header.tsx for correct responsive classes');
    console.log('2. Update any remaining lg: breakpoints to md:');
    console.log('3. Ensure tests expect the correct classes');
    console.log('4. Run tests to verify functionality');

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateHeaderComponent,
  validateTestFile,
  generateValidationReport,
};
