#!/usr/bin/env node

/**
 * IndexNow API Key Validation Script
 * 
 * Verifies that the IndexNow API key file is properly deployed and accessible
 * via CloudFront with correct Content-Type headers.
 * 
 * Usage:
 *   node scripts/validate-indexnow-key.js
 * 
 * Environment Variables:
 *   INDEXNOW_API_KEY - IndexNow API key (optional, will auto-detect from public directory)
 *   CLOUDFRONT_DOMAIN - CloudFront domain (default: d15sc9fc739ev2.cloudfront.net)
 * 
 * Validation Checks:
 *   1. API key file exists in public directory
 *   2. API key format is valid (hexadecimal, 8-128 characters)
 *   3. File is accessible via HTTPS through CloudFront
 *   4. Content-Type header is 'text/plain; charset=utf-8'
 *   5. File content matches expected key format
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net';
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;

/**
 * Validate API key format according to IndexNow requirements.
 * 
 * Checks that the API key:
 * - Is a string type (not null, undefined, number, etc.)
 * - Has length between 8 and 128 characters (inclusive)
 * - Contains only hexadecimal characters (0-9, a-f, A-F)
 * 
 * @param {string} key - API key to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * // Valid keys
 * validateApiKeyFormat('a1b2c3d4e5f6g7h8')  // Returns: true
 * validateApiKeyFormat('ABCDEF1234567890')  // Returns: true (case-insensitive)
 * validateApiKeyFormat('a'.repeat(128))     // Returns: true (max length)
 * 
 * @example
 * // Invalid keys
 * validateApiKeyFormat('invalid!')          // Returns: false (non-hex)
 * validateApiKeyFormat('abc')               // Returns: false (too short)
 * validateApiKeyFormat('a'.repeat(129))     // Returns: false (too long)
 * validateApiKeyFormat(null)                // Returns: false (not a string)
 */
function validateApiKeyFormat(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // Check length (8-128 characters)
  if (key.length < 8 || key.length > 128) {
    return false;
  }
  
  // Check hexadecimal format
  return /^[0-9a-f]+$/i.test(key);
}

/**
 * Find IndexNow key file in the public directory.
 * 
 * Searches the public directory for .txt files that match the IndexNow API key
 * format (hexadecimal, 8-128 characters). For each candidate file, verifies that:
 * 1. The filename (without .txt) is a valid API key format
 * 2. The file content matches the filename
 * 
 * This allows auto-detection of the API key without requiring environment variables.
 * 
 * @returns {Promise<{key: string, filePath: string}|null>} Key and file path if found, null otherwise
 * 
 * @throws {Error} If the public directory cannot be read
 * 
 * @example
 * // With key file present: public/a1b2c3d4e5f6g7h8.txt
 * const result = await findKeyFile();
 * console.log(result);
 * // {
 * //   key: 'a1b2c3d4e5f6g7h8',
 * //   filePath: '/path/to/project/public/a1b2c3d4e5f6g7h8.txt'
 * // }
 * 
 * @example
 * // No key file found
 * const result = await findKeyFile();
 * console.log(result); // null
 */
