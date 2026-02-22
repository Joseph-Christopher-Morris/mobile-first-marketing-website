const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));

let hasErrors = false;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const errors = [];
  
  // Extract content string
  const contentMatch = content.match(/content:\s*`([\s\S]*?)`\s*,/);
  if (!contentMatch) {
    errors.push('Could not extract content');
    return;
  }
  
  const htmlContent = contentMatch[1];
  
  // Check for unclosed img tags
  const unclosedImgs = htmlContent.match(/<img[^>]*(?<!\/)>/g);
  if (unclosedImgs) {
    errors.push(`Unclosed img tags: ${unclosedImgs.length}`);
  }
  
  // Check for unescaped ampersands
  const unescapedAmps = htmlContent.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g);
  if (unescapedAmps) {
    errors.push(`Unescaped ampersands: ${unescapedAmps.length}`);
  }
  
  // Check for unclosed hr tags
  const unclosedHrs = htmlContent.match(/<hr(?!\s*\/?>)/g);
  if (unclosedHrs) {
    errors.push(`Unclosed hr tags: ${unclosedHrs.length}`);
  }
  
  // Check for unclosed br tags  
  const unclosedBrs = htmlContent.match(/<br(?!\s*\/?>)/g);
  if (unclosedBrs) {
    errors.push(`Unclosed br tags: ${unclosedBrs.length}`);
  }
  
  if (errors.length > 0) {
    console.log(`❌ ${file}:`);
    errors.forEach(err => console.log(`   - ${err}`));
    hasErrors = true;
  } else {
    console.log(`✓ ${file}`);
  }
});

if (hasErrors) {
  console.log('\n❌ HTML validation failed!');
  process.exit(1);
} else {
  console.log('\n✓ All blog posts validated successfully!');
}
