# Implementation Plan: IndexNow Submission

## Overview

This implementation plan delivers IndexNow API integration for instant search engine notification when content is published or updated. The system consists of five core modules (API key generator, URL collector, submission service, logging service, manual script) plus GitHub Actions integration. All components use Node.js and integrate with the existing S3 + CloudFront deployment architecture.

## Tasks

- [x] 1. Set up project structure and core utilities
  - Create `scripts/lib/` directory for shared modules
  - Create `logs/` directory for submission logs
  - Add `.gitignore` entries for log files (keep directory structure)
  - _Requirements: 6.5_

- [x] 2. Implement API key generator
  - [x] 2.1 Create API key generation script
    - Write `scripts/generate-indexnow-key.js` with `generateApiKey()` function using `crypto.randomBytes(16)`
    - Implement `writeApiKeyFile()` to write key to `/public/{api-key}.txt`
    - Add command-line execution support with output confirmation
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Write property test for API key generation
    - **Property 1: API Key Generation Format**
    - **Validates: Requirements 1.1**
    - Test that generated keys are hexadecimal strings with length 8-128 characters
  
  - [x] 2.3 Write unit tests for API key file operations
    - Test file writing with valid key
    - Test file reading round-trip consistency
    - Test error handling for file system failures
    - _Requirements: 1.2_

- [x] 3. Implement URL collector module
  - [x] 3.1 Create URL collector with sitemap parsing
    - Write `scripts/lib/url-collector.js` with `collectUrls()` function
    - Implement sitemap.xml parsing from build output directory
    - Implement `validateUrl()` for domain matching and normalization
    - Implement `shouldIndex()` for exclusion rules (/thank-you/, noindex)
    - Add URL deduplication and sorting
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_
  
  - [x] 3.2 Write property tests for URL processing
    - **Property 6: URL Normalization**
    - **Validates: Requirements 2.6, 3.2, 3.3**
    - Test that normalized URLs have HTTPS, trailing slash, and correct domain
    - **Property 7: URL Deduplication**
    - **Validates: Requirements 3.6**
    - Test that duplicate URLs are removed while preserving order
  
  - [x] 3.3 Write unit tests for URL collector
    - Test sitemap parsing with sample XML
    - Test exclusion of /thank-you/ pages
    - Test domain validation rejects mismatched domains
    - Test empty sitemap handling
    - _Requirements: 3.2, 3.4, 3.5_

- [x] 4. Implement IndexNow submission service
  - [x] 4.1 Create submission service with API integration
    - Write `scripts/lib/indexnow-service.js` with `submitUrls()` function
    - Implement HTTPS POST to `https://api.indexnow.org/indexnow`
    - Implement request body construction (host, key, keyLocation, urlList)
    - Implement `validateApiKey()` for format validation
    - Implement `batchUrls()` for 10,000 URL limit enforcement
    - Add 30-second timeout configuration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.6_
  
  - [x] 4.2 Implement HTTP response handling
    - Handle status codes: 200, 202 (success), 400, 403, 422, 429, 500
    - Return structured `SubmissionResult` object
    - Add error message extraction from response body
    - _Requirements: 2.7, 2.8_
  
  - [x] 4.3 Write property tests for submission service
    - **Property 3: Request Payload Completeness**
    - **Validates: Requirements 2.2**
    - Test that payload contains all required fields with correct types
    - **Property 4: Key Location URL Construction**
    - **Validates: Requirements 2.4**
    - Test that keyLocation is valid HTTPS URL with correct format
    - **Property 5: URL List Size Constraint**
    - **Validates: Requirements 2.5**
    - Test that URL lists never exceed 10,000 per request
  
  - [x] 4.4 Write unit tests for submission service
    - Test successful submission (200 response)
    - Test rate limit handling (429 response)
    - Test authentication failure (403 response)
    - Test validation errors (422 response)
    - Test network timeout handling
    - Mock HTTP requests using test framework
    - _Requirements: 2.7, 2.8_

