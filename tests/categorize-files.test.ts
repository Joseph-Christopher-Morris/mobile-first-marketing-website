/**
 * Unit tests for file categorization system
 * Tests the core classification functions
 */

import { describe, test, expect, beforeAll } from 'vitest';

// Import the categorization functions
const {
  classifyDocumentation,
  classifyScript,
  isProtectedFile,
  loadConfig
} = require('../scripts/cleanup/categorize-files.js');

describe('File Categorization System', () => {
  beforeAll(async () => {
    // Load configuration before running tests
    await loadConfig();
  });

  describe('classifyDocumentation', () => {
    test('classifies deployment summaries correctly', () => {
      expect(classifyDocumentation('DEPLOYMENT-SUMMARY-FEB-21-2026.md')).toBe('summaries');
      expect(classifyDocumentation('DEPLOYMENT-FIXES-COMPLETE-FEB-20-2026.md')).toBe('summaries');
      expect(classifyDocumentation('FINAL-STATUS-COMPLETE.md')).toBe('summaries');
    });

    test('classifies audit files correctly', () => {
      expect(classifyDocumentation('validation-report-2026.md')).toBe('audits');
      expect(classifyDocumentation('test-results-summary.md')).toBe('audits');
      expect(classifyDocumentation('audit-findings.md')).toBe('audits');
    });

    test('classifies architecture files correctly', () => {
      expect(classifyDocumentation('AWS_S3_DEPLOYMENT_GUIDE.md')).toBe('architecture');
      expect(classifyDocumentation('INFRASTRUCTURE-SETUP.md')).toBe('architecture');
      expect(classifyDocumentation('ARCHITECTURE-OVERVIEW.md')).toBe('architecture');
    });

    test('classifies decision files correctly', () => {
      expect(classifyDocumentation('QUICK-REFERENCE-GUIDE.md')).toBe('decisions');
      expect(classifyDocumentation('DEPLOYMENT-CHECKLIST.md')).toBe('decisions');
      expect(classifyDocumentation('SETUP-INSTRUCTIONS.md')).toBe('decisions');
    });

    test('returns null for non-markdown files', () => {
      expect(classifyDocumentation('script.js')).toBeNull();
      expect(classifyDocumentation('data.json')).toBeNull();
      expect(classifyDocumentation('image.png')).toBeNull();
    });

    test('returns null for markdown files with no matching pattern', () => {
      expect(classifyDocumentation('README.md')).toBeNull();
      expect(classifyDocumentation('random-notes.md')).toBeNull();
    });

    test('identifies protected files', () => {
      expect(classifyDocumentation('aws-security-standards.md')).toBe('protected');
      expect(classifyDocumentation('deployment-standards.md')).toBe('protected');
      expect(classifyDocumentation('project-deployment-config.md')).toBe('protected');
    });
  });

  describe('classifyScript', () => {
    test('classifies fix scripts correctly', () => {
      expect(classifyScript('fix-broken-images.js')).toBe('fixes');
      expect(classifyScript('repair-metadata.js')).toBe('fixes');
      expect(classifyScript('blog-fix.js')).toBe('fixes');
    });

    test('classifies migration scripts correctly', () => {
      expect(classifyScript('deploy-production.js')).toBe('migrations');
      expect(classifyScript('setup-infrastructure.js')).toBe('migrations');
      expect(classifyScript('configure-cloudfront.js')).toBe('migrations');
      expect(classifyScript('migrate-database.js')).toBe('migrations');
    });

    test('classifies utility scripts correctly', () => {
      expect(classifyScript('validate-build.js')).toBe('utilities');
      expect(classifyScript('test-deployment.js')).toBe('utilities');
      expect(classifyScript('verify-links.js')).toBe('utilities');
      expect(classifyScript('check-dependencies.js')).toBe('utilities');
      expect(classifyScript('monitor-performance.js')).toBe('utilities');
    });

    test('returns null for non-JavaScript files', () => {
      expect(classifyScript('README.md')).toBeNull();
      expect(classifyScript('config.json')).toBeNull();
      expect(classifyScript('style.css')).toBeNull();
    });

    test('returns null for scripts with no matching pattern', () => {
      expect(classifyScript('random-script.js')).toBeNull();
      expect(classifyScript('helper.js')).toBeNull();
    });
  });

  describe('isProtectedFile', () => {
    test('identifies protected governance files', () => {
      expect(isProtectedFile('aws-security-standards.md')).toBe(true);
      expect(isProtectedFile('deployment-standards.md')).toBe(true);
      expect(isProtectedFile('project-deployment-config.md')).toBe(true);
    });

    test('returns false for non-protected files', () => {
      expect(isProtectedFile('README.md')).toBe(false);
      expect(isProtectedFile('DEPLOYMENT-SUMMARY.md')).toBe(false);
      expect(isProtectedFile('script.js')).toBe(false);
    });
  });

  describe('Pattern matching', () => {
    test('handles case-insensitive matching', () => {
      expect(classifyDocumentation('deployment-summary.md')).toBe('summaries');
      expect(classifyDocumentation('DEPLOYMENT-SUMMARY.md')).toBe('summaries');
      expect(classifyDocumentation('Deployment-Summary.md')).toBe('summaries');
    });

    test('handles wildcard patterns correctly', () => {
      expect(classifyDocumentation('FINAL-DEPLOYMENT-STATUS.md')).toBe('summaries');
      expect(classifyDocumentation('AWS_CLOUDFRONT_GUIDE.md')).toBe('architecture');
      expect(classifyScript('fix-all-blog-html.js')).toBe('fixes');
    });
  });

  describe('Edge cases', () => {
    test('handles empty strings', () => {
      expect(classifyDocumentation('')).toBeNull();
      expect(classifyScript('')).toBeNull();
    });

    test('handles files with multiple extensions', () => {
      expect(classifyDocumentation('backup.md.bak')).toBeNull();
      expect(classifyScript('script.js.old')).toBeNull();
    });

    test('handles files with no extension', () => {
      expect(classifyDocumentation('README')).toBeNull();
      expect(classifyScript('deploy')).toBeNull();
    });

    test('handles files with multiple matching patterns - first match wins', () => {
      // File contains both "validation" (audits) and "deployment" (summaries)
      // Based on priority order in implementation, audits should win
      expect(classifyDocumentation('deployment-validation-report.md')).toBe('audits');
      
      // File contains both "audit" (audits) and "summary" (summaries)
      expect(classifyDocumentation('audit-summary.md')).toBe('audits');
      
      // File contains both "guide" (architecture) and "checklist" (decisions)
      expect(classifyDocumentation('guide-checklist.md')).toBe('decisions');
    });

    test('handles files with no matching patterns', () => {
      // Documentation files that don't match any pattern
      expect(classifyDocumentation('random-notes.md')).toBeNull();
      expect(classifyDocumentation('meeting-minutes.md')).toBeNull();
      expect(classifyDocumentation('todo-list.md')).toBeNull();
      
      // Script files that don't match any pattern
      expect(classifyScript('helper-functions.js')).toBeNull();
      expect(classifyScript('utils.js')).toBeNull();
      expect(classifyScript('index.js')).toBeNull();
    });

    test('handles protected files with pattern-like names', () => {
      // Protected files should always return 'protected' even if they match other patterns
      // deployment-standards.md contains "deployment" but should be protected
      expect(classifyDocumentation('deployment-standards.md')).toBe('protected');
      
      // aws-security-standards.md starts with AWS_ pattern but should be protected
      expect(classifyDocumentation('aws-security-standards.md')).toBe('protected');
    });

    test('handles files with special characters in names', () => {
      expect(classifyDocumentation('deployment_summary_2026.md')).toBe('summaries');
      // Note: fix_broken_links.js uses underscore, not dash, so it won't match fix-* pattern
      expect(classifyScript('fix_broken_links.js')).toBeNull();
      // This one uses dashes and will match
      expect(classifyScript('fix-broken-links.js')).toBe('fixes');
    });

    test('handles files with numbers in names', () => {
      expect(classifyDocumentation('DEPLOYMENT-SUMMARY-2026-02-21.md')).toBe('summaries');
      expect(classifyScript('fix-issue-123.js')).toBe('fixes');
      expect(classifyScript('deploy-v2.js')).toBe('migrations');
    });

    test('handles very long filenames', () => {
      const longFilename = 'DEPLOYMENT-SUMMARY-WITH-VERY-LONG-DESCRIPTIVE-NAME-INCLUDING-DATES-AND-DETAILS-FEB-21-2026.md';
      expect(classifyDocumentation(longFilename)).toBe('summaries');
      
      const longScriptName = 'fix-all-broken-images-and-metadata-issues-in-blog-posts.js';
      expect(classifyScript(longScriptName)).toBe('fixes');
    });

    test('handles files with only pattern keyword', () => {
      expect(classifyDocumentation('DEPLOYMENT.md')).toBe('summaries');
      expect(classifyDocumentation('AUDIT.md')).toBe('audits');
      expect(classifyScript('fix.js')).toBeNull(); // "fix" alone doesn't match "fix-*" pattern
      expect(classifyScript('deploy.js')).toBeNull(); // "deploy" alone doesn't match "deploy-*" pattern
    });

    test('handles files with pattern at different positions', () => {
      // Pattern at start
      expect(classifyDocumentation('DEPLOYMENT-notes.md')).toBe('summaries');
      expect(classifyScript('fix-something.js')).toBe('fixes');
      
      // Pattern in middle - note: blog-fix-script.js doesn't match *-fix.js pattern
      // because it has additional text after -fix
      expect(classifyDocumentation('final-DEPLOYMENT-notes.md')).toBe('summaries');
      expect(classifyScript('blog-fix.js')).toBe('fixes'); // This matches *-fix.js
      
      // Pattern at end
      expect(classifyDocumentation('notes-DEPLOYMENT.md')).toBe('summaries');
      expect(classifyScript('something-fix.js')).toBe('fixes');
    });
  });

  describe('Specific categorization examples for each pattern type', () => {
    describe('Documentation - Summaries', () => {
      test('matches DEPLOYMENT pattern variations', () => {
        expect(classifyDocumentation('DEPLOYMENT-COMPLETE.md')).toBe('summaries');
        // Note: pre-deployment-checklist.md matches *CHECKLIST* pattern which has higher priority
        expect(classifyDocumentation('pre-deployment-checklist.md')).toBe('decisions');
        expect(classifyDocumentation('post-deployment-summary.md')).toBe('summaries');
      });

      test('matches SUMMARY pattern variations', () => {
        expect(classifyDocumentation('SUMMARY-REPORT.md')).toBe('summaries');
        expect(classifyDocumentation('weekly-summary.md')).toBe('summaries');
        expect(classifyDocumentation('project-summary.md')).toBe('summaries');
      });

      test('matches STATUS pattern variations', () => {
        expect(classifyDocumentation('STATUS-UPDATE.md')).toBe('summaries');
        expect(classifyDocumentation('current-status.md')).toBe('summaries');
        expect(classifyDocumentation('deployment-status.md')).toBe('summaries');
      });

      test('matches COMPLETE pattern variations', () => {
        expect(classifyDocumentation('COMPLETE-REPORT.md')).toBe('summaries');
        expect(classifyDocumentation('migration-complete.md')).toBe('summaries');
        expect(classifyDocumentation('setup-complete.md')).toBe('summaries');
      });
    });

    describe('Documentation - Audits', () => {
      test('matches validation-report pattern', () => {
        expect(classifyDocumentation('validation-report-2026.md')).toBe('audits');
        expect(classifyDocumentation('security-validation-report.md')).toBe('audits');
        expect(classifyDocumentation('final-validation-report.md')).toBe('audits');
      });

      test('matches test-results pattern', () => {
        expect(classifyDocumentation('test-results-summary.md')).toBe('audits');
        expect(classifyDocumentation('integration-test-results.md')).toBe('audits');
        expect(classifyDocumentation('unit-test-results.md')).toBe('audits');
      });

      test('matches audit pattern variations', () => {
        expect(classifyDocumentation('AUDIT-FINDINGS.md')).toBe('audits');
        expect(classifyDocumentation('security-audit.md')).toBe('audits');
        expect(classifyDocumentation('code-audit.md')).toBe('audits');
      });

      test('matches verification pattern variations', () => {
        expect(classifyDocumentation('VERIFICATION-REPORT.md')).toBe('audits');
        expect(classifyDocumentation('deployment-verification.md')).toBe('audits');
        expect(classifyDocumentation('build-verification.md')).toBe('audits');
      });
    });

    describe('Documentation - Architecture', () => {
      test('matches AWS_ prefix pattern', () => {
        expect(classifyDocumentation('AWS_S3_DEPLOYMENT_GUIDE.md')).toBe('architecture');
        expect(classifyDocumentation('AWS_CLOUDFRONT_SETUP.md')).toBe('architecture');
        expect(classifyDocumentation('AWS_INFRASTRUCTURE.md')).toBe('architecture');
      });

      test('matches GUIDE pattern variations', () => {
        expect(classifyDocumentation('DEPLOYMENT-GUIDE.md')).toBe('architecture');
        expect(classifyDocumentation('setup-guide.md')).toBe('architecture');
        expect(classifyDocumentation('user-guide.md')).toBe('architecture');
      });

      test('matches ARCHITECTURE pattern variations', () => {
        expect(classifyDocumentation('ARCHITECTURE-OVERVIEW.md')).toBe('architecture');
        expect(classifyDocumentation('system-architecture.md')).toBe('architecture');
        expect(classifyDocumentation('cloud-architecture.md')).toBe('architecture');
      });

      test('matches INFRASTRUCTURE pattern variations', () => {
        expect(classifyDocumentation('INFRASTRUCTURE-SETUP.md')).toBe('architecture');
        expect(classifyDocumentation('cloud-infrastructure.md')).toBe('architecture');
        expect(classifyDocumentation('infrastructure-design.md')).toBe('architecture');
      });
    });

    describe('Documentation - Decisions', () => {
      test('matches QUICK-REFERENCE pattern', () => {
        expect(classifyDocumentation('QUICK-REFERENCE-GUIDE.md')).toBe('decisions');
        expect(classifyDocumentation('deployment-quick-reference.md')).toBe('decisions');
        expect(classifyDocumentation('api-quick-reference.md')).toBe('decisions');
      });

      test('matches CHECKLIST pattern variations', () => {
        expect(classifyDocumentation('DEPLOYMENT-CHECKLIST.md')).toBe('decisions');
        expect(classifyDocumentation('pre-launch-checklist.md')).toBe('decisions');
        expect(classifyDocumentation('security-checklist.md')).toBe('decisions');
      });

      test('matches INSTRUCTIONS pattern variations', () => {
        expect(classifyDocumentation('SETUP-INSTRUCTIONS.md')).toBe('decisions');
        expect(classifyDocumentation('deployment-instructions.md')).toBe('decisions');
        expect(classifyDocumentation('installation-instructions.md')).toBe('decisions');
      });
    });

    describe('Scripts - Fixes', () => {
      test('matches fix-* pattern', () => {
        expect(classifyScript('fix-broken-images.js')).toBe('fixes');
        expect(classifyScript('fix-metadata.js')).toBe('fixes');
        expect(classifyScript('fix-links.js')).toBe('fixes');
      });

      test('matches *-fix pattern', () => {
        expect(classifyScript('blog-fix.js')).toBe('fixes');
        expect(classifyScript('image-fix.js')).toBe('fixes');
        expect(classifyScript('seo-fix.js')).toBe('fixes');
      });

      test('matches repair-* pattern', () => {
        expect(classifyScript('repair-database.js')).toBe('fixes');
        expect(classifyScript('repair-metadata.js')).toBe('fixes');
        expect(classifyScript('repair-links.js')).toBe('fixes');
      });
    });

    describe('Scripts - Migrations', () => {
      test('matches deploy-* pattern', () => {
        expect(classifyScript('deploy-production.js')).toBe('migrations');
        expect(classifyScript('deploy-staging.js')).toBe('migrations');
        expect(classifyScript('deploy-cloudfront.js')).toBe('migrations');
      });

      test('matches setup-* pattern', () => {
        expect(classifyScript('setup-infrastructure.js')).toBe('migrations');
        expect(classifyScript('setup-database.js')).toBe('migrations');
        expect(classifyScript('setup-monitoring.js')).toBe('migrations');
      });

      test('matches configure-* pattern', () => {
        expect(classifyScript('configure-cloudfront.js')).toBe('migrations');
        expect(classifyScript('configure-s3.js')).toBe('migrations');
        expect(classifyScript('configure-cdn.js')).toBe('migrations');
      });

      test('matches migrate-* pattern', () => {
        expect(classifyScript('migrate-database.js')).toBe('migrations');
        expect(classifyScript('migrate-content.js')).toBe('migrations');
        expect(classifyScript('migrate-users.js')).toBe('migrations');
      });
    });

    describe('Scripts - Utilities', () => {
      test('matches validate-* pattern', () => {
        expect(classifyScript('validate-build.js')).toBe('utilities');
        expect(classifyScript('validate-deployment.js')).toBe('utilities');
        expect(classifyScript('validate-config.js')).toBe('utilities');
      });

      test('matches test-* pattern', () => {
        expect(classifyScript('test-deployment.js')).toBe('utilities');
        expect(classifyScript('test-api.js')).toBe('utilities');
        expect(classifyScript('test-integration.js')).toBe('utilities');
      });

      test('matches verify-* pattern', () => {
        expect(classifyScript('verify-links.js')).toBe('utilities');
        expect(classifyScript('verify-images.js')).toBe('utilities');
        expect(classifyScript('verify-deployment.js')).toBe('utilities');
      });

      test('matches check-* pattern', () => {
        expect(classifyScript('check-dependencies.js')).toBe('utilities');
        expect(classifyScript('check-security.js')).toBe('utilities');
        expect(classifyScript('check-health.js')).toBe('utilities');
      });

      test('matches monitor-* pattern', () => {
        expect(classifyScript('monitor-performance.js')).toBe('utilities');
        expect(classifyScript('monitor-uptime.js')).toBe('utilities');
        expect(classifyScript('monitor-errors.js')).toBe('utilities');
      });
    });
  });
});
