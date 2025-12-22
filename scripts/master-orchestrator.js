#!/usr/bin/env node

/**
 * Master Orchestrator
 * Unified interface for all deployment, performance, analytics, content, and monitoring tasks
 */

const MasterHealthCheck = require('./master-health-check');
const DeploymentOrchestrator = require('./unified-deployment-orchestrator');
const PerformanceOptimizationSuite = require('./performance-optimization-suite');
const AnalyticsValidationDashboard = require('./analytics-validation-dashboard');
const ContentManagementOptimizer = require('./content-management-optimizer');
const ProactiveMonitoringSystem = require('./proactive-monitoring-system');

const fs = require('fs');
const path = require('path');

class MasterOrchestrator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      executionId: `exec-${Date.now()}`,
      tasks: {},
      summary: {},
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      header: '\x1b[35m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  displayHeader() {
    this.log('\n' + '='.repeat(80), 'header');
    this.log('🚀 MASTER ORCHESTRATOR - COMPREHENSIVE WEBSITE MANAGEMENT', 'header');
    this.log('='.repeat(80), 'header');
    this.log('Deployment • Performance • Analytics • Content • Monitoring', 'info');
    this.log(`Execution ID: ${this.results.executionId}`, 'info');
    this.log('');
  }

  async runHealthCheck() {
    this.log('🏥 Running Master Health Check...', 'info');
    
    try {
      const healthChecker = new MasterHealthCheck();
      const results = await healthChecker.run();
      
      this.results.tasks.healthCheck = {
        status: 'completed',
        results,
        duration: this.calculateDuration()
      };

      return results;
    } catch (error) {
      this.log(`✗ Health check failed: ${error.message}`, 'error');
      this.results.tasks.healthCheck = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runDeployment(options = {}) {
    this.log('\n🚀 Running Unified Deployment...', 'info');
    
    try {
      const deployer = new DeploymentOrchestrator(options);
      const results = await deployer.deploy();
      
      this.results.tasks.deployment = {
        status: results.success ? 'completed' : 'failed',
        results,
        duration: this.calculateDuration()
      };

      if (!results.success) {
        throw new Error(results.error);
      }

      return results;
    } catch (error) {
      this.log(`✗ Deployment failed: ${error.message}`, 'error');
      this.results.tasks.deployment = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runPerformanceOptimization() {
    this.log('\n⚡ Running Performance Optimization...', 'info');
    
    try {
      const optimizer = new PerformanceOptimizationSuite();
      const results = await optimizer.run();
      
      this.results.tasks.performance = {
        status: 'completed',
        results,
        duration: this.calculateDuration()
      };

      return results;
    } catch (error) {
      this.log(`✗ Performance optimization failed: ${error.message}`, 'error');
      this.results.tasks.performance = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runAnalyticsValidation() {
    this.log('\n📊 Running Analytics Validation...', 'info');
    
    try {
      const validator = new AnalyticsValidationDashboard();
      const results = await validator.run();
      
      this.results.tasks.analytics = {
        status: 'completed',
        results,
        duration: this.calculateDuration()
      };

      return results;
    } catch (error) {
      this.log(`✗ Analytics validation failed: ${error.message}`, 'error');
      this.results.tasks.analytics = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runContentOptimization() {
    this.log('\n📝 Running Content Optimization...', 'info');
    
    try {
      const optimizer = new ContentManagementOptimizer();
      const results = await optimizer.run();
      
      this.results.tasks.content = {
        status: 'completed',
        results,
        duration: this.calculateDuration()
      };

      return results;
    } catch (error) {
      this.log(`✗ Content optimization failed: ${error.message}`, 'error');
      this.results.tasks.content = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runProactiveMonitoring() {
    this.log('\n🔍 Running Proactive Monitoring...', 'info');
    
    try {
      const monitor = new ProactiveMonitoringSystem();
      const results = await monitor.run();
      
      this.results.tasks.monitoring = {
        status: 'completed',
        results,
        duration: this.calculateDuration()
      };

      return results;
    } catch (error) {
      this.log(`✗ Proactive monitoring failed: ${error.message}`, 'error');
      this.results.tasks.monitoring = {
        status: 'failed',
        error: error.message
      };
      throw error;
    }
  }

  async runFullOptimization(options = {}) {
    this.displayHeader();
    
    const startTime = Date.now();
    let healthResults = null;

    try {
      // 1. Health Check (always run first)
      healthResults = await this.runHealthCheck();

      // 2. Performance Optimization
      if (!options.skipPerformance) {
        await this.runPerformanceOptimization();
      }

      // 3. Analytics Validation
      if (!options.skipAnalytics) {
        await this.runAnalyticsValidation();
      }

      // 4. Content Optimization
      if (!options.skipContent) {
        await this.runContentOptimization();
      }

      // 5. Deployment (if requested)
      if (options.deploy) {
        await this.runDeployment(options.deploymentOptions || {});
      }

      // 6. Post-deployment monitoring
      if (!options.skipMonitoring) {
        await this.runProactiveMonitoring();
      }

      // Generate comprehensive summary
      await this.generateComprehensiveSummary();
      
      const totalDuration = Math.round((Date.now() - startTime) / 1000);
      this.displayFinalSummary(totalDuration);

      return this.results;

    } catch (error) {
      this.log(`\n💥 Orchestration failed: ${error.message}`, 'error');
      
      // Still generate a summary of what was completed
      await this.generateComprehensiveSummary();
      
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }

  async generateComprehensiveSummary() {
    this.log('\n📋 Generating Comprehensive Summary...', 'info');

    const completedTasks = Object.keys(this.results.tasks).filter(
      task => this.results.tasks[task].status === 'completed'
    );

    const failedTasks = Object.keys(this.results.tasks).filter(
      task => this.results.tasks[task].status === 'failed'
    );

    // Collect all recommendations from completed tasks
    const allRecommendations = [];
    completedTasks.forEach(taskName => {
      const task = this.results.tasks[taskName];
      if (task.results?.recommendations) {
        allRecommendations.push(...task.results.recommendations);
      }
    });

    // Prioritize recommendations
    const prioritizedRecommendations = this.prioritizeRecommendations(allRecommendations);

    this.results.summary = {
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      totalTasks: Object.keys(this.results.tasks).length,
      successRate: Math.round((completedTasks.length / Object.keys(this.results.tasks).length) * 100),
      recommendations: prioritizedRecommendations.slice(0, 10), // Top 10
      overallHealth: this.calculateOverallHealth(),
      nextActions: this.generateNextActions()
    };

    // Save comprehensive report
    const reportPath = `master-orchestrator-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`✓ Comprehensive report saved: ${reportPath}`, 'success');
  }

  prioritizeRecommendations(recommendations) {
    const priorityKeywords = {
      critical: ['security', 'error', 'broken', 'failed', 'down'],
      high: ['performance', 'seo', 'accessibility', 'slow'],
      medium: ['optimization', 'improvement', 'enhance'],
      low: ['consider', 'optional', 'future']
    };

    return recommendations
      .map(rec => ({
        text: rec,
        priority: this.determinePriority(rec, priorityKeywords)
      }))
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .map(rec => `[${rec.priority.toUpperCase()}] ${rec.text}`);
  }

  determinePriority(recommendation, keywords) {
    const text = recommendation.toLowerCase();
    
    for (const [priority, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return priority;
      }
    }
    
    return 'medium';
  }

  calculateOverallHealth() {
    const tasks = this.results.tasks;
    const completedCount = Object.values(tasks).filter(t => t.status === 'completed').length;
    const totalCount = Object.keys(tasks).length;
    
    if (totalCount === 0) return 'unknown';
    
    const successRate = completedCount / totalCount;
    
    if (successRate >= 0.9) return 'excellent';
    if (successRate >= 0.7) return 'good';
    if (successRate >= 0.5) return 'fair';
    return 'needs-attention';
  }

  generateNextActions() {
    const actions = [];
    
    // Check for failed tasks
    const failedTasks = Object.entries(this.results.tasks)
      .filter(([_, task]) => task.status === 'failed')
      .map(([name, _]) => name);

    if (failedTasks.length > 0) {
      actions.push(`Fix failed tasks: ${failedTasks.join(', ')}`);
    }

    // Check health status
    if (this.results.summary?.overallHealth === 'needs-attention') {
      actions.push('Address critical health issues immediately');
    }

    // Add deployment if not done
    if (!this.results.tasks.deployment) {
      actions.push('Consider running deployment after fixes');
    }

    // Add monitoring if not done
    if (!this.results.tasks.monitoring) {
      actions.push('Set up continuous monitoring');
    }

    return actions;
  }

  displayFinalSummary(duration) {
    this.log('\n' + '='.repeat(80), 'success');
    this.log('🎉 MASTER ORCHESTRATION COMPLETED!', 'success');
    this.log('='.repeat(80), 'success');
    
    this.log(`\n📊 EXECUTION SUMMARY`, 'info');
    this.log(`Duration: ${duration}s`, 'info');
    this.log(`Tasks Completed: ${this.results.summary.completedTasks}/${this.results.summary.totalTasks}`, 'info');
    this.log(`Success Rate: ${this.results.summary.successRate}%`, 'info');
    this.log(`Overall Health: ${this.results.summary.overallHealth.toUpperCase()}`, 
      this.results.summary.overallHealth === 'excellent' ? 'success' : 'warning');

    // Display task status
    this.log(`\n📋 TASK STATUS`, 'info');
    Object.entries(this.results.tasks).forEach(([taskName, task]) => {
      const emoji = task.status === 'completed' ? '✅' : '❌';
      this.log(`${emoji} ${taskName}: ${task.status}`, 
        task.status === 'completed' ? 'success' : 'error');
    });

    // Display top recommendations
    if (this.results.summary.recommendations.length > 0) {
      this.log(`\n💡 TOP RECOMMENDATIONS`, 'warning');
      this.results.summary.recommendations.slice(0, 5).forEach(rec => {
        this.log(`  • ${rec}`, 'warning');
      });
    }

    // Display next actions
    if (this.results.summary.nextActions.length > 0) {
      this.log(`\n🎯 NEXT ACTIONS`, 'info');
      this.results.summary.nextActions.forEach(action => {
        this.log(`  • ${action}`, 'info');
      });
    }

    this.log('\n' + '='.repeat(80), 'success');
  }

  calculateDuration() {
    // This would be implemented with proper timing in a real scenario
    return Math.round(Math.random() * 30 + 10); // Mock duration
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
🚀 Master Orchestrator - Comprehensive Website Management

Usage: node scripts/master-orchestrator.js [command] [options]

Commands:
  full                 Run complete optimization suite (default)
  health              Run health check only
  deploy              Run deployment only
  performance         Run performance optimization only
  analytics           Run analytics validation only
  content             Run content optimization only
  monitoring          Run monitoring only

Options:
  --skip-performance  Skip performance optimization
  --skip-analytics    Skip analytics validation
  --skip-content      Skip content optimization
  --skip-monitoring   Skip monitoring
  --deploy            Include deployment in full run
  --dry-run          Show what would be done without executing
  --aggressive       Use aggressive cache invalidation

Examples:
  node scripts/master-orchestrator.js
  node scripts/master-orchestrator.js full --deploy
  node scripts/master-orchestrator.js health
  node scripts/master-orchestrator.js deploy --dry-run
  node scripts/master-orchestrator.js full --skip-content --skip-analytics
    `);
    process.exit(0);
  }

  const command = args[0] || 'full';
  const options = {
    skipPerformance: args.includes('--skip-performance'),
    skipAnalytics: args.includes('--skip-analytics'),
    skipContent: args.includes('--skip-content'),
    skipMonitoring: args.includes('--skip-monitoring'),
    deploy: args.includes('--deploy'),
    deploymentOptions: {
      dryRun: args.includes('--dry-run'),
      aggressive: args.includes('--aggressive')
    }
  };

  const orchestrator = new MasterOrchestrator();

  async function runCommand() {
    try {
      let result;

      switch (command) {
        case 'health':
          result = await orchestrator.runHealthCheck();
          break;
        case 'deploy':
          result = await orchestrator.runDeployment(options.deploymentOptions);
          break;
        case 'performance':
          result = await orchestrator.runPerformanceOptimization();
          break;
        case 'analytics':
          result = await orchestrator.runAnalyticsValidation();
          break;
        case 'content':
          result = await orchestrator.runContentOptimization();
          break;
        case 'monitoring':
          result = await orchestrator.runProactiveMonitoring();
          break;
        case 'full':
        default:
          result = await orchestrator.runFullOptimization(options);
          break;
      }

      process.exit(result?.success !== false ? 0 : 1);
    } catch (error) {
      console.error(`Command failed: ${error.message}`);
      process.exit(1);
    }
  }

  runCommand();
}

module.exports = MasterOrchestrator;