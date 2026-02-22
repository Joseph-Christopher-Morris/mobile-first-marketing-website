import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import the module under test
const indexnowLogger = require('../scripts/lib/indexnow-logger.js');
const { logSubmission, getStatistics } = indexnowLogger;

/**
 * Unit tests for IndexNow Logger Statistics Tracking
 * 
 * Tests verify that the logging service correctly:
 * - Calculates total submissions, successful/failed counts
 * - Tracks success rate percentage
 * - Records last successful submission timestamp
 * - Calculates average URL count per submission
 * - Logs warnings when success rate falls below 90%
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

describe('Feature: indexnow-submission - Statistics Tracking', () => {
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

  describe('Requirement 8.1: Total Submissions Count', () => {
    it('should track total number of submissions', async () => {
      // Log 5 submissions
      for (let i = 0; i < 5; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      const stats = await getStatistics(10);
      expect(stats.totalSubmissions).toBe(5);
    });

    it('should return 0 for empty log file', async () => {
      const stats = await getStatistics(10);
      expect(stats.totalSubmissions).toBe(0);
    });
  });

  describe('Requirement 8.2: Successful/Failed Counts', () => {
    it('should count successful submissions correctly', async () => {
      // Log 3 successful submissions
      for (let i = 0; i < 3; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successfulSubmissions).toBe(3);
      expect(stats.failedSubmissions).toBe(0);
    });

    it('should count failed submissions correctly', async () => {
      // Log 2 failed submissions
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 429,
          error: 'Rate limit exceeded',
          duration: 500
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successfulSubmissions).toBe(0);
      expect(stats.failedSubmissions).toBe(2);
    });

    it('should count mixed successful and failed submissions', async () => {
      // Log 3 successful and 2 failed
      for (let i = 0; i < 3; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 500,
          error: 'Server error',
          duration: 500
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successfulSubmissions).toBe(3);
      expect(stats.failedSubmissions).toBe(2);
      expect(stats.totalSubmissions).toBe(5);
    });
  });

  describe('Requirement 8.3: Success Rate Calculation', () => {
    it('should calculate 100% success rate for all successful submissions', async () => {
      for (let i = 0; i < 5; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successRate).toBe(1.0);
    });

    it('should calculate 0% success rate for all failed submissions', async () => {
      for (let i = 0; i < 5; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 429,
          error: 'Rate limit',
          duration: 500
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successRate).toBe(0.0);
    });

    it('should calculate 60% success rate for 3 success out of 5', async () => {
      // 3 successful
      for (let i = 0; i < 3; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      // 2 failed
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 500,
          error: 'Error',
          duration: 500
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successRate).toBe(0.6);
    });

    it('should calculate 80% success rate for 8 success out of 10', async () => {
      // 8 successful
      for (let i = 0; i < 8; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      // 2 failed
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 429,
          error: 'Rate limit',
          duration: 500
        });
      }

      const stats = await getStatistics(10);
      expect(stats.successRate).toBe(0.8);
    });
  });

  describe('Requirement 8.4: Last Successful Submission Timestamp', () => {
    it('should track timestamp of last successful submission', async () => {
      const timestamp1 = '2026-02-22T10:00:00.000Z';
      const timestamp2 = '2026-02-22T11:00:00.000Z';
      const timestamp3 = '2026-02-22T12:00:00.000Z';

      await logSubmission({
        timestamp: timestamp1,
        urlCount: 10,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      await logSubmission({
        timestamp: timestamp2,
        urlCount: 10,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      await logSubmission({
        timestamp: timestamp3,
        urlCount: 10,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      const stats = await getStatistics(10);
      expect(stats.lastSuccessfulSubmission).toBe(timestamp3);
    });

    it('should return null when no successful submissions exist', async () => {
      await logSubmission({
        timestamp: new Date().toISOString(),
        urlCount: 10,
        success: false,
        statusCode: 429,
        error: 'Rate limit',
        duration: 500
      });

      const stats = await getStatistics(10);
      expect(stats.lastSuccessfulSubmission).toBeNull();
    });

    it('should track last successful even with failed submissions after', async () => {
      const successTimestamp = '2026-02-22T10:00:00.000Z';
      const failTimestamp = '2026-02-22T11:00:00.000Z';

      await logSubmission({
        timestamp: successTimestamp,
        urlCount: 10,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      await logSubmission({
        timestamp: failTimestamp,
        urlCount: 10,
        success: false,
        statusCode: 500,
        error: 'Error',
        duration: 500
      });

      const stats = await getStatistics(10);
      expect(stats.lastSuccessfulSubmission).toBe(successTimestamp);
    });
  });

  describe('Requirement 8.5: Average URL Count', () => {
    it('should calculate average URL count per submission', async () => {
      await logSubmission({
        timestamp: new Date().toISOString(),
        urlCount: 10,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      await logSubmission({
        timestamp: new Date().toISOString(),
        urlCount: 20,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      await logSubmission({
        timestamp: new Date().toISOString(),
        urlCount: 30,
        success: true,
        statusCode: 200,
        duration: 1000
      });

      const stats = await getStatistics(10);
      expect(stats.averageUrlCount).toBe(20); // (10 + 20 + 30) / 3 = 20
    });

    it('should handle varying URL counts', async () => {
      const urlCounts = [5, 15, 25, 35];
      
      for (const count of urlCounts) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: count,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      const stats = await getStatistics(10);
      expect(stats.averageUrlCount).toBe(20); // (5 + 15 + 25 + 35) / 4 = 20
    });

    it('should return 0 for empty log', async () => {
      const stats = await getStatistics(10);
      expect(stats.averageUrlCount).toBe(0);
    });
  });

  describe('Requirement 8.5: Success Rate Warning', () => {
    it('should log warning when success rate falls below 90%', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Log 8 successful and 2 failed (80% success rate)
      for (let i = 0; i < 8; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 429,
          error: 'Rate limit',
          duration: 500
        });
      }

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warningCall = consoleWarnSpy.mock.calls.find(call => 
        call[0].includes('WARNING') && call[0].includes('success rate')
      );
      expect(warningCall).toBeDefined();
      expect(warningCall![0]).toContain('80.0%');
      expect(warningCall![0]).toContain('below 90%');

      consoleWarnSpy.mockRestore();
    });

    it('should not log warning when success rate is 90% or above', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Log 9 successful and 1 failed (90% success rate)
      for (let i = 0; i < 9; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      await logSubmission({
        timestamp: new Date().toISOString(),
        urlCount: 10,
        success: false,
        statusCode: 429,
        error: 'Rate limit',
        duration: 500
      });

      // Verify no warning was logged
      const warningCall = consoleWarnSpy.mock.calls.find(call => 
        call[0].includes('WARNING') && call[0].includes('success rate')
      );
      expect(warningCall).toBeUndefined();

      consoleWarnSpy.mockRestore();
    });

    it('should not log warning when fewer than 10 submissions exist', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Log only 5 submissions with 60% success rate
      for (let i = 0; i < 3; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }
      
      for (let i = 0; i < 2; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: false,
          statusCode: 500,
          error: 'Error',
          duration: 500
        });
      }

      // Verify no warning was logged (need 10 submissions minimum)
      const warningCall = consoleWarnSpy.mock.calls.find(call => 
        call[0].includes('WARNING') && call[0].includes('success rate')
      );
      expect(warningCall).toBeUndefined();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Statistics Limit Parameter', () => {
    it('should respect limit parameter for recent submissions', async () => {
      // Log 15 submissions
      for (let i = 0; i < 15; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      // Get stats for last 5 submissions only
      const stats = await getStatistics(5);
      expect(stats.totalSubmissions).toBe(5);
    });

    it('should default to 10 submissions when no limit specified', async () => {
      // Log 15 submissions
      for (let i = 0; i < 15; i++) {
        await logSubmission({
          timestamp: new Date().toISOString(),
          urlCount: 10,
          success: true,
          statusCode: 200,
          duration: 1000
        });
      }

      // Get stats with default limit
      const stats = await getStatistics();
      expect(stats.totalSubmissions).toBe(10);
    });
  });
});