async function findKeyFile() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = await fs.readdir(publicDir);
    
    // Look for .txt files that match the key format
    for (const file of files) {
      if (file.endsWith('.txt') && file !== 'robots.txt') {
        const keyName = file.replace('.txt', '');
        
        // Validate the filename as a potential API key
        if (validateApiKeyFormat(keyName)) {
          const filePath = path.join(publicDir, file);
          
          // Read and verify the content matches the filename
          const content = await fs.readFile(filePath, 'utf-8');
          const trimmedContent = content.trim();
          
          if (trimmedContent === keyName) {
            return { key: keyName, filePath };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    throw new Error(`Failed to search for key file: ${error.message}`);
  }
}

/**
 * Make HTTPS request to verify key file accessibility.
 * 
 * Performs an HTTPS GET request to the specified URL and returns the response
 * details including status code, headers, and body. Includes a 10-second timeout
 * to prevent hanging on slow or unresponsive servers.
 * 
 * This is used to verify that the IndexNow API key file is accessible via
 * CloudFront with the correct Content-Type headers.
 * 
 * @param {string} url - URL to request (must be HTTPS)
 * @returns {Promise<{statusCode: number, headers: object, body: string}>} Response details
 * 
 * @throws {Error} If the request fails (network error, timeout, etc.)
 * 
 * @example
 * // Successful request
 * const response = await makeHttpsRequest('https://example.com/key.txt');
 * console.log(response);
 * // {
 * //   statusCode: 200,
 * //   headers: { 'content-type': 'text/plain; charset=utf-8', ... },
 * //   body: 'a1b2c3d4e5f6g7h8'
 * // }
 * 
 * @example
 * // 404 Not Found
 * const response = await makeHttpsRequest('https://example.com/missing.txt');
 * console.log(response.statusCode); // 404
 * 
 * @example
 * // Network error
 * try {
 *   await makeHttpsRequest('https://invalid-domain.example/key.txt');
 * } catch (error) {
 *   console.error(error.message);
 *   // 'HTTPS request failed: getaddrinfo ENOTFOUND invalid-domain.example'
 * }
 */
function makeHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let body = '';
      
      response.on('data', (chunk) => {
        body += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body
        });
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`HTTPS request failed: ${error.message}`));
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout after 10 seconds'));
    });
  });
}

/**
 * Validate Content-Type header for IndexNow key file.
 * 
 * Checks that the Content-Type header is set to 'text/plain' with optional
 * charset specification. The IndexNow protocol requires the key file to be
 * served as plain text.
 * 
 * Accepts the following formats (case-insensitive):
 * - 'text/plain'
 * - 'text/plain; charset=utf-8'
 * - 'text/plain;charset=utf-8' (no space)
 * 
 * @param {string} contentType - Content-Type header value
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * // Valid Content-Type headers
 * validateContentType('text/plain; charset=utf-8')  // Returns: true
 * validateContentType('text/plain')                 // Returns: true
 * validateContentType('TEXT/PLAIN')                 // Returns: true (case-insensitive)
 * 
 * @example
 * // Invalid Content-Type headers
 * validateContentType('text/html')                  // Returns: false
 * validateContentType('application/json')           // Returns: false
 * validateContentType(null)                         // Returns: false
 * validateContentType('')                           // Returns: false
 */
function validateContentType(contentType) {
  if (!contentType) {
    return false;
  }
  
  // Normalize the content type (case-insensitive, handle variations)
  // Remove all extra whitespace around semicolons
  const normalized = contentType.toLowerCase().trim().replace(/\s*;\s*/g, ';');
  
  // Accept both with and without charset specification
  return normalized === 'text/plain;charset=utf-8' ||
         normalized === 'text/plain';
}

/**
 * Display validation results in a formatted, comprehensive report.
 * 
 * Prints a detailed validation report with 5 checks:
 * 1. Key file existence in public directory
 * 2. API key format validation
 * 3. HTTPS accessibility via CloudFront
 * 4. Content-Type header verification
 * 5. File content verification
 * 
 * Each check shows PASS (✓) or FAIL (✗) with relevant details.
 * The report concludes with an overall result indicating whether
 * the IndexNow configuration is ready for use.
 * 
 * @param {Object} results - Validation results object
 * @param {boolean} results.fileExists - Whether key file was found
 * @param {boolean} results.formatValid - Whether key format is valid
 * @param {boolean} results.httpsAccessible - Whether file is accessible via HTTPS
 * @param {boolean} results.contentTypeValid - Whether Content-Type header is correct
 * @param {boolean} results.contentValid - Whether file content matches key
 * @param {boolean} results.allPassed - Whether all checks passed
 * @param {string} results.apiKey - The API key being validated
 * @param {string} results.filePath - Path to the key file
 * @param {string} results.keyUrl - CloudFront URL to the key file
 * @param {number} results.statusCode - HTTP status code
 * @param {string} results.contentType - Content-Type header value
 * @param {string} results.httpsError - HTTPS error message if failed
 * @returns {void}
 * 
 * @example
 * // Display successful validation
 * displayResults({
 *   fileExists: true,
 *   formatValid: true,
 *   httpsAccessible: true,
 *   contentTypeValid: true,
 *   contentValid: true,
 *   allPassed: true,
 *   apiKey: 'a1b2c3d4e5f6g7h8',
 *   filePath: '/path/to/public/a1b2c3d4e5f6g7h8.txt',
 *   keyUrl: 'https://example.com/a1b2c3d4e5f6g7h8.txt',
 *   statusCode: 200,
 *   contentType: 'text/plain; charset=utf-8'
 * });
 */
