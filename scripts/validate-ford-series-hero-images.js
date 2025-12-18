#!/usr/bin/env node

/**
 * Ford Series Hero Image Validation
 * Validates that Ford blog posts display correct hero images as per MASTER KIRO PATCH
 */

const https = require('https');
const { JSDOM } = require('jsdom');

// Configuration
const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';
const FORD_SERIES_POSTS = [
  {
    slug: 'ebay-model-ford-collection-part-1',
    title: 'Model Ford Collection Part 1',
    expectedHero: '/images/blog/240616-Model_Car_Collection-3.webp',
    description: 'Red Ford Escort (NOT Kuga)'
  },
  {
    slug: 'ebay-repeat-buyers-part-4',
    title: 'Repeat Buyers Part 4', 
    expectedHero: '/images/blog/240804-Model_Car_Collection-46 (1).jpg',
    description: 'Multiple Ford models (NOT single-car)'
  }
];

console.log('🔍 Ford Series Hero Image Validation');
console.log('📋 Validating MASTER KIRO PATCH compliance');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📝 Posts to validate: ${FORD_SERIES_POSTS.length}`);

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function validateHeroImage(post) {
  try {
    const url = `${BASE_URL}/blog/${post.slug}`;
    console.log(`\n🔍 Validating: ${post.title}`);
    console.log(`📄 URL: ${url}`);
    console.log(`🎯 Expected hero: ${post.expectedHero}`);
    
    const html = await fetchPage(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find the hero image (should be the first Image component after header)
    const heroImages = document.querySelectorAll('img[src*="/images/blog/"]');
    
    if (heroImages.length === 0) {
      console.log('❌ No blog images found');
      return false;
    }
    
    const firstImage = heroImages[0];
    const actualHero = firstImage.src || firstImage.getAttribute('src');
    
    console.log(`📸 Actual hero found: ${actualHero}`);
    
    // Check if the hero matches expected
    const heroMatches = actualHero.includes(post.expectedHero.split('/').pop());
    
    if (heroMatches) {
      console.log(`✅ Hero image CORRECT: ${post.description}`);
      
      // Additional validation: check that analytics images are present but not as hero
      const analyticsImages = Array.from(heroImages).filter(img => 
        (img.src || img.getAttribute('src')).includes('Screenshot 2025-07-04 193922')
      );
      
      if (analyticsImages.length > 0) {
        console.log(`📊 Analytics images found: ${analyticsImages.length} (correctly in content, not hero)`);
      }
      
      return true;
    } else {
      console.log(`❌ Hero image INCORRECT`);
      console.log(`   Expected: ${post.expectedHero}`);
      console.log(`   Actual: ${actualHero}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error validating ${post.title}: ${error.message}`);
    return false;
  }
}

async function validateAllPosts() {
  console.log('\n🚀 Starting validation...');
  
  const results = [];
  
  for (const post of FORD_SERIES_POSTS) {
    const isValid = await validateHeroImage(post);
    results.push({ post: post.title, valid: isValid });
    
    // Wait between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('═'.repeat(50));
  
  let allValid = true;
  results.forEach(result => {
    const status = result.valid ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.post}`);
    if (!result.valid) allValid = false;
  });
  
  console.log('═'.repeat(50));
  
  if (allValid) {
    console.log('🎉 ALL FORD SERIES POSTS VALIDATED SUCCESSFULLY!');
    console.log('✅ MASTER KIRO PATCH compliance confirmed');
    console.log('✅ Hero images are correctly enforced from post.image');
    console.log('✅ No content images are overriding heroes');
  } else {
    console.log('⚠️  VALIDATION FAILED - Issues found');
    console.log('❌ MASTER KIRO PATCH compliance NOT confirmed');
    console.log('💡 Check TSX files and redeploy if needed');
  }
  
  return allValid;
}

// Run validation
validateAllPosts()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Validation failed:', error.message);
    process.exit(1);
  });