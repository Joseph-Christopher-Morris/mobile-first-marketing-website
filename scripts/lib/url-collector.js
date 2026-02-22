/**
 * URL Collector Module
 * 
 * Collects and validates URLs from sitemap.xml for IndexNow submission.
 * Implements domain validation, URL normalization, exclusion rules, and deduplication.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Collect all indexable URLs from the sitemap for IndexNow submission.
 * 
 * Reads the sitemap.xml file from the build output directory, extracts all URLs,
 * validates them against the configured domain, normalizes them to HTTPS with
 * trailing slashes, applies exclusion rules, and deduplicates the list.
 * 
 * The function ensures all returned URLs:
 * - Match the specified domain
 * - Use HTTPS protocol
 * - Have trailing slashes
 * - Are not in the exclusion list
 * - Are unique (no duplicates)
 * - Are sorted alphabetically
 * 
 * @param {Object} options - Collection options
 * @param {string} options.domain - Site domain (e.g., 'vividmediacheshire.com')
 * @param {string[]} [options.excludePaths=['/thank-you/']] - Paths to exclude from indexing
 * @param {string} [options.sitemapPath='out/sitemap.xml'] - Path to sitemap.xml file
 * @returns {Promise<string[]>} Array of absolute HTTPS URLs with trailing slashes, sorted alphabetically
 * 
 * @throws {Error} If domain is not provided
 * @throws {Error} If sitemap file cannot be read
 * 
 * @example
 * // Collect all URLs with default exclusions
 * const urls = await collectUrls({
 *   domain: 'vividmediacheshire.com'
 * });
 * console.log(urls);
 * // [
 * //   'https://vividmediacheshire.com/',
 * //   'https://vividmediacheshire.com/about/',
 * //   'https://vividmediacheshire.com/blog/'
 * // ]
 * 
 * @example
 * // Collect URLs with custom exclusions
 * const urls = await collectUrls({
 *   domain: 'vividmediacheshire.com',
 *   excludePaths: ['/thank-you/', '/admin/'],
 *   sitemapPath: 'dist/sitemap.xml'
 * });
 */
async function collectUrls(options) {
  const {
    domain,
    excludePaths = ['/thank-you/'],
    sitemapPath = 'out/sitemap.xml'
  } = options;

  if (!domain) {
    throw new Error('Domain is required');
  }

  // Read sitemap.xml
  const sitemapContent = await fs.readFile(sitemapPath, 'utf-8');
  
  // Parse XML to extract URLs
  const urls = parseSitemapXml(sitemapContent);
  
  // Validate, normalize, and filter URLs
  const validUrls = [];
  const seen = new Set();
  
  for (const url of urls) {
    // Validate and normalize URL
    const normalized = validateUrl(url, domain);
    if (!normalized) {
      continue;
    }
    
    // Check if URL should be indexed
    if (!shouldIndex(normalized, excludePaths)) {
      continue;
    }
    
    // Deduplicate
    if (seen.has(normalized)) {
      continue;
    }
    
    seen.add(normalized);
    validUrls.push(normalized);
  }
  
  // Sort URLs for consistent output
  return validUrls.sort();
}

/**
 * Parse sitemap XML and extract URL entries from <loc> tags.
 * 
 * Uses regex-based parsing to extract URLs from standard sitemap.xml format.
 * This approach is sufficient for well-formed sitemaps and avoids the need
 * for external XML parsing dependencies.
 * 
 * @param {string} xmlContent - Sitemap XML content
 * @returns {string[]} Array of URLs from <loc> tags (may contain duplicates or invalid URLs)
 * 
 * @example
 * const xml = `<?xml version="1.0" encoding="UTF-8"?>
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <url><loc>https://example.com/</loc></url>
 *   <url><loc>https://example.com/about/</loc></url>
 * </urlset>`;
 * 
 * const urls = parseSitemapXml(xml);
 * console.log(urls);
 * // ['https://example.com/', 'https://example.com/about/']
 */