function displayResults(results) {
  console.log('\n=== IndexNow API Key Validation Results ===\n');
  
  // Check 1: Key file exists
  console.log('1. Key File Existence');
  if (results.fileExists) {
    console.log(`   ✓ PASS: Key file found at ${results.filePath}`);
    console.log(`   ✓ API Key: ${results.apiKey}`);
  } else {
    console.log('   ✗ FAIL: No valid key file found in public directory');
  }
  console.log('');
  
  // Check 2: Key format validation
  console.log('2. API Key Format');
  if (results.formatValid) {
    console.log(`   ✓ PASS: Key format is valid (${results.apiKey.length} characters, hexadecimal)`);
  } else {
    console.log('   ✗ FAIL: Key format is invalid');
  }
  console.log('');
  
  // Check 3: HTTPS accessibility
  console.log('3. HTTPS Accessibility');
  if (results.httpsAccessible) {
    console.log(`   ✓ PASS: Key file accessible via HTTPS`);
    console.log(`   ✓ URL: ${results.keyUrl}`);
    console.log(`   ✓ Status Code: ${results.statusCode}`);
  } else {
    console.log('   ✗ FAIL: Key file not accessible via HTTPS');
    console.log(`   ✗ URL: ${results.keyUrl}`);
    console.log(`   ✗ Error: ${results.httpsError || 'Unknown error'}`);
  }
  console.log('');
  
  // Check 4: Content-Type header
  console.log('4. Content-Type Header');
  if (results.contentTypeValid) {
    console.log(`   ✓ PASS: Content-Type is correct`);
    console.log(`   ✓ Header: ${results.contentType}`);
  } else {
    console.log('   ✗ FAIL: Content-Type is incorrect');
    console.log(`   ✗ Expected: text/plain; charset=utf-8`);
    console.log(`   ✗ Actual: ${results.contentType || 'Not set'}`);
  }
  console.log('');
  
  // Check 5: Content verification
  console.log('5. File Content Verification');
  if (results.contentValid) {
    console.log('   ✓ PASS: File content matches expected key format');
  } else {
    console.log('   ✗ FAIL: File content does not match expected format');
    if (results.contentMismatch) {
      console.log(`   ✗ Expected: ${results.apiKey}`);
      console.log(`   ✗ Actual: ${results.actualContent}`);
    }
  }
  console.log('');
  
  // Overall result
  console.log('=== Overall Result ===\n');
  if (results.allPassed) {
    console.log('✓ SUCCESS: All validation checks passed!');
    console.log('✓ IndexNow API key is properly configured and accessible.\n');
  } else {
    console.log('✗ FAILURE: Some validation checks failed.');
    console.log('✗ Please review the errors above and fix the issues.\n');
  }
}

