#!/usr/bin/env node

/**
 * Integrated Image Performance Monitor
 * Combines image loading performance monitoring with Core Web Vitals impact assessment
 */

const ImagePerformanceMonitor = require('./image-performance-monitor');
const CoreWebVitalsImageMonitor = require('./core-web-vitals-image-monitor');
const fs = require('fs');
const path = require('path');

class IntegratedImagePerformanceMonitor {
  constructor() {
    this.imageMonitor = new ImagePerformanceMonitor();
    this.vitalsMonitor = new CoreWebVitalsImageMonitor();
    this.results = {
      timestamp: new Date().toISOString(),
      imagePerformance: null,
      coreWebVitals: null,
      integratedAnalysis: {},
      alerts: [],
      recommendations: []
    };
  }

  /**
   * Run integrated monitoring combining both image performance and Core Web Vitals
   */
  async runIntegratedMonitoring() {
    console.log('🚀 Starting Integrated Image Performance Monitoring...');
    console.log('=' .repeat(60));
    
    try {
      // Run image performance monitoring
      console.log('\n📸 Phase 1: Image Loading Performance Analysis');
      console.log('-'.repeat(40));
      this.results.imagePerformance = await this.imageMonitor.runMonitoring();
      
      // Run Core Web Vitals monitoring
      console.log('\n📊 Phase 2: Core Web Vitals Impact Assessment');
      console.log('-'.repeat(40));
      this.results.coreWebVitals = await this.vitalsMonitor.runMonitoring();
      
      // Perform integrated analysis
      console.log('\n🔍 Phase 3: Integrated Performance Analysis');
      console.log('-'.repeat(40));
      this.performIntegratedAnalysis();
      
      // Generate comprehensive recommendations
      console.log('\n💡 Phase 4: Generating Comprehensive Recommendations');
      console.log('-'.repeat(40));
      this.generateIntegratedRecommendations();
      
      // Save integrated results
      console.log('\n💾 Phase 5: Saving Integrated Results');
      console.log('-'.repeat(40));
      const files = this.saveIntegratedResults();
      
      // Display final summary
      this.displayIntegratedSummary();
      
      console.log('\n📄 Integrated reports saved:');
      Object.entries(files).forEach(([type, filepath]) => {
        console.log(`  ${type}: ${filepath}`);
      });
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Integrated monitoring failed:', error);
      throw error;
    }
  }

  /**
   * Perform integrated analysis combining both monitoring results
   */
  performIntegratedAnalysis() {
    const imageResults = this.results.imagePerformance;
    const vitalsResults = this.results.coreWebVitals;
    
    // Correlate image performance with Core Web Vitals impact
    const analysis = {
      correlationAnalysis: this.analyzePerformanceCorrelation(imageResults, vitalsResults),
      riskAssessment: this.assessPerformanceRisks(imageResults, vitalsResults),
      impactMatrix: this.createImpactMatrix(imageResults, vitalsResults),
      priorityActions: this.identifyPriorityActions(imageResults, vitalsResults)
    };
    
    this.results.integratedAnalysis = analysis;
    
    // Generate integrated alerts
    this.generateIntegratedAlerts(imageResults, vitalsResults);
  }

  /**
   * Analyze correlation between image performance and Core Web Vitals
   */
  analyzePerformanceCorrelation(imageResults, vitalsResults) {
    const failedImages = imageResults.summary.failedImages;
    const avgLoadTime = imageResults.summary.avgLoadTime;
    const poorVitalsPages = Object.values(vitalsResults.vitalsMetrics)
      .filter(page => page.status === 'POOR').length;
    
    return {
      imageFailureImpact: {
        failedImages,
        estimatedLCPImpact: failedImages * 500, // Estimate 500ms impact per failed image
        estimatedCLSImpact: failedImages * 0.02, // Estimate 0.02 CLS impact per failed image
        severity: failedImages > 0 ? 'HIGH' : 'LOW'
      },
      loadTimeImpact: {
        avgLoadTime,
        lcpCorrelation: avgLoadTime > 2000 ? 'STRONG' : avgLoadTime > 1000 ? 'MODERATE' : 'WEAK',
        performanceRisk: avgLoadTime > 2000 ? 'HIGH' : avgLoadTime > 1000 ? 'MEDIUM' : 'LOW'
      },
      overallCorrelation: {
        strength: this.calculateCorrelationStrength(imageResults, vitalsResults),
        confidence: this.calculateConfidenceLevel(imageResults, vitalsResults)
      }
    };
  }