function parseSitemapXml(xmlContent) {
  const urls = [];
  
  // Simple regex-based XML parsing for <loc> tags
  // This is sufficient for standard sitemap.xml format
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1].trim());
  }
  
  return urls;
}

/**
 * Validate and normalize a URL for IndexNow submission.
 * 
 * Performs the following validations and transformations:
 * 1. Parses the URL to ensure it's valid
 * 2. Checks that the domain matches the expected domain (case-insensitive)
 * 3. Normalizes protocol to HTTPS
 * 4. Ensures pathname has a trailing slash
 * 5. Preserves query strings and hash fragments if present
 * 
 * Returns null if the URL is invalid or doesn't match the expected domain.
 * 
 * @param {string} url - URL to validate (can be HTTP or HTTPS, with or without trailing slash)
 * @param {string} domain - Expected domain (e.g., 'vividmediacheshire.com')
 * @returns {string|null} Normalized HTTPS URL with trailing slash, or null if invalid
 * 
 * @example
 * // Normalize HTTP to HTTPS
 * validateUrl('http://example.com/page', 'example.com')
 * // Returns: 'https://example.com/page/'
 * 
 * @example
 * // Add trailing slash
 * validateUrl('https://example.com/page', 'example.com')
 * // Returns: 'https://example.com/page/'
 * 
 * @example
 * // Reject mismatched domain
 * validateUrl('https://wrong.com/page/', 'example.com')
 * // Returns: null
 * 
 * @example
 * // Preserve query strings
 * validateUrl('https://example.com/page?id=123', 'example.com')
 * // Returns: 'https://example.com/page/?id=123'
 * 
 * @example
 * // Handle invalid URLs
 * validateUrl('not-a-url', 'example.com')
 * // Returns: null
 */
function validateUrl(url, domain) {
  try {
    // Parse URL
    const urlObj = new URL(url);
    
    // Check domain match (case-insensitive)
    const urlDomain = urlObj.hostname.toLowerCase();
    const expectedDomain = domain.toLowerCase();
    
    if (urlDomain !== expectedDomain) {
      return null;
    }
    
    // Normalize to HTTPS
    urlObj.protocol = 'https:';
    
    // Ensure trailing slash
    let pathname = urlObj.pathname;
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    
    // Reconstruct URL with normalized protocol and trailing slash
    return `https://${urlObj.hostname}${pathname}${urlObj.search}${urlObj.hash}`;
    
  } catch (error) {
    // Invalid URL format
    return null;
  }
}

/**
 * Check if URL should be indexed based on exclusion rules.
 * 
 * Determines whether a URL should be submitted to IndexNow by checking
 * if its pathname matches any of the excluded paths. URLs are excluded if:
 * - The pathname contains any of the excluded path strings
 * - The URL is malformed (returns false for safety)
 * 
 * Future enhancements may include checking for noindex meta tags.
 * 
 * @param {string} url - URL to check (must be a valid URL string)
 * @param {string[]} excludePaths - Paths to exclude (e.g., ['/thank-you/', '/admin/'])
 * @returns {boolean} True if URL should be indexed, false if it should be excluded
 * 
 * @example
 * // Exclude conversion page
 * shouldIndex('https://example.com/thank-you/', ['/thank-you/'])
 * // Returns: false
 * 
 * @example
 * // Allow blog page
 * shouldIndex('https://example.com/blog/', ['/thank-you/'])
 * // Returns: true
 * 
 * @example
 * // Multiple exclusions
 * shouldIndex('https://example.com/admin/users/', ['/thank-you/', '/admin/'])
 * // Returns: false
 * 
 * @example
 * // Partial path matching
 * shouldIndex('https://example.com/blog/thank-you-post/', ['/thank-you/'])
 * // Returns: false (contains '/thank-you/')
 */
function shouldIndex(url, excludePaths) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Check if pathname matches any excluded path
    for (const excludePath of excludePaths) {
      if (pathname.includes(excludePath)) {
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    // Invalid URL, don't index
    return false;
  }
}

module.exports = {
  collectUrls,
  validateUrl,
  shouldIndex,
  parseSitemapXml
};
