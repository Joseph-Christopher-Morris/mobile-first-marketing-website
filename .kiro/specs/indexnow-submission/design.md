# Design Document: IndexNow Submission

## Overview

This design implements IndexNow API integration to enable instant notification of search engines (Bing, Yandex, Seznam.cz, Naver) when website content is published or updated. The implementation follows the existing S3 + CloudFront deployment architecture and integrates seamlessly with the current GitHub Actions deployment pipeline.

The system consists of three main components:
1. **API Key Management**: Generation and hosting of the IndexNow API key
2. **Submission Service**: Core logic for submitting URLs to the IndexNow API
3. **Pipeline Integration**: Automated submission during deployment and manual submission capability

The design prioritizes simplicity, security, and reliability while maintaining compatibility with the project's existing infrastructure patterns.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions Pipeline                      │
│  ┌────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │   Build    │──▶│  Deploy to   │──▶│ CloudFront         │   │
│  │  Next.js   │   │  S3 Bucket   │   │ Invalidation       │   │
│  └────────────┘   └──────────────┘   └────────────────────┘   │
│                                              │                   │
│                                              ▼                   │
│                                    ┌────────────────────┐       │
│                                    │ IndexNow           │       │
│                                    │ Submission         │       │
│                                    └────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │  IndexNow API      │
                                    │  (api.indexnow.org)│
                                    └────────────────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                  ┌──────────┐         ┌──────────┐         ┌──────────┐
                  │   Bing   │         │  Yandex  │         │  Naver   │
                  └──────────┘         └──────────┘         └──────────┘
```

### Data Flow

1. **Deployment Trigger**: GitHub Actions workflow initiates deployment
2. **Build & Deploy**: Next.js static site is built and deployed to S3
3. **Cache Invalidation**: CloudFront cache is invalidated for updated content
4. **URL Collection**: System identifies all indexable URLs from the site
5. **IndexNow Submission**: URLs are submitted to IndexNow API endpoint
6. **Search Engine Notification**: IndexNow distributes notifications to participating search engines
7. **Logging**: Submission results are logged for monitoring and debugging

### Component Interaction

- **API Key File**: Stored in `/public/{api-key}.txt`, served via CloudFront
- **Submission Script**: Node.js module that handles API communication
- **Deployment Pipeline**: GitHub Actions workflow that orchestrates the process
- **Environment Variables**: Secure storage of API key and configuration
- **Log Files**: Structured JSON logs for submission tracking

## Components and Interfaces

### 1. API Key Generator

**Purpose**: Generate and store the IndexNow API key

**Module**: `scripts/generate-indexnow-key.js`

**Interface**:
```javascript
/**
 * Generate a cryptographically secure API key
 * @returns {string} Hexadecimal API key (32 characters)
 */
function generateApiKey(): string

/**
 * Write API key to public directory
 * @param {string} apiKey - The generated API key
 * @returns {void}
 */
function writeApiKeyFile(apiKey: string): void
```

**Implementation Details**:
- Uses Node.js `crypto.randomBytes()` for secure key generation
- Generates 16 bytes (128 bits) of random data
- Converts to hexadecimal string (32 characters)
- Writes to `/public/{api-key}.txt` with UTF-8 encoding
- File contains only the API key value (no additional content)

### 2. URL Collector

**Purpose**: Extract and validate URLs for submission

**Module**: `scripts/lib/url-collector.js`

**Interface**:
```javascript
/**
 * Collect all indexable URLs from the site
 * @param {Object} options - Collection options
 * @param {string} options.domain - Site domain
 * @param {string[]} options.excludePaths - Paths to exclude
 * @returns {Promise<string[]>} Array of absolute URLs
 */
async function collectUrls(options): Promise<string[]>

/**
 * Validate and normalize a URL
 * @param {string} url - URL to validate
 * @param {string} domain - Expected domain
 * @returns {string|null} Normalized URL or null if invalid
 */
function validateUrl(url: string, domain: string): string | null

/**
 * Check if URL should be indexed
 * @param {string} url - URL to check
 * @param {string[]} excludePaths - Paths to exclude
 * @returns {boolean} True if URL should be indexed
 */
