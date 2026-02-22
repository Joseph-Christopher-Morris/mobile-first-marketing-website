#!/usr/bin/env node

/**
 * IndexNow API Key Generator
 * 
 * Generates a cryptographically secure API key for IndexNow authentication
 * and stores it in the public directory for CloudFront serving.
 * 
 * Usage:
 *   node scripts/generate-indexnow-key.js
 * 
 * Requirements:
 *   - Generates hexadecimal key (32 characters from 16 bytes)
 *   - Stores key in /public/{api-key}.txt
 *   - Key file contains only the key value (no whitespace)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate a cryptographically secure API key for IndexNow authentication.
 * 
 * Uses Node.js crypto.randomBytes() to generate 16 bytes (128 bits) of
 * cryptographically secure random data, then converts to hexadecimal format.
 * The resulting key is 32 characters long and meets IndexNow's requirements
 * for API key format (8-128 hexadecimal characters).
 * 
 * @returns {string} Hexadecimal API key (32 characters, lowercase)
 * 
 * @example
 * const apiKey = generateApiKey();
 * console.log(apiKey); // 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
 * console.log(apiKey.length); // 32
 * console.log(/^[0-9a-f]+$/.test(apiKey)); // true
 */
function generateApiKey() {
  // Generate 16 bytes (128 bits) of random data
  const buffer = crypto.randomBytes(16);
  
  // Convert to hexadecimal string (32 characters)
  return buffer.toString('hex');
}

/**
 * Write API key to public directory as a text file.
 * 
 * Creates a file at /public/{api-key}.txt containing only the API key value.
 * The file is written with UTF-8 encoding and no trailing newline, as required
 * by the IndexNow protocol. The public directory is created if it doesn't exist.
 * 
 * This file must be deployed to CloudFront and accessible via HTTPS for
 * IndexNow to verify the API key ownership.
 * 
 * @param {string} apiKey - The generated API key (hexadecimal string)
 * @returns {string} Absolute path to the created key file
 * 
 * @throws {Error} If the file cannot be written (permission denied, disk full, etc.)
 * @throws {TypeError} If apiKey is not a string
 * 
 * @example
 * const apiKey = generateApiKey();
 * const filePath = writeApiKeyFile(apiKey);
 * console.log(filePath); // '/path/to/project/public/a1b2c3d4e5f6g7h8.txt'
 * 
 * // File content will be exactly: a1b2c3d4e5f6g7h8
 * // (no whitespace, no newlines)
 */
function writeApiKeyFile(apiKey) {
  // Construct file path: /public/{api-key}.txt
  const publicDir = path.join(process.cwd(), 'public');
  const filePath = path.join(publicDir, `${apiKey}.txt`);
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write key to file (UTF-8 encoding, no newline)
  fs.writeFileSync(filePath, apiKey, 'utf8');
  
  return filePath;
}

/**
 * Main execution function for command-line usage.
 * 
 * Generates a new IndexNow API key, writes it to the public directory,
 * and displays setup instructions to the user. Exits with code 0 on
 * success or code 1 on failure.
 * 
 * @returns {void}
 * 
 * @example
 * // Run from command line:
 * // node scripts/generate-indexnow-key.js
 * //
 * // Output:
 * // ✓ API key generated successfully!
 * // API Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
 * // File Location: /path/to/project/public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
 */
function main() {
  try {
    console.log('Generating IndexNow API key...\n');
    
    // Generate the API key
    const apiKey = generateApiKey();
    
    // Write to file
    const filePath = writeApiKeyFile(apiKey);
    
    // Output confirmation
    console.log('✓ API key generated successfully!');
    console.log(`\nAPI Key: ${apiKey}`);
    console.log(`File Location: ${filePath}`);
    console.log(`\nNext steps:`);
    console.log(`1. Add this key to GitHub Secrets as INDEXNOW_API_KEY`);
    console.log(`2. Commit and deploy the key file to make it accessible via HTTPS`);
    console.log(`3. Verify accessibility: https://d15sc9fc739ev2.cloudfront.net/${apiKey}.txt`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error generating API key:', error.message);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateApiKey,
  writeApiKeyFile
};

// Run main function if executed directly
if (require.main === module) {
  main();
}
