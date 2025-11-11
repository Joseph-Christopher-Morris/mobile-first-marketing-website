/**
 * Script Cleanup Utility
 * Finds and fixes JavaScript files with embedded markdown or corrupted content
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

const issues = {
  corrupted: [],
  empty: [],
  fixed: [],
  errors: []
};

logSection('JavaScript File Cleanup');

// Check all JavaScript files in scripts directory
const scriptsDir = path.join(process.cwd(), 'scripts');
const files = fs.readdirSync(scriptsDir);

log('\n1. Scanning JavaScript files...', 'blue');

for (const file of files) {
  if (!file.endsWith('.js')) continue;
  
  const filePath = path.join(scriptsDir, file);
  
  try {
    const stats = fs.statSync(filePath);
    
    // Check for empty files
    if (stats.size === 0) {
      log(`⚠ Empty file: ${file}`, 'yellow');
      issues.empty.push(file);
      continue;
    }
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for markdown headers that shouldn't be in JS files
    const markdownHeaders = content.match(/^#{1,6}\s+[A-Z]/gm);
    if (markdownHeaders && markdownHeaders.length > 5) {
      // More than 5 markdown headers suggests embedded markdown
      log(`⚠ Possible markdown content in: ${file}`, 'yellow');
      issues.corrupted.push({
        file,
        issue: 'Contains markdown headers',
        headers: markdownHeaders.length
      });
    }
    
    // Check for common syntax errors
    if (content.includes('```') || content.includes('---\n')) {
      log(`⚠ Markdown code blocks found in: ${file}`, 'yellow');
      issues.corrupted.push({
        file,
        issue: 'Contains markdown code blocks'
      });
    }
    
  } catch (error) {
    log(`✗ Error reading ${file}: ${error.message}`, 'red');
    issues.errors.push({
      file,
      error: error.message
    });
  }
}

// Report findings
logSection('Scan Results');

log(`\nEmpty files: ${issues.empty.length}`, issues.empty.length > 0 ? 'yellow' : 'green');
if (issues.empty.length > 0) {
  issues.empty.forEach(file => log(`  - ${file}`, 'yellow'));
}

log(`\nCorrupted files: ${issues.corrupted.length}`, issues.corrupted.length > 0 ? 'yellow' : 'green');
if (issues.corrupted.length > 0) {
  issues.corrupted.forEach(item => {
    log(`  - ${item.file}: ${item.issue}`, 'yellow');
    if (item.headers) {
      log(`    (${item.headers} markdown headers found)`, 'yellow');
    }
  });
}

log(`\nErrors: ${issues.errors.length}`, issues.errors.length > 0 ? 'red' : 'green');
if (issues.errors.length > 0) {
  issues.errors.forEach(item => log(`  - ${item.file}: ${item.error}`, 'red'));
}

// Fix empty files
if (issues.empty.length > 0) {
  logSection('Fixing Empty Files');
  
  for (const file of issues.empty) {
    const filePath = path.join(scriptsDir, file);
    
    // Delete empty files
    try {
      fs.unlinkSync(filePath);
      log(`✓ Deleted empty file: ${file}`, 'green');
      issues.fixed.push(file);
    } catch (error) {
      log(`✗ Could not delete ${file}: ${error.message}`, 'red');
    }
  }
}

// Summary
logSection('Cleanup Summary');

log(`\nFiles scanned: ${files.filter(f => f.endsWith('.js')).length}`, 'blue');
log(`Empty files removed: ${issues.fixed.length}`, 'green');
log(`Files needing manual review: ${issues.corrupted.length}`, 'yellow');
log(`Errors encountered: ${issues.errors.length}`, issues.errors.length > 0 ? 'red' : 'green');

if (issues.corrupted.length > 0) {
  log('\n⚠ Manual Review Required:', 'yellow');
  log('The following files may contain embedded markdown or spec text:', 'yellow');
  issues.corrupted.forEach(item => {
    log(`  - ${item.file}`, 'yellow');
  });
  log('\nPlease review these files and remove any non-JavaScript content.', 'yellow');
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    scanned: files.filter(f => f.endsWith('.js')).length,
    empty: issues.empty.length,
    corrupted: issues.corrupted.length,
    fixed: issues.fixed.length,
    errors: issues.errors.length
  },
  details: issues
};

const reportPath = `script-cleanup-report-${Date.now()}.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
log(`\nDetailed report saved to: ${reportPath}`, 'blue');

log('\n' + '='.repeat(60), 'cyan');
log('NEXT STEPS:', 'cyan');
log('='.repeat(60), 'cyan');
log('1. Run: npm run build', 'blue');
log('2. Check for remaining TypeScript errors', 'blue');
log('3. Review files flagged for manual inspection', 'blue');

process.exit(issues.errors.length > 0 ? 1 : 0);
