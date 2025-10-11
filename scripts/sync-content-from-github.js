#!/usr/bin/env node

/**
 * Sync Content from GitHub
 * Fetches the latest about.md file from GitHub and updates the local content
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// GitHub repository details
const GITHUB_REPO = 'mobile-first-marketing-website';
const GITHUB_USER = process.argv[2] || process.env.GITHUB_USER || 'your-username'; // Pass as argument
const GITHUB_BRANCH = 'main';

// File paths
const GITHUB_ABOUT_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/about.md`;
const LOCAL_ABOUT_PATH = path.join(__dirname, '../content/pages/about.md');

console.log('🔄 Syncing content from GitHub...');
console.log(`📂 Repository: ${GITHUB_USER}/${GITHUB_REPO}`);
console.log(`🌿 Branch: ${GITHUB_BRANCH}`);

/**
 * Fetch content from GitHub
 */
function fetchFromGitHub(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`GitHub API returned status ${response.statusCode}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Update local file
 */
function updateLocalFile(filePath, content) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main sync function
 */
async function syncContent() {
  try {
    console.log(`📥 Fetching about.md from GitHub...`);
    const aboutContent = await fetchFromGitHub(GITHUB_ABOUT_URL);
    
    console.log(`📝 Content length: ${aboutContent.length} characters`);
    
    // Update local file
    const success = updateLocalFile(LOCAL_ABOUT_PATH, aboutContent);
    
    if (success) {
      console.log('🎉 Content sync completed successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Review the updated content');
      console.log('   2. Run deployment: node scripts/deploy.js');
    } else {
      console.error('❌ Content sync failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error syncing content:', error.message);
    console.log('💡 Troubleshooting:');
    console.log('   - Check if the GitHub repository exists');
    console.log('   - Verify the file path: content/about.md');
    console.log('   - Ensure the repository is public or you have access');
    process.exit(1);
  }
}

// Run the sync
syncContent();