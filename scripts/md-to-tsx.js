// scripts/md-to-tsx.js
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const mdDir = path.join(process.cwd(), 'content', 'blog');    // source .md folder
const outDir = path.join(process.cwd(), 'src', 'content', 'blog');     // TSX output folder

function slugify(filename) {
  return filename
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractFirstHeading(content) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : null;
}

function extractFirstParagraph(content) {
  // Remove headings and get first paragraph
  const withoutHeadings = content.replace(/^#+\s+.+$/gm, '');
  const paragraphs = withoutHeadings.split('\n\n').filter(p => p.trim());
  if (paragraphs.length > 0) {
    // Strip markdown formatting for excerpt
    return paragraphs[0]
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim();
  }
  return '';
}

function extractFirstImage(content) {
  const imageMatch = content.match(/!\[.*?\]\((.+?)\)/);
  return imageMatch ? imageMatch[1] : null;
}

function categorizePost(filename, content) {
  const lower = filename.toLowerCase();
  if (lower.includes('ebay') || lower.includes('model')) {
    return 'eBay / Model Cars';
  }
  if (lower.includes('flyer') || lower.includes('marketing') || lower.includes('roi')) {
    return 'Marketing';
  }
  if (lower.includes('stock') || lower.includes('photography')) {
    return 'Stock Photography';
  }
  if (lower.includes('paid ads') || lower.includes('campaign')) {
    return 'Marketing';
  }
  return 'Case Study';
}

function generateTags(filename, content) {
  const lower = filename.toLowerCase();
  const tags = [];
  
  if (lower.includes('ebay')) tags.push('ebay');
  if (lower.includes('model')) tags.push('model-cars');
  if (lower.includes('flyer')) tags.push('flyers', 'direct-response');
  if (lower.includes('marketing')) tags.push('marketing');
  if (lower.includes('roi')) tags.push('roi', 'case-study');
  if (lower.includes('stock')) tags.push('stock-photography');
  if (lower.includes('photography')) tags.push('photography');
  if (lower.includes('paid ads')) tags.push('paid-ads', 'google-ads');
  if (lower.includes('income') || lower.includes('revenue')) tags.push('income', 'business');
  
  return tags.length > 0 ? tags : ['case-study'];
}

function estimateReadTime(content) {
  const wordCount = content.split(/\s+/).length;
  return Math.max(4, Math.round(wordCount / 200));
}

async function shouldOverwrite(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.includes('// AUTO-GENERATED');
  } catch (error) {
    return true; // File doesn't exist, so we can create it
  }
}

async function main() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outDir, { recursive: true });
    
    // Check if source directory exists
    try {
      await fs.access(mdDir);
    } catch (error) {
      console.log(`❌ Source directory ${mdDir} does not exist.`);
      return;
    }

    const files = await fs.readdir(mdDir);
    const mdFiles = files.filter(file => file.toLowerCase().endsWith('.md'));
    
    if (mdFiles.length === 0) {
      console.log(`No .md files found in ${mdDir}`);
      return;
    }

    console.log(`📚 Found ${mdFiles.length} markdown files to convert...`);

    let converted = 0;
    let skipped = 0;

    for (const file of mdFiles) {
      const slug = slugify(file);
      const fullPath = path.join(mdDir, file);
      const outPath = path.join(outDir, slug + '.ts');
      
      // Check if we should overwrite existing file
      if (!(await shouldOverwrite(outPath))) {
        console.log(`⏭️  Skipping ${file} (existing TS file without AUTO-GENERATED marker)`);
        skipped++;
        continue;
      }

      const raw = await fs.readFile(fullPath, 'utf8');
      const { data, content: mdBody } = matter(raw);

      // Extract title from frontmatter, first heading, or filename
      const title = data.title || extractFirstHeading(mdBody) || file.replace(/\.md$/i, '');
      
      // Extract excerpt from frontmatter or first paragraph
      const excerpt = data.excerpt || extractFirstParagraph(mdBody);
      
      // Extract image from frontmatter, first image in content, or use default
      const image = data.image || extractFirstImage(mdBody) || '/images/blog/default.jpg';
      
      // Categorize the post
      const category = data.category || categorizePost(file, mdBody);
      
      // Generate tags
      const tags = data.tags || generateTags(file, mdBody);
      
      // Estimate read time
      const readTime = data.readTime || estimateReadTime(mdBody);

      // Convert markdown body to HTML
      const htmlBody = marked.parse(mdBody);

      // Build TSX content with AUTO-GENERATED marker
      const tsx = `// AUTO-GENERATED from ${file}
import { BlogPost } from '@/lib/blog-types';

const post: BlogPost = {
  slug: ${JSON.stringify(data.slug || slug)},
  title: ${JSON.stringify(title)},
  excerpt: ${JSON.stringify(excerpt)},
  content: ${JSON.stringify(htmlBody)},
  date: ${JSON.stringify(data.date || '2025-01-01')},
  author: ${JSON.stringify(data.author || 'Joe from Vivid Auto')},
  category: ${JSON.stringify(category)},
  tags: ${JSON.stringify(tags)},
  image: ${JSON.stringify(image)},
  readTime: ${readTime},
  featured: ${data.featured || false},
};

export default post;
`;

      await fs.writeFile(outPath, tsx, 'utf8');
      console.log(`✅ Created ${path.relative(process.cwd(), outPath)}`);
      converted++;
    }

    console.log(`\n🎉 Conversion complete!`);
    console.log(`   ✅ Converted: ${converted} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    
    if (converted > 0) {
      console.log('\n📝 Next steps:');
      console.log('1. Review generated files for image paths and metadata');
      console.log('2. Run npm run build to verify everything works');
      console.log('3. Update any specific hero images as needed');
    }

  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});