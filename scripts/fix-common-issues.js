/**
 * Fix Common Issues Script
 * Automatically fixes common code quality issues
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
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

const fixes = {
  applied: 0,
  skipped: 0,
  details: []
};

logSection('Automatic Code Fixes');

// 1. Remove trailing whitespace
log('\n1. Removing trailing whitespace...', 'blue');
const srcDir = path.join(process.cwd(), 'src');

function removeTrailingWhitespace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeTrailingWhitespace(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fixed = content.split('\n').map(line => line.trimEnd()).join('\n');
        
        if (content !== fixed) {
          fs.writeFileSync(filePath, fixed, 'utf-8');
          fixes.applied++;
          fixes.details.push({
            file: filePath.replace(process.cwd(), ''),
            fix: 'Removed trailing whitespace'
          });
        }
      } catch (error) {
        log(`⚠ Could not process ${filePath}: ${error.message}`, 'yellow');
        fixes.skipped++;
      }
    }
  }
}

try {
  removeTrailingWhitespace(srcDir);
  log(`✓ Processed files for trailing whitespace`, 'green');
} catch (error) {
  log(`⚠ Error processing files: ${error.message}`, 'yellow');
}

// 2. Ensure files end with newline
log('\n2. Ensuring files end with newline...', 'blue');

function ensureNewlineAtEnd(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      ensureNewlineAtEnd(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        if (content.length > 0 && !content.endsWith('\n')) {
          fs.writeFileSync(filePath, content + '\n', 'utf-8');
          fixes.applied++;
          fixes.details.push({
            file: filePath.replace(process.cwd(), ''),
            fix: 'Added newline at end of file'
          });
        }
      } catch (error) {
        log(`⚠ Could not process ${filePath}: ${error.message}`, 'yellow');
        fixes.skipped++;
      }
    }
  }
}

try {
  ensureNewlineAtEnd(srcDir);
  log(`✓ Processed files for newline at end`, 'green');
} catch (error) {
  log(`⚠ Error processing files: ${error.message}`, 'yellow');
}

// 3. Fix common TypeScript issues
log('\n3. Checking for common TypeScript patterns...', 'blue');

function fixCommonTSIssues(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixCommonTSIssues(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        
        // Fix: Replace == with ===
        if (content.includes(' == ') || content.includes(' != ')) {
          const newContent = content
            .replace(/ == /g, ' === ')
            .replace(/ != /g, ' !== ');
          
          if (newContent !== content) {
            content = newContent;
            modified = true;
            fixes.details.push({
              file: filePath.replace(process.cwd(), ''),
              fix: 'Replaced == with === and != with !=='
            });
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf-8');
          fixes.applied++;
        }
      } catch (error) {
        log(`⚠ Could not process ${filePath}: ${error.message}`, 'yellow');
        fixes.skipped++;
      }
    }
  }
}

try {
  fixCommonTSIssues(srcDir);
  log(`✓ Checked for common TypeScript issues`, 'green');
} catch (error) {
  log(`⚠ Error processing files: ${error.message}`, 'yellow');
}

// Summary
logSection('Fix Summary');
log(`\nFixes Applied: ${fixes.applied}`, 'green');
log(`Files Skipped: ${fixes.skipped}`, 'yellow');

if (fixes.applied > 0) {
  log('\n✓ Applied automatic fixes successfully!', 'green');
  log('\nFixed issues:', 'blue');
  fixes.details.forEach(detail => {
    log(`  - ${detail.file}: ${detail.fix}`, 'blue');
  });
} else {
  log('\n✓ No issues found that could be automatically fixed.', 'green');
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    applied: fixes.applied,
    skipped: fixes.skipped
  },
  details: fixes.details
};

const reportPath = `fix-report-${Date.now()}.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

log(`\nDetailed report saved to: ${reportPath}`, 'blue');

log('\n' + '='.repeat(60), 'cyan');
log('NEXT STEPS:', 'cyan');
log('='.repeat(60), 'cyan');
log('1. Run: npm run build', 'blue');
log('2. Test the application locally', 'blue');
log('3. Review any remaining IDE warnings manually', 'blue');
log('4. Consider installing ESLint for comprehensive linting:', 'blue');
log('   npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin', 'blue');
