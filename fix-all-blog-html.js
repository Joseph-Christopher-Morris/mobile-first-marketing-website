const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // 1. Fix unclosed img tags - ensure they're self-closing with loading="lazy"
  const beforeImg = content;
  content = content.replace(/<img\s+([^>]*?)(?:\s*\/)?>/g, (match, attrs) => {
    // Check if already has loading attribute
    if (!attrs.includes('loading=')) {
      return `<img ${attrs} loading="lazy" />`;
    }
    // Ensure it's self-closing
    if (!match.endsWith('/>')) {
      return `<img ${attrs} />`;
    }
    return match;
  });
  if (content !== beforeImg) changes++;
  
  // 2. Fix unescaped ampersands in content (but not in already-escaped entities)
  const beforeAmp = content;
  content = content.replace(/(content: `[\s\S]*?`)/g, (match) => {
    return match.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  });
  if (content !== beforeAmp) changes++;
  
  // 3. Fix unescaped quotes in excerpt/title (use double quotes consistently)
  const beforeQuotes = content;
  // Fix escaped single quotes in double-quoted strings
  content = content.replace(/(excerpt|title):\s*'([^']*\\'[^']*)'/g, (match, field, value) => {
    const unescaped = value.replace(/\\'/g, "'");
    return `${field}: "${unescaped}"`;
  });
  if (content !== beforeQuotes) changes++;
  
  // 4. Fix unclosed hr tags
  const beforeHr = content;
  content = content.replace(/<hr(?!\s*\/?>)/g, '<hr />');
  content = content.replace(/<hr>/g, '<hr />');
  if (content !== beforeHr) changes++;
  
  // 5. Fix unclosed br tags
  const beforeBr = content;
  content = content.replace(/<br(?!\s*\/?>)/g, '<br />');
  content = content.replace(/<br>/g, '<br />');
  if (content !== beforeBr) changes++;
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${file} (${changes} types of issues)`);
    totalFixed++;
  } else {
    console.log(`  ${file} - no issues`);
  }
});

console.log(`\n✓ Complete! Fixed ${totalFixed} files.`);
