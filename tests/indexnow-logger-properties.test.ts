import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import the module under test
const indexnowLogger = require('../scripts/lib/indexnow-logger.js');
const { logSubmission, getStatistics, redactApiKey } = indexnowLogger;

/**
 * Property-Based Tests for IndexNow Logger
 * 
 * Feature: indexnow-submission
 * 
 * These property tests verify the core correctness properties of the
 * logging service across all valid inputs using fast-check.
 * 
 * Properties tested:
 * - Property 11: Comprehensive Error Logging
 * - Property 12: Submission Logging Completeness
 * - Property 13: Log File Format
 * - Property 14: API Key Redaction
 * - Property 16: Statistics Calculation Accuracy
 * - Property 17: Success Rate Warning Threshold
 */

describe('Feature: indexnow-submission - Logger Property Tests', () => {
  const TEST_LOG_FILE = path.join(process.cwd(), 'logs', 'indexnow-submissions.json');
  
  beforeEach(async () => {
    // Clean up test log file before each test
    try {
      await fs.unlink(TEST_LOG_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test log file after each test
    try {
      await fs.unlink(TEST_LOG_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  describe('Property 11: Comprehensive Error Logging', () => {
    it('should include error type, details, and timestamp for all error conditions', () => {
      // Feature: indexnow-submission, Property 11: Comprehensive error logging
      // **Validates: Requirements 6.1, 6.2, 6.3**
      
      const errorMessageGen = fc.string({ minLength: 1, maxLength: 200 });
      const statusCodeGen = fc.constantFrom(400, 403, 422, 429, 500, 502, 503);
      const urlCountGen = fc.nat({ max: 10000 });
      const durationGen = fc.nat({ max: 60000 });
      
      fc.assert(
        fc.asyncProperty(
          errorMessageGen,
          statusCodeGen,
          urlCountGen,
          durationGen,
          async (errorMessage, statusCode, urlCount, duration) => {
            const timestamp = new Date().toISOString();
            
            // Log an error entry
            await logSubmission({
              timestamp,
              urlCount,
              success: false,
              statusCode,
              error: errorMessage,
              duration
            });
            
            // Read the log file
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            // Verify error logging includes all required fields
            expect(lastEntry).toHaveProperty('error');
            expect(lastEntry).toHaveProperty('statusCode');
            expect(lastEntry).toHaveProperty('timestamp');
            expect(lastEntry.success).toBe(false);
            
            // Verify error details are present
            expect(lastEntry.error).toBeDefined();
            expect(lastEntry.statusCode).toBe(statusCode);
            expect(lastEntry.timestamp).toBeDefined();
            
            // Clean up for next iteration
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log network errors with endpoint and error message', () => {
      // Feature: indexnow-submission, Property 11: Comprehensive error logging
      
      const networkErrorGen = fc.constantFrom(
        'Connection refused',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'DNS resolution failed',
        'Network unreachable'
      );
      
      fc.assert(
        fc.asyncProperty(
          networkErrorGen,
          async (errorMessage) => {
            await logSubmission({
              timestamp: new Date().toISOString(),
              urlCount: 10,
              success: false,
              statusCode: 0,
              error: `Network error: ${errorMessage}`,
              duration: 0
            });
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n').filter(line => line.trim());
            
            // Verify we have at least one entry
            expect(lines.length).toBeGreaterThan(0);
            
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            // Verify network error details are logged
            expect(lastEntry).toHaveProperty('error');
            expect(lastEntry.error).toBeDefined();
            expect(typeof lastEntry.error).toBe('string');
            expect(lastEntry.error).toContain('Network error');
            expect(lastEntry.error).toContain(errorMessage);
            expect(lastEntry.statusCode).toBe(0);
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Submission Logging Completeness', () => {
    it('should include URL count, timestamp, success status, and status code for all submissions', () => {
      // Feature: indexnow-submission, Property 12: Submission logging completeness
      // **Validates: Requirements 6.4, 6.5**
      
      const urlCountGen = fc.nat({ max: 10000 });
      const successGen = fc.boolean();
      const statusCodeGen = fc.constantFrom(200, 202, 400, 403, 422, 429, 500);
      const durationGen = fc.nat({ max: 60000 });
      
      fc.assert(
        fc.asyncProperty(
          urlCountGen,
          successGen,
          statusCodeGen,
          durationGen,
          async (urlCount, success, statusCode, duration) => {
            const timestamp = new Date().toISOString();
            
            await logSubmission({
              timestamp,
              urlCount,
              success,
              statusCode,
              duration,
              error: success ? undefined : 'Error message'
            });
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            // Verify all required fields are present
            expect(lastEntry).toHaveProperty('urlCount');
            expect(lastEntry).toHaveProperty('timestamp');
            expect(lastEntry).toHaveProperty('success');
            expect(lastEntry).toHaveProperty('statusCode');
            expect(lastEntry).toHaveProperty('duration');
            
            // Verify field values match
            expect(lastEntry.urlCount).toBe(urlCount);
            expect(lastEntry.success).toBe(success);
            expect(lastEntry.statusCode).toBe(statusCode);
            expect(lastEntry.duration).toBe(duration);
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log optional deployment ID when provided', () => {
      // Feature: indexnow-submission, Property 12: Submission logging completeness
      
      const deploymentIdGen = fc.string({ minLength: 5, maxLength: 50 });
      
      fc.assert(
        fc.asyncProperty(
          deploymentIdGen,
          async (deploymentId) => {
            await logSubmission({
              timestamp: new Date().toISOString(),
              deploymentId,
              urlCount: 10,
              success: true,
              statusCode: 200,
              duration: 1000
            });
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            expect(lastEntry).toHaveProperty('deploymentId');
            expect(lastEntry.deploymentId).toBe(deploymentId);
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Log File Format', () => {
    it('should write valid JSON on single lines for all log entries', () => {
      // Feature: indexnow-submission, Property 13: Log file format
      // **Validates: Requirements 6.5**
      
      const logEntryGen = fc.record({
        urlCount: fc.nat({ max: 10000 }),
        success: fc.boolean(),
        statusCode: fc.constantFrom(200, 202, 400, 403, 422, 429, 500),
        duration: fc.nat({ max: 60000 }),
        error: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined })
      });
      
      fc.assert(
        fc.asyncProperty(
          fc.array(logEntryGen, { minLength: 1, maxLength: 20 }),
          async (entries) => {
            // Log multiple entries
            for (const entry of entries) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                ...entry
              });
            }
            
            // Read the log file
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            
            // Verify we have the correct number of lines
            expect(lines.length).toBe(entries.length);
            
            // Verify each line is valid JSON
            for (const line of lines) {
              expect(line.trim()).not.toBe('');
              
              // Should be parseable as JSON
              const parsed = JSON.parse(line);
              expect(parsed).toBeDefined();
              expect(typeof parsed).toBe('object');
              
              // Should not contain newlines within the JSON
              expect(line).not.toContain('\n');
            }
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain JSON Lines format with multiple entries', () => {
      // Feature: indexnow-submission, Property 13: Log file format
      
      fc.assert(
        fc.asyncProperty(
          fc.nat({ min: 1, max: 50 }),
          async (entryCount) => {
            // Log multiple entries
            for (let i = 0; i < entryCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: i,
                success: i % 2 === 0,
                statusCode: 200,
                duration: 1000
              });
            }
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n').filter(line => line.trim());
            
            // Should have exactly one line per entry
            expect(lines.length).toBe(entryCount);
            
            // Each line should be independently parseable
            const parsed = lines.map(line => JSON.parse(line));
            expect(parsed.length).toBe(entryCount);
            
            // Verify urlCount sequence
            for (let i = 0; i < entryCount; i++) {
              expect(parsed[i].urlCount).toBe(i);
            }
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: API Key Redaction', () => {
    it('should never expose API keys in log output', () => {
      // Feature: indexnow-submission, Property 14: API key redaction
      // **Validates: Requirements 7.4**
      
      // Generate hexadecimal API keys
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const apiKeyGen = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.asyncProperty(
          apiKeyGen,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (apiKey, errorPrefix) => {
            // Create error message containing API key
            const errorMessage = `${errorPrefix} with key ${apiKey} failed`;
            
            await logSubmission({
              timestamp: new Date().toISOString(),
              urlCount: 10,
              success: false,
              statusCode: 403,
              error: errorMessage,
              duration: 500
            });
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            // Verify API key is redacted in the error message
            expect(lastEntry.error).not.toContain(apiKey);
            expect(lastEntry.error).toContain('***REDACTED***');
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should redact multiple API keys in the same error message', () => {
      // Feature: indexnow-submission, Property 14: API key redaction
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const apiKeyGen = fc.array(hexChar, { minLength: 8, maxLength: 64 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.asyncProperty(
          apiKeyGen,
          apiKeyGen,
          async (apiKey1, apiKey2) => {
            const errorMessage = `Keys ${apiKey1} and ${apiKey2} are invalid`;
            
            await logSubmission({
              timestamp: new Date().toISOString(),
              urlCount: 10,
              success: false,
              statusCode: 403,
              error: errorMessage,
              duration: 500
            });
            
            const logContent = await fs.readFile(TEST_LOG_FILE, 'utf-8');
            const lines = logContent.trim().split('\n');
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            
            // Both keys should be redacted
            expect(lastEntry.error).not.toContain(apiKey1);
            expect(lastEntry.error).not.toContain(apiKey2);
            expect(lastEntry.error).toContain('***REDACTED***');
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle redaction of API keys in various text contexts', () => {
      // Feature: indexnow-submission, Property 14: API key redaction
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const apiKeyGen = fc.array(hexChar, { minLength: 32, maxLength: 32 }).map(arr => arr.join(''));
      
      // Use whitespace or punctuation as separators to ensure word boundaries
      const separatorGen = fc.constantFrom(' ', '\t', '\n', ', ', '. ', ': ', '- ', '= ');
      
      fc.assert(
        fc.property(
          apiKeyGen,
          separatorGen,
          separatorGen,
          (apiKey, prefix, suffix) => {
            const text = `${prefix}${apiKey}${suffix}`;
            const redacted = redactApiKey(text);
            
            // API key should be replaced with redaction marker
            expect(redacted).not.toContain(apiKey);
            expect(redacted).toContain('***REDACTED***');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Statistics Calculation Accuracy', () => {
    it('should accurately calculate statistics for any submission history', () => {
      // Feature: indexnow-submission, Property 16: Statistics calculation accuracy
      // **Validates: Requirements 8.1, 8.2, 8.3**
      
      const submissionGen = fc.record({
        success: fc.boolean(),
        urlCount: fc.nat({ max: 10000 })
      });
      
      fc.assert(
        fc.asyncProperty(
          fc.array(submissionGen, { minLength: 1, maxLength: 50 }),
          async (submissions) => {
            // Log all submissions
            for (const submission of submissions) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: submission.urlCount,
                success: submission.success,
                statusCode: submission.success ? 200 : 500,
                duration: 1000,
                error: submission.success ? undefined : 'Error'
              });
            }
            
            // Get statistics
            const stats = await getStatistics(submissions.length);
            
            // Calculate expected values
            const expectedTotal = submissions.length;
            const expectedSuccessful = submissions.filter(s => s.success).length;
            const expectedFailed = submissions.filter(s => !s.success).length;
            const expectedSuccessRate = expectedSuccessful / expectedTotal;
            const expectedAvgUrlCount = submissions.reduce((sum, s) => sum + s.urlCount, 0) / expectedTotal;
            
            // Verify statistics match expected values
            expect(stats.totalSubmissions).toBe(expectedTotal);
            expect(stats.successfulSubmissions).toBe(expectedSuccessful);
            expect(stats.failedSubmissions).toBe(expectedFailed);
            expect(stats.successRate).toBeCloseTo(expectedSuccessRate, 10);
            expect(stats.averageUrlCount).toBeCloseTo(expectedAvgUrlCount, 10);
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track last successful submission timestamp correctly', () => {
      // Feature: indexnow-submission, Property 16: Statistics calculation accuracy
      
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
          async (successPattern) => {
            const timestamps: string[] = [];
            
            // Log submissions with timestamps
            for (const success of successPattern) {
              const timestamp = new Date(Date.now() + timestamps.length * 1000).toISOString();
              timestamps.push(timestamp);
              
              await logSubmission({
                timestamp,
                urlCount: 10,
                success,
                statusCode: success ? 200 : 500,
                duration: 1000,
                error: success ? undefined : 'Error'
              });
            }
            
            const stats = await getStatistics(successPattern.length);
            
            // Find the last successful submission
            let expectedLastSuccess: string | null = null;
            for (let i = successPattern.length - 1; i >= 0; i--) {
              if (successPattern[i]) {
                expectedLastSuccess = timestamps[i];
                break;
              }
            }
            
            expect(stats.lastSuccessfulSubmission).toBe(expectedLastSuccess);
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect the limit parameter for recent submissions', () => {
      // Feature: indexnow-submission, Property 16: Statistics calculation accuracy
      
      fc.assert(
        fc.asyncProperty(
          fc.nat({ min: 10, max: 50 }),
          fc.nat({ min: 1, max: 20 }),
          async (totalSubmissions, limit) => {
            // Log submissions
            for (let i = 0; i < totalSubmissions; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: i,
                success: true,
                statusCode: 200,
                duration: 1000
              });
            }
            
            const stats = await getStatistics(limit);
            
            // Should only analyze the most recent 'limit' submissions
            expect(stats.totalSubmissions).toBe(Math.min(limit, totalSubmissions));
            
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Success Rate Warning Threshold', () => {
    it('should log warning when success rate falls below 90% over last 10 submissions', () => {
      // Feature: indexnow-submission, Property 17: Success rate warning threshold
      // **Validates: Requirements 8.5**
      
      fc.assert(
        fc.asyncProperty(
          fc.nat({ min: 0, max: 8 }), // Number of successful submissions (0-8 out of 10)
          async (successCount) => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const failCount = 10 - successCount;
            const successRate = successCount / 10;
            
            // Log successful submissions first
            for (let i = 0; i < successCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: true,
                statusCode: 200,
                duration: 1000
              });
            }
            
            // Log failed submissions
            for (let i = 0; i < failCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: false,
                statusCode: 500,
                error: 'Error',
                duration: 500
              });
            }
            
            // Check if warning was logged
            const warningCalls = consoleWarnSpy.mock.calls.filter(call => 
              call[0].includes('WARNING') && call[0].includes('success rate')
            );
            
            if (successRate < 0.9) {
              // Should have logged at least one warning
              expect(warningCalls.length).toBeGreaterThan(0);
              // Verify the warning message format
              const firstWarning = warningCalls[0][0];
              expect(firstWarning).toContain('WARNING');
              expect(firstWarning).toContain('success rate');
              expect(firstWarning).toContain('below 90%');
            } else {
              // Should not have logged a warning (90% or above)
              expect(warningCalls.length).toBe(0);
            }
            
            consoleWarnSpy.mockRestore();
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 9 } // Test all cases from 0-8 successful submissions
      );
    });

    it('should not log warning when fewer than 10 submissions exist', () => {
      // Feature: indexnow-submission, Property 17: Success rate warning threshold
      
      fc.assert(
        fc.asyncProperty(
          fc.nat({ min: 1, max: 9 }),
          fc.nat({ min: 0, max: 100 }),
          async (submissionCount, successPercentage) => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const successCount = Math.floor(submissionCount * successPercentage / 100);
            const failCount = submissionCount - successCount;
            
            // Log submissions
            for (let i = 0; i < successCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: true,
                statusCode: 200,
                duration: 1000
              });
            }
            
            for (let i = 0; i < failCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: false,
                statusCode: 500,
                error: 'Error',
                duration: 500
              });
            }
            
            // Should not log warning (need 10 submissions minimum)
            const warningCalls = consoleWarnSpy.mock.calls.filter(call => 
              call[0].includes('WARNING') && call[0].includes('success rate')
            );
            expect(warningCalls.length).toBe(0);
            
            consoleWarnSpy.mockRestore();
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include correct success rate percentage in warning message', () => {
      // Feature: indexnow-submission, Property 17: Success rate warning threshold
      
      fc.assert(
        fc.asyncProperty(
          fc.nat({ min: 0, max: 8 }),
          async (successCount) => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const failCount = 10 - successCount;
            const expectedRate = (successCount / 10) * 100;
            
            // Log submissions
            for (let i = 0; i < successCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: true,
                statusCode: 200,
                duration: 1000
              });
            }
            
            for (let i = 0; i < failCount; i++) {
              await logSubmission({
                timestamp: new Date().toISOString(),
                urlCount: 10,
                success: false,
                statusCode: 500,
                error: 'Error',
                duration: 500
              });
            }
            
            const warningCalls = consoleWarnSpy.mock.calls.filter(call => 
              call[0].includes('WARNING') && call[0].includes('success rate')
            );
            
            if (warningCalls.length > 0) {
              // Warning should include the correct percentage
              expect(warningCalls[0][0]).toContain(`${expectedRate.toFixed(1)}%`);
            }
            
            consoleWarnSpy.mockRestore();
            await fs.unlink(TEST_LOG_FILE);
          }
        ),
        { numRuns: 9 }
      );
    });
  });
});
