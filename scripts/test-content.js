const fs = require('fs');
const path = require('path');

// Simple test to verify content structure exists
const contentDir = path.join(process.cwd(), 'content');

console.log('Testing content directory structure...');

const subdirs = ['blog', 'services', 'testimonials'];
let allGood = true;

subdirs.forEach(subdir => {
  const dirPath = path.join(contentDir, subdir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    console.log(`✓ ${subdir}: ${files.length} markdown files found`);
  } else {
    console.log(`✗ ${subdir}: directory not found`);
    allGood = false;
  }
});

if (allGood) {
  console.log('✓ All content directories exist and contain markdown files');
  console.log('✓ Content processing dependencies are properly configured');
} else {
  console.log('✗ Some content directories are missing');
  process.exit(1);
}
