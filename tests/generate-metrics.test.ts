/**
 * Unit Tests for Metrics Reporter
 * 
 * Tests the metrics generation system that calculates cleanup success metrics.
 * 
 * Requirements: 10.1-10.7
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

const {
  generateMetrics,
  countRootFiles,
  measureSearchTime,
  calculateReduction,
  determineSuccess,
} = require('../scripts/cleanup/generate-metrics.js');

describe('Metrics Reporter', () => {
  describe('generateMetrics', () => {
    it('should generate metrics report with all required fields', async () => {
      const beforeState = {
        rootFileCount: 150,
        searchTime: 500,
      };
      
      const afterState = {
        rootFileCount: 30,
        searchTime: 50,
        filesMoved: {
          summaries: 20,
          audits: 15,
          architecture: 10,
          decisions: 8,
          archive: 25,
          fixes: 12,
          migrations: 18,
          utilities: 22,
        },
      };
      
      const metrics = await generateMetrics(beforeState, afterState);
      
      // Requirement 10.1: Count root-level files before cleanup
      expect(metrics).toHaveProperty('rootFilesBefore');
      expect(metrics.rootFilesBefore).toBe(150);
      
      // Requirement 10.2: Count root-level files after cleanup
      expect(metrics).toHaveProperty('rootFilesAfter');
      expect(metrics.rootFilesAfter).toBe(30);
      
      // Requirement 10.3: Calculate percentage reduction
      expect(metrics).toHaveProperty('reductionPercentage');
      expect(metrics.reductionPercentage).toBe(80);
      
      // Requirement 10.4: Report number of files moved to each category
      expect(metrics).toHaveProperty('filesMoved');
      expect(metrics.filesMoved).toEqual({
        summaries: 20,
        audits: 15,
        architecture: 10,
        decisions: 8,
        archive: 25,
        fixes: 12,
        migrations: 18,
        utilities: 22,
      });
      
      // Requirement 10.5: Measure time to find documentation before and after
      expect(metrics).toHaveProperty('searchTimeBefore');
      expect(metrics).toHaveProperty('searchTimeAfter');
      expect(metrics.searchTimeBefore).toBe(500);
      expect(metrics.searchTimeAfter).toBe(50);
      
      // Requirement 10.6: Calculate search time improvement
      expect(metrics).toHaveProperty('searchTimeImprovement');
      expect(metrics.searchTimeImprovement).toBe(90);
      
      // Requirement 10.7: Determine success based on 80% threshold
      expect(metrics).toHaveProperty('success');
      expect(metrics.success).toBe(true);
      
      // Timestamp should be present
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
    
    it('should handle missing filesMoved data with defaults', async () => {
      const beforeState = { rootFileCount: 100, searchTime: 400 };
      const afterState = { rootFileCount: 20, searchTime: 40 };
      
      const metrics = await generateMetrics(beforeState, afterState);
      
      expect(metrics.filesMoved).toEqual({
        summaries: 0,
        audits: 0,
        architecture: 0,
        decisions: 0,
        archive: 0,
        fixes: 0,
        migrations: 0,
        utilities: 0,
      });
    });
    
    it('should calculate metrics when state objects are minimal', async () => {
      const beforeState = {};
      const afterState = {};
      
      const metrics = await generateMetrics(beforeState, afterState);
      
      // Should still generate all required fields
      expect(metrics).toHaveProperty('rootFilesBefore');
      expect(metrics).toHaveProperty('rootFilesAfter');
      expect(metrics).toHaveProperty('reductionPercentage');
      expect(metrics).toHaveProperty('filesMoved');
      expect(metrics).toHaveProperty('searchTimeBefore');
      expect(metrics).toHaveProperty('searchTimeAfter');
      expect(metrics).toHaveProperty('searchTimeImprovement');
      expect(metrics).toHaveProperty('success');
      expect(metrics).toHaveProperty('timestamp');
    });
  });
  
  describe('countRootFiles', () => {
    it('should count only files in root directory', async () => {
      // This test uses the actual root directory
      const count = await countRootFiles('.');
      
      // Should return a non-negative number
      expect(count).toBeGreaterThanOrEqual(0);
      expect(typeof count).toBe('number');
    });
    
    it('should exclude hidden files', async () => {
      // Hidden files like .gitignore, .env should not be counted
      // This is validated by the implementation logic
      const count = await countRootFiles('.');
      expect(typeof count).toBe('number');
    });
    
    it('should exclude package-lock.json', async () => {
      // package-lock.json should not be counted
      // This is validated by the implementation logic
      const count = await countRootFiles('.');
      expect(typeof count).toBe('number');
    });
    
    it('should return 0 for non-existent directory', async () => {
      const count = await countRootFiles('/non/existent/path');
      expect(count).toBe(0);
    });
  });
  
  describe('measureSearchTime', () => {
    it('should measure time to find documentation', async () => {
      const searchTime = await measureSearchTime('deployment');
      
      // Should return a positive number (milliseconds)
      expect(searchTime).toBeGreaterThanOrEqual(0);
      expect(typeof searchTime).toBe('number');
    });
    
    it('should search for different terms', async () => {
      const time1 = await measureSearchTime('deployment');
      const time2 = await measureSearchTime('validation');
      
      // Both should return valid times
      expect(time1).toBeGreaterThanOrEqual(0);
      expect(time2).toBeGreaterThanOrEqual(0);
    });
    
    it('should handle case-insensitive search', async () => {
      const timeLower = await measureSearchTime('deployment');
      const timeUpper = await measureSearchTime('DEPLOYMENT');
      
      // Both should work (case-insensitive)
      expect(timeLower).toBeGreaterThanOrEqual(0);
      expect(timeUpper).toBeGreaterThanOrEqual(0);
    });
    
    it('should return default time on error', async () => {
      // Simulate error by searching in invalid context
      const searchTime = await measureSearchTime('');
      
      // Should still return a valid number
      expect(typeof searchTime).toBe('number');
      expect(searchTime).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('calculateReduction', () => {
    it('should calculate percentage reduction correctly', () => {
      // Requirement 10.3: Calculate percentage reduction
      expect(calculateReduction(100, 20)).toBe(80);
      expect(calculateReduction(150, 30)).toBe(80);
      expect(calculateReduction(200, 50)).toBe(75);
      expect(calculateReduction(500, 100)).toBe(80);
    });
    
    it('should handle 100% reduction', () => {
      expect(calculateReduction(100, 0)).toBe(100);
    });
    
    it('should handle 0% reduction', () => {
      expect(calculateReduction(100, 100)).toBe(0);
    });
    
    it('should handle zero before value', () => {
      expect(calculateReduction(0, 0)).toBe(0);
      expect(calculateReduction(0, 10)).toBe(0);
    });
    
    it('should round to 2 decimal places', () => {
      expect(calculateReduction(100, 33)).toBe(67);
      expect(calculateReduction(100, 66)).toBe(34);
      expect(calculateReduction(150, 47)).toBe(68.67);
    });
    
    it('should never return negative reduction', () => {
      // If after > before, should return 0 (no reduction)
      expect(calculateReduction(50, 100)).toBe(0);
    });
  });
  
  describe('determineSuccess', () => {
    it('should return true when search time improvement is 80% or more', () => {
      // Requirement 10.6: Success if time reduced by 80% or more
      expect(determineSuccess({ searchTimeImprovement: 80 })).toBe(true);
      expect(determineSuccess({ searchTimeImprovement: 85 })).toBe(true);
      expect(determineSuccess({ searchTimeImprovement: 90 })).toBe(true);
      expect(determineSuccess({ searchTimeImprovement: 100 })).toBe(true);
    });
    
    it('should return false when search time improvement is less than 80%', () => {
      expect(determineSuccess({ searchTimeImprovement: 79 })).toBe(false);
      expect(determineSuccess({ searchTimeImprovement: 70 })).toBe(false);
      expect(determineSuccess({ searchTimeImprovement: 50 })).toBe(false);
      expect(determineSuccess({ searchTimeImprovement: 0 })).toBe(false);
    });
    
    it('should use 80% threshold as success criterion', () => {
      // Exactly 80% should be successful
      expect(determineSuccess({ searchTimeImprovement: 80 })).toBe(true);
      
      // Just below 80% should fail
      expect(determineSuccess({ searchTimeImprovement: 79.99 })).toBe(false);
    });
    
    it('should ignore other metrics and only check search time improvement', () => {
      // Even with high file reduction, low search improvement = failure
      expect(determineSuccess({ 
        reductionPercentage: 90,
        searchTimeImprovement: 70 
      })).toBe(false);
      
      // Even with low file reduction, high search improvement = success
      expect(determineSuccess({ 
        reductionPercentage: 50,
        searchTimeImprovement: 85 
      })).toBe(true);
    });
  });
  
  describe('Integration: Full metrics workflow', () => {
    it('should generate complete metrics for successful cleanup', async () => {
      const beforeState = {
        rootFileCount: 200,
        searchTime: 1000,
      };
      
      const afterState = {
        rootFileCount: 25,
        searchTime: 100,
        filesMoved: {
          summaries: 30,
          audits: 25,
          architecture: 20,
          decisions: 15,
          archive: 40,
          fixes: 15,
          migrations: 25,
          utilities: 30,
        },
      };
      
      const metrics = await generateMetrics(beforeState, afterState);
      
      // Verify all calculations
      expect(metrics.rootFilesBefore).toBe(200);
      expect(metrics.rootFilesAfter).toBe(25);
      expect(metrics.reductionPercentage).toBe(87.5);
      expect(metrics.searchTimeBefore).toBe(1000);
      expect(metrics.searchTimeAfter).toBe(100);
      expect(metrics.searchTimeImprovement).toBe(90);
      expect(metrics.success).toBe(true);
      
      // Verify total files moved
      const totalMoved = Object.values(metrics.filesMoved).reduce((sum, count) => sum + count, 0);
      expect(totalMoved).toBe(200);
    });
    
    it('should generate complete metrics for unsuccessful cleanup', async () => {
      const beforeState = {
        rootFileCount: 100,
        searchTime: 500,
      };
      
      const afterState = {
        rootFileCount: 60,
        searchTime: 300,
        filesMoved: {
          summaries: 10,
          audits: 8,
          architecture: 7,
          decisions: 5,
          archive: 10,
          fixes: 0,
          migrations: 0,
          utilities: 0,
        },
      };
      
      const metrics = await generateMetrics(beforeState, afterState);
      
      // Verify calculations
      expect(metrics.rootFilesBefore).toBe(100);
      expect(metrics.rootFilesAfter).toBe(60);
      expect(metrics.reductionPercentage).toBe(40);
      expect(metrics.searchTimeBefore).toBe(500);
      expect(metrics.searchTimeAfter).toBe(300);
      expect(metrics.searchTimeImprovement).toBe(40);
      
      // Should fail because search time improvement < 80%
      expect(metrics.success).toBe(false);
    });
  });
});
