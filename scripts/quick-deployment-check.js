#!/usr/bin/env node

const https = require('https');

function checkDeployment() {
  console.log('🔍 Checking if deployment is live...');
  
  const req = https.get('https://d15sc9fc739ev2.cloudfront.net', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (body.includes('Live deployment test')) {
        console.log('✅ SUCCESS! Changes are live on the website');
        console.log('🌐 Visit: https://d15sc9fc739ev2.cloudfront.net');
        
        // Extract timestamp
        const match = body.match(/Updated: ([^<]+)/);
        if (match) {
          console.log(`🕒 Timestamp: ${match[1]}`);
        }
      } else {
        console.log('⏳ Changes not yet visible - deployment may still be in progress');
        console.log('💡 GitHub Actions typically takes 2-5 minutes');
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Error checking site:', err.message);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    console.log('⏰ Request timeout');
  });
}

checkDeployment();