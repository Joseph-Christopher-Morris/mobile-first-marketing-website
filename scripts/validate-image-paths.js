#!/usr/bin/env node

/**
 * IMAGE PATH VALIDATION SCRIPT
 * Validates all image references against actual filesystem
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Build filesystem image map
function buildImageMap() {
  const result = execSync('find public/images -type f', { encoding: 'utf-8' });
  const files = result.trim().split('\n').filter(f => f && !f.includes('/.git'));
  
  const imageMap = new Map();
  files.forEach(file => {
    const webPath = file.replace('public', '');
    imageMap.set(webPath, true);
  });
  
  return imageMap;
}

// Extract image references from code
function extractImageReferences() {
  const patterns = [
    'src/app/**/*.tsx',
    'src/app/**/*.ts',
    'src/components/**/*.tsx',
    'src/content/blog/**/*.ts',
    'src/lib/**/*.ts',
    'src/config/**/*.ts',
  ];
  
  const references = new Set();
  const imageRegex = /(src=|image:|hero:|ogImage:)\s*['"]([^'"]*\/images\/[^'"?]*)/g;
  
  patterns.forEach(pattern => {
    try {
      const baseDir = pattern.split('/**')[0];
      const files = execSync(
        `find ${baseDir} -type f \\( -name "*.tsx" -o -name "*.ts" \\) 2>/dev/null || true`,
        { encoding: 'utf-8' }
      ).trim().split('\n').filter(f => f);
      
      files.forEach(file => {
        if (!fs.existsSync(file)) return;
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
          const imagePath = match[2].split('?')[0]; // Remove query params
          references.add({ path: imagePath, file });
        }
      });
    } catch (err) {
      // Skip if pattern doesn't match
    }
  });
  
  return Array.from(references);
}

function validate() {
  log('\n🔍 IMAGE PATH VALIDATION', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const imageMap = buildImageMap();
  log(`✓ Found ${imageMap.size} images in filesystem`, 'green');
  
  const references = extractImageReferences();
  log(`✓ Found ${references.length} image references in code\n`, 'green');
  
  const missing = [];
  const valid = [];
  
  references.forEach(ref => {
    const publicPath = `public${ref.path}`;
    if (!fs.existsSync(publicPath)) {
      missing.push(ref);
    } else {
      valid.push(ref);
    }
  });
  
  log('📊 VALIDATION RESULTS', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✓ Valid references: ${valid.length}`, 'green');
  
  if (missing.length > 0) {
    log(`✗ Missing images: ${missing.length}`, 'red');
    log('\n⚠️  MISSING IMAGES:', 'yellow');
    missing.forEach(ref => {
      log(`  ${ref.path}`, 'red');
      log(`    Referenced in: ${ref.file}`, 'yellow');
    });
  } else {
    log('✓ No missing images detected!', 'green');
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  
  return missing.length === 0;
}

const success = validate();
process.exit(success ? 0 : 1);
