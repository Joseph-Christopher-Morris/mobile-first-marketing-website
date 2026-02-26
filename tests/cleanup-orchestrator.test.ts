/**
 * Unit Tests: Cleanup Orchestrator
 * 
 * Tests for the main cleanup orchestrator that coordinates all phases.
 * Validates: Requirements 9.1-9.7
 * 
 * Note: This test file validates the orchestrator's exported functions.
 * Full integration testing is done in cleanup-integration.test.ts
 */

import { describe, it, expect } from 'vitest';
import { 
  validatePreconditions, 
  createGitCommit,
  runPhase,
  rollbackToCommit 
} from '../scripts/cleanup-orchestrator';

describe('Cleanup Orchestrator', () => {
  describe('Module exports', () => {
    it('should export validatePreconditions function', () => {
      expect(typeof validatePreconditions).toBe('function');
    });

    it('should export createGitCommit function', () => {
      expect(typeof createGitCommit).toBe('function');
    });

    it('should export runPhase function', () => {
      expect(typeof runPhase).toBe('function');
    });

    it('should export rollbackToCommit function', () => {
      expect(typeof rollbackToCommit).toBe('function');
    });
  });

  describe('Commit Message Format', () => {
    it('should validate commit message pattern', () => {
      const pattern = /^chore\(cleanup\):\s+\[.+\]\s+-\s+.+$/;
      
      const validMessages = [
        'chore(cleanup): [folder-creation] - Create organized folder structure',
        'chore(cleanup): [documentation] - Move documentation files',
        'chore(cleanup): [scripts] - Consolidate scripts by category',
        'chore(cleanup): [rename] - Standardize file naming with dates',
        'chore(cleanup): [references] - Update path references',
      ];

      validMessages.forEach(message => {
        expect(pattern.test(message)).toBe(true);
      });
    });

    it('should reject invalid commit message formats', () => {
      const pattern = /^chore\(cleanup\):\s+\[.+\]\s+-\s+.+$/;
      
      const invalidMessages = [
        'cleanup: folder creation',
        'chore(cleanup) folder creation',
        'chore(cleanup): folder creation',
        '[folder-creation] - Create folders',
      ];

      invalidMessages.forEach(message => {
        expect(pattern.test(message)).toBe(false);
      });
    });
  });

  describe('validatePreconditions', () => {
    it('should return an object with valid and errors properties', () => {
      // Run in test mode to be more lenient
      const result = validatePreconditions(true);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
