#!/usr/bin/env node

/**
 * AHREFS BROKEN IMAGE FIX SCRIPT
 * Automatically fixes all broken image paths reported by Ahrefs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Build filesystem image map
function buildImageMap() {
  log('\n📦 Building filesystem image map...', 'cyan');
  const result = execSync('find public/images -type f', { encoding: 'utf-8' });
  const files = result.trim().split('\n').filter(f => f && !f.includes('/.git'));
  
  const imageMap = new Map();
  files.forEach(file => {
    const webPath = file.replace('public', '');
    const fileName = path.basename(file);
    const lowerFileName = fileName.toLowerCase();
    
    imageMap.set(webPath, { exists: true, path: file });
    imageMap.set(lowerFileName, { exists: true, path: file, webPath });
  });
  
  log(`✓ Found ${files.length} images in filesystem`, 'green');
  return imageMap;
}

// Case-sensitive path fixes
const pathFixes = {
  // Photography folder case fix
  '/images/services/Photography/': '/images/services/photography/',
  
  // Web Hosting And Migration case fix
  '/images/services/Web Hosting And Migration/': '/images/services/web-hosting-and-migration/',
  
  // Screenshot case variations
  'Screenshot 2025': 'screenshot-2025',
};

// Known broken paths from Ahrefs
const knownBrokenPaths = [
  '/images/services/Photography/240427-_Nantwich_Stock_Photography-19.webp',
  '/images/services/Photography/240427-_Nantwich_Stock_Photography-23.webp',
  '/images/services/Photography/240421-Nantwich_Stock_Photography-49.webp',
  '/images/services/Photography/photography-hero.webp',
  '/images/services/Photography/photography-sample-1.webp',
  '/images/services/Photography/photography-sample-2.webp',
  '/images/services/Photography/photography-sample-3.webp',
  '/images/services/Photography/photography-sample-4.webp',
  '/images/services/Photography/5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp',
  '/images/services/Web Hosting And Migration/pagespeed-aws-migration-desktop.webp',
  '/images/services/Web Hosting And Migration/before-hosting-performance.webp',
  '/images/blog/Screenshot 2025-08-11 143853.webp',
  '/images/blog/Screenshot 2025-08-11 143943.webp',
  '/images/blog/Screenshot 2025-07-04 193922 (1).webp',
  '/images/blog/Screenshot 2025-05-25 191000.webp',
  '/images/blog/Screenshot 2025-08-14 093957.webp',
  '/images/blog/Screenshot 2025-08-14 094204.webp',
  '/images/blog/Screenshot 2025-08-14 093805-cropped.webp',
  '/images/blog/Screenshot 2025-08-14 094416.webp',
  '/images/blog/Screenshot 2025-07-04 211333.webp',
];

function fixFile(filePath, imageMap) {
  if (!fs.existsSync(filePath)) return { fixed: 0, errors: [] };
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fixCount = 0;
  const errors = [];
  
  // Fix case-sensitive paths
  Object.entries(pathFixes).forEach(([wrong, correct]) => {
    if (content.includes(wrong)) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, correct);
        fixCount += matches.length;
        log(`  ✓ Fixed ${matches.length}x: ${wrong} → ${correct}`, 'green');
      }
    }
  });
  
  // Fix URL-encoded spaces
  if (content.includes('%20')) {
    const urlEncodedRegex = /(['"])([^'"]*%20[^'"]*)\1/g;
    content = content.replace(urlEncodedRegex, (match, quote, url) => {
      const decoded = decodeURIComponent(url);
      fixCount++;
      log(`  ✓ Decoded URL: ${url} → ${decoded}`, 'green');
      return `${quote}${decoded}${quote}`;
    });
  }
  
  // Verify all image references exist
  const imageRegex = /(src=|image:|hero:|ogImage:)\s*['"]([^'"]*\/images\/[^'"]*)['"]/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imagePath = match[2];
    const publicPath = `public${imagePath}`;
    
    if (!fs.existsSync(publicPath)) {
      errors.push(`Missing: ${imagePath}`);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { fixed: fixCount, errors };
}

function scanAndFix() {
  log('\n🔍 AHREFS BROKEN IMAGE FIX - STARTING', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const imageMap = buildImageMap();
  
  // Files to scan
  const filesToScan = [
    'src/app/**/*.tsx',
    'src/app/**/*.ts',
    'src/components/**/*.tsx',
    'src/content/blog/**/*.ts',
    'src/lib/**/*.ts',
    'src/config/**/*.ts',
  ];
  
  log('\n🔧 Scanning and fixing files...', 'cyan');
  
  let totalFixed = 0;
  let totalErrors = [];
  
  filesToScan.forEach(pattern => {
    try {
      const files = execSync(`find ${pattern.split('/**')[0]} -type f \\( -name "*.tsx" -o -name "*.ts" \\) 2>/dev/null || true`, {
        encoding: 'utf-8',
      }).trim().split('\n').filter(f => f);
      
      files.forEach(file => {
        const result = fixFile(file, imageMap);
        if (result.fixed > 0) {
          log(`\n📝 ${file}`, 'blue');
          totalFixed += result.fixed;
        }
        if (result.errors.length > 0) {
          totalErrors.push(...result.errors.map(e => `${file}: ${e}`));
        }
      });
    } catch (err) {
      // Pattern not found, skip
    }
  });
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 FIX SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✓ Total fixes applied: ${totalFixed}`, totalFixed > 0 ? 'green' : 'yellow');
  
  if (totalErrors.length > 0) {
    log(`\n⚠️  Missing images (${totalErrors.length}):`, 'yellow');
    totalErrors.forEach(err => log(`  - ${err}`, 'yellow'));
  } else {
    log('✓ No missing images detected', 'green');
  }
  
  log('\n✅ AHREFS IMAGE FIX COMPLETE', 'green');
}

// Run
scanAndFix();