function shouldIndex(url: string, excludePaths: string[]): boolean
```

**Implementation Details**:
- Reads sitemap.xml from build output directory
- Parses XML to extract all URL entries
- Validates each URL matches the configured domain
- Normalizes URLs to include HTTPS and trailing slashes
- Excludes URLs with noindex meta tags (if HTML parsing is enabled)
- Excludes conversion pages (/thank-you/)
- Deduplicates URL list
- Returns sorted array of valid URLs

### 3. IndexNow Submission Service

**Purpose**: Submit URLs to IndexNow API

**Module**: `scripts/lib/indexnow-service.js`

**Interface**:
```javascript
/**
 * Submit URLs to IndexNow API
 * @param {Object} options - Submission options
 * @param {string} options.host - Site domain
 * @param {string} options.key - API key
 * @param {string} options.keyLocation - Full URL to API key file
 * @param {string[]} options.urlList - URLs to submit (max 10,000)
 * @returns {Promise<SubmissionResult>} Submission result
 */
async function submitUrls(options): Promise<SubmissionResult>

/**
 * Validate API key format
 * @param {string} key - API key to validate
 * @returns {boolean} True if valid
 */
function validateApiKey(key: string): boolean

/**
 * Batch URLs for submission
 * @param {string[]} urls - URLs to batch
 * @param {number} batchSize - Maximum URLs per batch (default: 10000)
 * @returns {string[][]} Array of URL batches
 */
function batchUrls(urls: string[], batchSize: number = 10000): string[][]
```

**Types**:
```typescript
interface SubmissionResult {
  success: boolean;
  statusCode: number;
  urlCount: number;
  timestamp: string;
  error?: string;
}
```

**Implementation Details**:
- Makes HTTPS POST request to `https://api.indexnow.org/indexnow`
- Sets Content-Type header to `application/json`
- Includes request body with host, key, keyLocation, and urlList
- Handles HTTP response codes:
  - 200: Success
  - 202: Accepted (treated as success)
  - 400: Bad request (validation error)
  - 403: Forbidden (invalid key)
  - 422: Unprocessable entity (invalid URLs)
  - 429: Rate limit exceeded
  - 500: Server error
- Implements timeout of 30 seconds
- Returns structured result object

### 4. Logging Service

**Purpose**: Track submission history and results

**Module**: `scripts/lib/indexnow-logger.js`

**Interface**:
```javascript
/**
 * Log submission result
 * @param {Object} entry - Log entry
 * @returns {Promise<void>}
 */
async function logSubmission(entry: LogEntry): Promise<void>

/**
 * Get submission statistics
 * @param {number} limit - Number of recent submissions to analyze
 * @returns {Promise<Statistics>} Submission statistics
 */
async function getStatistics(limit: number = 10): Promise<Statistics>

/**
 * Rotate log file if needed
 * @returns {Promise<void>}
 */
async function rotateLogFile(): Promise<void>
```

**Types**:
```typescript
interface LogEntry {
  timestamp: string;
  deploymentId?: string;
  urlCount: number;
  success: boolean;
  statusCode: number;
  error?: string;
  duration: number;
}

interface Statistics {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  successRate: number;
  lastSuccessfulSubmission: string | null;
  averageUrlCount: number;
}
```

**Implementation Details**:
- Writes to `logs/indexnow-submissions.json` in JSON Lines format
- Each line is a complete JSON object (one submission per line)
- Checks file size before writing
- Rotates log file when size exceeds 10MB
- Rotated files named with timestamp: `indexnow-submissions-{timestamp}.json`
- Calculates statistics from recent submissions
- Logs warning if success rate falls below 90%

### 5. Manual Submission Script

**Purpose**: Allow manual URL submission outside deployment pipeline

**Module**: `scripts/submit-indexnow.js`

**Interface**:
```bash
# Submit URLs from file
node scripts/submit-indexnow.js --file urls.txt

# Dry run (validate without submitting)
node scripts/submit-indexnow.js --file urls.txt --dry-run

# Submit all site URLs
node scripts/submit-indexnow.js --all

# Display help
node scripts/submit-indexnow.js --help
```

**Implementation Details**:
- Accepts command-line arguments via process.argv
- Reads URLs from newline-separated text file
- Validates all URLs before submission
- Displays summary of URLs to be submitted
- In dry-run mode, validates and displays URLs without API call
- Shows progress during submission
- Displays detailed results including status code and error messages
- Exits with code 0 on success, 1 on failure

### 6. Deployment Integration

