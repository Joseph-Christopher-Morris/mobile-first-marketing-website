#!/usr/bin/env node

/**
 * Simple Deployment Dashboard
 * Quick overview of your GitHub to CloudFront deployment status
 */

const https = require('https');
const { execSync } = require('child_process');

async function checkDeploymentStatus() {
  console.log('🚀 DEPLOYMENT DASHBOARD');
  console.log('=' .repeat(40));
  
  // 1. Git Status
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --format="%h %s"', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    console.log(`📋 Git Status:`);
    console.log(`   Branch: ${branch}`);
    console.log(`   Last commit: ${lastCommit}`);
    console.log(`   Working directory: ${status.trim() ? '⚠️  Has changes' : '✅ Clean'}`);
  } catch (error) {
    console.log('❌ Git check failed');
  }
  
  // 2. Site Status
  try {
    const startTime = Date.now();
    const response = await makeRequest('https://d15sc9fc739ev2.cloudfront.net');
    const loadTime = Date.now() - startTime;
    
    console.log(`\n🌐 Site Status:`);
    console.log(`   Status: ${response.statusCode === 200 ? '✅ Online' : '❌ Issue'}`);
    console.log(`   Load time: ${loadTime}ms`);
    console.log(`   Cache status: ${response.headers['x-cache'] || 'Unknown'}`);
  } catch (error) {
    console.log('\n❌ Site check failed:', error.message);
  }
  
  // 3. Quick Actions
  console.log(`\n🔧 Quick Actions:`);
  console.log(`   Deploy now: git push`);
  console.log(`   Force cache clear: node scripts/quick-cache-invalidation.js`);
  console.log(`   Full health check: node scripts/deployment-health-check.js`);
  
  console.log('\n✅ Dashboard complete!');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

checkDeploymentStatus().catch(console.error);