#!/usr/bin/env node

/**
 * Fix UK English Compliance Issues
 * Automatically corrects American English to UK English across the codebase
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /\bcenter\b/g, to: 'centre', description: 'center → centre' },
  { from: /\bcentered\b/g, to: 'centred', description: 'centered → centred' },
  { from: /\bcolor\b/g, to: 'colour', description: 'color → colour' },
  { from: /\bcolors\b/g, to: 'colours', description: 'colors → colours' },
  { from: /\bvisualization\b/g, to: 'visualisation', description: 'visualization → visualisation' },
  { from: /\bvisualizations\b/g, to: 'visualisations', description: 'visualizations → visualisations' },
];

// Files to fix based on the compliance check
const filesToFix = [
  'src/app/contact/page.tsx',
  'src/app/free-audit/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/website-design/page.tsx',
  'src/app/services/website-hosting/page.tsx',
];

let totalChanges = 0;
const changesByFile = {};

console.log('🔍 Fixing UK English compliance issues...\n');

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;
  const changesInFile = [];

  replacements.forEach(({ from, to, description }) => {
    const matches = content.match(from);
    if (matches) {
      const count = matches.length;
      content = content.replace(from, to);
      fileChanges += count;
      changesInFile.push(`  • ${description} (${count} occurrence${count > 1 ? 's' : ''})`);
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalChanges += fileChanges;
    changesByFile[filePath] = changesInFile;
    console.log(`✅ ${filePath}`);
    changesInFile.forEach(change => console.log(change));
    console.log('');
  }
});

console.log(`\n✨ Fixed ${totalChanges} UK English compliance issue${totalChanges !== 1 ? 's' : ''} across ${Object.keys(changesByFile).length} file${Object.keys(changesByFile).length !== 1 ? 's' : ''}\n`);

if (totalChanges > 0) {
  console.log('📝 Summary of changes:');
  Object.entries(changesByFile).forEach(([file, changes]) => {
    console.log(`\n${file}:`);
    changes.forEach(change => console.log(change));
  });
  
  console.log('\n✅ All files updated successfully!');
  console.log('💡 Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Run: git add .');
  console.log('   3. Run: git commit -m "Fix UK English compliance issues"');
  console.log('   4. Run: git push origin main');
} else {
  console.log('✅ No UK English issues found!');
}