**Purpose**: Integrate IndexNow submission into GitHub Actions workflow

**Module**: `.github/workflows/s3-cloudfront-deploy.yml` (modification)

**Integration Point**:
```yaml
- name: Submit to IndexNow
  run: node scripts/submit-indexnow.js --all
  env:
    INDEXNOW_API_KEY: ${{ secrets.INDEXNOW_API_KEY }}
    SITE_DOMAIN: vividmediacheshire.com
  continue-on-error: true
```

**Implementation Details**:
- Runs after CloudFront invalidation step
- Uses environment variables from GitHub Secrets
- Continues deployment even if IndexNow submission fails
- Logs results to deployment logs
- Does not block deployment on failure

## Data Models

### API Key File Format

**Location**: `/public/{api-key}.txt`

**Format**: Plain text file containing only the API key
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Requirements**:
- UTF-8 encoding
- No whitespace or newlines
- Hexadecimal characters only (0-9, a-f)
- Length: 32 characters (16 bytes)

### IndexNow API Request

**Endpoint**: `POST https://api.indexnow.org/indexnow`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "host": "vividmediacheshire.com",
  "key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "keyLocation": "https://d15sc9fc739ev2.cloudfront.net/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt",
  "urlList": [
    "https://d15sc9fc739ev2.cloudfront.net/",
    "https://d15sc9fc739ev2.cloudfront.net/services/",
    "https://d15sc9fc739ev2.cloudfront.net/blog/"
  ]
}
```

**Field Specifications**:
- `host`: Domain name without protocol or path
- `key`: API key value (must match file content)
- `keyLocation`: Full HTTPS URL to API key file
- `urlList`: Array of absolute HTTPS URLs (max 10,000)

### Log File Format

**Location**: `logs/indexnow-submissions.json`

**Format**: JSON Lines (one JSON object per line)
```json
{"timestamp":"2026-02-22T10:30:00.000Z","deploymentId":"deploy-1708596600000","urlCount":25,"success":true,"statusCode":200,"duration":1234}
{"timestamp":"2026-02-22T11:45:00.000Z","deploymentId":"deploy-1708601100000","urlCount":25,"success":false,"statusCode":429,"error":"Rate limit exceeded","duration":567}
```

**Field Specifications**:
- `timestamp`: ISO 8601 format with milliseconds
- `deploymentId`: Optional deployment identifier
- `urlCount`: Number of URLs submitted
- `success`: Boolean indicating submission success
- `statusCode`: HTTP response status code
- `error`: Optional error message
- `duration`: Request duration in milliseconds

### Environment Variables

**Required**:
- `INDEXNOW_API_KEY`: The IndexNow API key (stored in GitHub Secrets)

**Optional**:
- `SITE_DOMAIN`: Site domain (default: `vividmediacheshire.com`)
- `INDEXNOW_ENDPOINT`: API endpoint (default: `https://api.indexnow.org/indexnow`)
- `INDEXNOW_TIMEOUT`: Request timeout in ms (default: `30000`)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Properties 3.2 and 3.3 both test URL validation/normalization and can be combined into a comprehensive URL processing property
- Properties 6.2, 6.3, and 6.4 all test logging behavior and can be combined into a comprehensive logging property
- Properties 8.1, 8.2, 8.3, and 8.4 all test statistics tracking and can be combined into a comprehensive statistics property

### Property 1: API Key Generation Format

*For any* generated API key, the key SHALL be a hexadecimal string with length between 8 and 128 characters (inclusive).

**Validates: Requirements 1.1**

### Property 2: API Key File Round Trip

*For any* valid API key, writing the key to a file and then reading it back SHALL produce the exact same key value with no additional whitespace or characters.

**Validates: Requirements 1.2**

### Property 3: Request Payload Completeness

*For any* valid submission parameters (host, key, keyLocation, urlList), the generated JSON payload SHALL contain all four required fields with correct types (strings for host/key/keyLocation, array for urlList).

**Validates: Requirements 2.2**

### Property 4: Key Location URL Construction

*For any* valid API key, the constructed keyLocation URL SHALL be a valid HTTPS URL that includes the domain and the key as the filename with .txt extension.

**Validates: Requirements 2.4**

### Property 5: URL List Size Constraint

*For any* list of URLs provided to the submission service, if the list exceeds 10,000 URLs, the service SHALL either batch them into groups of 10,000 or truncate to 10,000, never submitting more than 10,000 URLs in a single request.

