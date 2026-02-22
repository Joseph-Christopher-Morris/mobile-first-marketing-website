import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import the module under test
const submitScript = require('../scripts/submit-indexnow.js');
const { parseArguments, readUrlsFromFile, displayResults } = submitScript;

/**
 * Property-Based Tests for IndexNow Manual Submission Script
 * 
 * Feature: indexnow-submission
 * 
 * These property tests verify the core correctness properties of the
 * manual submission script across all valid inputs using fast-check.
 * 
 * Properties tested:
 * - Property 9: File Path Argument Parsing
 * - Property 10: Submission Result Display
 */

describe('Feature: indexnow-submission - Manual Script Property Tests', () => {
  const TEST_DIR = path.join(process.cwd(), 'tests', 'temp');
  
  beforeEach(async () => {
    // Create test directory
    try {
      await fs.mkdir(TEST_DIR, { recursive: true });
    } catch {
      // Directory already exists
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      const files = await fs.readdir(TEST_DIR);
      for (const file of files) {
        await fs.unlink(path.join(TEST_DIR, file));
      }
      await fs.rmdir(TEST_DIR);
    } catch {
      // Directory doesn't exist or cleanup failed
    }
  });

  describe('Property 9: File Path Argument Parsing', () => {
    it('should successfully read and parse valid file paths with newline-separated URLs', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      // **Validates: Requirements 5.2**
      
      const urlGen = fc.webUrl({ validSchemes: ['https'] });
      const urlListGen = fc.array(urlGen, { minLength: 1, maxLength: 50 });
      
      fc.assert(
        fc.asyncProperty(
          urlListGen,
          fc.string({ minLength: 5, maxLength: 20 }).filter(s => !s.includes('/') && !s.includes('\\')),
          async (urls, filename) => {
            // Create a test file with newline-separated URLs
            const filePath = path.join(TEST_DIR, `${filename}.txt`);
            const fileContent = urls.join('\n');
            await fs.writeFile(filePath, fileContent, 'utf-8');
            
            // Read URLs from file
            const readUrls = await readUrlsFromFile(filePath);
            
            // Should successfully parse all URLs
            expect(readUrls).toBeDefined();
            expect(Array.isArray(readUrls)).toBe(true);
            expect(readUrls.length).toBe(urls.length);
            
            // URLs should match the original list
            for (let i = 0; i < urls.length; i++) {
              expect(readUrls[i]).toBe(urls[i]);
            }
            
            // Clean up
            await fs.unlink(filePath);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle files with empty lines and comments', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      const urlGen = fc.webUrl({ validSchemes: ['https'] });
      const commentGen = fc.string({ minLength: 1, maxLength: 50 }).map(s => `# ${s}`);
      
      fc.assert(
        fc.asyncProperty(
          fc.array(urlGen, { minLength: 1, maxLength: 20 }),
          fc.array(commentGen, { minLength: 0, maxLength: 5 }),
          fc.nat({ max: 5 }),
          async (urls, comments, emptyLineCount) => {
            const filePath = path.join(TEST_DIR, 'test-with-comments.txt');
            
            try {
              // Interleave URLs with comments and empty lines
              const lines: string[] = [];
              for (const url of urls) {
                lines.push(url);
              }
              for (const comment of comments) {
                lines.push(comment);
              }
              for (let i = 0; i < emptyLineCount; i++) {
                lines.push('');
              }
              
              // Shuffle lines to mix URLs, comments, and empty lines
              const shuffled = lines.sort(() => Math.random() - 0.5);
              const fileContent = shuffled.join('\n');
              await fs.writeFile(filePath, fileContent, 'utf-8');
              
              // Read URLs from file
              const readUrls = await readUrlsFromFile(filePath);
              
              // Should only include actual URLs, not comments or empty lines
              expect(readUrls.length).toBe(urls.length);
              
              // All read URLs should be in the original URL list
              for (const readUrl of readUrls) {
                expect(urls).toContain(readUrl);
              }
            } finally {
              // Clean up
              try {
                await fs.unlink(filePath);
              } catch {
                // File may not exist
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle files with various line endings', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      const urlGen = fc.webUrl({ validSchemes: ['https'] });
      
      fc.assert(
        fc.asyncProperty(
          fc.array(urlGen, { minLength: 1, maxLength: 20 }),
          fc.constantFrom('\n', '\r\n', '\r'),
          async (urls, lineEnding) => {
            const filePath = path.join(TEST_DIR, 'test-line-endings.txt');
            
            try {
              const fileContent = urls.join(lineEnding);
              await fs.writeFile(filePath, fileContent, 'utf-8');
              
              // Read URLs from file
              const readUrls = await readUrlsFromFile(filePath);
              
              // Should successfully parse all URLs regardless of line ending
              expect(readUrls.length).toBe(urls.length);
            } finally {
              // Clean up
              try {
                await fs.unlink(filePath);
              } catch {
                // File may not exist
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle files with leading and trailing whitespace', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      const urlGen = fc.webUrl({ validSchemes: ['https'] });
      const whitespaceGen = fc.constantFrom(' ', '  ', '\t', '  \t  ');
      
      fc.assert(
        fc.asyncProperty(
          fc.array(urlGen, { minLength: 1, maxLength: 20 }),
          whitespaceGen,
          whitespaceGen,
          async (urls, leadingWs, trailingWs) => {
            const filePath = path.join(TEST_DIR, 'test-whitespace.txt');
            
            try {
              // Add whitespace around each URL
              const lines = urls.map(url => `${leadingWs}${url}${trailingWs}`);
              const fileContent = lines.join('\n');
              await fs.writeFile(filePath, fileContent, 'utf-8');
              
              // Read URLs from file
              const readUrls = await readUrlsFromFile(filePath);
              
              // Should trim whitespace and return clean URLs
              expect(readUrls.length).toBe(urls.length);
              for (let i = 0; i < urls.length; i++) {
                expect(readUrls[i]).toBe(urls[i]);
                expect(readUrls[i]).not.toMatch(/^\s/);
                expect(readUrls[i]).not.toMatch(/\s$/);
              }
            } finally {
              // Clean up
              try {
                await fs.unlink(filePath);
              } catch {
                // File may not exist
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error for non-existent file paths', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 30 }).filter(s => !s.includes('/') && !s.includes('\\')),
          async (filename) => {
            const nonExistentPath = path.join(TEST_DIR, `nonexistent-${filename}.txt`);
            
            // Should throw error for non-existent file
            await expect(readUrlsFromFile(nonExistentPath)).rejects.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty files', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 })
            .filter(s => !s.includes('/') && !s.includes('\\') && s.trim().length > 0),
          async (filename) => {
            const filePath = path.join(TEST_DIR, `${filename}.txt`);
            
            try {
              await fs.writeFile(filePath, '', 'utf-8');
              
              // Should return empty array for empty file
              const readUrls = await readUrlsFromFile(filePath);
              expect(readUrls).toEqual([]);
            } finally {
              // Clean up
              try {
                await fs.unlink(filePath);
              } catch {
                // File may not exist
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle files with only comments and empty lines', () => {
      // Feature: indexnow-submission, Property 9: File path argument parsing
      
      const commentGen = fc.string({ minLength: 1, maxLength: 50 }).map(s => `# ${s}`);
      
      fc.assert(
        fc.asyncProperty(
          fc.array(commentGen, { minLength: 1, maxLength: 10 }),
          fc.nat({ max: 5 }),
          async (comments, emptyLineCount) => {
            const filePath = path.join(TEST_DIR, 'test-only-comments.txt');
            
            try {
              const lines = [...comments];
              for (let i = 0; i < emptyLineCount; i++) {
                lines.push('');
              }
              
              const fileContent = lines.join('\n');
              await fs.writeFile(filePath, fileContent, 'utf-8');
              
              // Should return empty array when no URLs present
              const readUrls = await readUrlsFromFile(filePath);
              expect(readUrls).toEqual([]);
            } finally {
              // Clean up
              try {
                await fs.unlink(filePath);
              } catch {
                // File may not exist
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Submission Result Display', () => {
    it('should display success status and HTTP code for successful submissions', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      // **Validates: Requirements 5.5**
      
      const successStatusGen = fc.constantFrom(200, 202);
      const urlCountGen = fc.nat({ min: 1, max: 10000 });
      const durationGen = fc.nat({ min: 100, max: 60000 });
      
      fc.assert(
        fc.property(
          successStatusGen,
          urlCountGen,
          durationGen,
          (statusCode, urlCount, duration) => {
            // Capture console output
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            const result = {
              success: true,
              statusCode,
              urlCount,
              duration,
              timestamp: new Date().toISOString()
            };
            
            displayResults(result);
            
            // Verify output includes success status
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            expect(allOutput).toContain('SUCCESS');
            expect(allOutput).toContain(`${statusCode}`);
            expect(allOutput).toContain(`${urlCount}`);
            expect(allOutput).toContain(`${duration}`);
            
            // Verify success indicator is present
            expect(allOutput).toMatch(/✓|✔|SUCCESS/);
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display failure status and HTTP code for failed submissions', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      const failureStatusGen = fc.constantFrom(400, 403, 422, 429, 500, 502, 503);
      const urlCountGen = fc.nat({ min: 1, max: 10000 });
      const errorMessageGen = fc.string({ minLength: 10, maxLength: 100 });
      
      fc.assert(
        fc.property(
          failureStatusGen,
          urlCountGen,
          errorMessageGen,
          (statusCode, urlCount, errorMessage) => {
            // Capture console output
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            const result = {
              success: false,
              statusCode,
              urlCount,
              error: errorMessage,
              timestamp: new Date().toISOString()
            };
            
            displayResults(result);
            
            // Verify output includes failure status
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            expect(allOutput).toContain('FAILURE');
            expect(allOutput).toContain(`${statusCode}`);
            expect(allOutput).toContain(`${urlCount}`);
            expect(allOutput).toContain(errorMessage);
            
            // Verify failure indicator is present
            expect(allOutput).toMatch(/✗|✘|FAILURE/);
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display all required fields for any submission result', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      const submissionResultGen = fc.record({
        success: fc.boolean(),
        statusCode: fc.constantFrom(200, 202, 400, 403, 422, 429, 500),
        urlCount: fc.nat({ min: 1, max: 10000 }),
        duration: fc.option(fc.nat({ min: 100, max: 60000 }), { nil: undefined }),
        error: fc.option(
          fc.string({ minLength: 5, maxLength: 100 }),
          { nil: undefined }
        ),
        timestamp: fc.date().map(d => d.toISOString())
      });
      
      fc.assert(
        fc.property(
          submissionResultGen,
          (result) => {
            // Capture console output
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            displayResults(result);
            
            // Verify output includes all required fields
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            
            // Status (SUCCESS or FAILURE)
            expect(allOutput).toMatch(/SUCCESS|FAILURE/);
            
            // HTTP Status Code
            expect(allOutput).toContain(`${result.statusCode}`);
            
            // URL Count
            expect(allOutput).toContain(`${result.urlCount}`);
            
            // Error field should be present for failures
            if (!result.success && result.error) {
              // The word "Error" should appear in the output
              expect(allOutput).toMatch(/Error/i);
            }
            
            // Duration if present
            // Success always shows duration, failure only shows if truthy
            if (result.duration !== undefined) {
              if (result.success || result.duration > 0) {
                expect(allOutput).toContain(`${result.duration}`);
              }
            }
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle network errors with status code 0', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      const networkErrorGen = fc.constantFrom(
        'Connection refused',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'Network unreachable',
        'DNS resolution failed'
      );
      
      fc.assert(
        fc.property(
          networkErrorGen,
          fc.nat({ min: 1, max: 100 }),
          (errorMessage, urlCount) => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            const result = {
              success: false,
              statusCode: 0,
              urlCount,
              error: `Network error: ${errorMessage}`,
              timestamp: new Date().toISOString()
            };
            
            displayResults(result);
            
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            
            // Should display failure status
            expect(allOutput).toContain('FAILURE');
            
            // Should display status code (0 or N/A)
            expect(allOutput).toMatch(/0|N\/A/);
            
            // Should display error message
            expect(allOutput).toContain(errorMessage);
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format output consistently for all result types', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom(0, 200, 202, 400, 403, 422, 429, 500),
          fc.nat({ min: 1, max: 10000 }),
          (success, statusCode, urlCount) => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            const result = {
              success,
              statusCode,
              urlCount,
              error: success ? undefined : 'Error message',
              duration: 1000,
              timestamp: new Date().toISOString()
            };
            
            displayResults(result);
            
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            
            // Should have consistent structure
            expect(allOutput).toContain('Submission Results');
            expect(allOutput).toContain('Status:');
            expect(allOutput).toContain('HTTP Status Code:');
            expect(allOutput).toContain('URL');
            
            // Should use consistent formatting symbols
            const hasSymbols = /✓|✗|✔|✘/.test(allOutput);
            expect(hasSymbols).toBe(true);
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display duration when provided', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.nat({ min: 1, max: 60000 }), // Ensure duration is at least 1
          (success, duration) => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            const result = {
              success,
              statusCode: success ? 200 : 500,
              urlCount: 10,
              duration,
              error: success ? undefined : 'Error',
              timestamp: new Date().toISOString()
            };
            
            displayResults(result);
            
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            
            // Should display duration
            // For success: always displays duration
            // For failure: only displays if duration is truthy (not 0)
            if (success || duration > 0) {
              expect(allOutput).toContain(`${duration}`);
              expect(allOutput).toMatch(/Duration|duration|ms/i);
            }
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle missing optional fields gracefully', () => {
      // Feature: indexnow-submission, Property 10: Submission result display
      
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom(200, 400, 500),
          fc.nat({ min: 1, max: 100 }),
          (success, statusCode, urlCount) => {
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            
            // Result with minimal fields
            const result = {
              success,
              statusCode,
              urlCount,
              timestamp: new Date().toISOString()
            };
            
            // Should not throw error
            expect(() => displayResults(result)).not.toThrow();
            
            const allOutput = consoleLogSpy.mock.calls.map(call => call.join(' ')).join('\n');
            
            // Should still display required fields
            expect(allOutput).toMatch(/SUCCESS|FAILURE/);
            expect(allOutput).toContain(`${statusCode}`);
            expect(allOutput).toContain(`${urlCount}`);
            
            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests: Argument Parsing', () => {
    it('should parse --file argument correctly', () => {
      process.argv = ['node', 'script.js', '--file', 'urls.txt'];
      const args = parseArguments();
      
      expect(args.file).toBe('urls.txt');
      expect(args.all).toBe(false);
      expect(args.dryRun).toBe(false);
      expect(args.help).toBe(false);
    });

    it('should parse --all argument correctly', () => {
      process.argv = ['node', 'script.js', '--all'];
      const args = parseArguments();
      
      expect(args.file).toBe(null);
      expect(args.all).toBe(true);
      expect(args.dryRun).toBe(false);
      expect(args.help).toBe(false);
    });

    it('should parse --dry-run argument correctly', () => {
      process.argv = ['node', 'script.js', '--file', 'urls.txt', '--dry-run'];
      const args = parseArguments();
      
      expect(args.file).toBe('urls.txt');
      expect(args.dryRun).toBe(true);
    });

    it('should parse --help argument correctly', () => {
      process.argv = ['node', 'script.js', '--help'];
      const args = parseArguments();
      
      expect(args.help).toBe(true);
    });

    it('should parse short form arguments', () => {
      process.argv = ['node', 'script.js', '-f', 'urls.txt', '-d'];
      const args = parseArguments();
      
      expect(args.file).toBe('urls.txt');
      expect(args.dryRun).toBe(true);
    });

    it('should throw error for unknown arguments', () => {
      process.argv = ['node', 'script.js', '--unknown'];
      
      expect(() => parseArguments()).toThrow('Unknown argument');
    });

    it('should throw error for --file without path', () => {
      process.argv = ['node', 'script.js', '--file'];
      
      expect(() => parseArguments()).toThrow('--file requires a file path argument');
    });
  });
});
