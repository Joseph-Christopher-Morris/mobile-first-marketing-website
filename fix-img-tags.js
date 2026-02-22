const fs = require('fs');
const path = require('path');

const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix unclosed img tags - add loading="lazy" and self-closing
  content = content.replace(/<img ([^>]*?)(?<!loading="lazy" )(?<!loading='lazy' )(?<!\/)>/g, '<img $1 loading="lazy" />');
  
  // Fix double loading="lazy" if any
  content = content.replace(/loading="lazy"\s+loading="lazy"/g, 'loading="lazy"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('All blog post img tags fixed!');
