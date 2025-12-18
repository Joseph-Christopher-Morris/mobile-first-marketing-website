#!/usr/bin/env node

/**
 * HERO ENFORCEMENT VALIDATOR
 * 
 * Ensures blog posts don't have hero images embedded in content.
 * Hero images must live ONLY in post.image field.
 */

const fs = require('fs');
const path = require('path');

const BLOG_CONTENT_DIR = 'src/content/blog';

function validateBlogPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the post object
    const postMatch = content.match(/const post: BlogPost = ({[\s\S]*?});/);
    if (!postMatch) {
      console.warn(`⚠️  Could not parse post object in ${filePath}`);
      return true;
    }
    
    // Check if content starts with an <img> tag
    const contentMatch = content.match(/content:\s*`([\s\S]*?)`/);
    if (!contentMatch) {
      console.warn(`⚠️  Could not extract content from ${filePath}`);
      return true;
    }
    
    const postContent = contentMatch[1].trim();
    
    // RULE: Content must not start with <img>
    if (postContent.startsWith('<img')) {
      console.error(`❌ HERO VIOLATION: ${path.basename(filePath)}`);
      console.error(`   Content starts with <img> tag - hero images must be in post.image only`);
      return false;
    }
    
    // RULE: Check for specific hero images in content that should be in post.image
    const heroImagePatterns = [
      '/images/blog/240616-Model_Car_Collection-3.webp', // Ford Part 1 hero
      '/images/blog/240804-Model_Car_Collection-46 (1).jpg', // Ford Part 4 hero
    ];
    
    for (const heroImage of heroImagePatterns) {
      if (postContent.includes(heroImage)) {
        console.error(`❌ HERO VIOLATION: ${path.basename(filePath)}`);
        console.error(`   Hero image ${heroImage} found in content - should be post.image only`);
        return false;
      }
    }
    
    console.log(`✅ ${path.basename(filePath)} - Hero enforcement OK`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error validating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Validating hero image enforcement...\n');
  
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    console.error(`❌ Blog content directory not found: ${BLOG_CONTENT_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(BLOG_CONTENT_DIR)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(BLOG_CONTENT_DIR, file));
  
  let allValid = true;
  
  for (const file of files) {
    const isValid = validateBlogPost(file);
    if (!isValid) {
      allValid = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('✅ All blog posts pass hero enforcement validation');
    process.exit(0);
  } else {
    console.log('❌ Hero enforcement violations found');
    console.log('\n💡 Fix: Remove hero <img> tags from content, ensure they exist only in post.image');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateBlogPost };