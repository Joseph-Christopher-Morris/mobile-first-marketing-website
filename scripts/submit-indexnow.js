#!/usr/bin/env node

/**
 * IndexNow Manual Submission Script
 * 
 * Command-line tool for submitting URLs to IndexNow API.
 * Supports file input, dry-run mode, and automatic site URL collection.
 * 
 * Usage:
 *   node scripts/submit-indexnow.js --file urls.txt
 *   node scripts/submit-indexnow.js --all
 *   node scripts/submit-indexnow.js --file urls.txt --dry-run
 *   node scripts/submit-indexnow.js --help
 * 
 * Environment Variables:
 *   INDEXNOW_API_KEY - IndexNow API key (required)
 *   SITE_DOMAIN - Site domain (default: vividmediacheshire.com)
 */

const fs = require('fs').promises;
const path = require('path');
const { collectUrls } = require('./lib/url-collector');
const { submitUrls } = require('./lib/indexnow-service');
const { logSubmission } = require('./lib/indexnow-logger');

// Configuration
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'vividmediacheshire.com';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net';
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY;

/**
 * Display usage information and command-line help.
 * 
 * Prints comprehensive help text including:
 * - Script description and purpose
 * - Available command-line options
 * - Required environment variables
 * - Usage examples
 * - Exit codes
 * 
 * @returns {void}
 * 
 * @example
 * displayHelp();
 * // Prints help text to console
 */
function displayHelp() {
  console.log(`
IndexNow Manual Submission Script

Submit URLs to IndexNow API for instant search engine notification.

USAGE:
  node scripts/submit-indexnow.js [OPTIONS]

OPTIONS:
  --file <path>     Submit URLs from a newline-separated text file
  --all             Submit all indexable URLs from the site
  --dry-run         Validate URLs without submitting to the API
  --help            Display this help message

ENVIRONMENT VARIABLES:
  INDEXNOW_API_KEY     IndexNow API key (required)
  SITE_DOMAIN          Site domain (default: vividmediacheshire.com)
  CLOUDFRONT_DOMAIN    CloudFront domain for keyLocation URL (default: d15sc9fc739ev2.cloudfront.net)

EXAMPLES:
  # Submit URLs from file
  node scripts/submit-indexnow.js --file urls.txt

  # Submit all site URLs
  node scripts/submit-indexnow.js --all

  # Dry run to validate URLs
  node scripts/submit-indexnow.js --file urls.txt --dry-run

  # Display help
  node scripts/submit-indexnow.js --help

EXIT CODES:
  0 - Success
  1 - Failure (validation error, API error, or missing configuration)
`);
}

/**
 * Parse command-line arguments into a structured object.
 * 
 * Parses process.argv to extract command-line flags and their values.
 * Supports the following flags:
 * - --help, -h: Display help message
 * - --file <path>, -f <path>: Submit URLs from file
 * - --all, -a: Submit all site URLs
 * - --dry-run, -d: Validate without submitting
 * 
 * @returns {Object} Parsed arguments
 * @returns {string|null} return.file - File path if --file specified
 * @returns {boolean} return.all - True if --all specified
 * @returns {boolean} return.dryRun - True if --dry-run specified
 * @returns {boolean} return.help - True if --help specified
 * 
 * @throws {Error} If --file is specified without a file path
 * @throws {Error} If an unknown argument is provided
 * 
 * @example
 * // node script.js --file urls.txt --dry-run
 * const args = parseArguments();
 * console.log(args);
 * // { file: 'urls.txt', all: false, dryRun: true, help: false }
 * 
 * @example
 * // node script.js --all
 * const args = parseArguments();
 * console.log(args);
 * // { file: null, all: true, dryRun: false, help: false }
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const parsed = {
    file: null,
    all: false,
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--file' || arg === '-f') {
      if (i + 1 < args.length) {
        parsed.file = args[i + 1];
        i++; // Skip next argument
      } else {
        throw new Error('--file requires a file path argument');
      }
    } else if (arg === '--all' || arg === '-a') {
      parsed.all = true;
    } else if (arg === '--dry-run' || arg === '-d') {
      parsed.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

/**
 * Read URLs from a newline-separated text file.
 * 
 * Reads a text file containing one URL per line, filters out empty lines
 * and comment lines (starting with #), and returns an array of URLs.
 * 
 * The file format is simple:
 * - One URL per line
 * - Empty lines are ignored
 * - Lines starting with # are treated as comments and ignored
 * - Leading and trailing whitespace is trimmed
 * 
 * @param {string} filePath - Path to the file (relative or absolute)
 * @returns {Promise<string[]>} Array of URLs from the file
 * 
 * @throws {Error} If the file cannot be read (not found, permission denied, etc.)
 * 
 * @example
 * // File content:
 * // https://example.com/
 * // https://example.com/about/
 * // # This is a comment
 * // https://example.com/blog/
 * 
 * const urls = await readUrlsFromFile('urls.txt');
 * console.log(urls);
 * // [
 * //   'https://example.com/',
 * //   'https://example.com/about/',
 * //   'https://example.com/blog/'
 * // ]
 * 
 * @example
 * // Handle file not found
 * try {
 *   const urls = await readUrlsFromFile('missing.txt');
 * } catch (error) {
 *   console.error(error.message);
 *   // 'Failed to read file missing.txt: ENOENT: no such file or directory'
 * }
 */
async function readUrlsFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const urls = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Filter empty lines and comments
    
    return urls;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Display progress message during submission.
 * 
 * Writes a progress message to stdout using carriage return (\r) to overwrite
 * the previous message on the same line. This creates a dynamic progress indicator
 * without cluttering the console with multiple lines.
 * 
 * @param {string} message - Progress message to display
 * @returns {void}
 * 
 * @example
 * displayProgress('⏳ Sending request...');
 * // Displays: ⏳ Sending request...
 * 
 * @example
 * // Simulate progress updates
 * displayProgress('⏳ Connecting...');
 * await delay(1000);
 * displayProgress('⏳ Sending data...');
 * await delay(1000);
 * displayProgress('✓ Complete!');
 */
function displayProgress(message) {
  process.stdout.write(`\r${message}`);
}

/**
 * Display submission results in a formatted, user-friendly way.
 * 
 * Prints a formatted summary of the submission result including:
 * - Success or failure status with visual indicators (✓ or ✗)
 * - HTTP status code
 * - Number of URLs submitted
 * - Request duration
 * - Error message (if failed)
 * 
 * The output uses color-coded symbols and clear formatting to make
 * results easy to read and understand at a glance.
 * 
 * @param {Object} result - Submission result from submitUrls()
 * @param {boolean} result.success - Whether submission was successful
 * @param {number} result.statusCode - HTTP response status code
 * @param {number} result.urlCount - Number of URLs submitted
 * @param {string} [result.error] - Error message if submission failed
 * @param {number} [result.duration] - Request duration in milliseconds
 * @returns {void}
 * 
 * @example
 * // Display successful result
 * displayResults({
 *   success: true,
 *   statusCode: 200,
 *   urlCount: 25,
 *   duration: 1234
 * });
 * // Output:
 * // === Submission Results ===
 * // ✓ Status: SUCCESS
 * // ✓ HTTP Status Code: 200
 * // ✓ URLs Submitted: 25
 * // ✓ Duration: 1234ms
 * 
 * @example
 * // Display failed result
 * displayResults({
 *   success: false,
 *   statusCode: 429,
 *   urlCount: 25,
 *   error: 'Rate limit exceeded',
 *   duration: 567
 * });
 * // Output:
 * // === Submission Results ===
 * // ✗ Status: FAILURE
 * // ✗ HTTP Status Code: 429
 * // ✗ URLs Attempted: 25
 * // ✗ Error: Rate limit exceeded
 * // ✗ Duration: 567ms
 */
function displayResults(result) {
  console.log('\n\n=== Submission Results ===\n');
  
  if (result.success) {
    console.log('✓ Status: SUCCESS');
    console.log(`✓ HTTP Status Code: ${result.statusCode}`);
    console.log(`✓ URLs Submitted: ${result.urlCount}`);
    console.log(`✓ Duration: ${result.duration}ms`);
  } else {
    console.log('✗ Status: FAILURE');
    console.log(`✗ HTTP Status Code: ${result.statusCode || 'N/A'}`);
    console.log(`✗ URLs Attempted: ${result.urlCount}`);
    console.log(`✗ Error: ${result.error || 'Unknown error'}`);
    if (result.duration) {
      console.log(`✗ Duration: ${result.duration}ms`);
    }
  }
  
  console.log('');
}

/**
 * Main execution function for the manual submission script.
 * 
 * Orchestrates the entire submission process:
 * 1. Parses command-line arguments
 * 2. Validates configuration and environment variables
 * 3. Collects URLs from file or sitemap
 * 4. Validates URLs
 * 5. Submits to IndexNow API (unless dry-run)
 * 6. Displays results
 * 7. Logs submission
 * 8. Exits with appropriate code
 * 
 * The function handles all error cases gracefully and provides clear
 * error messages to help users troubleshoot issues.
 * 
 * @returns {Promise<void>}
 * 
 * @throws {Error} If command-line arguments are invalid
 * @throws {Error} If required environment variables are missing
 * @throws {Error} If file cannot be read
 * @throws {Error} If no URLs are found
 * 
 * @example
 * // Run from command line:
 * // node scripts/submit-indexnow.js --file urls.txt
 * //
 * // Output:
 * // IndexNow Submission Script
 * // ==========================
 * // Domain: vividmediacheshire.com
 * // CloudFront: d15sc9fc739ev2.cloudfront.net
 * // Mode: LIVE SUBMISSION
 * //
 * // Reading URLs from file: urls.txt
 * // ✓ Read 25 URLs from file
 * // ...
 */
async function main() {
  try {
    // Parse command-line arguments
    const args = parseArguments();

    // Display help if requested
    if (args.help) {
      displayHelp();
      process.exit(0);
    }

    // Validate that either --file or --all is provided
    if (!args.file && !args.all) {
      console.error('Error: Either --file or --all must be specified\n');
      displayHelp();
      process.exit(1);
    }

    // Validate that both --file and --all are not provided
    if (args.file && args.all) {
      console.error('Error: Cannot specify both --file and --all\n');
      displayHelp();
      process.exit(1);
    }

    // Validate API key is provided (not required for dry-run)
    if (!args.dryRun && !INDEXNOW_API_KEY) {
      console.error('Error: INDEXNOW_API_KEY environment variable is required\n');
      console.error('Set it with: export INDEXNOW_API_KEY=your-api-key\n');
      process.exit(1);
    }

    console.log('IndexNow Submission Script');
    console.log('==========================\n');
    console.log(`Domain: ${SITE_DOMAIN}`);
    console.log(`CloudFront: ${CLOUDFRONT_DOMAIN}`);
    console.log(`Mode: ${args.dryRun ? 'DRY RUN (validation only)' : 'LIVE SUBMISSION'}\n`);

    // Collect URLs
    let urls = [];
    
    if (args.file) {
      console.log(`Reading URLs from file: ${args.file}`);
      urls = await readUrlsFromFile(args.file);
      console.log(`✓ Read ${urls.length} URLs from file\n`);
    } else if (args.all) {
      console.log('Collecting all indexable URLs from site...');
      urls = await collectUrls({
        domain: SITE_DOMAIN,
        excludePaths: ['/thank-you/']
      });
      console.log(`✓ Collected ${urls.length} URLs from sitemap\n`);
    }

    // Validate URLs
    if (urls.length === 0) {
      console.error('Error: No URLs to submit\n');
      process.exit(1);
    }

    // Display URL summary
    console.log('URLs to submit:');
    console.log('---------------');
    
    // Show first 10 URLs
    const displayCount = Math.min(10, urls.length);
    for (let i = 0; i < displayCount; i++) {
      console.log(`  ${i + 1}. ${urls[i]}`);
    }
    
    if (urls.length > 10) {
      console.log(`  ... and ${urls.length - 10} more`);
    }
    
    console.log('');

    // Dry run mode - exit after validation
    if (args.dryRun) {
      console.log('✓ DRY RUN: URLs validated successfully');
      console.log(`✓ Total URLs: ${urls.length}`);
      console.log('\nNo submission made (dry-run mode)\n');
      process.exit(0);
    }

    // Submit URLs to IndexNow API
    console.log('Submitting to IndexNow API...');
    displayProgress('⏳ Sending request...');

    const keyLocation = `https://${CLOUDFRONT_DOMAIN}/${INDEXNOW_API_KEY}.txt`;
    
    const result = await submitUrls({
      host: SITE_DOMAIN,
      key: INDEXNOW_API_KEY,
      keyLocation,
      urlList: urls
    });

    // Display results
    displayResults(result);

    // Log submission
    await logSubmission({
      timestamp: result.timestamp,
      urlCount: result.urlCount,
      success: result.success,
      statusCode: result.statusCode,
      error: result.error,
      duration: result.duration
    });

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { parseArguments, readUrlsFromFile, displayResults };
