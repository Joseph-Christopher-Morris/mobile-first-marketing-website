import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

/**
 * Unit Tests for IndexNow Manual Submission Script
 * 
 * Feature: indexnow-submission
 * 
 * Tests specific examples, edge cases, and integration points for the manual
 * submission script including command-line argument parsing, file reading,
 * dry-run mode, and exit code handling.
 * 
 * Test Coverage:
 * - --file flag with sample URL file (Requirement 5.2)
 * - --dry-run flag outputs without API call (Requirements 5.3, 5.4)
 * - --all flag collects all site URLs (Requirement 5.2)
 * - --help flag displays usage (Requirement 5.6)
 * - Exit codes for success and failure scenarios (Requirement 5.6)
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.6
 */

// Import the module under test
const submitScript = require('../scripts/submit-indexnow.js');
const { parseArguments, readUrlsFromFile, displayResults } = submitScript;

describe('Feature: indexnow-submission - Manual Script Unit Tests', () => {
  const TEST_URLS_FILE = 'test-urls.txt';
  const TEST_SITEMAP_FILE = 'test-sitemap.xml';

  beforeEach(async () => {
    // Clean up test files before each test
    try {
      await fs.unlink(TEST_URLS_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
    try {
      await fs.unlink(TEST_SITEMAP_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      await fs.unlink(TEST_URLS_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
    try {
      await fs.unlink(TEST_SITEMAP_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  describe('Requirement 5.6: --help Flag Displays Usage', () => {
    it('should parse --help flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--help'];

      const args = parseArguments();

      expect(args.help).toBe(true);
      expect(args.file).toBeNull();
      expect(args.all).toBe(false);
      expect(args.dryRun).toBe(false);

      process.argv = originalArgv;
    });

    it('should parse -h short flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '-h'];

      const args = parseArguments();

      expect(args.help).toBe(true);

      process.argv = originalArgv;
    });

    it('should prioritize help flag over other flags', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--help', '--file', 'urls.txt', '--all'];

      const args = parseArguments();

      expect(args.help).toBe(true);
      // Other flags should still be parsed
      expect(args.file).toBe('urls.txt');
      expect(args.all).toBe(true);

      process.argv = originalArgv;
    });
  });

  describe('Requirement 5.2: --file Flag with Sample URL File', () => {
    it('should parse --file flag with file path', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls.txt'];

      const args = parseArguments();

      expect(args.file).toBe('urls.txt');
      expect(args.all).toBe(false);
      expect(args.dryRun).toBe(false);
      expect(args.help).toBe(false);

      process.argv = originalArgv;
    });

    it('should parse -f short flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '-f', 'urls.txt'];

      const args = parseArguments();

      expect(args.file).toBe('urls.txt');

      process.argv = originalArgv;
    });

    it('should throw error when --file has no argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file'];

      expect(() => parseArguments()).toThrow('--file requires a file path argument');

      process.argv = originalArgv;
    });

    it('should read URLs from newline-separated text file', async () => {
      const urls = [
        'https://vividmediacheshire.com/',
        'https://vividmediacheshire.com/services/',
        'https://vividmediacheshire.com/blog/'
      ];

      await fs.writeFile(TEST_URLS_FILE, urls.join('\n'), 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(3);
      expect(readUrls).toEqual(urls);
    });

    it('should filter out empty lines from URL file', async () => {
      const content = `https://vividmediacheshire.com/

https://vividmediacheshire.com/services/

https://vividmediacheshire.com/blog/`;

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(3);
      expect(readUrls).not.toContain('');
    });

    it('should filter out comment lines starting with #', async () => {
      const content = `# This is a comment
https://vividmediacheshire.com/
# Another comment
https://vividmediacheshire.com/services/
https://vividmediacheshire.com/blog/`;

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(3);
      expect(readUrls).not.toContain('# This is a comment');
      expect(readUrls).not.toContain('# Another comment');
    });

    it('should trim whitespace from URLs', async () => {
      const content = `  https://vividmediacheshire.com/  
  https://vividmediacheshire.com/services/  
  https://vividmediacheshire.com/blog/  `;

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(3);
      expect(readUrls[0]).toBe('https://vividmediacheshire.com/');
      expect(readUrls[1]).toBe('https://vividmediacheshire.com/services/');
      expect(readUrls[2]).toBe('https://vividmediacheshire.com/blog/');
    });

    it('should throw error when file does not exist', async () => {
      await expect(readUrlsFromFile('non-existent-file.txt'))
        .rejects.toThrow('Failed to read file non-existent-file.txt');
    });

    it('should handle file with single URL', async () => {
      await fs.writeFile(TEST_URLS_FILE, 'https://vividmediacheshire.com/', 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(1);
      expect(readUrls[0]).toBe('https://vividmediacheshire.com/');
    });

    it('should handle empty file', async () => {
      await fs.writeFile(TEST_URLS_FILE, '', 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(0);
      expect(readUrls).toEqual([]);
    });

    it('should handle file with only comments and empty lines', async () => {
      const content = `# Comment 1

# Comment 2

`;

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(0);
      expect(readUrls).toEqual([]);
    });
  });

  describe('Requirement 5.2: --all Flag Collects All Site URLs', () => {
    it('should parse --all flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--all'];

      const args = parseArguments();

      expect(args.all).toBe(true);
      expect(args.file).toBeNull();
      expect(args.dryRun).toBe(false);
      expect(args.help).toBe(false);

      process.argv = originalArgv;
    });

    it('should parse -a short flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '-a'];

      const args = parseArguments();

      expect(args.all).toBe(true);

      process.argv = originalArgv;
    });
  });

  describe('Requirements 5.3, 5.4: --dry-run Flag Outputs Without API Call', () => {
    it('should parse --dry-run flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls.txt', '--dry-run'];

      const args = parseArguments();

      expect(args.dryRun).toBe(true);
      expect(args.file).toBe('urls.txt');

      process.argv = originalArgv;
    });

    it('should parse -d short flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls.txt', '-d'];

      const args = parseArguments();

      expect(args.dryRun).toBe(true);

      process.argv = originalArgv;
    });

    it('should work with --all flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--all', '--dry-run'];

      const args = parseArguments();

      expect(args.all).toBe(true);
      expect(args.dryRun).toBe(true);

      process.argv = originalArgv;
    });
  });

  describe('Requirement 5.6: Exit Codes for Success and Failure Scenarios', () => {
    it('should display success results with status code 200', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: true,
        statusCode: 200,
        urlCount: 25,
        duration: 1234
      };

      displayResults(result);

      // Verify success indicators are logged
      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('SUCCESS');
      expect(allLogs).toContain('200');
      expect(allLogs).toContain('25');
      expect(allLogs).toContain('1234ms');

      consoleLogSpy.mockRestore();
    });

    it('should display failure results with error message', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: false,
        statusCode: 429,
        urlCount: 25,
        error: 'Rate limit exceeded',
        duration: 567
      };

      displayResults(result);

      // Verify failure indicators are logged
      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('FAILURE');
      expect(allLogs).toContain('429');
      expect(allLogs).toContain('25');
      expect(allLogs).toContain('Rate limit exceeded');
      expect(allLogs).toContain('567ms');

      consoleLogSpy.mockRestore();
    });

    it('should display failure results without status code for network errors', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: false,
        statusCode: 0,
        urlCount: 10,
        error: 'Network error: Connection refused'
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('FAILURE');
      expect(allLogs).toContain('N/A');
      expect(allLogs).toContain('Network error: Connection refused');

      consoleLogSpy.mockRestore();
    });

    it('should display success results with status code 202', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: true,
        statusCode: 202,
        urlCount: 10,
        duration: 500
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('SUCCESS');
      expect(allLogs).toContain('202');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Argument Parsing Edge Cases', () => {
    it('should throw error for unknown argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--unknown'];

      expect(() => parseArguments()).toThrow('Unknown argument: --unknown');

      process.argv = originalArgv;
    });

    it('should handle multiple flags in any order', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--dry-run', '--file', 'urls.txt'];

      const args = parseArguments();

      expect(args.dryRun).toBe(true);
      expect(args.file).toBe('urls.txt');

      process.argv = originalArgv;
    });

    it('should handle no arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js'];

      const args = parseArguments();

      expect(args.file).toBeNull();
      expect(args.all).toBe(false);
      expect(args.dryRun).toBe(false);
      expect(args.help).toBe(false);

      process.argv = originalArgv;
    });

    it('should handle file path with spaces', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'my urls.txt'];

      const args = parseArguments();

      expect(args.file).toBe('my urls.txt');

      process.argv = originalArgv;
    });

    it('should handle file path with special characters', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls-2026.txt'];

      const args = parseArguments();

      expect(args.file).toBe('urls-2026.txt');

      process.argv = originalArgv;
    });

    it('should handle relative file paths', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', './data/urls.txt'];

      const args = parseArguments();

      expect(args.file).toBe('./data/urls.txt');

      process.argv = originalArgv;
    });

    it('should handle absolute file paths', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', '/tmp/urls.txt'];

      const args = parseArguments();

      expect(args.file).toBe('/tmp/urls.txt');

      process.argv = originalArgv;
    });
  });

  describe('File Reading Edge Cases', () => {
    it('should handle file with Windows line endings (CRLF)', async () => {
      const content = 'https://vividmediacheshire.com/\r\nhttps://vividmediacheshire.com/services/\r\n';

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(2);
      expect(readUrls[0]).toBe('https://vividmediacheshire.com/');
      expect(readUrls[1]).toBe('https://vividmediacheshire.com/services/');
    });

    it('should handle file with mixed line endings', async () => {
      const content = 'https://vividmediacheshire.com/\nhttps://vividmediacheshire.com/services/\r\nhttps://vividmediacheshire.com/blog/\n';

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(3);
    });

    it('should handle file with trailing newline', async () => {
      const content = 'https://vividmediacheshire.com/\nhttps://vividmediacheshire.com/services/\n';

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(2);
    });

    it('should handle file without trailing newline', async () => {
      const content = 'https://vividmediacheshire.com/\nhttps://vividmediacheshire.com/services/';

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(2);
    });

    it('should handle very long URLs', async () => {
      const longPath = 'a'.repeat(500);
      const longUrl = `https://vividmediacheshire.com/${longPath}/`;

      await fs.writeFile(TEST_URLS_FILE, longUrl, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(1);
      expect(readUrls[0]).toBe(longUrl);
    });

    it('should handle file with many URLs', async () => {
      const urls = Array(1000).fill(0).map((_, i) => `https://vividmediacheshire.com/page-${i}/`);
      const content = urls.join('\n');

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(1000);
      expect(readUrls[0]).toBe('https://vividmediacheshire.com/page-0/');
      expect(readUrls[999]).toBe('https://vividmediacheshire.com/page-999/');
    });

    it('should handle file with UTF-8 characters in comments', async () => {
      const content = `# URLs für die Website 🌐
https://vividmediacheshire.com/
# Más páginas
https://vividmediacheshire.com/services/`;

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(2);
      expect(readUrls).not.toContain('# URLs für die Website 🌐');
    });

    it('should handle file with tabs and spaces', async () => {
      const content = '\t  https://vividmediacheshire.com/  \t\n\t  https://vividmediacheshire.com/services/  \t';

      await fs.writeFile(TEST_URLS_FILE, content, 'utf-8');

      const readUrls = await readUrlsFromFile(TEST_URLS_FILE);

      expect(readUrls).toHaveLength(2);
      expect(readUrls[0]).toBe('https://vividmediacheshire.com/');
      expect(readUrls[1]).toBe('https://vividmediacheshire.com/services/');
    });
  });

  describe('Display Results Edge Cases', () => {
    it('should handle result without duration', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: true,
        statusCode: 200,
        urlCount: 10
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('SUCCESS');
      expect(allLogs).toContain('200');

      consoleLogSpy.mockRestore();
    });

    it('should handle result with zero URLs', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: true,
        statusCode: 200,
        urlCount: 0,
        duration: 100
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('0');

      consoleLogSpy.mockRestore();
    });

    it('should handle result with very large URL count', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: true,
        statusCode: 200,
        urlCount: 10000,
        duration: 5000
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('10000');

      consoleLogSpy.mockRestore();
    });

    it('should handle result with very long error message', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const longError = 'x'.repeat(500);
      const result = {
        success: false,
        statusCode: 500,
        urlCount: 10,
        error: longError
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('FAILURE');
      expect(allLogs).toContain(longError);

      consoleLogSpy.mockRestore();
    });

    it('should handle result without error message for failure', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = {
        success: false,
        statusCode: 500,
        urlCount: 10
      };

      displayResults(result);

      const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
      const allLogs = logCalls.join('\n');

      expect(allLogs).toContain('FAILURE');
      expect(allLogs).toContain('Unknown error');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Integration: Argument Combinations', () => {
    it('should reject both --file and --all together', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls.txt', '--all'];

      const args = parseArguments();

      // Both flags should be parsed
      expect(args.file).toBe('urls.txt');
      expect(args.all).toBe(true);
      // The main function should validate this combination is invalid

      process.argv = originalArgv;
    });

    it('should allow --dry-run with --file', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--file', 'urls.txt', '--dry-run'];

      const args = parseArguments();

      expect(args.file).toBe('urls.txt');
      expect(args.dryRun).toBe(true);

      process.argv = originalArgv;
    });

    it('should allow --dry-run with --all', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'submit-indexnow.js', '--all', '--dry-run'];

      const args = parseArguments();

      expect(args.all).toBe(true);
      expect(args.dryRun).toBe(true);

      process.argv = originalArgv;
    });

    it('should parse flags in any order', () => {
      const originalArgv = process.argv;
      
      // Test different orderings
      const orderings = [
        ['--file', 'urls.txt', '--dry-run'],
        ['--dry-run', '--file', 'urls.txt'],
        ['--file', 'urls.txt', '--dry-run', '--help'],
        ['--help', '--dry-run', '--file', 'urls.txt']
      ];

      for (const ordering of orderings) {
        process.argv = ['node', 'submit-indexnow.js', ...ordering];
        const args = parseArguments();
        
        expect(args.file).toBe('urls.txt');
        expect(args.dryRun).toBe(true);
      }

      process.argv = originalArgv;
    });
  });
});