  /**
   * Calculate correlation strength between image performance and Core Web Vitals
   */
  calculateCorrelationStrength(imageResults, vitalsResults) {
    const imageScore = imageResults.summary.successRate;
    const avgVitalsScore = Object.values(vitalsResults.vitalsMetrics)
      .reduce((sum, page) => sum + page.scores.overall, 0) / 
      Object.keys(vitalsResults.vitalsMetrics).length;
    
    const scoreDifference = Math.abs(imageScore - avgVitalsScore);
    
    if (scoreDifference < 10) return 'STRONG';
    if (scoreDifference < 25) return 'MODERATE';
    return 'WEAK';
  }

  /**
   * Calculate confidence level in the analysis
   */
  calculateConfidenceLevel(imageResults, vitalsResults) {
    const imageDataPoints = imageResults.imageMetrics.length;
    const vitalsDataPoints = Object.keys(vitalsResults.vitalsMetrics).length;
    
    if (imageDataPoints >= 8 && vitalsDataPoints >= 5) return 'HIGH';
    if (imageDataPoints >= 5 && vitalsDataPoints >= 3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Assess performance risks based on integrated analysis
   */
  assessPerformanceRisks(imageResults, vitalsResults) {
    const risks = [];
    
    // Critical image loading failures
    if (imageResults.summary.failedImages > 0) {
      risks.push({
        type: 'CRITICAL_IMAGE_FAILURES',
        severity: 'HIGH',
        impact: 'User experience degradation and potential revenue loss',
        likelihood: 'CERTAIN',
        mitigation: 'Immediate image path and deployment fixes required'
      });
    }
    
    // Poor Core Web Vitals scores
    const poorPages = Object.values(vitalsResults.vitalsMetrics)
      .filter(page => page.status === 'POOR').length;
    
    if (poorPages > 0) {
      risks.push({
        type: 'SEO_RANKING_IMPACT',
        severity: 'HIGH',
        impact: 'Google search ranking penalties due to poor Core Web Vitals',
        likelihood: 'HIGH',
        mitigation: 'Optimize image loading and implement performance best practices'
      });
    }
    
    // Slow image loading
    if (imageResults.summary.avgLoadTime > 2000) {
      risks.push({
        type: 'USER_ENGAGEMENT_RISK',
        severity: 'MEDIUM',
        impact: 'Increased bounce rate due to slow image loading',
        likelihood: 'MEDIUM',
        mitigation: 'Image optimization and CDN improvements'
      });
    }
    
    return risks;
  }

  /**
   * Create impact matrix showing relationship between issues and business impact
   */
  createImpactMatrix(imageResults, vitalsResults) {
    return {
      businessImpact: {
        seo: {
          risk: vitalsResults.alerts.filter(a => a.severity === 'ERROR').length > 0 ? 'HIGH' : 'LOW',
          description: 'Core Web Vitals directly affect Google search rankings'
        },
        userExperience: {
          risk: imageResults.summary.failedImages > 0 ? 'HIGH' : 'MEDIUM',
          description: 'Failed or slow images degrade user experience'
        },
        conversionRate: {
          risk: imageResults.summary.avgLoadTime > 2000 ? 'MEDIUM' : 'LOW',
          description: 'Slow loading times can reduce conversion rates'
        },
        brandPerception: {
          risk: imageResults.summary.failedImages > 0 ? 'HIGH' : 'LOW',
          description: 'Missing images create unprofessional appearance'
        }
      },
      technicalImpact: {
        performance: {
          severity: imageResults.summary.overallStatus === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          areas: ['LCP', 'CLS', 'Image Loading Speed']
        },
        reliability: {
          severity: imageResults.summary.failedImages > 0 ? 'HIGH' : 'LOW',
          areas: ['Image Availability', 'CDN Performance', 'Cache Configuration']
        },
        scalability: {
          severity: 'MEDIUM',
          areas: ['Image Optimization', 'Bandwidth Usage', 'Server Load']
        }
      }
    };
  }

  /**
   * Identify priority actions based on integrated analysis
   */
  identifyPriorityActions(imageResults, vitalsResults) {
    const actions = [];
    
    // Priority 1: Critical failures
    if (imageResults.summary.failedImages > 0) {
      actions.push({
        priority: 1,
        action: 'Fix Critical Image Loading Failures',
        urgency: 'IMMEDIATE',
        effort: 'LOW',
        impact: 'HIGH',
        description: 'Resolve all failed image loading issues immediately',
        tasks: [
          'Verify all image files exist in correct locations',
          'Fix image path references in components',
          'Test deployment pipeline image handling',
          'Validate CloudFront cache invalidation'
        ]
      });
    }
    
    // Priority 2: Core Web Vitals optimization
    const criticalVitalsAlerts = vitalsResults.alerts.filter(a => a.severity === 'ERROR').length;
    if (criticalVitalsAlerts > 0) {
      actions.push({
        priority: 2,
        action: 'Optimize Core Web Vitals Performance',
        urgency: 'HIGH',
        effort: 'MEDIUM',
        impact: 'HIGH',
        description: 'Address critical Core Web Vitals issues affecting SEO',
        tasks: [
          'Optimize hero image loading for better LCP',
          'Implement proper image dimensions to prevent CLS',
          'Add image preloading for critical assets',
          'Configure proper caching headers'
        ]
      });
    }
    
    // Priority 3: Performance optimization
    if (imageResults.summary.avgLoadTime > 2000) {
      actions.push({
        priority: 3,
        action: 'Implement Image Performance Optimization',
        urgency: 'MEDIUM',
        effort: 'MEDIUM',
        impact: 'MEDIUM',
        description: 'Optimize image loading performance across the site',
        tasks: [
          'Implement WebP format with fallbacks',
          'Add lazy loading for non-critical images',
          'Optimize image compression and sizing',
          'Implement responsive image loading'
        ]
      });
    }
    
    // Priority 4: Monitoring and alerting
    actions.push({
      priority: 4,
      action: 'Implement Continuous Performance Monitoring',
      urgency: 'LOW',
      effort: 'HIGH',
      impact: 'MEDIUM',
      description: 'Set up ongoing monitoring to prevent future issues',
      tasks: [
        'Deploy automated performance monitoring',
        'Set up alerts for performance regressions',
        'Implement performance budgets',
        'Create performance dashboard'
      ]
    });
    
    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate integrated alerts combining both monitoring systems
   */
  generateIntegratedAlerts(imageResults, vitalsResults) {
    const alerts = [];
    
    // Combine alerts from both systems
    alerts.push(...imageResults.alerts.map(alert => ({
      ...alert,
      source: 'IMAGE_PERFORMANCE',
      integratedImpact: this.assessIntegratedImpact(alert, vitalsResults)
    })));
    
    alerts.push(...vitalsResults.alerts.map(alert => ({
      ...alert,
      source: 'CORE_WEB_VITALS',
      integratedImpact: this.assessIntegratedImpact(alert, imageResults)
    })));
    
    // Add correlation-based alerts
    const correlation = this.results.integratedAnalysis.correlationAnalysis;
    if (correlation.imageFailureImpact.severity === 'HIGH' && 
        correlation.loadTimeImpact.performanceRisk === 'HIGH') {
      alerts.push({
        type: 'PERFORMANCE_CORRELATION',
        severity: 'ERROR',
        source: 'INTEGRATED_ANALYSIS',
        message: 'High correlation between image failures and poor Core Web Vitals detected',
        recommendation: 'Prioritize image optimization to improve overall site performance',
        integratedImpact: 'CRITICAL'
      });
    }
    
    this.results.alerts = alerts;
  }

  /**
   * Assess integrated impact of individual alerts
   */
  assessIntegratedImpact(alert, otherResults) {
    // Simple impact assessment based on alert type and other system status
    if (alert.severity === 'ERROR') {
      return 'HIGH';
    } else if (alert.severity === 'WARNING') {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Generate comprehensive recommendations combining both systems
   */
  generateIntegratedRecommendations() {
    const recommendations = [];
    
    // Immediate actions
    const criticalIssues = this.results.alerts.filter(a => a.severity === 'ERROR').length;
    if (criticalIssues > 0) {
      recommendations.push({
        category: 'IMMEDIATE_ACTION',
        priority: 'CRITICAL',
        timeframe: '24 hours',
        title: 'Resolve Critical Performance Issues',
        description: 'Address all critical image loading and Core Web Vitals issues immediately',
        actions: this.results.integratedAnalysis.priorityActions
          .filter(action => action.priority <= 2)
          .map(action => action.description)
      });
    }
    
    // Short-term improvements
    recommendations.push({
      category: 'SHORT_TERM_OPTIMIZATION',
      priority: 'HIGH',
      timeframe: '1-2 weeks',
      title: 'Implement Performance Optimization Strategy',
      description: 'Deploy comprehensive image and performance optimizations',
      actions: [
        'Implement WebP image format with fallbacks',
        'Add lazy loading for non-critical images',
        'Optimize image compression and sizing',
        'Configure proper caching strategies',
        'Implement image preloading for critical assets'
      ]
    });
    
    // Long-term strategy
    recommendations.push({
      category: 'LONG_TERM_STRATEGY',
      priority: 'MEDIUM',
      timeframe: '1-3 months',
      title: 'Establish Performance Monitoring and Optimization Framework',
      description: 'Build sustainable performance monitoring and optimization processes',
      actions: [
        'Deploy automated performance monitoring dashboard',
        'Implement performance budgets and alerts',
        'Set up continuous performance testing in CI/CD',
        'Create performance optimization playbooks',
        'Establish regular performance review processes'
      ]
    });
    
    this.results.recommendations = recommendations;
  }

  /**
   * Save integrated monitoring results
   */
  saveIntegratedResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const files = {};
    
    // Save comprehensive results
    const resultsFile = `integrated-image-performance-monitoring-${timestamp}.json`;
    const resultsPath = path.join(process.cwd(), resultsFile);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    files.results = resultsPath;
    
    // Save executive summary
    const summaryFile = `integrated-performance-executive-summary-${timestamp}.md`;
    const summaryPath = path.join(process.cwd(), summaryFile);
    const summaryReport = this.generateExecutiveSummary();
    fs.writeFileSync(summaryPath, summaryReport);
    files.summary = summaryPath;
    
    // Save action plan
    const actionPlanFile = `performance-optimization-action-plan-${timestamp}.md`;
    const actionPlanPath = path.join(process.cwd(), actionPlanFile);
    const actionPlan = this.generateActionPlan();
    fs.writeFileSync(actionPlanPath, actionPlan);
    files.actionPlan = actionPlanPath;
    
    return files;
  }

  /**
   * Generate executive summary report
   */
  generateExecutiveSummary() {
    const imageResults = this.results.imagePerformance;
    const vitalsResults = this.results.coreWebVitals;
    const analysis = this.results.integratedAnalysis;
    
    const criticalAlerts = this.results.alerts.filter(a => a.severity === 'ERROR').length;
    const warningAlerts = this.results.alerts.filter(a => a.severity === 'WARNING').length;
    
    return `# Integrated Image Performance Monitoring - Executive Summary

**Generated:** ${this.results.timestamp}
**Monitoring Scope:** Image Loading Performance + Core Web Vitals Impact

## Executive Overview

This integrated analysis combines image loading performance monitoring with Core Web Vitals impact assessment to provide a comprehensive view of website performance and user experience.

## Key Findings

### Performance Status
- **Image Loading Success Rate:** ${imageResults.summary.successRate}%
- **Average Image Load Time:** ${imageResults.summary.avgLoadTime}ms
- **Failed Images:** ${imageResults.summary.failedImages}
- **Critical Alerts:** ${criticalAlerts}
- **Warning Alerts:** ${warningAlerts}

### Core Web Vitals Impact
- **Pages Monitored:** ${Object.keys(vitalsResults.vitalsMetrics).length}
- **Pages with Good Performance:** ${Object.values(vitalsResults.vitalsMetrics).filter(p => p.status === 'GOOD').length}
- **Pages with Poor Performance:** ${Object.values(vitalsResults.vitalsMetrics).filter(p => p.status === 'POOR').length}
- **SEO Risk Level:** ${analysis.riskAssessment.find(r => r.type === 'SEO_RANKING_IMPACT')?.severity || 'LOW'}

### Business Impact Assessment

${Object.entries(analysis.impactMatrix.businessImpact).map(([area, impact]) => `
**${area.toUpperCase()}**
- Risk Level: ${impact.risk}
- Impact: ${impact.description}
`).join('\n')}

## Critical Issues Requiring Immediate Attention

${this.results.alerts.filter(a => a.severity === 'ERROR').map(alert => `
### ${alert.type}
- **Source:** ${alert.source}
- **Message:** ${alert.message}
- **Recommendation:** ${alert.recommendation}
`).join('\n')}

## Priority Action Plan

${this.results.recommendations.map(rec => `
### ${rec.category} (${rec.priority} Priority)
**Timeframe:** ${rec.timeframe}
**Objective:** ${rec.title}

${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## Performance Correlation Analysis

- **Image-Vitals Correlation Strength:** ${analysis.correlationAnalysis.overallCorrelation.strength}
- **Analysis Confidence Level:** ${analysis.correlationAnalysis.overallCorrelation.confidence}
- **Load Time Impact on LCP:** ${analysis.correlationAnalysis.loadTimeImpact.lcpCorrelation}
- **Image Failure Impact Severity:** ${analysis.correlationAnalysis.imageFailureImpact.severity}

## Next Steps

1. **Immediate (24 hours):** ${this.results.recommendations.find(r => r.category === 'IMMEDIATE_ACTION')?.description || 'No immediate actions required'}

2. **Short-term (1-2 weeks):** ${this.results.recommendations.find(r => r.category === 'SHORT_TERM_OPTIMIZATION')?.description || 'Implement performance optimizations'}

3. **Long-term (1-3 months):** ${this.results.recommendations.find(r => r.category === 'LONG_TERM_STRATEGY')?.description || 'Establish monitoring framework'}

## Monitoring Recommendations

- **Frequency:** Run integrated monitoring weekly
- **Alerting:** Set up automated alerts for critical performance regressions
- **Reporting:** Generate monthly performance reports for stakeholders
- **Optimization:** Implement continuous performance optimization processes

---
*This executive summary provides a high-level overview. Refer to detailed reports for technical implementation guidance.*
`;
  }

  /**
   * Generate detailed action plan
   */
  generateActionPlan() {
    const actions = this.results.integratedAnalysis.priorityActions;
    
    return `# Performance Optimization Action Plan

**Generated:** ${this.results.timestamp}

## Action Items by Priority

${actions.map(action => `
## Priority ${action.priority}: ${action.action}

**Urgency:** ${action.urgency}
**Effort Required:** ${action.effort}
**Expected Impact:** ${action.impact}

### Description
${action.description}

### Implementation Tasks
${action.tasks.map(task => `- [ ] ${task}`).join('\n')}

### Success Criteria
- Task completion within specified timeframe
- Measurable improvement in performance metrics
- Reduction in related alerts and issues

---
`).join('\n')}

## Implementation Timeline

| Priority | Action | Timeframe | Owner | Status |
|----------|--------|-----------|-------|--------|
${actions.map(action => 
  `| ${action.priority} | ${action.action} | ${action.urgency === 'IMMEDIATE' ? '24 hours' : action.urgency === 'HIGH' ? '1 week' : '2-4 weeks'} | TBD | Not Started |`
).join('\n')}

## Resource Requirements

- **Development Time:** Estimated 2-4 weeks for complete implementation
- **Testing:** Comprehensive performance testing required
- **Monitoring:** Ongoing monitoring and optimization resources
- **Tools:** Performance monitoring and optimization tools

## Risk Mitigation

- **Backup Plans:** Maintain rollback capabilities for all changes
- **Testing:** Thorough testing in staging environment before production
- **Monitoring:** Continuous monitoring during implementation
- **Communication:** Regular stakeholder updates on progress

---
*This action plan should be reviewed and updated regularly based on implementation progress and new findings.*
`;
  }

  /**
   * Display integrated summary in console
   */
  displayIntegratedSummary() {
    const imageResults = this.results.imagePerformance;
    const vitalsResults = this.results.coreWebVitals;
    const criticalAlerts = this.results.alerts.filter(a => a.severity === 'ERROR').length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 INTEGRATED IMAGE PERFORMANCE MONITORING SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n🖼️  IMAGE PERFORMANCE:');
    console.log(`   Success Rate: ${imageResults.summary.successRate}%`);
    console.log(`   Average Load Time: ${imageResults.summary.avgLoadTime}ms`);
    console.log(`   Failed Images: ${imageResults.summary.failedImages}`);
    console.log(`   Status: ${imageResults.summary.overallStatus}`);
    
    console.log('\n📈 CORE WEB VITALS:');
    const goodPages = Object.values(vitalsResults.vitalsMetrics).filter(p => p.status === 'GOOD').length;
    const totalPages = Object.keys(vitalsResults.vitalsMetrics).length;
    console.log(`   Pages with Good Performance: ${goodPages}/${totalPages}`);
    console.log(`   Performance Alerts: ${vitalsResults.alerts.length}`);
    
    console.log('\n🔍 INTEGRATED ANALYSIS:');
    console.log(`   Correlation Strength: ${this.results.integratedAnalysis.correlationAnalysis.overallCorrelation.strength}`);
    console.log(`   Critical Alerts: ${criticalAlerts}`);
    console.log(`   Priority Actions: ${this.results.integratedAnalysis.priorityActions.length}`);
    
    if (criticalAlerts > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED:');
      this.results.alerts.filter(a => a.severity === 'ERROR').forEach(alert => {
        console.log(`   ❌ ${alert.type}: ${alert.message}`);
      });
    }
    
    console.log('\n💡 TOP RECOMMENDATIONS:');
    this.results.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   ${rec.priority}: ${rec.title} (${rec.timeframe})`);
    });
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new IntegratedImagePerformanceMonitor();
  
  monitor.runIntegratedMonitoring()
    .then((results) => {
      const criticalAlerts = results.alerts.filter(a => a.severity === 'ERROR').length;
      const exitCode = criticalAlerts > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ Integrated monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = IntegratedImagePerformanceMonitor;