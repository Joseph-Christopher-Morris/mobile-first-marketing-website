/**
 * Unit Tests: Navigation Index Creator
 * 
 * Tests for scripts/cleanup/create-navigation-index.js
 * Validates Requirements 6.1-6.6
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

const {
  createNavigationIndex,
  generateIndexContent
} = require('../scripts/cleanup/create-navigation-index.js');

describe('Navigation Index Creator', () => {
  const testDocsDir = path.join(process.cwd(), 'test-docs-nav');
  const testIndexPath = path.join(testDocsDir, 'README.md');

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDocsDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDocsDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('createNavigationIndex', () => {
    it('should create docs/README.md file', async () => {
      // Override process.cwd() for test
      const originalCwd = process.cwd();
      const testRoot = path.join(originalCwd, 'test-nav-root');
      
      try {
        await fs.mkdir(testRoot, { recursive: true });
        process.chdir(testRoot);
        
        const result = await createNavigationIndex();
        
        expect(result.success).toBe(true);
        expect(result.path).toContain('docs/README.md');
        
        // Verify file exists
        const fileExists = await fs.access(result.path).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
        
        // Clean up
        await fs.rm(testRoot, { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return success status on successful creation', async () => {
      const originalCwd = process.cwd();
      const testRoot = path.join(originalCwd, 'test-nav-success');
      
      try {
        await fs.mkdir(testRoot, { recursive: true });
        process.chdir(testRoot);
        
        const result = await createNavigationIndex();
        
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        
        await fs.rm(testRoot, { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should create docs directory if it does not exist', async () => {
      const originalCwd = process.cwd();
      const testRoot = path.join(originalCwd, 'test-nav-mkdir');
      
      try {
        await fs.mkdir(testRoot, { recursive: true });
        process.chdir(testRoot);
        
        // Verify docs directory doesn't exist
        const docsDir = path.join(testRoot, 'docs');
        const existsBefore = await fs.access(docsDir).then(() => true).catch(() => false);
        expect(existsBefore).toBe(false);
        
        await createNavigationIndex();
        
        // Verify docs directory was created
        const existsAfter = await fs.access(docsDir).then(() => true).catch(() => false);
        expect(existsAfter).toBe(true);
        
        await fs.rm(testRoot, { recursive: true, force: true });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('generateIndexContent - Required Sections (Requirement 6.2)', () => {
    it('should contain Quick Links section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Quick Links');
    });

    it('should contain Documentation Categories section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Documentation Categories');
    });

    it('should contain Date Convention section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Date Convention');
    });

    it('should contain Common Tasks section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Common Tasks');
    });

    it('should contain Repository Structure section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Repository Structure');
    });

    it('should contain Protected Files section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('## Protected Files');
    });
  });

  describe('generateIndexContent - Protected Files Links (Requirement 6.5)', () => {
    it('should link to aws-security-standards.md at root', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('[AWS Security Standards](../aws-security-standards.md)');
    });

    it('should link to deployment-standards.md at root', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('[Deployment Standards](../deployment-standards.md)');
    });

    it('should link to project-deployment-config.md at root', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('[Project Deployment Config](../project-deployment-config.md)');
    });

    it('should describe protected files in Protected Files section', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**aws-security-standards.md**');
      expect(content).toContain('AWS security requirements and best practices');
      expect(content).toContain('**deployment-standards.md**');
      expect(content).toContain('Deployment architecture and standards');
      expect(content).toContain('**project-deployment-config.md**');
      expect(content).toContain('Current deployment configuration');
    });
  });

  describe('generateIndexContent - Category Descriptions (Requirement 6.3)', () => {
    it('should describe summaries category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Summaries');
      expect(content).toContain('Deployment summaries, status reports, and completion documents');
      expect(content).toContain('`summaries/`');
    });

    it('should describe audits category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Audits');
      expect(content).toContain('Validation reports, test results, and verification documents');
      expect(content).toContain('`audits/`');
    });

    it('should describe architecture category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Architecture');
      expect(content).toContain('Infrastructure guides, architecture documentation, and setup instructions');
      expect(content).toContain('`architecture/`');
    });

    it('should describe decisions category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Decisions');
      expect(content).toContain('Quick references, checklists, and implementation decisions');
      expect(content).toContain('`decisions/`');
    });

    it('should describe archive category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Archive');
      expect(content).toContain('Historical documentation older than 90 days');
      expect(content).toContain('`archive/`');
    });
  });

  describe('generateIndexContent - File Type Examples (Requirement 6.3)', () => {
    it('should provide examples for summaries category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:** deployment summaries, implementation complete docs');
    });

    it('should provide examples for audits category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:** validation reports, test summaries, audit results');
    });

    it('should provide examples for architecture category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:** AWS guides, CloudFront configuration, infrastructure docs');
    });

    it('should provide examples for decisions category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:** quick reference guides, deployment checklists');
    });

    it('should provide examples for archive category', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:** outdated deployment summaries, old validation reports');
    });
  });

  describe('generateIndexContent - Date Convention (Requirement 6.6)', () => {
    it('should explain YYYY-MM-DD date format', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**YYYY-MM-DD**');
      expect(content).toContain('prefix format');
    });

    it('should provide date format example', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('`2026-02-22-deployment-summary.md`');
    });

    it('should explain benefits of date convention', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('Files are sorted chronologically');
      expect(content).toContain('Easy identification of document creation dates');
      expect(content).toContain('Consistent naming across all documentation');
    });
  });

  describe('generateIndexContent - Common Tasks (Requirement 6.4)', () => {
    it('should provide task for finding deployment summaries', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find a deployment summary');
      expect(content).toContain('`summaries/`');
    });

    it('should provide task for finding validation reports', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find a validation report');
      expect(content).toContain('`audits/`');
    });

    it('should provide task for finding setup guides', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find a setup guide');
      expect(content).toContain('`architecture/`');
    });

    it('should provide task for finding quick references', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find a quick reference');
      expect(content).toContain('`decisions/`');
    });

    it('should provide task for finding historical documentation', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find historical documentation');
      expect(content).toContain('`archive/`');
    });
  });

  describe('generateIndexContent - Repository Structure', () => {
    it('should show folder structure with descriptions', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('docs/');
      expect(content).toContain('├── README.md');
      expect(content).toContain('├── summaries/');
      expect(content).toContain('├── audits/');
      expect(content).toContain('├── architecture/');
      expect(content).toContain('├── decisions/');
      expect(content).toContain('└── archive/');
    });

    it('should include inline descriptions for each folder', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('# This navigation index');
      expect(content).toContain('# Deployment and status summaries');
      expect(content).toContain('# Validation reports and test results');
      expect(content).toContain('# Infrastructure and design documentation');
      expect(content).toContain('# Implementation decisions and quick references');
      expect(content).toContain('# Historical documentation (>90 days old)');
    });
  });

  describe('generateIndexContent - Markdown Formatting', () => {
    it('should use proper markdown heading hierarchy', () => {
      const content = generateIndexContent({});
      
      // Main title
      expect(content).toMatch(/^# Documentation Navigation/m);
      
      // Section headings
      expect(content).toContain('## Quick Links');
      expect(content).toContain('## Documentation Categories');
      expect(content).toContain('## Date Convention');
      expect(content).toContain('## Common Tasks');
      
      // Subsection headings
      expect(content).toContain('### Summaries');
      expect(content).toContain('### Audits');
      expect(content).toContain('### Find a deployment summary');
    });

    it('should use code blocks for folder paths', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('`summaries/`');
      expect(content).toContain('`audits/`');
      expect(content).toContain('`architecture/`');
      expect(content).toContain('`decisions/`');
      expect(content).toContain('`archive/`');
    });

    it('should use bold formatting for emphasis', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('**Examples:**');
      expect(content).toContain('**Location:**');
      expect(content).toContain('**YYYY-MM-DD**');
      expect(content).toContain('**Example:**');
    });

    it('should include timestamp footer', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('*Last updated:');
      expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty manifest gracefully', () => {
      const content = generateIndexContent({});
      
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('# Documentation Navigation');
    });

    it('should handle undefined manifest gracefully', () => {
      const content = generateIndexContent(undefined);
      
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('# Documentation Navigation');
    });

    it('should handle null manifest gracefully', () => {
      const content = generateIndexContent(null);
      
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('# Documentation Navigation');
    });
  });

  describe('Content Completeness', () => {
    it('should include all required sections in correct order', () => {
      const content = generateIndexContent({});
      
      const quickLinksIndex = content.indexOf('## Quick Links');
      const categoriesIndex = content.indexOf('## Documentation Categories');
      const dateConventionIndex = content.indexOf('## Date Convention');
      const commonTasksIndex = content.indexOf('## Common Tasks');
      const structureIndex = content.indexOf('## Repository Structure');
      const protectedIndex = content.indexOf('## Protected Files');
      
      expect(quickLinksIndex).toBeGreaterThan(-1);
      expect(categoriesIndex).toBeGreaterThan(quickLinksIndex);
      expect(dateConventionIndex).toBeGreaterThan(categoriesIndex);
      expect(commonTasksIndex).toBeGreaterThan(dateConventionIndex);
      expect(structureIndex).toBeGreaterThan(commonTasksIndex);
      expect(protectedIndex).toBeGreaterThan(structureIndex);
    });

    it('should include all five documentation categories', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Summaries');
      expect(content).toContain('### Audits');
      expect(content).toContain('### Architecture');
      expect(content).toContain('### Decisions');
      expect(content).toContain('### Archive');
    });

    it('should include all five common tasks', () => {
      const content = generateIndexContent({});
      
      expect(content).toContain('### Find a deployment summary');
      expect(content).toContain('### Find a validation report');
      expect(content).toContain('### Find a setup guide');
      expect(content).toContain('### Find a quick reference');
      expect(content).toContain('### Find historical documentation');
    });

    it('should include all three protected file links', () => {
      const content = generateIndexContent({});
      
      const protectedFileLinks = [
        '[AWS Security Standards](../aws-security-standards.md)',
        '[Deployment Standards](../deployment-standards.md)',
        '[Project Deployment Config](../project-deployment-config.md)'
      ];
      
      protectedFileLinks.forEach(link => {
        expect(content).toContain(link);
      });
    });
  });
});
