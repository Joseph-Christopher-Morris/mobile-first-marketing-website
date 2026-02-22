import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateApiKey } from '../scripts/generate-indexnow-key.js';

/**
 * Property 1: API Key Generation Format
 * 
 * **Validates: Requirements 1.1**
 * 
 * This property test verifies that ALL generated API keys meet the format
 * requirements specified in the IndexNow API documentation:
 * - Must be hexadecimal strings (characters 0-9, a-f)
 * - Must have length between 8 and 128 characters (inclusive)
 * 
 * Testing Strategy: Generate multiple API keys and verify each one meets
 * the format requirements. This ensures the key generation is consistent
 * and reliable across all executions.
 */

describe('Feature: indexnow-submission', () => {
  describe('Property 1: API Key Generation Format', () => {
    it('should generate hexadecimal strings with length 8-128 characters', () => {
      // Feature: indexnow-submission, Property 1: API key generation format
      fc.assert(
        fc.property(
          // Generate 100 iterations with a constant input (key generation is random)
          fc.constant(null),
          () => {
            const apiKey = generateApiKey();
            
            // Verify the key is a string
            expect(typeof apiKey).toBe('string');
            
            // Verify the key contains only hexadecimal characters (0-9, a-f)
            expect(apiKey).toMatch(/^[0-9a-f]+$/);
            
            // Verify the key length is within the valid range (8-128 characters)
            expect(apiKey.length).toBeGreaterThanOrEqual(8);
            expect(apiKey.length).toBeLessThanOrEqual(128);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate unique keys on each invocation', () => {
      // Feature: indexnow-submission, Property 1: API key generation format
      // Additional property: uniqueness across multiple generations
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const key1 = generateApiKey();
            const key2 = generateApiKey();
            
            // Verify that two consecutively generated keys are different
            // This tests the randomness of the key generation
            expect(key1).not.toBe(key2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate keys with consistent length', () => {
      // Feature: indexnow-submission, Property 1: API key generation format
      // Verify that the implementation consistently generates 32-character keys
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const apiKey = generateApiKey();
            
            // The implementation uses 16 bytes which produces 32 hex characters
            expect(apiKey.length).toBe(32);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
