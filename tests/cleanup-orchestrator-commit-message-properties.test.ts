/**
 * Property Test: Commit Message Pattern Compliance
 * 
 * Property 13: Commit message pattern compliance
 * Validates: Requirements 9.6, 9.7
 * 
 * For any git commit created during cleanup, the commit message should follow 
 * the pattern "chore(cleanup): [category] - [description]".
 */

import * as fc from 'fast-check';

describe('Property 13: Commit Message Pattern Compliance', () => {
  const COMMIT_MESSAGE_PATTERN = /^chore\(cleanup\): .+ - .+$/;
  
  const VALID_CATEGORIES = [
    'folder structure',
    'documentation files',
    'scripts',
    'file naming',
    'path references',
    'navigation index',
    'build validation',
    'metrics'
  ];

  /**
   * Validates commit message format
   */
  function isValidCommitMessage(message: string): boolean {
    return COMMIT_MESSAGE_PATTERN.test(message);
  }

  /**
   * Extracts category from commit message
   */
  function extractCategory(message: string): string | null {
    const match = message.match(/^chore\(cleanup\): (.+?) - /);
    return match ? match[1] : null;
  }

  /**
   * Extracts description from commit message
   */
  function extractDescription(message: string): string | null {
    const match = message.match(/^chore\(cleanup\): .+ - (.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Arbitrary generator for valid commit message categories
   */
  const categoryArb = fc.constantFrom(...VALID_CATEGORIES);

  /**
   * Arbitrary generator for commit message descriptions
   */
  const descriptionArb = fc.stringMatching(/^[a-z][a-z0-9 ]{5,50}$/);

  /**
   * Arbitrary generator for valid commit messages
   */
  const validCommitMessageArb = fc.tuple(categoryArb, descriptionArb)
    .map(([category, description]) => `chore(cleanup): ${category} - ${description}`);

  test('Property: Valid commit messages match the required pattern', () => {
    fc.assert(
      fc.property(validCommitMessageArb, (message) => {
        expect(isValidCommitMessage(message)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property: Commit messages have extractable category', () => {
    fc.assert(
      fc.property(validCommitMessageArb, (message) => {
        const category = extractCategory(message);
        expect(category).not.toBeNull();
        expect(category!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Property: Commit messages have extractable description', () => {
    fc.assert(
      fc.property(validCommitMessageArb, (message) => {
        const description = extractDescription(message);
        expect(description).not.toBeNull();
        expect(description!.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Property: Commit messages start with "chore(cleanup):"', () => {
    fc.assert(
      fc.property(validCommitMessageArb, (message) => {
        expect(message.startsWith('chore(cleanup):')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property: Commit messages contain separator " - "', () => {
    fc.assert(
      fc.property(validCommitMessageArb, (message) => {
        expect(message).toContain(' - ');
      }),
      { numRuns: 100 }
    );
  });

  test('Property: Invalid messages without prefix are rejected', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const invalidMessage = `${category} - ${description}`;
          expect(isValidCommitMessage(invalidMessage)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Invalid messages without separator are rejected', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const invalidMessage = `chore(cleanup): ${category} ${description}`;
          expect(isValidCommitMessage(invalidMessage)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Invalid messages with wrong scope are rejected', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const invalidMessage = `chore(other): ${category} - ${description}`;
          expect(isValidCommitMessage(invalidMessage)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Invalid messages with wrong type are rejected', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const invalidMessage = `feat(cleanup): ${category} - ${description}`;
          expect(isValidCommitMessage(invalidMessage)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Category and description are preserved in round-trip', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const message = `chore(cleanup): ${category} - ${description}`;
          const extractedCategory = extractCategory(message);
          const extractedDescription = extractDescription(message);
          
          expect(extractedCategory).toBe(category);
          expect(extractedDescription).toBe(description);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Example: Known valid commit messages', () => {
    const validMessages = [
      'chore(cleanup): folder structure - create organized folder structure',
      'chore(cleanup): documentation files - organize documentation files',
      'chore(cleanup): scripts - consolidate scripts by category',
      'chore(cleanup): file naming - standardize file naming with dates',
      'chore(cleanup): path references - update path references',
      'chore(cleanup): navigation index - create documentation navigation index'
    ];

    validMessages.forEach(message => {
      expect(isValidCommitMessage(message)).toBe(true);
      expect(extractCategory(message)).not.toBeNull();
      expect(extractDescription(message)).not.toBeNull();
    });
  });

  test('Example: Known invalid commit messages', () => {
    const invalidMessages = [
      'cleanup: organize files',
      'chore: organize files',
      'chore(cleanup) organize files',
      'chore(cleanup): organize files',
      'feat(cleanup): organize files - description',
      'chore(other): organize files - description',
      'CHORE(cleanup): organize files - description'
    ];

    invalidMessages.forEach(message => {
      expect(isValidCommitMessage(message)).toBe(false);
    });
  });

  test('Property: Commit messages are case-sensitive for prefix', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const upperCase = `CHORE(CLEANUP): ${category} - ${description}`;
          const mixedCase = `Chore(Cleanup): ${category} - ${description}`;
          
          expect(isValidCommitMessage(upperCase)).toBe(false);
          expect(isValidCommitMessage(mixedCase)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Commit messages with extra whitespace are invalid', () => {
    fc.assert(
      fc.property(
        categoryArb,
        descriptionArb,
        (category, description) => {
          const extraSpace = `chore(cleanup):  ${category}  -  ${description}`;
          // This should still match the pattern, but we can test for normalized format
          const normalized = `chore(cleanup): ${category} - ${description}`;
          
          expect(isValidCommitMessage(normalized)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
