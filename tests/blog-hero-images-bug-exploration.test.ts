import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Bug Condition Exploration Test - Ahrefs Broken Images Fix Round 2
 * 
 * **Property 1: Fault Condition - Blog Hero Images Return 404 for Incorrect Extensions**
 * 
 * **Validates: Requirements 2.1, 2.2**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes
 * after implementation. The goal is to surface counterexamples that demonstrate
 * the bug exists.
 * 
 * ROOT CAUSE DISCOVERED:
 * - Blog post metadata references .jpg files (which exist in public/images/blog/)
 * - Blog post content HTML references .webp files (which DO NOT exist)
 * - The .jpg files exist but may have issues with spaces in filenames
 * - The .webp files referenced in content do not exist at all
 * 
 * Expected Outcome: Test FAILS (this is correct - it proves the bug exists)
 * 
 * Counterexamples to document:
 * - Content references `/images/blog/240804-Model_Car_Collection-46 (1).webp` but file doesn't exist
 * - Content references `/images/blog/240620-Model_Car_Collection-96 (1).webp` but file doesn't exist  
 * - Content references `/images/blog/240708-Model_Car_Collection-21 (1).webp` but file doesn't exist
 * - Actual files are .jpg: 240804-Model_Car_Collection-46 (1).jpg, etc.
 */

// CloudFront distribution URL for production
const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';

// The three blog posts with broken content images
const BROKEN_BLOG_POSTS = [
  {
    slug: 'ebay-repeat-buyers-part-4',
    title: 'Part 4',
    heroImagePath: '/images/blog/240804-Model_Car_Collection-46 (1).jpg', // metadata - correct
    contentImagePath: '/images/blog/240804-Model_Car_Collection-46 (1).webp', // content HTML - WRONG
    actualFile: '240804-Model_Car_Collection-46 (1).jpg', // what exists in public/
  },
  {
    slug: 'ebay-business-side-part-5',
    title: 'Part 5',
    heroImagePath: '/images/blog/240620-Model_Car_Collection-96 (1).jpg', // metadata - correct
    contentImagePath: '/images/blog/240620-Model_Car_Collection-96 (1).webp', // content HTML - WRONG (doesn't exist)
    actualFile: '240620-Model_Car_Collection-96 (1).jpg', // what exists in public/
  },
  {
    slug: 'ebay-model-car-sales-timing-bundles',
    title: 'Part 3',
    heroImagePath: '/images/blog/240708-Model_Car_Collection-21 (1).jpg', // metadata - correct
    contentImagePath: '/images/blog/240708-Model_Car_Collection-21 (1).webp', // content HTML - WRONG (doesn't exist)
    actualFile: '240708-Model_Car_Collection-21 (1).jpg', // what exists in public/
  },
];

describe('Blog Hero Images Bug Exploration', () => {
  describe('Property 1: Fault Condition - Content Images Reference Non-Existent .webp Files', () => {
    it('should demonstrate bug: content references .webp files that do not exist', async () => {
      // This test SHOULD FAIL on unfixed code
      // The .webp files referenced in content HTML do not exist
      
      const results = await Promise.all(
        BROKEN_BLOG_POSTS.map(async (post) => {
          // URL-encode the path properly for spaces and parentheses
          const encodedPath = post.contentImagePath.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
          const contentImageUrl = `${CLOUDFRONT_URL}${encodedPath}`;
          
          try {
            const response = await fetch(contentImageUrl, { method: 'HEAD' });
            return {
              post: post.title,
              path: post.contentImagePath,
              status: response.status,
              expected: 200,
              note: 'Content HTML references this .webp file',
            };
          } catch (error) {
            return {
              post: post.title,
              path: post.contentImagePath,
              status: 'ERROR',
              expected: 200,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );

      // Log counterexamples for documentation
      console.log('\n=== BUG CONFIRMED: Content References Non-Existent .webp Files ===');
      results.forEach(r => {
        console.log(`${r.post}: ${r.path} returned ${r.status} (expected ${r.expected})`);
        if ('note' in r) console.log(`  Note: ${r.note}`);
      });
      console.log('================================================================\n');

      // This assertion SHOULD FAIL on unfixed code
      // When it fails, it proves the bug exists (404 for .webp files)
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    }, 30000); // 30 second timeout for network requests

    it('should verify actual .jpg files exist in public directory', async () => {
      // This test SHOULD PASS - it confirms the actual .jpg files exist
      // The bug is that content references .webp but files are .jpg
      
      const results = await Promise.all(
        BROKEN_BLOG_POSTS.map(async (post) => {
          // URL-encode the path properly for spaces and parentheses
          const encodedPath = post.heroImagePath.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
          const heroImageUrl = `${CLOUDFRONT_URL}${encodedPath}`;
          
          try {
            const response = await fetch(heroImageUrl, { method: 'HEAD' });
            return {
              post: post.title,
              path: post.heroImagePath,
              actualFile: post.actualFile,
              status: response.status,
              expected: 200,
            };
          } catch (error) {
            return {
              post: post.title,
              path: post.heroImagePath,
              actualFile: post.actualFile,
              status: 'ERROR',
              expected: 200,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        })
      );

      // Log verification results
      console.log('\n=== VERIFICATION: Actual .jpg Files Exist ===');
      results.forEach(r => {
        console.log(`${r.post}: ${r.path} returned ${r.status}`);
        console.log(`  Actual file: ${r.actualFile}`);
      });
      console.log('============================================\n');

      // All .jpg files should exist and return 200
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    }, 30000); // 30 second timeout for network requests
  });

  describe('Property-Based Test: Extension Mismatch Detection', () => {
    it('should detect that content references .webp but actual files are .jpg', () => {
      // Property-based test to verify the bug pattern
      // This scopes the test to the three known broken posts
      
      fc.assert(
        fc.property(
          fc.constantFrom(...BROKEN_BLOG_POSTS),
          (post) => {
            // Extract extensions
            const heroExt = post.heroImagePath.split('.').pop();
            const contentExt = post.contentImagePath.split('.').pop();
            const actualExt = post.actualFile.split('.').pop();
            
            // Verify the bug pattern:
            // - Hero metadata references .jpg (correct)
            // - Content HTML references .webp (incorrect - file doesn't exist)
            // - Actual file is .jpg
            expect(heroExt).toBe('jpg');
            expect(contentExt).toBe('webp');
            expect(actualExt).toBe('jpg');
            
            // Verify the base filename is the same (only extension differs)
            const heroBase = post.heroImagePath.replace(/\.[^.]+$/, '');
            const contentBase = post.contentImagePath.replace(/\.[^.]+$/, '');
            expect(heroBase).toBe(contentBase);
          }
        ),
        { numRuns: 10 } // Run 10 times to test all posts multiple times
      );
    });
  });
});
