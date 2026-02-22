/**
 * IndexNow Submission Service
 * 
 * Handles submission of URLs to the IndexNow API for instant search engine notification.
 * Supports Bing, Yandex, Seznam.cz, and Naver search engines.
 * 
 * @see https://www.indexnow.org/documentation
 */

const https = require('https');

/**
 * Submit URLs to IndexNow API for instant search engine notification.
 * 
 * Makes an HTTPS POST request to the IndexNow API endpoint with the provided URLs.
 * The API distributes the notification to all participating search engines (Bing,
 * Yandex, Seznam.cz, Naver) automatically.
 * 
 * The function handles:
 * - Request payload construction with required fields
 * - URL list size enforcement (max 10,000 URLs)
 * - HTTP response handling for all status codes
 * - Network error handling and timeouts
 * - Duration tracking for monitoring
 * 
 * @param {Object} options - Submission options
 * @param {string} options.host - Site domain without protocol (e.g., 'vividmediacheshire.com')
 * @param {string} options.key - IndexNow API key (hexadecimal string, 8-128 characters)
 * @param {string} options.keyLocation - Full HTTPS URL to API key file (e.g., 'https://example.com/key.txt')
 * @param {string[]} options.urlList - URLs to submit (max 10,000, will be truncated if exceeded)
 * @param {number} [options.timeout=30000] - Request timeout in milliseconds (default: 30 seconds)
 * @returns {Promise<SubmissionResult>} Submission result with status and metadata
 * 
 * @throws {Error} If required parameters are missing (host, key, keyLocation, urlList)
 * @throws {Error} If API key format is invalid
 * @throws {TypeError} If urlList is not an array
 * 
 * @typedef {Object} SubmissionResult
 * @property {boolean} success - Whether submission was successful (true for 200/202, false otherwise)
 * @property {number} statusCode - HTTP response status code (0 for network errors)
 * @property {number} urlCount - Number of URLs submitted
 * @property {string} timestamp - ISO 8601 timestamp of submission
 * @property {string} [error] - Error message if submission failed
 * @property {number} [duration] - Request duration in milliseconds
 * 
 * @example
 * // Successful submission
 * const result = await submitUrls({
 *   host: 'vividmediacheshire.com',
 *   key: 'a1b2c3d4e5f6g7h8',
 *   keyLocation: 'https://example.com/a1b2c3d4e5f6g7h8.txt',
 *   urlList: ['https://example.com/', 'https://example.com/about/']
 * });
 * console.log(result);
 * // {
 * //   success: true,
 * //   statusCode: 200,
 * //   urlCount: 2,
 * //   timestamp: '2026-02-22T10:30:00.000Z',
 * //   duration: 1234
 * // }
 * 
 * @example
 * // Rate limit error
 * const result = await submitUrls({ ...options });
 * console.log(result);
 * // {
 * //   success: false,
 * //   statusCode: 429,
 * //   urlCount: 25,
 * //   timestamp: '2026-02-22T10:30:00.000Z',
 * //   error: 'Rate limit exceeded',
 * //   duration: 567
 * // }
 * 
 * @example
 * // Network error
 * const result = await submitUrls({ ...options });
 * console.log(result);
 * // {
 * //   success: false,
 * //   statusCode: 0,
 * //   urlCount: 25,
 * //   timestamp: '2026-02-22T10:30:00.000Z',
 * //   error: 'Network error: ECONNREFUSED',
 * //   duration: 100
 * // }
 */
