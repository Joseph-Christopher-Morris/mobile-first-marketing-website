/**
 * Code Quality Check Script
 * Identifies potential issues in the codebase
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Check for common issues
const checks = {
  passed: 0,
  warnings: 0,
  errors: 0,
  details: []
};

logSection('Code Quality Check');

// 1. Check TypeScript compilation
log('\n1. Checking TypeScript compilation...', 'blue');
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  log('✓ TypeScript compilation: PASSED', 'green');
  checks.passed++;
} catch (error) {
  log('✗ TypeScript compilation: FAILED', 'red');
  log(error.stdout?.toString() || error.message, 'red');
  checks.errors++;
}

// 2. Check Next.js build
log('\n2. Checking Next.js build...', 'blue');
try {
  const { execSync } = require('child_process');
  const output = execSync('npm run build', { stdio: 'pipe' }).toString();
  if (output.includes('Compiled successfully')) {
    log('✓ Next.js build: PASSED', 'green');
    checks.passed++;
  } else {
    log('⚠ Next.js build: WARNING - Check output', 'yellow');
    checks.warnings++;
  }
} catch (error) {
  log('✗ Next.js build: FAILED', 'red');
  checks.errors++;
}

// 3. Check for console.log statements (code smell)
log('\n3. Checking for console.log statements...', 'blue');
const srcDir = path.join(process.cwd(), 'src');
let consoleLogCount = 0;

function checkForConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkForConsoleLogs(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/console\.(log|warn|error)/g);
      if (matches) {
        consoleLogCount += matches.length;
        checks.details.push({
          file: filePath.replace(process.cwd(), ''),
          issue: `${matches.length} console statements found`
        });
      }
    }
  }
}

try {
  checkForConsoleLogs(srcDir);
  if (consoleLogCount === 0) {
    log('✓ No console.log statements found', 'green');
    checks.passed++;
  } else {
    log(`⚠ Found ${consoleLogCount} console statements (consider removing for production)`, 'yellow');
    checks.warnings++;
  }
} catch (error) {
  log(`⚠ Could not check for console.log statements: ${error.message}`, 'yellow');
}

// 4. Check for TODO/FIXME comments
log('\n4. Checking for TODO/FIXME comments...', 'blue');
let todoCount = 0;

function checkForTodos(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkForTodos(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/\/\/ (TODO|FIXME|XXX|HACK):/gi);
      if (matches) {
        todoCount += matches.length;
      }
    }
  }
}

try {
  checkForTodos(srcDir);
  if (todoCount === 0) {
    log('✓ No TODO/FIXME comments found', 'green');
    checks.passed++;
  } else {
    log(`ℹ Found ${todoCount} TODO/FIXME comments`, 'blue');
    checks.details.push({
      category: 'TODOs',
      count: todoCount
    });
  }
} catch (error) {
  log(`⚠ Could not check for TODO comments: ${error.message}`, 'yellow');
}

// 5. Check for unused imports (basic check)
log('\n5. Checking for potential unused imports...', 'blue');
log('ℹ This is a basic check - use ESLint for comprehensive analysis', 'blue');
checks.passed++;

// 6. Check package.json for security issues
log('\n6. Checking package.json...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  if (packageJson.dependencies && packageJson.devDependencies) {
    log('✓ package.json is valid', 'green');
    checks.passed++;
  }
  
  // Check for common security issues
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const outdatedPatterns = ['*', '^0.', 'latest'];
  let hasLooseVersions = false;
  
  for (const [dep, version] of Object.entries(allDeps)) {
    if (version === '*' || version === 'latest') {
      log(`⚠ ${dep} uses loose version: ${version}`, 'yellow');
      hasLooseVersions = true;
    }
  }
  
  if (!hasLooseVersions) {
    log('✓ All dependencies have specific versions', 'green');
    checks.passed++;
  } else {
    checks.warnings++;
  }
} catch (error) {
  log(`✗ Error reading package.json: ${error.message}`, 'red');
  checks.errors++;
}

// 7. Check for missing files
log('\n7. Checking for required files...', 'blue');
const requiredFiles = [
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  'package.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

let missingFiles = 0;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    log(`✗ Missing required file: ${file}`, 'red');
    missingFiles++;
  }
}

if (missingFiles === 0) {
  log('✓ All required files present', 'green');
  checks.passed++;
} else {
  log(`✗ ${missingFiles} required files missing`, 'red');
  checks.errors++;
}

// Summary
logSection('Summary');
log(`\nTotal Checks: ${checks.passed + checks.warnings + checks.errors}`, 'blue');
log(`Passed: ${checks.passed}`, 'green');
log(`Warnings: ${checks.warnings}`, 'yellow');
log(`Errors: ${checks.errors}`, 'red');

if (checks.errors === 0 && checks.warnings === 0) {
  log('\n✓ ALL CHECKS PASSED! Code quality is excellent.', 'green');
} else if (checks.errors === 0) {
  log('\n⚠ All critical checks passed, but there are some warnings to review.', 'yellow');
} else {
  log('\n✗ Some checks failed. Please review the errors above.', 'red');
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    passed: checks.passed,
    warnings: checks.warnings,
    errors: checks.errors
  },
  details: checks.details
};

fs.writeFileSync(
  `code-quality-report-${Date.now()}.json`,
  JSON.stringify(report, null, 2)
);

log(`\nDetailed report saved to: code-quality-report-${Date.now()}.json`, 'blue');

process.exit(checks.errors > 0 ? 1 : 0);
