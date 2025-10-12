#!/usr/bin/env node

/**
 * Watch Deployment Script
 * Monitors the live site for changes after a push
 */

const https = require('https');

class DeploymentWatcher {
  constructor() {
    this.siteUrl = 'https://d15sc9fc739ev2.cloudfront.net';
    this.checkInterval = 10000; // 10 seconds
    this.maxChecks = 30; // 5 minutes total
    this.checks = 0;
  }

  async watchForChanges() {
    console.log('🔍 Watching for deployment changes...');
    console.log(`Site: ${this.siteUrl}`);
    console.log(`Checking every ${this.checkInterval/1000} seconds\n`);

    const initialContent = await this.fetchContent();
    console.log('📸 Initial content captured');
    
    if (initialContent.includes('Live deployment test')) {
      console.log('✅ Changes already live!');
      this.showDeploymentInfo(initialContent);
      return;
    }

    console.log('⏳ Waiting for changes to appear...\n');

    const interval = setInterval(async () => {
      this.checks++;
      
      try {
        const currentContent = await this.fetchContent();
        
        if (currentContent.includes('Live deployment test')) {
          console.log(`\n🎉 DEPLOYMENT DETECTED! (Check ${this.checks})`);
          this.showDeploymentInfo(currentContent);
          clearInterval(interval);
          return;
        }
        
        process.stdout.write(`⏳ Check ${this.checks}/${this.maxChecks} - No changes yet...\r`);
        
        if (this.checks >= this.maxChecks) {
          console.log('\n⏰ Timeout reached. Deployment may take longer than expected.');
          console.log('💡 Try checking manually: ' + this.siteUrl);
          clearInterval(interval);
        }
        
      } catch (error) {
        console.log(`\n❌ Check ${this.checks} failed:`, error.message);
      }
    }, this.checkInterval);
  }

  async fetchContent() {
    return new Promise((resolve, reject) => {
      const req = https.get(this.siteUrl, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      
      req.on('error', reject);
      req.setTimeout(8000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  showDeploymentInfo(content) {
    console.log('\n📊 DEPLOYMENT SUCCESS!');
    console.log('=' .repeat(40));
    
    // Extract timestamp from content
    const timestampMatch = content.match(/Updated: ([^<]+)/);
    if (timestampMatch) {
      console.log(`🕒 Deployment timestamp: ${timestampMatch[1]}`);
    }
    
    console.log(`🌐 Live site: ${this.siteUrl}`);
    console.log(`⏱️  Detection time: ${this.checks * (this.checkInterval/1000)} seconds`);
    
    // Check cache status
    this.checkCacheStatus();
  }

  async checkCacheStatus() {
    try {
      const response = await this.makeRequest(this.siteUrl);
      const cacheStatus = response.headers['x-cache'] || 'Unknown';
      console.log(`🗄️  Cache status: ${cacheStatus}`);
      
      if (cacheStatus.includes('Miss')) {
        console.log('✅ Fresh content served (cache miss is expected for new deployments)');
      }
    } catch (error) {
      console.log('⚠️  Could not check cache status');
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ 
          statusCode: res.statusCode, 
          headers: res.headers, 
          body 
        }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }
}

// Run the watcher
if (require.main === module) {
  const watcher = new DeploymentWatcher();
  watcher.watchForChanges().catch(console.error);
}

module.exports = DeploymentWatcher;