/**
 * Main validation function for IndexNow API key configuration.
 * 
 * Performs comprehensive validation of the IndexNow API key setup:
 * 1. Locates the API key (from environment variable or auto-detection)
 * 2. Validates the key format
 * 3. Verifies HTTPS accessibility via CloudFront
 * 4. Checks Content-Type headers
 * 5. Verifies file content matches the key
 * 
 * The function provides detailed feedback for each validation step and
 * exits with code 0 if all checks pass, or code 1 if any check fails.
 * 
 * This validation should be run after deployment to ensure the IndexNow
 * integration is properly configured and ready to use.
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // Run from command line:
 * // node scripts/validate-indexnow-key.js
 * //
 * // Output:
 * // IndexNow API Key Validation
 * // ============================
 * // CloudFront Domain: d15sc9fc739ev2.cloudfront.net
 * //
 * // Running validation checks...
 * //
 * // === IndexNow API Key Validation Results ===
 * //
 * // 1. Key File Existence
 * //    ✓ PASS: Key file found at /path/to/public/a1b2c3d4e5f6g7h8.txt
 * //    ✓ API Key: a1b2c3d4e5f6g7h8
 * // ...
 */
async function main() {
  const results = {
    fileExists: false,
    formatValid: false,
    httpsAccessible: false,
    contentTypeValid: false,
    contentValid: false,
    allPassed: false,
    apiKey: null,
    filePath: null,
    keyUrl: null,
    statusCode: null,
    contentType: null,
    actualContent: null,
    httpsError: null,
    contentMismatch: false
  };
  
  try {
    console.log('IndexNow API Key Validation');
    console.log('============================\n');
    console.log(`CloudFront Domain: ${CLOUDFRONT_DOMAIN}\n`);
    console.log('Running validation checks...\n');
    
    // Step 1: Find or use provided API key
    let apiKey = INDEXNOW_API_KEY;
    let filePath = null;
    
    if (apiKey) {
      console.log('Using API key from environment variable');
      filePath = path.join(process.cwd(), 'public', `${apiKey}.txt`);
      
      // Verify file exists
      try {
        await fs.access(filePath);
        results.fileExists = true;
        results.filePath = filePath;
      } catch (error) {
        console.log('⚠ Warning: Key file not found at expected location');
        results.fileExists = false;
      }
    } else {
      console.log('Auto-detecting API key from public directory...');
      const keyFile = await findKeyFile();
      
      if (keyFile) {
        apiKey = keyFile.key;
        filePath = keyFile.filePath;
        results.fileExists = true;
        results.filePath = filePath;
        console.log(`✓ Found API key: ${apiKey}\n`);
      } else {
        console.log('✗ No valid API key file found\n');
        results.fileExists = false;
      }
    }
    
    if (!apiKey) {
      displayResults(results);
      process.exit(1);
    }
    
    results.apiKey = apiKey;
    
    // Step 2: Validate API key format
    results.formatValid = validateApiKeyFormat(apiKey);
    
    // Step 3: Construct CloudFront URL and test HTTPS accessibility
    const keyUrl = `https://${CLOUDFRONT_DOMAIN}/${apiKey}.txt`;
    results.keyUrl = keyUrl;
    
    try {
      const response = await makeHttpsRequest(keyUrl);
      results.statusCode = response.statusCode;
      results.contentType = response.headers['content-type'];
      results.actualContent = response.body.trim();
      
      // Check if request was successful
      if (response.statusCode === 200) {
        results.httpsAccessible = true;
        
        // Step 4: Validate Content-Type header
        results.contentTypeValid = validateContentType(response.headers['content-type']);
        
        // Step 5: Verify content matches key
        if (response.body.trim() === apiKey) {
          results.contentValid = true;
        } else {
          results.contentValid = false;
          results.contentMismatch = true;
        }
      } else {
        results.httpsAccessible = false;
        results.httpsError = `HTTP ${response.statusCode}`;
      }
    } catch (error) {
      results.httpsAccessible = false;
      results.httpsError = error.message;
    }
    
    // Determine overall result
    results.allPassed = results.fileExists && 
                        results.formatValid && 
                        results.httpsAccessible && 
                        results.contentTypeValid && 
                        results.contentValid;
    
    // Display results
    displayResults(results);
    
    // Exit with appropriate code
    process.exit(results.allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('\n✗ Validation Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  validateApiKeyFormat,
  findKeyFile,
  makeHttpsRequest,
  validateContentType
};

// Run main function if executed directly
if (require.main === module) {
  main();
}