**Validates: Requirements 2.5**

### Property 6: URL Normalization

*For any* input URL string, the normalized URL SHALL have HTTPS protocol, include a trailing slash, and match the configured domain.

**Validates: Requirements 2.6, 3.2, 3.3**

### Property 7: URL Deduplication

*For any* list of URLs containing duplicates, the deduplicated list SHALL contain each unique URL exactly once, preserving the order of first occurrence.

**Validates: Requirements 3.6**

### Property 8: Noindex Exclusion

*For any* URL that has a noindex meta tag, that URL SHALL be excluded from the final submission list.

**Validates: Requirements 3.4**

### Property 9: File Path Argument Parsing

*For any* valid file path provided as a command-line argument, the manual script SHALL successfully read and parse the file contents as newline-separated URLs.

**Validates: Requirements 5.2**

### Property 10: Submission Result Display

*For any* submission result (success or failure), the manual script output SHALL include the success/failure status and the HTTP response code.

**Validates: Requirements 5.5**

### Property 11: Comprehensive Error Logging

*For any* error condition (network error, non-200 status, validation failure), the log entry SHALL include the error type, relevant details (endpoint/status code/URL), and a timestamp.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 12: Submission Logging Completeness

*For any* submission attempt, the log entry SHALL include the URL count, submission timestamp, success status, and status code in valid JSON format.

**Validates: Requirements 6.4, 6.5**

### Property 13: Log File Format

*For any* log entry written to the log file, the entry SHALL be valid JSON on a single line, parseable by standard JSON parsers.

**Validates: Requirements 6.5**

### Property 14: API Key Redaction

*For any* log message or error output, the API key value SHALL NOT appear in plain text anywhere in the output.

**Validates: Requirements 7.4**

### Property 15: API Key Format Validation

*For any* string input, the API key validator SHALL correctly identify whether it matches the hexadecimal format with length between 8 and 128 characters.

**Validates: Requirements 7.6**

### Property 16: Statistics Calculation Accuracy

*For any* sequence of submission results, the calculated statistics (total submissions, successful submissions, failed submissions, success rate) SHALL accurately reflect the submission history.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 17: Success Rate Warning Threshold

*For any* submission history where the success rate over the last 10 submissions falls below 90%, a warning message SHALL be logged.

**Validates: Requirements 8.5**

## Error Handling

### Error Categories

1. **Configuration Errors**
   - Missing API key environment variable
   - Invalid API key format
   - Missing or invalid domain configuration

2. **Network Errors**
   - Connection timeout
   - DNS resolution failure
   - SSL/TLS errors
   - Network unreachable

3. **API Errors**
   - 400 Bad Request: Invalid request format
   - 403 Forbidden: Invalid API key
   - 422 Unprocessable Entity: Invalid URLs
   - 429 Rate Limit: Too many requests
   - 500 Server Error: IndexNow service issues

4. **File System Errors**
   - Cannot write API key file
   - Cannot read URL input file
   - Cannot write to log file
   - Log rotation failure

5. **Validation Errors**
   - Invalid URL format
   - URL domain mismatch
   - Empty URL list
   - URL list exceeds maximum size

### Error Handling Strategy

**Configuration Errors**:
- Fail fast with clear error message
- Exit with code 1
- Log error details
- Provide troubleshooting guidance

**Network Errors**:
- Log error with endpoint and error message
- Do not retry automatically (avoid rate limiting)
- Return failure result
- In deployment pipeline: continue deployment (non-blocking)

**API Errors**:
- Log status code and response body
- For 429 (rate limit): log warning, do not retry
- For 4xx errors: log validation details
- For 5xx errors: log server error, consider retry in future enhancement
- Return failure result with error details

**File System Errors**:
- Log error with file path and error message
- For API key file write: fail deployment (critical)
- For log file write: log to console as fallback
- For log rotation: log warning, continue operation

**Validation Errors**:
- Log invalid input with reason
- Filter out invalid URLs, continue with valid ones
- If no valid URLs remain: log warning, skip submission
- Return result indicating partial success if applicable

### Error Recovery

**Graceful Degradation**:
- If IndexNow submission fails, deployment continues
- If some URLs are invalid, submit valid ones
- If logging fails, output to console
- If log rotation fails, continue writing to existing file

