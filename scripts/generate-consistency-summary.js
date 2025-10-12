#!/usr/bin/env node

/**
 * Generate Local-CI Consistency Summary
 * 
 * This script generates a comprehensive summary of the local-CI consistency
 * testing results and provides actionable next steps.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConsistencySummaryGenerator {
  constructor() {
    this.summary = {
      timestamp: new Date().toISOString(),
      currentState: {},
      issues: [],
      recommendations: [],
      nextSteps: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  gatherCurrentState() {
    this.log('Gathering current environment state...', 'info');
    
    try {
      // Node.js version
      this.summary.currentState.nodeVersion = process.version;
      
      // npm version
      this.summary.currentState.npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
      
      // Package.json engines
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.summary.currentState.requiredNode = packageJson.engines?.node;
      this.summary.currentState.requiredNpm = packageJson.engines?.npm;
      
      // CI workflow version
      const workflowPath = '.github/workflows/quality-check.yml';
      if (fs.existsSync(workflowPath)) {
        const workflowContent = fs.readFileSync(workflowPath, 'utf8');
        const nodeVersionMatch = workflowContent.match(/node-version:\s*['"]?([^'"\\s]+)['"]?/);
        if (nodeVersionMatch) {
          this.summary.currentState.ciNodeVersion = nodeVersionMatch[1];
        }
      }
      
      // Check if lockfile exists
      this.summary.currentState.hasLockfile = fs.existsSync('package-lock.json');
      
      // Check build status
      try {
        execSync('npm run build', { stdio: 'pipe' });
        this.summary.currentState.buildStatus = 'working';
      } catch (error) {
        this.summary.currentState.buildStatus = 'failing';
      }
      
    } catch (error) {
      this.log(`Error gathering state: ${error.message}`, 'error');
    }
  }

  analyzeIssues() {
    this.log('Analyzing consistency issues...', 'info');
    
    const state = this.summary.currentState;
    
    // Node version compatibility
    const currentMajor = parseInt(state.nodeVersion.slice(1).split('.')[0]);
    const requiredMajor = parseInt(state.requiredNode.replace('>=', '').split('.')[0]);
    
    if (currentMajor < requiredMajor) {
      this.summary.issues.push({
        category: 'Node.js Version',
        severity: 'critical',
        description: `Local Node.js ${state.nodeVersion} is incompatible with requirement ${state.requiredNode}`,
        impact: 'Prevents CI compatibility and may cause dependency issues'
      });
    }
    
    // CI version mismatch
    if (state.ciNodeVersion && state.nodeVersion !== `v${state.ciNodeVersion}`) {
      this.summary.issues.push({
        category: 'CI Version Mismatch',
        severity: 'high',
        description: `Local Node.js ${state.nodeVersion} differs from CI Node.js v${state.ciNodeVersion}`,
        impact: 'Builds may behave differently between local and CI environments'
      });
    }
    
    // Build status
    if (state.buildStatus === 'failing') {
      this.summary.issues.push({
        category: 'Build Failure',
        severity: 'high',
        description: 'Local build is currently failing',
        impact: 'Cannot validate build consistency between environments'
      });
    }
    
    // Lockfile consistency
    if (!state.hasLockfile) {
      this.summary.issues.push({
        category: 'Missing Lockfile',
        severity: 'medium',
        description: 'package-lock.json is missing',
        impact: 'Cannot ensure reproducible builds'
      });
    }
  }

  generateRecommendations() {
    this.log('Generating recommendations...', 'info');
    
    const criticalIssues = this.summary.issues.filter(i => i.severity === 'critical');
    const highIssues = this.summary.issues.filter(i => i.severity === 'high');
    
    if (criticalIssues.some(i => i.category === 'Node.js Version')) {
      this.summary.recommendations.push({
        priority: 1,
        action: 'Upgrade Node.js to version 22.19.0',
        reason: 'Required for dependency compatibility and CI consistency',
        commands: [
          'nvm install 22.19.0 && nvm use 22.19.0  # Using nvm-windows',
          'corepack enable && corepack prepare node@22.19.0  # Using corepack',
          '# Or download directly from https://nodejs.org/dist/v22.19.0/'
        ]
      });
    }
    
    if (this.summary.issues.some(i => i.category.includes('Lockfile') || i.category === 'Missing Lockfile')) {
      this.summary.recommendations.push({
        priority: 2,
        action: 'Fix lockfile consistency',
        reason: 'Ensure reproducible builds between local and CI',
        commands: [
          'npm run consistency:fix-lockfile  # Automated fix',
          '# Or manually:',
          'rm -rf node_modules package-lock.json',
          'npm install',
          'git add package-lock.json',
          'git commit -m "fix: update package-lock.json for Node 22.19.0 compatibility"'
        ]
      });
    }
    
    this.summary.recommendations.push({
      priority: 3,
      action: 'Validate consistency after fixes',
      reason: 'Confirm all issues are resolved',
      commands: [
        'npm run consistency:test  # Full consistency test',
        'npm run consistency:validate-build  # Build consistency test'
      ]
    });
  }

  generateNextSteps() {
    this.log('Generating next steps...', 'info');
    
    const hasNodeIssue = this.summary.issues.some(i => i.category === 'Node.js Version');
    const hasLockfileIssue = this.summary.issues.some(i => i.category.includes('Lockfile'));
    const hasBuildIssue = this.summary.issues.some(i => i.category === 'Build Failure');
    
    if (hasNodeIssue) {
      this.summary.nextSteps.push({
        step: 1,
        title: 'Upgrade Node.js',
        description: 'Install Node.js 22.19.0 using your preferred method',
        validation: 'Run `node -v` to confirm version is v22.19.0'
      });
    }
    
    if (hasLockfileIssue || hasNodeIssue) {
      this.summary.nextSteps.push({
        step: 2,
        title: 'Fix lockfile consistency',
        description: 'Regenerate package-lock.json with correct Node version',
        validation: 'Run `npm ci --dry-run` to confirm lockfile is valid'
      });
    }
    
    if (hasBuildIssue) {
      this.summary.nextSteps.push({
        step: 3,
        title: 'Test build',
        description: 'Verify builds work in both local and CI environments',
        validation: 'Run `npm run build` to confirm build succeeds'
      });
    }
    
    this.summary.nextSteps.push({
      step: this.summary.nextSteps.length + 1,
      title: 'Validate consistency',
      description: 'Run full consistency test to confirm all issues resolved',
      validation: 'Run `npm run consistency:test` - should show all tests passing'
    });
    
    this.summary.nextSteps.push({
      step: this.summary.nextSteps.length + 1,
      title: 'Commit changes',
      description: 'Commit any lockfile changes to version control',
      validation: 'Push changes and verify CI pipeline passes'
    });
  }

  generateReport() {
    const reportPath = `local-ci-consistency-summary-${Date.now()}.md`;
    
    let report = `# Local-CI Environment Consistency Summary

Generated: ${this.summary.timestamp}

## Current State

| Component | Local | Required | CI | Status |
|-----------|-------|----------|----|---------|\n`;

    const state = this.summary.currentState;
    const nodeStatus = parseInt(state.nodeVersion.slice(1).split('.')[0]) >= parseInt(state.requiredNode.replace('>=', '').split('.')[0]) ? '✅' : '❌';
    const ciStatus = state.nodeVersion === `v${state.ciNodeVersion}` ? '✅' : '⚠️';
    
    report += `| Node.js | ${state.nodeVersion} | ${state.requiredNode} | v${state.ciNodeVersion} | ${nodeStatus} |\n`;
    report += `| npm | ${state.npmVersion} | ${state.requiredNpm} | Latest | ✅ |\n`;
    report += `| Build | ${state.buildStatus} | working | working | ${state.buildStatus === 'working' ? '✅' : '❌'} |\n`;
    report += `| Lockfile | ${state.hasLockfile ? 'exists' : 'missing'} | exists | exists | ${state.hasLockfile ? '✅' : '❌'} |\n\n`;

    if (this.summary.issues.length > 0) {
      report += `## Issues Found\n\n`;
      this.summary.issues.forEach((issue, index) => {
        const severityIcon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
        report += `### ${index + 1}. ${issue.category} ${severityIcon}\n\n`;
        report += `**Severity:** ${issue.severity}\n\n`;
        report += `**Description:** ${issue.description}\n\n`;
        report += `**Impact:** ${issue.impact}\n\n`;
      });
    }

    if (this.summary.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      this.summary.recommendations.forEach((rec, index) => {
        report += `### ${rec.priority}. ${rec.action}\n\n`;
        report += `**Reason:** ${rec.reason}\n\n`;
        report += `**Commands:**\n\`\`\`bash\n${rec.commands.join('\n')}\n\`\`\`\n\n`;
      });
    }

    if (this.summary.nextSteps.length > 0) {
      report += `## Next Steps\n\n`;
      this.summary.nextSteps.forEach(step => {
        report += `### Step ${step.step}: ${step.title}\n\n`;
        report += `${step.description}\n\n`;
        report += `**Validation:** ${step.validation}\n\n`;
      });
    }

    report += `## Quick Commands\n\n`;
    report += `\`\`\`bash\n`;
    report += `# Test current consistency\n`;
    report += `npm run consistency:test\n\n`;
    report += `# Fix lockfile issues (after Node upgrade)\n`;
    report += `npm run consistency:fix-lockfile\n\n`;
    report += `# Validate build consistency\n`;
    report += `npm run consistency:validate-build\n`;
    report += `\`\`\`\n\n`;

    report += `## Documentation\n\n`;
    report += `- [Local-CI Consistency Guide](./docs/local-ci-consistency-guide.md)\n`;
    report += `- [Node.js 22 Upgrade Guide](./docs/node-22-upgrade-guide.md)\n`;
    report += `- [GitHub Actions Setup](./docs/github-actions-aws-setup.md)\n`;

    fs.writeFileSync(reportPath, report);
    return reportPath;
  }

  displaySummary() {
    const state = this.summary.currentState;
    
    this.log('='.repeat(60));
    this.log('📊 Local-CI Consistency Summary', 'info');
    this.log('='.repeat(60));
    
    this.log(`Node.js: ${state.nodeVersion} (required: ${state.requiredNode})`, 
      parseInt(state.nodeVersion.slice(1).split('.')[0]) >= parseInt(state.requiredNode.replace('>=', '').split('.')[0]) ? 'success' : 'error');
    
    this.log(`CI Node.js: v${state.ciNodeVersion}`, 
      state.nodeVersion === `v${state.ciNodeVersion}` ? 'success' : 'warning');
    
    this.log(`Build Status: ${state.buildStatus}`, 
      state.buildStatus === 'working' ? 'success' : 'error');
    
    this.log(`Lockfile: ${state.hasLockfile ? 'exists' : 'missing'}`, 
      state.hasLockfile ? 'success' : 'warning');
    
    if (this.summary.issues.length > 0) {
      this.log('\n🔍 Issues Found:', 'warning');
      this.summary.issues.forEach((issue, index) => {
        const severityIcon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡';
        this.log(`  ${index + 1}. ${issue.category} ${severityIcon}`, 'warning');
      });
    }
    
    if (this.summary.recommendations.length > 0) {
      this.log('\n💡 Priority Actions:', 'info');
      this.summary.recommendations.slice(0, 3).forEach(rec => {
        this.log(`  ${rec.priority}. ${rec.action}`, 'info');
      });
    }
  }

  async run() {
    this.log('🔍 Generating Local-CI Consistency Summary', 'info');
    
    this.gatherCurrentState();
    this.analyzeIssues();
    this.generateRecommendations();
    this.generateNextSteps();
    
    const reportPath = this.generateReport();
    this.displaySummary();
    
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'success');
    
    const hasIssues = this.summary.issues.length > 0;
    if (hasIssues) {
      this.log('\n⚠️ Issues found - follow the recommendations to resolve them', 'warning');
    } else {
      this.log('\n✅ No consistency issues found', 'success');
    }
  }
}

// Run the generator if called directly
if (require.main === module) {
  const generator = new ConsistencySummaryGenerator();
  generator.run().catch(error => {
    console.error('❌ Summary generator failed:', error);
    process.exit(1);
  });
}

module.exports = ConsistencySummaryGenerator;