async function submitUrls(options) {
  const {
    host,
    key,
    keyLocation,
    urlList,
    timeout = 30000
  } = options;

  // Validate required parameters
  if (!host) {
    throw new Error('Host is required');
  }
  if (!key) {
    throw new Error('API key is required');
  }
  if (!keyLocation) {
    throw new Error('Key location URL is required');
  }
  if (!urlList || !Array.isArray(urlList)) {
    throw new Error('URL list must be an array');
  }

  // Validate API key format
  if (!validateApiKey(key)) {
    throw new Error('Invalid API key format (must be hexadecimal, 8-128 characters)');
  }

  // Enforce 10,000 URL limit
  const urls = urlList.slice(0, 10000);
  
  if (urlList.length > 10000) {
    console.warn(`Warning: URL list exceeds 10,000 limit. Submitting first 10,000 URLs.`);
  }

  // Construct request payload
  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls
  };

  const payloadJson = JSON.stringify(payload);
  const startTime = Date.now();

  // Make HTTPS POST request
  return new Promise((resolve) => {
    const requestOptions = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadJson)
      },
      timeout
    };

    const req = https.request(requestOptions, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const timestamp = new Date().toISOString();

        // Handle response based on status code
        if (statusCode === 200 || statusCode === 202) {
          // Success
          resolve({
            success: true,
            statusCode,
            urlCount: urls.length,
            timestamp,
            duration
          });
        } else {
          // Error response
          let errorMessage = `HTTP ${statusCode}`;
          
          // Add specific error messages for known status codes
          if (statusCode === 400) {
            errorMessage = 'Bad request - Invalid request format';
          } else if (statusCode === 403) {
            errorMessage = 'Forbidden - Invalid API key';
          } else if (statusCode === 422) {
            errorMessage = 'Unprocessable entity - Invalid URLs';
          } else if (statusCode === 429) {
            errorMessage = 'Rate limit exceeded';
          } else if (statusCode >= 500) {
            errorMessage = 'Server error';
          }

          // Include response body if available
          if (responseBody) {
            try {
              const parsed = JSON.parse(responseBody);
              if (parsed.message) {
                errorMessage += ` - ${parsed.message}`;
              }
            } catch (e) {
              // Response body is not JSON, append as-is if short
              if (responseBody.length < 200) {
                errorMessage += ` - ${responseBody}`;
              }
            }
          }

          resolve({
            success: false,
            statusCode,
            urlCount: urls.length,
            timestamp,
            duration,
            error: errorMessage
          });
        }
      });
    });

    // Handle request errors
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      resolve({
        success: false,
        statusCode: 0,
        urlCount: urls.length,
        timestamp,
        duration,
        error: `Network error: ${error.message}`
      });
    });

    // Handle timeout
    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      resolve({
        success: false,
        statusCode: 0,
        urlCount: urls.length,
        timestamp,
        duration,
        error: `Request timeout after ${timeout}ms`
      });
    });

    // Send request
    req.write(payloadJson);
    req.end();
  });
}

/**
 * Validate API key format according to IndexNow requirements.
 * 
 * Checks that the API key:
 * - Is a string type
 * - Contains only hexadecimal characters (0-9, a-f, A-F)
 * - Has length between 8 and 128 characters (inclusive)
 * 
 * This validation ensures the key meets IndexNow protocol requirements
 * before making API requests.
 * 
 * @param {string} key - API key to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * // Valid keys
 * validateApiKey('a1b2c3d4e5f6g7h8')  // Returns: true
 * validateApiKey('ABCDEF1234567890')  // Returns: true (uppercase OK)
 * validateApiKey('a'.repeat(128))     // Returns: true (max length)
 * 
 * @example
 * // Invalid keys
 * validateApiKey('invalid!')          // Returns: false (non-hex character)
 * validateApiKey('abc')               // Returns: false (too short)
 * validateApiKey('a'.repeat(129))     // Returns: false (too long)
 * validateApiKey(12345)               // Returns: false (not a string)
 * validateApiKey('')                  // Returns: false (empty)
 */
function validateApiKey(key) {
  if (typeof key !== 'string') {
    return false;
  }

  // Check length (8-128 characters)
  if (key.length < 8 || key.length > 128) {
    return false;
  }

  // Check hexadecimal format (0-9, a-f, A-F)
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(key);
}

/**
 * Batch URLs for submission to comply with IndexNow API limits.
 * 
 * Splits a large URL list into batches that comply with the IndexNow API limit
 * of 10,000 URLs per request. Each batch contains at most `batchSize` URLs.
 * 
 * This is useful when you have more than 10,000 URLs to submit and need to
 * make multiple API requests. The function preserves the original order of URLs.
 * 
 * @param {string[]} urls - URLs to batch (can be any length)
 * @param {number} [batchSize=10000] - Maximum URLs per batch (default: 10,000)
 * @returns {string[][]} Array of URL batches, each containing at most batchSize URLs
 * 
 * @throws {Error} If urls is not an array
 * @throws {Error} If batchSize is not positive
 * 
 * @example
 * // Batch large URL list
 * const allUrls = [...]; // 25,000 URLs
 * const batches = batchUrls(allUrls, 10000);
 * console.log(batches.length); // 3
 * console.log(batches[0].length); // 10,000
 * console.log(batches[1].length); // 10,000
 * console.log(batches[2].length); // 5,000
 * 
 * @example
 * // Submit all batches
 * const batches = batchUrls(largeUrlList, 10000);
 * for (const batch of batches) {
 *   const result = await submitUrls({ 
 *     ...options, 
 *     urlList: batch 
 *   });
 *   console.log(`Submitted ${result.urlCount} URLs`);
 * }
 * 
 * @example
 * // Small list (no batching needed)
 * const urls = ['https://example.com/', 'https://example.com/about/'];
 * const batches = batchUrls(urls, 10000);
 * console.log(batches.length); // 1
 * console.log(batches[0]); // ['https://example.com/', 'https://example.com/about/']
 */
function batchUrls(urls, batchSize = 10000) {
  if (!Array.isArray(urls)) {
    throw new Error('URLs must be an array');
  }

  if (batchSize <= 0) {
    throw new Error('Batch size must be positive');
  }

  const batches = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  return batches;
}

module.exports = {
  submitUrls,
  validateApiKey,
  batchUrls
};
