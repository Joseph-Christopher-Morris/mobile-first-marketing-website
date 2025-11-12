#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Brand term replacements
const replacements = [
  { from: /AWS S3 \+ CloudFront/gi, to: 'secure cloud hosting with global delivery' },
  { from: /AWS CloudFront/gi, to: 'secure cloud infrastructure' },
  { from: /AWS hosting/gi, to: 'secure cloud hosting' },
  { from: /AWS/g, to: 'secure cloud' },
  { from: /CloudFront/g, to: 'global content delivery network' },
  { from: /Cloudflare/g, to: 'protective caching and security layer' },
  { from: /Zoho Mail/g, to: 'professional business email service' },
];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, filePattern = /\.(tsx?|jsx?|md)$/) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        updatedCount += walkDirectory(filePath, filePattern);
      }
    } else if (filePattern.test(file)) {
      if (replaceInFile(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

console.log('🔄 Replacing brand-specific terms with generic alternatives...\n');

const srcDir = path.join(process.cwd(), 'src');
const updatedFiles = walkDirectory(srcDir);

console.log(`\n✅ Complete! Updated ${updatedFiles} files.`);
