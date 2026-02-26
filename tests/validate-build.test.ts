/**
 * Unit Tests for Build Validator
 * 
 * Tests build validation, output directory validation, and breakage analysis.
 * Requirements: 7.1-7.5
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Create mock functions
const mockExecSync = vi.fn();
const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();

// Mock dependencies
vi.mock('child_process', () => ({
  execSync: mockExecSync
}));

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync
}));

// Import the module to test
const validateBuildModule = require('../scripts/cleanup/validate-build.js');

describe('Build Validator - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('runBuild()', () => {
    it('should return success when build passes', () => {
      // Arrange
      const mockOutput = 'Build completed successfully\nExporting static pages...';
      mockExecSync.mockReturnValue(mockOutput);

      // Act
      const result = validateBuildModule.runBuild();

      // Assert
      expect(result.success).toBe(true);
      expect(result.output).toBe(mockOutput);
      expect(result.error).toBeNull();
      expect(mockExecSync).toHaveBeenCalledWith('npm run build', expect.any(Object));
    });

    it('should return failure when build fails', () => {
      // Arrange
      const mockError = new Error('Build failed') as any;
      mockError.stdout = 'Building pages...';
      mockError.stderr = 'Error: Cannot find module "./missing-file"';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = validateBuildModule.runBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.output).toBe('Building pages...');
      expect(result.error).toBe('Error: Cannot find module "./missing-file"');
    });

    it('should handle build errors without stdout/stderr', () => {
      // Arrange
      const mockError = new Error('Unknown build error');
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = validateBuildModule.runBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown build error');
    });

    it('should use correct buffer size for large outputs', () => {
      // Arrange
      mockExecSync.mockReturnValue('Build output' as any);

      // Act
      validateBuildModule.runBuild();

      // Assert
      expect(mockExecSync).toHaveBeenCalledWith('npm run build', {
        encoding: 'utf-8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024
      });
    });
  });

  describe('validateOutputDirectory()', () => {
    it('should return valid when all expected files exist', () => {
      // Arrange
      mockExistsSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        return pathStr.includes('out') || 
               pathStr.includes('index.html') || 
               pathStr.includes('_next') || 
               pathStr.includes('404.html');
      });
      
      mockReaddirSync.mockReturnValue(['static', 'chunks'] as any);

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(true);
      expect(result.missingFiles).toEqual([]);
    });

    it('should return invalid when output directory does not exist', () => {
      // Arrange
      mockExistsSync.mockReturnValue(false);

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('out/ directory not found');
    });

    it('should detect missing index.html', () => {
      // Arrange
      mockExistsSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        return !pathStr.includes('index.html');
      });

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('index.html');
    });

    it('should detect missing _next directory', () => {
      // Arrange
      mockExistsSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        return !pathStr.includes('_next');
      });

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('_next');
    });

    it('should detect missing 404.html', () => {
      // Arrange
      mockExistsSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        return !pathStr.includes('404.html');
      });

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('404.html');
    });

    it('should detect empty _next directory', () => {
      // Arrange
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as any);

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('_next/ directory is empty');
    });

    it('should detect multiple missing files', () => {
      // Arrange
      mockExistsSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        // Only out directory exists, nothing else
        return pathStr.endsWith('out');
      });

      // Act
      const result = validateBuildModule.validateOutputDirectory();

      // Assert
      expect(result.valid).toBe(false);
      expect(result.missingFiles.length).toBeGreaterThan(1);
      expect(result.missingFiles).toContain('index.html');
      expect(result.missingFiles).toContain('_next');
      expect(result.missingFiles).toContain('404.html');
    });
  });

  describe('analyzeBreakage()', () => {
    it('should detect module not found errors', () => {
      // Arrange
      const buildError = `
        Error: Cannot find module './scripts/deploy.js'
        at Function.Module._resolveFilename
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toContain('./scripts/deploy.js');
    });

    it('should detect file not found errors (ENOENT)', () => {
      // Arrange
      const buildError = `
        Error: ENOENT: no such file or directory, open '/path/to/missing-file.json'
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toContain('/path/to/missing-file.json');
    });

    it('should detect import/require resolution errors', () => {
      // Arrange
      const buildError = `
        Error: Cannot find '../config/settings.js'
        at resolveModule
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toContain('../config/settings.js');
    });

    it('should detect TypeScript/JavaScript file references', () => {
      // Arrange
      const buildError = `
        TypeError: Cannot read property 'foo' of undefined
        at src/components/Header.tsx:45:12
        at src/lib/utils.js:23:5
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toContain('src/components/Header.tsx:45:12');
      expect(result).toContain('src/lib/utils.js:23:5');
    });

    it('should detect script path errors', () => {
      // Arrange
      const buildError = `
        Error loading scripts/validate-deployment.js
        Failed to execute scripts/lib/helper.js
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toContain('scripts/validate-deployment.js');
      expect(result).toContain('scripts/lib/helper.js');
    });

    it('should filter out node_modules references', () => {
      // Arrange
      const buildError = `
        at node_modules/next/dist/build/index.js:123:45
        at src/app/page.tsx:10:5
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).not.toContain('node_modules/next/dist/build/index.js:123:45');
      expect(result).toContain('src/app/page.tsx:10:5');
    });

    it('should remove duplicate file paths', () => {
      // Arrange
      const buildError = `
        Error: Cannot find module './missing.js'
        at Function.Module._resolveFilename
        Error: Cannot find module './missing.js'
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      const occurrences = result.filter(f => f === './missing.js').length;
      expect(occurrences).toBe(1);
    });

    it('should return empty array for null/undefined error', () => {
      // Act
      const result1 = validateBuildModule.analyzeBreakage(null);
      const result2 = validateBuildModule.analyzeBreakage(undefined);

      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('should return empty array when no patterns match', () => {
      // Arrange
      const buildError = 'Generic error message with no file paths';

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result).toEqual([]);
    });

    it('should detect multiple error patterns in same error message', () => {
      // Arrange
      const buildError = `
        Error: Cannot find module './scripts/deploy.js'
        ENOENT: no such file or directory, open 'config/settings.json'
        at src/app/layout.tsx:15:3
      `;

      // Act
      const result = validateBuildModule.analyzeBreakage(buildError);

      // Assert
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result).toContain('./scripts/deploy.js');
      expect(result).toContain('config/settings.json');
      expect(result).toContain('src/app/layout.tsx:15:3');
    });
  });

  describe('validateBuild()', () => {
    it('should return success when build passes and output is valid', async () => {
      // Arrange
      mockExecSync.mockReturnValue('Build successful');
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['static'] as any);

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(true);
      expect(result.outputDirectoryValid).toBe(true);
      expect(result.missingFiles).toEqual([]);
      expect(result.suspectedBreakage).toEqual([]);
      expect(result.recommendations).toContain('Build validation successful - all checks passed');
    });

    it('should return failure when build fails', async () => {
      // Arrange
      const mockError = new Error('Build failed') as any;
      mockError.stderr = 'Error: Cannot find module "./missing"';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.recommendations).toContain('Build failed - review build output for errors');
    });

    it('should analyze breakage when build fails', async () => {
      // Arrange
      const mockError = new Error('Build failed') as any;
      mockError.stderr = 'Error: Cannot find module "./scripts/deploy.js"';
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.suspectedBreakage).toContain('./scripts/deploy.js');
      expect(result.recommendations.some(r => 
        r.includes('Check these files for broken path references')
      )).toBe(true);
    });

    it('should return failure when output directory is invalid', async () => {
      // Arrange
      mockExecSync.mockReturnValue('Build successful');
      mockExistsSync.mockReturnValue(false);

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.outputDirectoryValid).toBe(false);
      expect(result.recommendations).toContain('Output directory validation failed');
    });

    it('should report missing files in recommendations', async () => {
      // Arrange
      mockExecSync.mockReturnValue('Build successful');
      mockExistsSync.mockImplementation((filePath: any) => {
        return !filePath.toString().includes('index.html');
      });

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.missingFiles).toContain('index.html');
      expect(result.recommendations.some(r => 
        r.includes('Missing expected files')
      )).toBe(true);
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      mockExecSync.mockImplementation(() => {
        throw new Error('Unexpected system error');
      });

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.recommendations.some(r => 
        r.includes('Unexpected error during validation')
      )).toBe(true);
    });

    it('should capture build output on success', async () => {
      // Arrange
      const mockOutput = 'Build completed\nExporting pages...';
      mockExecSync.mockReturnValue(mockOutput);
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['static'] as any);

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.buildOutput).toBe(mockOutput);
    });
  });

  describe('generateReport()', () => {
    it('should generate report for successful validation', () => {
      // Arrange
      const result = {
        success: true,
        buildOutput: 'Build successful',
        outputDirectoryValid: true,
        missingFiles: [],
        suspectedBreakage: [],
        recommendations: ['Build validation successful - all checks passed']
      };

      // Act
      const report = validateBuildModule.generateReport(result);

      // Assert
      expect(report).toContain('BUILD VALIDATION REPORT');
      expect(report).toContain('Status: ✓ PASSED');
      expect(report).toContain('Output Directory Valid: Yes');
      expect(report).toContain('Build validation successful - all checks passed');
    });

    it('should generate report for failed validation', () => {
      // Arrange
      const result = {
        success: false,
        buildOutput: 'Build failed with errors',
        outputDirectoryValid: false,
        missingFiles: ['index.html', '_next'],
        suspectedBreakage: ['./scripts/deploy.js'],
        recommendations: ['Build failed - review build output for errors']
      };

      // Act
      const report = validateBuildModule.generateReport(result);

      // Assert
      expect(report).toContain('Status: ✗ FAILED');
      expect(report).toContain('Output Directory Valid: No');
      expect(report).toContain('Missing Files:');
      expect(report).toContain('index.html');
      expect(report).toContain('_next');
      expect(report).toContain('Suspected Broken References:');
      expect(report).toContain('./scripts/deploy.js');
    });

    it('should include build output in report when validation fails', () => {
      // Arrange
      const result = {
        success: false,
        buildOutput: 'Error: Module not found\nBuild process terminated',
        outputDirectoryValid: false,
        missingFiles: [],
        suspectedBreakage: [],
        recommendations: []
      };

      // Act
      const report = validateBuildModule.generateReport(result);

      // Assert
      expect(report).toContain('Build Output (last 50 lines)');
      expect(report).toContain('Error: Module not found');
    });

    it('should truncate build output to last 50 lines', () => {
      // Arrange
      const longOutput = Array(100).fill('Build line').join('\n');
      const result = {
        success: false,
        buildOutput: longOutput,
        outputDirectoryValid: false,
        missingFiles: [],
        suspectedBreakage: [],
        recommendations: []
      };

      // Act
      const report = validateBuildModule.generateReport(result);

      // Assert
      const outputLines = report.split('\n').filter(line => line === 'Build line');
      expect(outputLines.length).toBeLessThanOrEqual(50);
    });

    it('should not include build output when validation succeeds', () => {
      // Arrange
      const result = {
        success: true,
        buildOutput: 'Build successful',
        outputDirectoryValid: true,
        missingFiles: [],
        suspectedBreakage: [],
        recommendations: ['All checks passed']
      };

      // Act
      const report = validateBuildModule.generateReport(result);

      // Assert
      expect(report).not.toContain('Build Output (last 50 lines)');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete successful validation workflow', async () => {
      // Arrange
      mockExecSync.mockReturnValue('Build completed successfully');
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['static', 'chunks'] as any);

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(true);
      expect(result.outputDirectoryValid).toBe(true);
      expect(result.missingFiles).toEqual([]);
      expect(result.suspectedBreakage).toEqual([]);
    });

    it('should handle complete failed validation workflow with analysis', async () => {
      // Arrange
      const mockError = new Error('Build failed') as any;
      mockError.stderr = `
        Error: Cannot find module './scripts/deploy.js'
        ENOENT: no such file or directory, open 'config/settings.json'
      `;
      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = await validateBuildModule.validateBuild();

      // Assert
      expect(result.success).toBe(false);
      expect(result.suspectedBreakage.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
