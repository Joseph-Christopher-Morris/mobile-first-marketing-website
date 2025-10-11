#!/usr/bin/env node

/**
 * Lighthouse Performance Audit Script
 * 
 * Executes Lighthouse audits on all major pages targeting 90+ scores
 * for Performance, Accessibility, Best Practices, and SEO.
 * 
 * Requirements: 6.6 - Performance optimization and monitoring
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUDIT_CONFIG = {
  // Target URLs to audit (using CloudFront distribution)
  baseUrl: 'https://d15sc9fc739ev2.cloudfront.net',
  pages: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services/' },
    { name: 'Photography Services', path: '/services/photography/' },
    { name: 'Analytics Services', path: '/services/analytics/' },
    { name: 'Ad Campaigns Services', path: '/services/ad-campaigns/' },
    { name: 'Blog', path: '/blog/' },
    { name: 'Contact', path: '/contact/' }
  ],
  
  // Target scores (90+ for all categories)
  targetScores: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90
  },
  
  // Lighthouse configuration
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  },
  
  // Chrome launch options
  chromeFlags: [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ]
};

class LighthouseAuditor {
  constructor() {
    this.results = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.reportDir = path.join(process.cwd(), 'lighthouse-reports');
  }

  async init() {
    // Create reports directory
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
      console.log(`📁 Created reports directory: ${this.reportDir}`);
    } catch (error) {
      console.error('❌ Failed to create reports directory:', error.message);
      throw error;
    }
  }

  async launchChrome() {
    console.log('🚀 Launching Chrome...');
    try {
      this.chrome = await chromeLauncher.launch({
        chromeFlags: AUDIT_CONFIG.chromeFlags
      });
      console.log(`✅ Chrome launched on port ${this.chrome.port}`);
      return this.chrome.port;
    } catch (error) {
      console.error('❌ Failed to launch Chrome:', error.message);
      throw error;
    }
  }

  async runAudit(url, pageName) {
    console.log(`\n🔍 Auditing ${pageName}: ${url}`);
    
    try {
      const result = await lighthouse(url, {
        port: this.chrome.port,
        ...AUDIT_CONFIG.lighthouseConfig.settings
      }, AUDIT_CONFIG.lighthouseConfig);

      if (!result || !result.lhr) {
        throw new Error('Invalid Lighthouse result');
      }

      const scores = {
        performance: Math.round(result.lhr.categories.performance.score * 100),
        accessibility: Math.round(result.lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(result.lhr.categories['best-practices'].score * 100),
        seo: Math.round(result.lhr.categories.seo.score * 100)
      };

      // Save detailed HTML report
      const reportPath = path.join(this.reportDir, `${pageName.toLowerCase().replace(/\s+/g, '-')}-${this.timestamp}.html`);
      await fs.writeFile(reportPath, result.report);

      const auditResult = {
        page: pageName,
        url,
        scores,
        reportPath,
        timestamp: new Date().toISOString(),
        passed: this.checkScores(scores),
        metrics: this.extractMetrics(result.lhr),
        opportunities: this.extractOpportunities(result.lhr),
        diagnostics: this.extractDiagnostics(result.lhr)
      };

      this.results.push(auditResult);
      this.logScores(pageName, scores);
      
      return auditResult;
    } catch (error) {
      console.error(`❌ Failed to audit ${pageName}:`, error.message);
      const failedResult = {
        page: pageName,
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
        passed: false
      };
      this.results.push(failedResult);
      return failedResult;
    }
  }

  checkScores(scores) {
    const failedCategories = [];
    
    Object.entries(AUDIT_CONFIG.targetScores).forEach(([category, target]) => {
      if (scores[category] < target) {
        failedCategories.push(`${category}: ${scores[category]} < ${target}`);
      }
    });

    return {
      passed: failedCategories.length === 0,
      failedCategories
    };
  }

  extractMetrics(lhr) {
    const metrics = {};
    
    if (lhr.audits['largest-contentful-paint']) {
      metrics.lcp = {
        value: lhr.audits['largest-contentful-paint'].numericValue,
        displayValue: lhr.audits['largest-contentful-paint'].displayValue,
        score: lhr.audits['largest-contentful-paint'].score
      };
    }

    if (lhr.audits['first-input-delay']) {
      metrics.fid = {
        value: lhr.audits['first-input-delay'].numericValue,
        displayValue: lhr.audits['first-input-delay'].displayValue,
        score: lhr.audits['first-input-delay'].score
      };
    }

    if (lhr.audits['cumulative-layout-shift']) {
      metrics.cls = {
        value: lhr.audits['cumulative-layout-shift'].numericValue,
        displayValue: lhr.audits['cumulative-layout-shift'].displayValue,
        score: lhr.audits['cumulative-layout-shift'].score
      };
    }

    if (lhr.audits['first-contentful-paint']) {
      metrics.fcp = {
        value: lhr.audits['first-contentful-paint'].numericValue,
        displayValue: lhr.audits['first-contentful-paint'].displayValue,
        score: lhr.audits['first-contentful-paint'].score
      };
    }

    if (lhr.audits['speed-index']) {
      metrics.speedIndex = {
        value: lhr.audits['speed-index'].numericValue,
        displayValue: lhr.audits['speed-index'].displayValue,
        score: lhr.audits['speed-index'].score
      };
    }

    return metrics;
  }

  extractOpportunities(lhr) {
    const opportunities = [];
    
    Object.values(lhr.audits).forEach(audit => {
      if (audit.details && audit.details.type === 'opportunity' && audit.numericValue > 0) {
        opportunities.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          savings: audit.displayValue,
          numericValue: audit.numericValue,
          score: audit.score
        });
      }
    });

    return opportunities.sort((a, b) => b.numericValue - a.numericValue);
  }

  extractDiagnostics(lhr) {
    const diagnostics = [];
    
    Object.values(lhr.audits).forEach(audit => {
      if (audit.details && audit.details.type === 'diagnostic' && audit.score !== null && audit.score < 1) {
        diagnostics.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score
        });
      }
    });

    return diagnostics.sort((a, b) => a.score - b.score);
  }

  logScores(pageName, scores) {
    console.log(`📊 ${pageName} Scores:`);
    Object.entries(scores).forEach(([category, score]) => {
      const target = AUDIT_CONFIG.targetScores[category];
      const status = score >= target ? '✅' : '❌';
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
      console.log(`   ${status} ${categoryName}: ${score}/100 (target: ${target})`);
    });
  }

  async generateSummaryReport() {
    const summaryPath = path.join(this.reportDir, `lighthouse-audit-summary-${this.timestamp}.json`);
    const markdownPath = path.join(this.reportDir, `lighthouse-audit-summary-${this.timestamp}.md`);
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: this.results.length,
      passedPages: this.results.filter(r => r.passed && r.passed.passed).length,
      failedPages: this.results.filter(r => !r.passed || !r.passed.passed).length,
      averageScores: this.calculateAverageScores(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    // Save JSON report
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    // Generate markdown report
    const markdownContent = this.generateMarkdownReport(summary);
    await fs.writeFile(markdownPath, markdownContent);

    console.log(`\n📄 Summary reports generated:`);
    console.log(`   JSON: ${summaryPath}`);
    console.log(`   Markdown: ${markdownPath}`);

    return summary;
  }

  calculateAverageScores() {
    const validResults = this.results.filter(r => r.scores);
    if (validResults.length === 0) return null;

    const totals = { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 };
    
    validResults.forEach(result => {
      Object.entries(result.scores).forEach(([category, score]) => {
        totals[category] += score;
      });
    });

    const averages = {};
    Object.entries(totals).forEach(([category, total]) => {
      averages[category] = Math.round(total / validResults.length);
    });

    return averages;
  }

  generateRecommendations() {
    const recommendations = [];
    const allOpportunities = [];
    const allDiagnostics = [];

    this.results.forEach(result => {
      if (result.opportunities) {
        allOpportunities.push(...result.opportunities);
      }
      if (result.diagnostics) {
        allDiagnostics.push(...result.diagnostics);
      }
    });

    // Group opportunities by type
    const opportunityGroups = {};
    allOpportunities.forEach(opp => {
      if (!opportunityGroups[opp.id]) {
        opportunityGroups[opp.id] = {
          title: opp.title,
          description: opp.description,
          count: 0,
          totalSavings: 0
        };
      }
      opportunityGroups[opp.id].count++;
      opportunityGroups[opp.id].totalSavings += opp.numericValue;
    });

    // Convert to recommendations
    Object.entries(opportunityGroups)
      .sort(([,a], [,b]) => b.totalSavings - a.totalSavings)
      .slice(0, 10)
      .forEach(([id, group]) => {
        recommendations.push({
          type: 'opportunity',
          id,
          title: group.title,
          description: group.description,
          affectedPages: group.count,
          priority: group.totalSavings > 1000 ? 'high' : group.totalSavings > 500 ? 'medium' : 'low'
        });
      });

    return recommendations;
  }

  generateMarkdownReport(summary) {
    let markdown = `# Lighthouse Performance Audit Report\n\n`;
    markdown += `**Generated:** ${new Date(summary.timestamp).toLocaleString()}\n\n`;
    
    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Pages Audited:** ${summary.totalPages}\n`;
    markdown += `- **Pages Meeting Targets:** ${summary.passedPages}/${summary.totalPages}\n`;
    markdown += `- **Pages Needing Improvement:** ${summary.failedPages}/${summary.totalPages}\n\n`;

    // Average Scores
    if (summary.averageScores) {
      markdown += `## Average Scores Across All Pages\n\n`;
      Object.entries(summary.averageScores).forEach(([category, score]) => {
        const target = AUDIT_CONFIG.targetScores[category];
        const status = score >= target ? '✅' : '❌';
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
        markdown += `- ${status} **${categoryName}:** ${score}/100 (target: ${target})\n`;
      });
      markdown += `\n`;
    }

    // Individual Page Results
    markdown += `## Individual Page Results\n\n`;
    this.results.forEach(result => {
      if (result.error) {
        markdown += `### ❌ ${result.page}\n`;
        markdown += `**Error:** ${result.error}\n\n`;
        return;
      }

      const overallStatus = result.passed && result.passed.passed ? '✅' : '❌';
      markdown += `### ${overallStatus} ${result.page}\n`;
      markdown += `**URL:** ${result.url}\n\n`;
      
      if (result.scores) {
        markdown += `**Scores:**\n`;
        Object.entries(result.scores).forEach(([category, score]) => {
          const target = AUDIT_CONFIG.targetScores[category];
          const status = score >= target ? '✅' : '❌';
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
          markdown += `- ${status} ${categoryName}: ${score}/100\n`;
        });
        markdown += `\n`;
      }

      if (result.metrics) {
        markdown += `**Core Web Vitals:**\n`;
        if (result.metrics.lcp) {
          markdown += `- **LCP:** ${result.metrics.lcp.displayValue}\n`;
        }
        if (result.metrics.fid) {
          markdown += `- **FID:** ${result.metrics.fid.displayValue}\n`;
        }
        if (result.metrics.cls) {
          markdown += `- **CLS:** ${result.metrics.cls.displayValue}\n`;
        }
        markdown += `\n`;
      }

      if (result.passed && !result.passed.passed && result.passed.failedCategories.length > 0) {
        markdown += `**Failed Categories:**\n`;
        result.passed.failedCategories.forEach(failure => {
          markdown += `- ${failure}\n`;
        });
        markdown += `\n`;
      }

      if (result.reportPath) {
        markdown += `**Detailed Report:** [${path.basename(result.reportPath)}](${result.reportPath})\n\n`;
      }
    });

    // Recommendations
    if (summary.recommendations && summary.recommendations.length > 0) {
      markdown += `## Top Recommendations\n\n`;
      summary.recommendations.forEach((rec, index) => {
        const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        markdown += `### ${index + 1}. ${priorityEmoji} ${rec.title}\n`;
        markdown += `**Priority:** ${rec.priority.toUpperCase()}\n`;
        markdown += `**Affected Pages:** ${rec.affectedPages}\n`;
        markdown += `**Description:** ${rec.description}\n\n`;
      });
    }

    return markdown;
  }

  async cleanup() {
    if (this.chrome) {
      await this.chrome.kill();
      console.log('🔄 Chrome instance closed');
    }
  }

  async run() {
    try {
      await this.init();
      await this.launchChrome();

      console.log(`\n🎯 Starting Lighthouse audits for ${AUDIT_CONFIG.pages.length} pages...`);
      console.log(`📍 Base URL: ${AUDIT_CONFIG.baseUrl}`);
      console.log(`🎯 Target scores: ${Object.entries(AUDIT_CONFIG.targetScores).map(([k,v]) => `${k}:${v}`).join(', ')}\n`);

      // Run audits for each page
      for (const page of AUDIT_CONFIG.pages) {
        const url = `${AUDIT_CONFIG.baseUrl}${page.path}`;
        await this.runAudit(url, page.name);
        
        // Small delay between audits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Generate summary report
      const summary = await this.generateSummaryReport();

      // Final summary
      console.log(`\n🎉 Audit Complete!`);
      console.log(`📊 Results: ${summary.passedPages}/${summary.totalPages} pages meeting targets`);
      
      if (summary.averageScores) {
        console.log(`📈 Average Scores:`);
        Object.entries(summary.averageScores).forEach(([category, score]) => {
          const target = AUDIT_CONFIG.targetScores[category];
          const status = score >= target ? '✅' : '❌';
          console.log(`   ${status} ${category}: ${score}/100`);
        });
      }

      if (summary.failedPages > 0) {
        console.log(`\n⚠️  ${summary.failedPages} pages need improvement. Check the detailed reports for recommendations.`);
        process.exit(1);
      } else {
        console.log(`\n✅ All pages meet the 90+ score targets!`);
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the audit if called directly
const currentFile = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFile;

if (isMainModule) {
  console.log('🚀 Starting Lighthouse Performance Audit...');
  const auditor = new LighthouseAuditor();
  auditor.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default LighthouseAuditor;