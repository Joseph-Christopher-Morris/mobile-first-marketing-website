#!/usr/bin/env node

/**
 * Fix Invalid Tags - Map to Approved Tags
 */

const fs = require('fs');
const path = require('path');

// Tag mapping: invalid -> approved
const TAG_MAPPING = {
  'stock-photography': 'content-strategy',
  'photography-business': 'small-business',
  'data-analysis': 'analytics',
  'istock': 'content-strategy',
  'deepmeta': 'analytics',
  'earnings-breakdown': 'analytics',
  'flyer-marketing': 'offline-marketing',
  'ROI': 'conversion-optimisation',
  'print-vs-digital': 'offline-marketing',
  'small-business-growth': 'small-business',
  'breakthrough': 'case-study',
  'income-growth': 'conversion-optimisation',
  'consistency': 'content-strategy',
  'getting-started': 'case-study',
  'income-diversification': 'small-business',
  'freelance-strategy': 'small-business',
  'passive-income': 'content-strategy',
  'revenue-scaling': 'conversion-optimisation',
  'content-ROI': 'conversion-optimisation',
  'evergreen-content': 'content-strategy',
  'visual-marketing': 'content-strategy'
};

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function fixTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  const tagsMatch = content.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    const tagsStr = tagsMatch[1];
    const tags = tagsStr
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(t => t);
    
    const mappedTags = tags.map(tag => TAG_MAPPING[tag] || tag);
    
    // Remove duplicates
    const uniqueTags = [...new Set(mappedTags)];
    
    if (JSON.stringify(tags) !== JSON.stringify(uniqueTags)) {
      const newTagsStr = uniqueTags.map(t => `'${t}'`).join(', ');
      content = content.replace(
        /tags:\s*\[.*?\]/s,
        `tags: [${newTagsStr}]`
      );
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  console.log('\n🔧 Fixing invalid tags...\n');
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.ts'));
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    if (fixTags(filePath)) {
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  });
  
  console.log(`\n✅ Fixed ${fixedCount} files\n`);
}

main();
