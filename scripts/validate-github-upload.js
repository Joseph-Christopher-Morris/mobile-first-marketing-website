#!/usr/bin/env node

/**
 * GitHub Upload Validation Script
 * Run this after uploading to verify your GitHub repository is correct
 */

const https = require('https');

const REPO_OWNER = 'Joseph-Christopher-Morris';
const REPO_NAME = 'mobile-first-marketing-website';
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

console.log('🔍 GitHub Repository Upload Validation');
console.log('=====================================\n');

// Check if repository exists and get basic info
function checkRepository() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}`,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Upload-Validator',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Repository check failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

// Check repository contents
function checkContents(path = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Upload-Validator',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

// Get repository languages
function checkLanguages() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/languages`,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Upload-Validator',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Languages check failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
}

async function validateUpload() {
  try {
    console.log('📊 Checking repository information...');
    const repoInfo = await checkRepository();
    console.log(`✅ Repository found: ${repoInfo.full_name}`);
    console.log(
      `📅 Last updated: ${new Date(repoInfo.updated_at).toLocaleString()}`
    );
    console.log(`📁 Default branch: ${repoInfo.default_branch}\n`);

    console.log('🔍 Checking language statistics...');
    const languages = await checkLanguages();
    const totalBytes = Object.values(languages).reduce(
      (sum, bytes) => sum + bytes,
      0
    );

    console.log('📊 Language breakdown:');
    Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .forEach(([lang, bytes]) => {
        const percentage = ((bytes / totalBytes) * 100).toFixed(1);
        console.log(`   ${lang}: ${percentage}%`);
      });

    // Check if TypeScript is primary language
    const sortedLangs = Object.entries(languages).sort(([, a], [, b]) => b - a);
    const primaryLang = sortedLangs[0];

    if (primaryLang[0] === 'TypeScript') {
      console.log('✅ TypeScript is the primary language - Upload successful!');
    } else {
      console.log(
        `⚠️  Primary language is ${primaryLang[0]}, should be TypeScript`
      );
      console.log(
        '   This suggests the src/ folder may not have uploaded correctly'
      );
    }

    console.log('\n🔍 Checking critical folders...');

    // Check for src folder
    const srcContents = await checkContents('src');
    if (srcContents) {
      console.log('✅ src/ folder found');

      // Check src subfolders
      const srcFolders = srcContents.filter(item => item.type === 'dir');
      const expectedFolders = ['app', 'components', 'lib'];
      expectedFolders.forEach(folder => {
        if (srcFolders.find(item => item.name === folder)) {
          console.log(`   ✅ src/${folder}/ found`);
        } else {
          console.log(`   ❌ src/${folder}/ missing`);
        }
      });
    } else {
      console.log('❌ src/ folder not found - This is the main issue!');
    }

    // Check for public folder
    const publicContents = await checkContents('public');
    if (publicContents) {
      console.log('✅ public/ folder found');
      const imagesFolder = publicContents.find(item => item.name === 'images');
      if (imagesFolder) {
        console.log('   ✅ public/images/ found');
      } else {
        console.log('   ⚠️  public/images/ not found');
      }
    } else {
      console.log('❌ public/ folder not found');
    }

    // Check for essential config files
    console.log('\n🔍 Checking configuration files...');
    const rootContents = await checkContents('');
    const essentialFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'tailwind.config.js',
      '.eslintrc.json',
    ];

    essentialFiles.forEach(file => {
      if (rootContents.find(item => item.name === file)) {
        console.log(`✅ ${file} found`);
      } else {
        console.log(`❌ ${file} missing`);
      }
    });

    // Check for GitHub Actions
    const githubFolder = await checkContents('.github');
    if (githubFolder) {
      console.log('✅ .github/ folder found');
      const workflowsFolder = await checkContents('.github/workflows');
      if (workflowsFolder) {
        console.log('   ✅ GitHub Actions workflows found');
      }
    } else {
      console.log(
        '⚠️  .github/ folder not found (deployment automation missing)'
      );
    }

    console.log('\n📋 Summary:');
    if (primaryLang[0] === 'TypeScript' && srcContents && publicContents) {
      console.log('🎉 Upload appears successful!');
      console.log('   - TypeScript is primary language');
      console.log('   - Source code uploaded');
      console.log('   - Assets uploaded');
      console.log('\n🚀 Your GitHub Actions should now work properly!');
    } else {
      console.log('⚠️  Upload needs attention:');
      if (primaryLang[0] !== 'TypeScript') {
        console.log('   - Upload src/ folder with TypeScript components');
      }
      if (!srcContents) {
        console.log('   - src/ folder is missing');
      }
      if (!publicContents) {
        console.log('   - public/ folder is missing');
      }
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.log('\n💡 This might be because:');
    console.log('   - Repository is private and needs authentication');
    console.log('   - Network connection issue');
    console.log('   - Repository name is different');
  }
}

validateUpload();
