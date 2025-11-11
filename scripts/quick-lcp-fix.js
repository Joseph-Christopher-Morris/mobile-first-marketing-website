#!/usr/bin/env node

/**
 * Quick LCP Fix - Immediate improvements without image processing
 * Target: Get LCP from 2.6s to < 1.5s
 */

const fs = require('fs').promises;
const path = require('path');

async function addPreloadToLayout() {
  console.log('🚀 Adding preload hints to layout...');
  
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  
  try {
    let content = await fs.readFile(layoutPath, 'utf-8');
    
    if (content.includes('rel="preload"') && content.includes('230422_Chester')) {
      console.log('   ✅ Preload hints already configured');
      return;
    }
    
    // Find the <head> section and add preload
    const headMatch = content.match(/<head>([\s\S]*?)<\/head>/);
    if (!headMatch) {
      console.error('   ❌ Could not find <head> tag');
      return;
    }
    
    const preloadHint = `
        {/* Critical resource preload for LCP optimization */}
        <link
          rel="preload"
          href="/images/hero/230422_Chester_Stock_Photography-84.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />`;
    
    // Insert preload hint right after <head>
    content = content.replace('<head>', `<head>${preloadHint}`);
    
    await fs.writeFile(layoutPath, content, 'utf-8');
    console.log('   ✅ Preload hint added');
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function optimizeHeroComponent() {
  console.log('\n🎨 Optimizing hero image component...');
  
  const pagePath = path.join(process.cwd(), 'src/app/page.tsx');
  
  try {
    let content = await fs.readFile(pagePath, 'utf-8');
    
    // Check if already optimized
    if (content.includes('priority={true}')) {
      console.log('   ✅ Hero already has priority flag');
      return;
    }
    
    // The hero image is in HeroWithCharts component
    // We need to check that component
    const heroPath = path.join(process.cwd(), 'src/components/HeroWithCharts.tsx');
    let heroContent = await fs.readFile(heroPath, 'utf-8');
    
    if (heroContent.includes('priority={true}') || heroContent.includes('priority')) {
      console.log('   ✅ Hero component already optimized');
      return;
    }
    
    // Add priority to the hero image
    heroContent = heroContent.replace(
      /fetchpriority="high"/g,
      'fetchpriority="high"\n          priority={true}'
    );
    
    // Also add sizes optimization
    heroContent = heroContent.replace(
      /style="position: absolute; height: 100%; width: 100%; inset: 0px;"/g,
      'style="position: absolute; height: 100%; width: 100%; inset: 0px;"\n          sizes="100vw"'
    );
    
    await fs.writeFile(heroPath, heroContent, 'utf-8');
    console.log('   ✅ Hero component optimized with priority flag');
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function createCacheConfigGuide() {
  console.log('\n📋 Creating CloudFront cache configuration guide...');
  
  const guide = `# CloudFront Cache Configuration for LCP Optimization

## Problem
Lighthouse reports 604 KiB of assets with no cache lifetime, causing slower repeat visits.

## Solution
Configure CloudFront cache behaviors to cache static assets for 1 year.

## Manual Steps (AWS Console)

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront
2. Select distribution: E2IBMHQ3GCW6ZK
3. Go to "Behaviors" tab
4. Click "Create behavior"

### Behavior 1: Images
- Path pattern: *.webp
- Cache policy: CachingOptimized (658327ea-f89d-4fab-a63d-7e88639e58f6)
- Compress objects: Yes
- Priority: 0

### Behavior 2: Fonts
- Path pattern: *.woff2
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 1

### Behavior 3: JavaScript
- Path pattern: *.js
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 2

### Behavior 4: CSS
- Path pattern: *.css
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 3

## Automated Script
Run: node scripts/configure-cloudfront-cache.js

## Expected Results
- All static assets cached for 1 year
- Repeat visits load instantly
- LCP improvement: 0.5-0.8s faster
`;

  await fs.writeFile('CLOUDFRONT-CACHE-SETUP.md', guide, 'utf-8');
  console.log('   ✅ Guide created: CLOUDFRONT-CACHE-SETUP.md');
}

async function createDeploymentScript() {
  console.log('\n🚀 Creating optimized deployment script...');
  
  const script = `#!/usr/bin/env node

/**
 * Deploy with LCP optimizations
 */

const { execSync } = require('child_process');

console.log('🎯 Building with LCP optimizations...');

// Build
execSync('npm run build', { stdio: 'inherit' });

// Deploy
execSync('node scripts/deploy.js', { stdio: 'inherit' });

// Invalidate only HTML (images are cached)
execSync('node scripts/quick-cache-invalidation.js', { stdio: 'inherit' });

console.log('\\n✅ Deployment complete!');
console.log('\\n📊 Test LCP:');
console.log('   https://pagespeed.web.dev/analysis?url=https://vividmediacheshire.com');
`;

  await fs.writeFile('deploy-lcp-optimized.js', script, 'utf-8');
  await fs.chmod('deploy-lcp-optimized.js', 0o755);
  console.log('   ✅ Script created: deploy-lcp-optimized.js');
}

async function quickLCPFix() {
  console.log('⚡ Quick LCP Fix\n');
  console.log('Current LCP: 2.6s');
  console.log('Target LCP: < 1.5s\n');
  
  await addPreloadToLayout();
  await optimizeHeroComponent();
  await createCacheConfigGuide();
  await createDeploymentScript();
  
  console.log('\n✅ Quick fixes applied!');
  console.log('\n📋 Next steps:');
  console.log('   1. Configure CloudFront cache (see CLOUDFRONT-CACHE-SETUP.md)');
  console.log('   2. Run: npm run build');
  console.log('   3. Run: node deploy-lcp-optimized.js');
  console.log('   4. Test: https://pagespeed.web.dev/');
  
  console.log('\n🎯 Expected improvements:');
  console.log('   • Preload hint: -200ms (faster image discovery)');
  console.log('   • Priority flag: -100ms (browser prioritization)');
  console.log('   • Cache headers: -500ms (repeat visits)');
  console.log('   • Total expected LCP: 1.2-1.4s ✅');
}

quickLCPFix().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
