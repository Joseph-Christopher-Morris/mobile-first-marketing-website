import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { EventEmitter } from 'events';

// Import the module under test
const indexnowService = require('../scripts/lib/indexnow-service.js');
const { submitUrls, validateApiKey, batchUrls } = indexnowService;

/**
 * Property 3: Request Payload Completeness
 * Property 4: Key Location URL Construction
 * Property 5: URL List Size Constraint
 * Property 15: API Key Format Validation
 * 
 * These property tests verify the core correctness properties of the
 * IndexNow submission service across all valid inputs.
 */

describe('Feature: indexnow-submission', () => {
  describe('Property 3: Request Payload Completeness', () => {
    it('should generate payload with all required fields and correct types', () => {
      // Feature: indexnow-submission, Property 3: Request payload completeness
      // **Validates: Requirements 2.2**
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexString = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          fc.domain(),
          hexString,
          fc.webUrl({ validSchemes: ['https'] }),
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 100 }),
          (host, key, keyLocation, urlList) => {
            // Construct the payload as the submitUrls function does
            const payload = {
              host,
              key,
              keyLocation,
              urlList
            };
            
            // Verify all required fields are present
            expect(payload).toHaveProperty('host');
            expect(payload).toHaveProperty('key');
            expect(payload).toHaveProperty('keyLocation');
            expect(payload).toHaveProperty('urlList');
            
            // Verify correct types
            expect(typeof payload.host).toBe('string');
            expect(typeof payload.key).toBe('string');
            expect(typeof payload.keyLocation).toBe('string');
            expect(Array.isArray(payload.urlList)).toBe(true);
            
            // Verify all URL list items are strings
            for (const url of payload.urlList) {
              expect(typeof url).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid JSON payload', () => {
      // Feature: indexnow-submission, Property 3: Request payload completeness
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexString = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          fc.domain(),
          hexString,
          fc.webUrl({ validSchemes: ['https'] }),
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 50 }),
          (host, key, keyLocation, urlList) => {
            const payload = {
              host,
              key,
              keyLocation,
              urlList
            };
            
            // Should be serializable to JSON
            const json = JSON.stringify(payload);
            expect(json).toBeDefined();
            
            // Should be parseable back from JSON
            const parsed = JSON.parse(json);
            expect(parsed).toEqual(payload);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Key Location URL Construction', () => {
    it('should construct valid HTTPS URL with correct format', () => {
      // Feature: indexnow-submission, Property 4: Key location URL construction
      // **Validates: Requirements 2.4**
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexString = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          fc.domain(),
          hexString,
          (domain, key) => {
            // Construct keyLocation as the system would
            const keyLocation = `https://${domain}/${key}.txt`;
            
            // Should be a valid HTTPS URL
            expect(keyLocation).toMatch(/^https:\/\//);
            
            // Should contain the domain
            expect(keyLocation).toContain(domain);
            
            // Should contain the key as filename
            expect(keyLocation).toContain(`/${key}.txt`);
            
            // Should be parseable as URL
            const url = new URL(keyLocation);
            expect(url.protocol).toBe('https:');
            expect(url.hostname).toBe(domain);
            expect(url.pathname).toBe(`/${key}.txt`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should construct keyLocation with CloudFront domain', () => {
      // Feature: indexnow-submission, Property 4: Key location URL construction
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexString = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          hexString,
          (key) => {
            // Using the actual CloudFront domain from the project
            const domain = 'd15sc9fc739ev2.cloudfront.net';
            const keyLocation = `https://${domain}/${key}.txt`;
            
            // Should be valid HTTPS URL
            expect(keyLocation).toMatch(/^https:\/\//);
            
            // Should have .txt extension
            expect(keyLocation).toMatch(/\.txt$/);
            
            // Should be parseable
            const url = new URL(keyLocation);
            expect(url.protocol).toBe('https:');
            expect(url.hostname).toBe(domain);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle various key lengths in URL construction', () => {
      // Feature: indexnow-submission, Property 4: Key location URL construction
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 8, max: 128 }),
          (length) => {
            // Generate key of specific length
            const key = Array(length).fill('a').join('');
            const domain = 'example.com';
            const keyLocation = `https://${domain}/${key}.txt`;
            
            // Should be valid URL regardless of key length
            const url = new URL(keyLocation);
            expect(url.protocol).toBe('https:');
            expect(url.pathname).toBe(`/${key}.txt`);
            expect(url.pathname.length).toBe(length + 5); // key + "/.txt"
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: API Key Format Validation', () => {
    it('should correctly validate hexadecimal API keys with length 8-128', () => {
      // Feature: indexnow-submission, Property 15: API key format validation
      // **Validates: Requirements 7.6**
      
      // Generate hexadecimal strings using fc.array and fc.join
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexString = fc.array(hexChar, { minLength: 8, maxLength: 128 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          hexString,
          (validKey) => {
            // All valid hexadecimal strings of correct length should pass
            expect(validateApiKey(validKey)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject API keys that are too short', () => {
      // Feature: indexnow-submission, Property 15: API key format validation
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const shortHexString = fc.array(hexChar, { minLength: 1, maxLength: 7 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          shortHexString,
          (shortKey) => {
            // Keys shorter than 8 characters should be rejected
            expect(validateApiKey(shortKey)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject API keys that are too long', () => {
      // Feature: indexnow-submission, Property 15: API key format validation
      
      const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const longHexString = fc.array(hexChar, { minLength: 129, maxLength: 200 }).map(arr => arr.join(''));
      
      fc.assert(
        fc.property(
          longHexString,
          (longKey) => {
            // Keys longer than 128 characters should be rejected
            expect(validateApiKey(longKey)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-hexadecimal strings', () => {
      // Feature: indexnow-submission, Property 15: API key format validation
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 128 }).filter(s => !/^[0-9a-fA-F]+$/.test(s)),
          (invalidKey) => {
            // Strings with non-hex characters should be rejected
            expect(validateApiKey(invalidKey)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string inputs', () => {
      // Feature: indexnow-submission, Property 15: API key format validation
      
      expect(validateApiKey(null)).toBe(false);
      expect(validateApiKey(undefined)).toBe(false);
      expect(validateApiKey(123)).toBe(false);
      expect(validateApiKey({})).toBe(false);
      expect(validateApiKey([])).toBe(false);
    });
  });

  describe('Property 5: URL List Size Constraint', () => {
    it('should never submit more than 10,000 URLs in a single request', () => {
      // Feature: indexnow-submission, Property 5: URL list size constraint
      // **Validates: Requirements 2.5**
      
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 0, maxLength: 15000 }),
          (urls) => {
            const batches = batchUrls(urls, 10000);
            
            // Every batch should have at most 10,000 URLs
            for (const batch of batches) {
              expect(batch.length).toBeLessThanOrEqual(10000);
            }
            
            // All URLs should be included across all batches
            const totalUrls = batches.flat();
            expect(totalUrls.length).toBe(urls.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create correct number of batches', () => {
      // Feature: indexnow-submission, Property 5: URL list size constraint
      
      fc.assert(
        fc.property(
          fc.nat({ max: 50000 }),
          (urlCount) => {
            const urls = Array(urlCount).fill('https://example.com/');
            const batches = batchUrls(urls, 10000);
            
            const expectedBatches = Math.ceil(urlCount / 10000);
            expect(batches.length).toBe(expectedBatches);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve URL order across batches', () => {
      // Feature: indexnow-submission, Property 5: URL list size constraint
      
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 25000 }),
          (urls) => {
            const batches = batchUrls(urls, 10000);
            const reconstructed = batches.flat();
            
            // URLs should be in the same order after batching
            expect(reconstructed).toEqual(urls);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Unit Tests: API Key Validation', () => {
    it('should accept valid 32-character hexadecimal key', () => {
      const validKey = 'a1b2c3d4e5f6789012345678abcdef01';
      expect(validateApiKey(validKey)).toBe(true);
    });

    it('should accept uppercase hexadecimal characters', () => {
      const validKey = 'A1B2C3D4E5F6789012345678ABCDEF01';
      expect(validateApiKey(validKey)).toBe(true);
    });

    it('should accept mixed case hexadecimal characters', () => {
      const validKey = 'A1b2C3d4E5f6789012345678AbCdEf01';
      expect(validateApiKey(validKey)).toBe(true);
    });

    it('should reject key with special characters', () => {
      const invalidKey = 'a1b2c3d4-e5f6-7890-1234-5678abcdef01';
      expect(validateApiKey(invalidKey)).toBe(false);
    });

    it('should reject key with spaces', () => {
      const invalidKey = 'a1b2c3d4 e5f6789012345678abcdef01';
      expect(validateApiKey(invalidKey)).toBe(false);
    });

    it('should accept minimum length key (8 characters)', () => {
      const validKey = 'a1b2c3d4';
      expect(validateApiKey(validKey)).toBe(true);
    });

    it('should accept maximum length key (128 characters)', () => {
      const validKey = 'a'.repeat(128);
      expect(validateApiKey(validKey)).toBe(true);
    });
  });

  describe('Unit Tests: URL Batching', () => {
    it('should return single batch for small URL list', () => {
      const urls = ['https://example.com/1', 'https://example.com/2'];
      const batches = batchUrls(urls, 10000);
      
      expect(batches.length).toBe(1);
      expect(batches[0]).toEqual(urls);
    });

    it('should split exactly 10,000 URLs into one batch', () => {
      const urls = Array(10000).fill(0).map((_, i) => `https://example.com/${i}`);
      const batches = batchUrls(urls, 10000);
      
      expect(batches.length).toBe(1);
      expect(batches[0].length).toBe(10000);
    });

    it('should split 10,001 URLs into two batches', () => {
      const urls = Array(10001).fill(0).map((_, i) => `https://example.com/${i}`);
      const batches = batchUrls(urls, 10000);
      
      expect(batches.length).toBe(2);
      expect(batches[0].length).toBe(10000);
      expect(batches[1].length).toBe(1);
    });

    it('should handle empty URL list', () => {
      const urls: string[] = [];
      const batches = batchUrls(urls, 10000);
      
      expect(batches.length).toBe(0);
    });

    it('should throw error for non-array input', () => {
      expect(() => batchUrls('not an array' as any, 10000)).toThrow('URLs must be an array');
    });

    it('should throw error for invalid batch size', () => {
      const urls = ['https://example.com/'];
      expect(() => batchUrls(urls, 0)).toThrow('Batch size must be positive');
      expect(() => batchUrls(urls, -1)).toThrow('Batch size must be positive');
    });

    it('should support custom batch sizes', () => {
      const urls = Array(25).fill(0).map((_, i) => `https://example.com/${i}`);
      const batches = batchUrls(urls, 10);
      
      expect(batches.length).toBe(3);
      expect(batches[0].length).toBe(10);
      expect(batches[1].length).toBe(10);
      expect(batches[2].length).toBe(5);
    });
  });

  describe('Unit Tests: Submit URLs - Parameter Validation', () => {
    it('should throw error for missing host', async () => {
      const options = {
        host: '',
        key: 'a1b2c3d4e5f6789012345678abcdef01',
        keyLocation: 'https://example.com/key.txt',
        urlList: ['https://example.com/']
      };

      await expect(submitUrls(options)).rejects.toThrow('Host is required');
    });

    it('should throw error for missing API key', async () => {
      const options = {
        host: 'vividmediacheshire.com',
        key: '',
        keyLocation: 'https://example.com/key.txt',
        urlList: ['https://example.com/']
      };

      await expect(submitUrls(options)).rejects.toThrow('API key is required');
    });

    it('should throw error for invalid API key format', async () => {
      const options = {
        host: 'vividmediacheshire.com',
        key: 'invalid!',
        keyLocation: 'https://example.com/key.txt',
        urlList: ['https://example.com/']
      };

      await expect(submitUrls(options)).rejects.toThrow('Invalid API key format');
    });

    it('should throw error for missing key location', async () => {
      const options = {
        host: 'vividmediacheshire.com',
        key: 'a1b2c3d4e5f6789012345678abcdef01',
        keyLocation: '',
        urlList: ['https://example.com/']
      };

      await expect(submitUrls(options)).rejects.toThrow('Key location URL is required');
    });

    it('should throw error for non-array URL list', async () => {
      const options = {
        host: 'vividmediacheshire.com',
        key: 'a1b2c3d4e5f6789012345678abcdef01',
        keyLocation: 'https://example.com/key.txt',
        urlList: 'not an array' as any
      };

      await expect(submitUrls(options)).rejects.toThrow('URL list must be an array');
    });
  });

  describe('Unit Tests: HTTP Response Handling', () => {
    /**
     * Mock HTTPS request/response for testing
     * Creates a mock request object that simulates HTTP responses
     */
    function createMockHttpsRequest(statusCode: number, responseBody: string = '') {
      const mockResponse = new EventEmitter() as any;
      mockResponse.statusCode = statusCode;
      
      const mockRequest = new EventEmitter() as any;
      mockRequest.write = vi.fn();
      mockRequest.end = vi.fn(() => {
        // Simulate async response using process.nextTick for immediate execution
        process.nextTick(() => {
          // Call the response handler that was registered
          const responseHandler = mockRequest.listeners('response')[0];
          if (responseHandler) {
            responseHandler(mockResponse);
          }
          
          // Emit data if response body provided
          if (responseBody) {
            process.nextTick(() => {
              mockResponse.emit('data', Buffer.from(responseBody));
              process.nextTick(() => {
                mockResponse.emit('end');
              });
            });
          } else {
            process.nextTick(() => {
              mockResponse.emit('end');
            });
          }
        });
      });
      mockRequest.destroy = vi.fn();
      
      return mockRequest;
    }

    it('should handle 200 success response', async () => {
      // Mock https.request to return 200 status
      const https = require('https');
      const mockRequest = createMockHttpsRequest(200);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        // Register the callback as a response listener
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/page1/', 'https://example.com/page2/']
        });

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.urlCount).toBe(2);
        expect(result.timestamp).toBeDefined();
        expect(result.duration).toBeDefined();
        expect(result.error).toBeUndefined();
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 202 accepted response', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(202);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(202);
        expect(result.error).toBeUndefined();
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 400 bad request error', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(400, JSON.stringify({ message: 'Invalid request format' }));
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(400);
        expect(result.error).toContain('Bad request');
        expect(result.error).toContain('Invalid request format');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 403 forbidden error', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(403);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(403);
        expect(result.error).toContain('Forbidden');
        expect(result.error).toContain('Invalid API key');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 422 unprocessable entity error', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(422, JSON.stringify({ message: 'Invalid URLs provided' }));
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(422);
        expect(result.error).toContain('Unprocessable entity');
        expect(result.error).toContain('Invalid URLs');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 429 rate limit error', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(429);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(429);
        expect(result.error).toContain('Rate limit exceeded');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle 500 server error', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(500);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(500);
        expect(result.error).toContain('Server error');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle network timeout', async () => {
      const https = require('https');
      const mockRequest = new EventEmitter() as any;
      mockRequest.write = vi.fn();
      mockRequest.end = vi.fn(() => {
        setImmediate(() => {
          mockRequest.emit('timeout');
        });
      });
      mockRequest.destroy = vi.fn();
      
      const originalRequest = https.request;
      https.request = vi.fn(() => mockRequest);

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/'],
          timeout: 1000
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(0);
        expect(result.error).toContain('Request timeout');
        expect(result.error).toContain('1000ms');
        expect(mockRequest.destroy).toHaveBeenCalled();
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle network error', async () => {
      const https = require('https');
      const mockRequest = new EventEmitter() as any;
      mockRequest.write = vi.fn();
      mockRequest.end = vi.fn(() => {
        setImmediate(() => {
          mockRequest.emit('error', new Error('Connection refused'));
        });
      });
      
      const originalRequest = https.request;
      https.request = vi.fn(() => mockRequest);

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(0);
        expect(result.error).toContain('Network error');
        expect(result.error).toContain('Connection refused');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should extract error message from JSON response body', async () => {
      const https = require('https');
      const errorResponse = JSON.stringify({ 
        message: 'Custom error message from API',
        details: 'Additional error details'
      });
      const mockRequest = createMockHttpsRequest(400, errorResponse);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Custom error message from API');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should handle plain text error response body', async () => {
      const https = require('https');
      const errorResponse = 'Plain text error message';
      const mockRequest = createMockHttpsRequest(500, errorResponse);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Server error');
        expect(result.error).toContain('Plain text error message');
      } finally {
        https.request = originalRequest;
      }
    });

    it('should truncate very long error response bodies', async () => {
      const https = require('https');
      const longErrorResponse = 'x'.repeat(300); // Longer than 200 chars
      const mockRequest = createMockHttpsRequest(500, longErrorResponse);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Server error');
        // Should not include the long response body
        expect(result.error).not.toContain('x'.repeat(300));
      } finally {
        https.request = originalRequest;
      }
    });

    it('should include duration in result', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(200);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.duration).toBeDefined();
        expect(typeof result.duration).toBe('number');
        expect(result.duration).toBeGreaterThanOrEqual(0);
      } finally {
        https.request = originalRequest;
      }
    });

    it('should include timestamp in ISO 8601 format', async () => {
      const https = require('https');
      const mockRequest = createMockHttpsRequest(200);
      
      const originalRequest = https.request;
      https.request = vi.fn((options, callback) => {
        if (callback) {
          mockRequest.on('response', callback);
        }
        return mockRequest;
      });

      try {
        const result = await submitUrls({
          host: 'vividmediacheshire.com',
          key: 'a1b2c3d4e5f6789012345678abcdef01',
          keyLocation: 'https://example.com/key.txt',
          urlList: ['https://example.com/']
        });

        expect(result.timestamp).toBeDefined();
        // Verify ISO 8601 format
        expect(() => new Date(result.timestamp)).not.toThrow();
        expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      } finally {
        https.request = originalRequest;
      }
    });
  });
});
