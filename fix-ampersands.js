const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix unescaped ampersands in content string (between backticks)
  // Match content between backticks and fix ampersands
  content = content.replace(/(content: `[\s\S]*?`)/g, (match) => {
    // Replace & with &amp; but avoid double-escaping already escaped ones
    return match.replace(/&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('All ampersands fixed!');
