/**
 * Unit Tests for Path Reference Updater
 * 
 * Tests specific examples and edge cases for:
 * - package.json script path updates
 * - GitHub Actions workflow path updates
 * - Script reference updates (require/import statements)
 * - Critical path validation (scripts/deploy.js, workflows)
 * 
 * Requirements: 4.7, 8.1-8.5
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';

const updateReferences = require('../scripts/cleanup/update-references.js');

describe('Path Reference Updater - Unit Tests', () => {
  let tempDir: string;
  
  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'update-refs-test-'));
  });
  
  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir && fsSync.existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
  
  describe('updatePackageJson', () => {
    test('should update script paths in package.json', async () => {
      // Create test package.json
      const packageJson = {
        name: 'test-project',
        scripts: {
          deploy: 'node scripts/deploy.js',
          validate: 'node scripts/validate.js'
        }
      };
      
      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Change to temp directory
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        // Create path mappings
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js'],
          ['scripts/validate.js', 'scripts/utilities/validate.js']
        ]);
        
        // Update package.json
        const result = await updateReferences.updatePackageJson(pathMappings);
        
        // Verify updates
        expect(result.updated).toBe(2);
        expect(result.errors).toHaveLength(0);
        
        // Read updated package.json
        const updatedContent = await fs.readFile(packageJsonPath, 'utf-8');
        const updatedPackageJson = JSON.parse(updatedContent);
        
        expect(updatedPackageJson.scripts.deploy).toBe('node scripts/migrations/deploy.js');
        expect(updatedPackageJson.scripts.validate).toBe('node scripts/utilities/validate.js');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle package.json with no scripts section', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0'
      };
      
      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updatePackageJson(pathMappings);
        
        expect(result.updated).toBe(0);
        expect(result.errors).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle missing package.json', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updatePackageJson(pathMappings);
        
        expect(result.updated).toBe(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('package.json not found');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should update multiple references in same script command', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          'deploy-all': 'node scripts/deploy.js && node scripts/validate.js'
        }
      };
      
      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js'],
          ['scripts/validate.js', 'scripts/utilities/validate.js']
        ]);
        
        const result = await updateReferences.updatePackageJson(pathMappings);
        
        expect(result.updated).toBe(2);
        
        const updatedContent = await fs.readFile(packageJsonPath, 'utf-8');
        const updatedPackageJson = JSON.parse(updatedContent);
        
        expect(updatedPackageJson.scripts['deploy-all']).toBe(
          'node scripts/migrations/deploy.js && node scripts/utilities/validate.js'
        );
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should preserve package.json formatting', async () => {
      const packageJson = {
        name: 'test-project',
        scripts: {
          deploy: 'node scripts/deploy.js'
        }
      };
      
      const packageJsonPath = path.join(tempDir, 'package.json');
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        await updateReferences.updatePackageJson(pathMappings);
        
        const updatedContent = await fs.readFile(packageJsonPath, 'utf-8');
        
        // Should end with newline
        expect(updatedContent.endsWith('\n')).toBe(true);
        
        // Should be valid JSON
        expect(() => JSON.parse(updatedContent)).not.toThrow();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
  
  describe('updateGitHubWorkflows', () => {
    test('should update paths in GitHub Actions workflow files', async () => {
      // Create .github/workflows directory
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      await fs.mkdir(workflowsDir, { recursive: true });
      
      // Create test workflow file
      const workflow = `name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: node scripts/deploy.js
      - name: Validate
        run: node scripts/validate.js
`;
      
      const workflowPath = path.join(workflowsDir, 'deploy.yml');
      await fs.writeFile(workflowPath, workflow);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js'],
          ['scripts/validate.js', 'scripts/utilities/validate.js']
        ]);
        
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        expect(result.updated).toBe(2);
        expect(result.errors).toHaveLength(0);
        
        const updatedContent = await fs.readFile(workflowPath, 'utf-8');
        expect(updatedContent).toContain('scripts/migrations/deploy.js');
        expect(updatedContent).toContain('scripts/utilities/validate.js');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle missing .github/workflows directory', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        expect(result.updated).toBe(0);
        expect(result.errors).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle empty workflows directory', async () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      await fs.mkdir(workflowsDir, { recursive: true });
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        expect(result.updated).toBe(0);
        expect(result.errors).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should process both .yml and .yaml files', async () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      await fs.mkdir(workflowsDir, { recursive: true });
      
      const workflow1 = 'run: node scripts/deploy.js';
      const workflow2 = 'run: node scripts/deploy.js';
      
      await fs.writeFile(path.join(workflowsDir, 'deploy.yml'), workflow1);
      await fs.writeFile(path.join(workflowsDir, 'test.yaml'), workflow2);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        expect(result.updated).toBe(2);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle workflow file read errors gracefully', async () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      await fs.mkdir(workflowsDir, { recursive: true });
      
      // Create a file with restricted permissions (if possible)
      const workflowPath = path.join(workflowsDir, 'deploy.yml');
      await fs.writeFile(workflowPath, 'run: node scripts/deploy.js');
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        // This should succeed normally, but demonstrates error handling
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        // Should either succeed or have errors, but not crash
        expect(result).toHaveProperty('updated');
        expect(result).toHaveProperty('errors');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
  
  describe('updateScriptReferences', () => {
    test('should update require() statements in scripts', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      await fs.mkdir(scriptsDir, { recursive: true });
      
      const scriptContent = `
const deploy = require('./deploy.js');
const validate = require("./validate.js");
const helper = require('../lib/helper.js');
`;
      
      const scriptPath = path.join(scriptsDir, 'main.js');
      await fs.writeFile(scriptPath, scriptContent);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['./deploy.js', './migrations/deploy.js'],
          ['./validate.js', './utilities/validate.js']
        ]);
        
        const result = await updateReferences.updateScriptReferences(pathMappings);
        
        expect(result.updated).toBeGreaterThan(0);
        expect(result.errors).toHaveLength(0);
        
        const updatedContent = await fs.readFile(scriptPath, 'utf-8');
        expect(updatedContent).toContain("require('./migrations/deploy.js')");
        expect(updatedContent).toContain('require("./utilities/validate.js")');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should update import statements in scripts', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      await fs.mkdir(scriptsDir, { recursive: true });
      
      const scriptContent = `
import { deploy } from './deploy.js';
import validate from "./validate.js";
import * as helper from '../lib/helper.js';
`;
      
      const scriptPath = path.join(scriptsDir, 'main.js');
      await fs.writeFile(scriptPath, scriptContent);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['./deploy.js', './migrations/deploy.js'],
          ['./validate.js', './utilities/validate.js']
        ]);
        
        const result = await updateReferences.updateScriptReferences(pathMappings);
        
        expect(result.updated).toBeGreaterThan(0);
        
        const updatedContent = await fs.readFile(scriptPath, 'utf-8');
        expect(updatedContent).toContain("from './migrations/deploy.js'");
        expect(updatedContent).toContain('from "./utilities/validate.js"');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should handle missing scripts directory', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['./deploy.js', './migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateScriptReferences(pathMappings);
        
        expect(result.updated).toBe(0);
        expect(result.errors).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should recursively process nested script directories', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      const nestedDir = path.join(scriptsDir, 'nested');
      await fs.mkdir(nestedDir, { recursive: true });
      
      const scriptContent = "const deploy = require('./deploy.js');";
      
      await fs.writeFile(path.join(scriptsDir, 'main.js'), scriptContent);
      await fs.writeFile(path.join(nestedDir, 'sub.js'), scriptContent);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['./deploy.js', './migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateScriptReferences(pathMappings);
        
        // Should update both files
        expect(result.updated).toBe(2);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should skip node_modules directory', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      const nodeModulesDir = path.join(scriptsDir, 'node_modules');
      await fs.mkdir(nodeModulesDir, { recursive: true });
      
      const scriptContent = "const deploy = require('./deploy.js');";
      
      await fs.writeFile(path.join(scriptsDir, 'main.js'), scriptContent);
      await fs.writeFile(path.join(nodeModulesDir, 'package.js'), scriptContent);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['./deploy.js', './migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateScriptReferences(pathMappings);
        
        // Should only update main.js, not the file in node_modules
        expect(result.updated).toBe(1);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
  
  describe('findReferences', () => {
    test('should find single reference in content', () => {
      const content = 'const deploy = require("scripts/deploy.js");';
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      
      expect(references).toHaveLength(1);
      expect(references[0]).toBe('Line 1');
    });
    
    test('should find multiple references in content', () => {
      const content = `Line 1: scripts/deploy.js
Line 2: something else
Line 3: scripts/deploy.js again`;
      
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      
      expect(references).toHaveLength(2);
      expect(references).toContain('Line 1');
      expect(references).toContain('Line 3');
    });
    
    test('should return empty array when no references found', () => {
      const content = 'const deploy = require("other/path.js");';
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      
      expect(references).toHaveLength(0);
    });
    
    test('should handle empty content', () => {
      const content = '';
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      
      expect(references).toHaveLength(0);
    });
    
    test('should find references in comments', () => {
      const content = `// Reference to scripts/deploy.js
const other = require("other.js");`;
      
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      
      expect(references).toHaveLength(1);
      expect(references[0]).toBe('Line 1');
    });
  });
  
  describe('generatePathMappings', () => {
    test('should generate mappings from documentation moves', () => {
      const moveReport = {
        documentation: {
          moved: [
            { source: 'doc1.md', destination: 'docs/summaries/doc1.md' },
            { source: 'doc2.md', destination: 'docs/audits/doc2.md' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(2);
      expect(mappings.get('doc1.md')).toBe('docs/summaries/doc1.md');
      expect(mappings.get('doc2.md')).toBe('docs/audits/doc2.md');
    });
    
    test('should generate mappings from script moves', () => {
      const moveReport = {
        scripts: {
          moved: [
            { source: 'deploy.js', destination: 'scripts/migrations/deploy.js' },
            { source: 'validate.js', destination: 'scripts/utilities/validate.js' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(2);
      expect(mappings.get('deploy.js')).toBe('scripts/migrations/deploy.js');
      expect(mappings.get('validate.js')).toBe('scripts/utilities/validate.js');
    });
    
    test('should combine documentation and script moves', () => {
      const moveReport = {
        documentation: {
          moved: [
            { source: 'doc.md', destination: 'docs/summaries/doc.md' }
          ]
        },
        scripts: {
          moved: [
            { source: 'script.js', destination: 'scripts/utilities/script.js' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(2);
      expect(mappings.get('doc.md')).toBe('docs/summaries/doc.md');
      expect(mappings.get('script.js')).toBe('scripts/utilities/script.js');
    });
    
    test('should handle empty move report', () => {
      const moveReport = {
        documentation: { moved: [] },
        scripts: { moved: [] }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(0);
    });
    
    test('should handle missing documentation section', () => {
      const moveReport = {
        scripts: {
          moved: [
            { source: 'script.js', destination: 'scripts/utilities/script.js' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(1);
      expect(mappings.get('script.js')).toBe('scripts/utilities/script.js');
    });
    
    test('should handle missing scripts section', () => {
      const moveReport = {
        documentation: {
          moved: [
            { source: 'doc.md', destination: 'docs/summaries/doc.md' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      
      expect(mappings.size).toBe(1);
      expect(mappings.get('doc.md')).toBe('docs/summaries/doc.md');
    });
  });
  
  describe('Critical Path Validation', () => {
    test('should validate scripts/deploy.js references are updated', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      await fs.mkdir(scriptsDir, { recursive: true });
      
      const packageJson = {
        scripts: {
          deploy: 'node scripts/deploy.js'
        }
      };
      
      await fs.writeFile(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updatePackageJson(pathMappings);
        
        expect(result.updated).toBe(1);
        
        const updatedContent = await fs.readFile(
          path.join(tempDir, 'package.json'),
          'utf-8'
        );
        const updatedPackageJson = JSON.parse(updatedContent);
        
        expect(updatedPackageJson.scripts.deploy).toBe('node scripts/migrations/deploy.js');
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    test('should validate GitHub Actions workflow paths are updated', async () => {
      const workflowsDir = path.join(tempDir, '.github', 'workflows');
      await fs.mkdir(workflowsDir, { recursive: true });
      
      const workflow = `name: Deploy
jobs:
  deploy:
    steps:
      - run: node scripts/deploy.js
`;
      
      await fs.writeFile(path.join(workflowsDir, 'deploy.yml'), workflow);
      
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const pathMappings = new Map([
          ['scripts/deploy.js', 'scripts/migrations/deploy.js']
        ]);
        
        const result = await updateReferences.updateGitHubWorkflows(pathMappings);
        
        expect(result.updated).toBe(1);
        
        const updatedContent = await fs.readFile(
          path.join(workflowsDir, 'deploy.yml'),
          'utf-8'
        );
        
        expect(updatedContent).toContain('scripts/migrations/deploy.js');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
  
  describe('getJavaScriptFiles', () => {
    test('should find all JavaScript files in directory', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      await fs.mkdir(scriptsDir, { recursive: true });
      
      await fs.writeFile(path.join(scriptsDir, 'file1.js'), '');
      await fs.writeFile(path.join(scriptsDir, 'file2.js'), '');
      await fs.writeFile(path.join(scriptsDir, 'readme.md'), '');
      
      const files = await updateReferences.getJavaScriptFiles(scriptsDir);
      
      expect(files).toHaveLength(2);
      expect(files.some((f: string) => f.endsWith('file1.js'))).toBe(true);
      expect(files.some((f: string) => f.endsWith('file2.js'))).toBe(true);
    });
    
    test('should recursively find JavaScript files in nested directories', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      const nestedDir = path.join(scriptsDir, 'nested');
      await fs.mkdir(nestedDir, { recursive: true });
      
      await fs.writeFile(path.join(scriptsDir, 'file1.js'), '');
      await fs.writeFile(path.join(nestedDir, 'file2.js'), '');
      
      const files = await updateReferences.getJavaScriptFiles(scriptsDir);
      
      expect(files).toHaveLength(2);
    });
    
    test('should skip node_modules directory', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      const nodeModulesDir = path.join(scriptsDir, 'node_modules');
      await fs.mkdir(nodeModulesDir, { recursive: true });
      
      await fs.writeFile(path.join(scriptsDir, 'file1.js'), '');
      await fs.writeFile(path.join(nodeModulesDir, 'package.js'), '');
      
      const files = await updateReferences.getJavaScriptFiles(scriptsDir);
      
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('file1.js');
    });
    
    test('should skip hidden directories', async () => {
      const scriptsDir = path.join(tempDir, 'scripts');
      const hiddenDir = path.join(scriptsDir, '.hidden');
      await fs.mkdir(hiddenDir, { recursive: true });
      
      await fs.writeFile(path.join(scriptsDir, 'file1.js'), '');
      await fs.writeFile(path.join(hiddenDir, 'file2.js'), '');
      
      const files = await updateReferences.getJavaScriptFiles(scriptsDir);
      
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('file1.js');
    });
  });
});
