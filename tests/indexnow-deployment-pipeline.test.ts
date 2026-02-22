import { describe, it, expect } from 'vitest';
import * as fs from 'fs/promises';
import * as yaml from 'yaml';

/**
 * Integration Tests for IndexNow Deployment Pipeline
 * 
 * Feature: indexnow-submission
 * 
 * Tests the GitHub Actions workflow integration to verify that the IndexNow
 * submission step is correctly configured in the deployment pipeline.
 * 
 * Test Coverage:
 * - Workflow executes submission step (Requirement 4.1)
 * - Deployment continues on submission failure (Requirement 4.4)
 * - Environment variables are correctly passed (Requirements 4.5, 7.1, 7.3)
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 7.1, 7.3
 */

describe('Feature: indexnow-submission - Deployment Pipeline Integration Tests', () => {
  const WORKFLOW_PATH = '.github/workflows/s3-cloudfront-deploy.yml';

  describe('Requirement 4.1: Workflow Executes Submission Step', () => {
    it('should have IndexNow submission step in workflow', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      // Find the deploy job
      const deployJob = workflow.jobs.deploy;
      expect(deployJob).toBeDefined();

      // Find the IndexNow submission step
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep).toBeDefined();
      expect(indexNowStep.name).toBe('Submit to IndexNow');
    });

    it('should execute submission script with --all flag', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.run).toBe('node scripts/submit-indexnow.js --all');
    });

    it('should run after CloudFront invalidation step', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const steps = deployJob.steps;

      // Find the indices of both steps
      const cloudFrontStepIndex = steps.findIndex(
        (step: any) => step.name === 'Invalidate CloudFront'
      );
      const indexNowStepIndex = steps.findIndex(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(cloudFrontStepIndex).toBeGreaterThanOrEqual(0);
      expect(indexNowStepIndex).toBeGreaterThanOrEqual(0);
      expect(indexNowStepIndex).toBeGreaterThan(cloudFrontStepIndex);
    });

    it('should be part of the deploy job', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      expect(deployJob).toBeDefined();

      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep).toBeDefined();
    });
  });

  describe('Requirement 4.4: Deployment Continues on Submission Failure', () => {
    it('should have continue-on-error set to true', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep['continue-on-error']).toBe(true);
    });

    it('should not block deployment on failure', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // Verify continue-on-error is explicitly set (not just missing)
      expect(indexNowStep).toHaveProperty('continue-on-error');
      expect(indexNowStep['continue-on-error']).toBe(true);
    });

    it('should allow subsequent steps to run after IndexNow step', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const steps = deployJob.steps;

      const indexNowStepIndex = steps.findIndex(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // Verify there are steps after IndexNow submission
      expect(steps.length).toBeGreaterThan(indexNowStepIndex + 1);

      // Verify the next step exists (should be audit/monitoring steps)
      const nextStep = steps[indexNowStepIndex + 1];
      expect(nextStep).toBeDefined();
      expect(nextStep.name).toBeDefined();
    });
  });

  describe('Requirements 4.5, 7.1, 7.3: Environment Variables Configuration', () => {
    it('should configure INDEXNOW_API_KEY environment variable', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.env).toBeDefined();
      expect(indexNowStep.env.INDEXNOW_API_KEY).toBeDefined();
    });

    it('should read API key from GitHub Secrets', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.env.INDEXNOW_API_KEY).toBe('${{ secrets.INDEXNOW_API_KEY }}');
    });

    it('should configure SITE_DOMAIN environment variable', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.env.SITE_DOMAIN).toBeDefined();
      expect(indexNowStep.env.SITE_DOMAIN).toBe('vividmediacheshire.com');
    });

    it('should configure CLOUDFRONT_DOMAIN environment variable', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.env.CLOUDFRONT_DOMAIN).toBeDefined();
      expect(indexNowStep.env.CLOUDFRONT_DOMAIN).toBe('d15sc9fc739ev2.cloudfront.net');
    });

    it('should have all required environment variables', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      const requiredEnvVars = ['INDEXNOW_API_KEY', 'SITE_DOMAIN', 'CLOUDFRONT_DOMAIN'];
      
      for (const envVar of requiredEnvVars) {
        expect(indexNowStep.env).toHaveProperty(envVar);
        expect(indexNowStep.env[envVar]).toBeDefined();
        expect(indexNowStep.env[envVar]).not.toBe('');
      }
    });

    it('should not expose API key value in workflow file', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // API key should reference secrets, not contain actual key
      expect(indexNowStep.env.INDEXNOW_API_KEY).toContain('secrets.');
      expect(indexNowStep.env.INDEXNOW_API_KEY).not.toMatch(/^[0-9a-f]{8,128}$/);
    });
  });

  describe('Workflow Structure Validation', () => {
    it('should be a valid YAML file', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      
      // Should not throw when parsing
      expect(() => yaml.parse(workflowContent)).not.toThrow();
    });

    it('should have required workflow structure', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      expect(workflow.name).toBeDefined();
      expect(workflow.jobs).toBeDefined();
      expect(workflow.jobs.deploy).toBeDefined();
      expect(workflow.jobs.deploy.steps).toBeDefined();
      expect(Array.isArray(workflow.jobs.deploy.steps)).toBe(true);
    });

    it('should have deploy job run on main branch', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      expect(deployJob.if).toBeDefined();
      expect(deployJob.if).toContain('refs/heads/main');
    });

    it('should have proper step ordering', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const steps = deployJob.steps;

      // Find key steps
      const checkoutIndex = steps.findIndex(
        (step: any) => step.name && step.name.includes('Checkout')
      );
      const cloudFrontIndex = steps.findIndex(
        (step: any) => step.name === 'Invalidate CloudFront'
      );
      const indexNowIndex = steps.findIndex(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // Verify ordering: checkout -> cloudfront -> indexnow
      expect(checkoutIndex).toBeGreaterThanOrEqual(0);
      expect(cloudFrontIndex).toBeGreaterThan(checkoutIndex);
      expect(indexNowIndex).toBeGreaterThan(cloudFrontIndex);
    });
  });

  describe('Step Configuration Validation', () => {
    it('should use correct script path', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.run).toContain('scripts/submit-indexnow.js');
    });

    it('should use node command to execute script', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(indexNowStep.run).toMatch(/^node\s+/);
    });

    it('should not have conditional execution (if clause)', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // Step should always run (no if clause)
      expect(indexNowStep.if).toBeUndefined();
    });

    it('should not have timeout configured', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // No timeout means it uses default GitHub Actions timeout
      expect(indexNowStep['timeout-minutes']).toBeUndefined();
    });
  });

  describe('Environment Variable Security', () => {
    it('should not contain hardcoded API keys in workflow', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');

      // Check for patterns that look like API keys (hex strings 8-128 chars)
      const hexKeyPattern = /[0-9a-f]{32,128}/gi;
      const matches = workflowContent.match(hexKeyPattern);

      // Should not find any long hex strings that could be API keys
      // (Allow short hex strings like commit SHAs)
      if (matches) {
        for (const match of matches) {
          // If we find a long hex string, it should be in a comment or example
          expect(match.length).toBeLessThan(32);
        }
      }
    });

    it('should use GitHub Secrets for sensitive data', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // All sensitive environment variables should use secrets
      const apiKeyValue = indexNowStep.env.INDEXNOW_API_KEY;
      expect(apiKeyValue).toMatch(/\$\{\{\s*secrets\./);
    });

    it('should not log environment variables', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // Step should not echo or print environment variables
      expect(indexNowStep.run).not.toContain('echo $INDEXNOW_API_KEY');
      expect(indexNowStep.run).not.toContain('printenv');
      expect(indexNowStep.run).not.toContain('env');
    });
  });

  describe('Integration with Deployment Flow', () => {
    it('should run in deploy job, not build job', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const buildJob = workflow.jobs.build;
      const deployJob = workflow.jobs.deploy;

      // IndexNow step should be in deploy job
      const deployIndexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );
      expect(deployIndexNowStep).toBeDefined();

      // IndexNow step should NOT be in build job
      const buildIndexNowStep = buildJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );
      expect(buildIndexNowStep).toBeUndefined();
    });

    it('should run after S3 sync steps', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const steps = deployJob.steps;

      const s3SyncIndex = steps.findIndex(
        (step: any) => step.name && step.name.includes('Sync')
      );
      const indexNowIndex = steps.findIndex(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      expect(s3SyncIndex).toBeGreaterThanOrEqual(0);
      expect(indexNowIndex).toBeGreaterThan(s3SyncIndex);
    });

    it('should run before audit finalization', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const steps = deployJob.steps;

      const indexNowIndex = steps.findIndex(
        (step: any) => step.name === 'Submit to IndexNow'
      );
      const auditFinalizeIndex = steps.findIndex(
        (step: any) => step.name && step.name.includes('Finalize Audit')
      );

      expect(indexNowIndex).toBeGreaterThanOrEqual(0);
      
      // If audit finalization step exists, IndexNow should run before it
      if (auditFinalizeIndex >= 0) {
        expect(indexNowIndex).toBeLessThan(auditFinalizeIndex);
      }
    });
  });

  describe('Error Handling Configuration', () => {
    it('should allow deployment to succeed even if IndexNow fails', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // continue-on-error: true means deployment won't fail
      expect(indexNowStep['continue-on-error']).toBe(true);
    });

    it('should not have retry configuration', async () => {
      const workflowContent = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      const workflow = yaml.parse(workflowContent);

      const deployJob = workflow.jobs.deploy;
      const indexNowStep = deployJob.steps.find(
        (step: any) => step.name === 'Submit to IndexNow'
      );

      // No retry means it runs once and continues on error
      expect(indexNowStep.uses).toBeUndefined(); // Not using a retry action
      expect(indexNowStep.run).not.toContain('retry');
    });
  });
});