**Retry Strategy**:
- No automatic retries for rate limit errors (429)
- No automatic retries for validation errors (4xx)
- Future enhancement: exponential backoff for 5xx errors
- Manual retry available via manual submission script

**Monitoring and Alerting**:
- Log all errors with structured data
- Track success rate over time
- Alert when success rate falls below 90%
- Provide validation script to verify configuration

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Verify specific API key generation produces valid format
- Test specific error responses (429, 403, 500)
- Verify log file rotation at 10MB threshold
- Test GitHub Actions integration
- Verify environment variable reading
- Test specific URL exclusions (/thank-you/)

**Property-Based Tests**: Verify universal properties across all inputs
- API key generation always produces valid format (Property 1)
- URL normalization always produces HTTPS with trailing slash (Property 6)
- Deduplication always removes duplicates (Property 7)
- Logging always includes required fields (Property 12)
- Statistics calculation is always accurate (Property 16)

### Property-Based Testing Configuration

**Library**: fast-check (already in project dependencies)

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: indexnow-submission, Property {number}: {property_text}`

**Example Property Test Structure**:
```javascript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: indexnow-submission', () => {
  it('Property 1: API key generation format', () => {
    // Feature: indexnow-submission, Property 1: API key generation format
    fc.assert(
      fc.property(fc.constant(null), () => {
        const apiKey = generateApiKey();
        expect(apiKey).toMatch(/^[0-9a-f]+$/);
        expect(apiKey.length).toBeGreaterThanOrEqual(8);
        expect(apiKey.length).toBeLessThanOrEqual(128);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 6: URL normalization', () => {
    // Feature: indexnow-submission, Property 6: URL normalization
    fc.assert(
      fc.property(
        fc.webUrl({ withFragments: false }),
        (url) => {
          const normalized = normalizeUrl(url, 'vividmediacheshire.com');
          if (normalized) {
            expect(normalized).toMatch(/^https:\/\//);
            expect(normalized).toMatch(/\/$/);
            expect(normalized).toContain('vividmediacheshire.com');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

**Unit Test Coverage**:
- API key generation and file writing
- URL collection from sitemap
- URL validation and normalization
- IndexNow API request construction
- HTTP response handling (200, 429, 403, 422, 500)
- Logging service (write, rotate, statistics)
- Manual script CLI argument parsing
- Environment variable configuration
- Error handling for each error category

**Property Test Coverage**:
- All 17 correctness properties defined above
- Each property tested with minimum 100 iterations
- Generators for URLs, API keys, submission results
- Edge cases handled by property test generators

**Integration Test Coverage**:
- End-to-end deployment pipeline execution
- API key file accessibility via CloudFront
- Log file creation and rotation
- Manual script execution with various inputs
- GitHub Actions workflow integration

### Test Data Generators

**For Property-Based Tests**:
```javascript
// API key generator
const apiKeyGen = fc.hexaString({ minLength: 8, maxLength: 128 });

// URL generator
const urlGen = fc.webUrl({ 
  validSchemes: ['http', 'https'],
  withFragments: false 
});

// URL list generator
const urlListGen = fc.array(urlGen, { minLength: 0, maxLength: 15000 });

// Submission result generator
const submissionResultGen = fc.record({
  success: fc.boolean(),
  statusCode: fc.oneof(
    fc.constant(200),
    fc.constant(202),
    fc.constant(400),
    fc.constant(403),
    fc.constant(422),
    fc.constant(429),
    fc.constant(500)
  ),
  urlCount: fc.nat({ max: 10000 }),
  timestamp: fc.date().map(d => d.toISOString())
});
```

### Testing Best Practices

1. **Isolation**: Mock external dependencies (HTTP requests, file system)
2. **Determinism**: Use fixed seeds for property tests during CI
3. **Fast Feedback**: Unit tests run in < 5 seconds, property tests in < 30 seconds
4. **Clear Failures**: Property test failures show the failing input
5. **Regression Prevention**: Add unit test for each bug found
6. **Documentation**: Each test includes comment explaining what it validates

### Continuous Integration

**Pre-Deployment Checks**:
- All unit tests must pass
- All property tests must pass
- No linting errors
- API key format validation passes
- Log file format validation passes

**Post-Deployment Validation**:
- API key file accessible via HTTPS
- Submission logs created successfully
- No errors in deployment logs
- Success rate tracking functional