- [x] 5. Checkpoint - Ensure core modules pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement logging service
  - [x] 6.1 Create logging service with JSON Lines format
    - Write `scripts/lib/indexnow-logger.js` with `logSubmission()` function
    - Implement JSON Lines format (one JSON object per line)
    - Implement `getStatistics()` for success rate calculation
    - Implement `rotateLogFile()` for 10MB size threshold
    - Add API key redaction in all log output
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4_
  
  - [x] 6.2 Implement statistics tracking
    - Calculate total submissions, successful/failed counts, success rate
    - Track last successful submission timestamp
    - Calculate average URL count per submission
    - Log warning when success rate falls below 90%
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 6.3 Write property tests for logging service
    - **Property 11: Comprehensive Error Logging**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Test that error logs include type, details, and timestamp
    - **Property 12: Submission Logging Completeness**
    - **Validates: Requirements 6.4, 6.5**
    - Test that logs include URL count, timestamp, success status, status code
    - **Property 13: Log File Format**
    - **Validates: Requirements 6.5**
    - Test that log entries are valid JSON on single lines
    - **Property 14: API Key Redaction**
    - **Validates: Requirements 7.4**
    - Test that API keys never appear in log output
    - **Property 16: Statistics Calculation Accuracy**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Test that statistics accurately reflect submission history
    - **Property 17: Success Rate Warning Threshold**
    - **Validates: Requirements 8.5**
    - Test that warnings are logged when success rate < 90%
  
  - [x] 6.4 Write unit tests for logging service
    - Test log file creation and writing
    - Test log rotation at 10MB threshold
    - Test statistics calculation with sample data
    - Test console fallback when file write fails
    - _Requirements: 6.5, 6.6, 8.1, 8.2, 8.3_

- [x] 7. Implement manual submission script
  - [x] 7.1 Create manual submission CLI script
    - Write `scripts/submit-indexnow.js` with command-line argument parsing
    - Implement `--file` flag for URL file input
    - Implement `--dry-run` flag for validation without submission
    - Implement `--all` flag to submit all site URLs
    - Implement `--help` flag for usage documentation
    - Add progress display during submission
    - Add detailed result output (status, URL count, errors)
    - Set exit code 0 for success, 1 for failure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 7.2 Write property tests for manual script
    - **Property 9: File Path Argument Parsing**
    - **Validates: Requirements 5.2**
    - Test that valid file paths are correctly parsed and read
    - **Property 10: Submission Result Display**
    - **Validates: Requirements 5.5**
    - Test that output includes success/failure status and HTTP code
  
  - [x] 7.3 Write unit tests for manual script
    - Test --file flag with sample URL file
    - Test --dry-run flag outputs without API call
    - Test --all flag collects all site URLs
    - Test --help flag displays usage
    - Test exit codes for success and failure scenarios
    - _Requirements: 5.3, 5.4, 5.6_

- [x] 8. Integrate with GitHub Actions deployment pipeline
  - [x] 8.1 Add IndexNow submission step to workflow
    - Modify `.github/workflows/s3-cloudfront-deploy.yml`
    - Add "Submit to IndexNow" step after CloudFront invalidation
    - Configure step to run `node scripts/submit-indexnow.js --all`
    - Set `continue-on-error: true` to prevent deployment blocking
    - Add environment variables: `INDEXNOW_API_KEY`, `SITE_DOMAIN`
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [x] 8.2 Configure GitHub Secrets
    - Document required secret: `INDEXNOW_API_KEY`
    - Add instructions for generating and storing API key
    - Document environment variable configuration
    - _Requirements: 7.1, 7.3_
  
  - [x] 8.3 Write integration tests for deployment pipeline
    - Test workflow executes submission step
    - Test deployment continues on submission failure
    - Test environment variables are correctly passed
    - _Requirements: 4.3, 4.4_

- [x] 9. Checkpoint - Ensure integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create validation and monitoring tools
  - [x] 10.1 Create API key validation script
    - Write `scripts/validate-indexnow-key.js` to verify key file accessibility
    - Test HTTPS access to key file via CloudFront
    - Verify Content-Type header is `text/plain; charset=utf-8`
    - Display validation results with clear success/failure messages
    - _Requirements: 1.4, 8.6_
  
  - [x] 10.2 Write unit tests for validation script
    - Test successful key file access
    - Test handling of 404 errors
    - Test Content-Type header verification
    - Mock HTTPS requests
    - _Requirements: 8.6_

- [x] 11. Create documentation and setup guide
  - [x] 11.1 Create README for IndexNow integration
    - Document setup steps (API key generation, GitHub Secrets)
    - Document manual submission usage
    - Document monitoring and troubleshooting
    - Include example commands and expected output
    - Document error codes and resolution steps
    - _Requirements: 5.1, 7.1, 7.3_
  
  - [x] 11.2 Add inline code documentation
    - Add JSDoc comments to all public functions
    - Document function parameters and return types
    - Add usage examples in function documentation
    - Document error conditions and exceptions

- [x] 12. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify no linting errors
  - Ensure all modules are properly integrated
  - Ask the user if questions arise before deployment

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses Node.js with native modules (crypto, fs, https)
- All HTTP requests use native `https` module (no external dependencies required)
- Log files use JSON Lines format for easy parsing and streaming
- API key must be generated before first deployment
- GitHub Secret `INDEXNOW_API_KEY` must be configured before automated submissions
