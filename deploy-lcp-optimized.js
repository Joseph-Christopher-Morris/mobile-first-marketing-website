#!/usr/bin/env node

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

console.log('\n✅ Deployment complete!');
console.log('\n📊 Test LCP:');
console.log('   https://pagespeed.web.dev/analysis?url=https://vividmediacheshire.com');
