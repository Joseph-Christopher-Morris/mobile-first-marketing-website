#!/usr/bin/env node

/**
 * Core Web Vitals Dashboard
 * Provides ongoing monitoring and alerting for Core Web Vitals metrics
 */

const CoreWebVitalsMonitor = require('./core-web-vitals-monitor');
const fs = require('fs').promises;
const path = require('path');

class CoreWebVitalsDashboard {
  constructor() {
    this.monitor = new CoreWebVitalsMonitor();
    this.alertThresholds = {
      lcp: 3000, // Alert if LCP > 3 seconds
      fid: 150,  // Alert if FID > 150ms
      cls: 0.15  // Alert if CLS > 0.15
    };
  }

  async runDashboard(options = {}) {
    const { 
      continuous = false, 
      interval = 3600000, // 1 hour default
      alerting = true 
    } = options;

    console.log('📊 Core Web Vitals Dashboard Starting');
    console.log(`🔄 Continuous monitoring: ${continuous ? 'Enabled' : 'Disabled'}`);
    
    if (continuous) {
      console.log(`⏱️  Monitoring interval: ${interval / 1000 / 60} minutes`);
    }
    
    console.log('');

    do {
      try {
        const result = await this.monitor.runMonitoring();
        
        if (alerting) {
          await this.checkAlerts(result.results);
        }
        
        await this.updateDashboard(result);
        
        if (continuous) {
          console.log(`⏳ Next monitoring run in ${interval / 1000 / 60} minutes`);
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        
      } catch (error) {
        console.error('❌ Dashboard error:', error);
        
        if (continuous) {
          console.log('🔄 Retrying in 5 minutes...');
          await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes
        }
      }
    } while (continuous);
  }

  async checkAlerts(results) {
    console.log('🚨 Checking Alert Thresholds');
    
    const alerts = [];
    
    results.forEach(result => {
      if (result.error) return;
      
      // Check LCP alerts
      if (result.metrics.lcp && result.metrics.lcp.value > this.alertThresholds.lcp) {
        alerts.push({
          type: 'LCP',
          page: result.page,
          value: result.metrics.lcp.value,
          threshold: this.alertThresholds.lcp,
          severity: 'high'
        });
      }
      
      // Check FID alerts
      if (result.metrics.fid && result.metrics.fid.value && result.metrics.fid.value > this.alertThresholds.fid) {
        alerts.push({
          type: 'FID',
          page: result.page,
          value: result.metrics.fid.value,
          threshold: this.alertThresholds.fid,
          severity: 'medium'
        });
      }
      
      // Check CLS alerts
      if (result.metrics.cls && result.metrics.cls.value > this.alertThresholds.cls) {
        alerts.push({
          type: 'CLS',
          page: result.page,
          value: result.metrics.cls.value,
          threshold: this.alertThresholds.cls,
          severity: 'medium'
        });
      }
    });
    
    if (alerts.length > 0) {
      console.log(`🚨 ${alerts.length} alerts triggered:`);
      alerts.forEach(alert => {
        const emoji = alert.severity === 'high' ? '🔴' : '🟡';
        console.log(`   ${emoji} ${alert.type} on ${alert.page}: ${alert.value} > ${alert.threshold}`);
      });
      
      await this.saveAlerts(alerts);
    } else {
      console.log('✅ No alerts triggered');
    }
    
    console.log('');
  }

  async saveAlerts(alerts) {
    const timestamp = new Date().toISOString();
    const alertData = {
      timestamp,
      alerts,
      count: alerts.length
    };
    
    const alertFile = `core-web-vitals-alerts-${timestamp.replace(/[:.]/g, '-')}.json`;
    await fs.writeFile(alertFile, JSON.stringify(alertData, null, 2));
    
    console.log(`🚨 Alerts saved to: ${alertFile}`);
  }

  async updateDashboard(result) {
    const timestamp = new Date().toISOString();
    
    // Create dashboard data
    const dashboardData = {
      lastUpdate: timestamp,
      overallStatus: result.passed ? 'PASSED' : 'FAILED',
      summary: {
        totalPages: result.results.length,
        passedPages: result.results.filter(r => r.passed).length,
        failedPages: result.results.filter(r => !r.passed).length
      },
      metrics: this.aggregateMetrics(result.results),
      trends: await this.calculateTrends(),
      alerts: await this.getRecentAlerts()
    };
    
    // Save dashboard data
    await fs.writeFile('core-web-vitals-dashboard.json', JSON.stringify(dashboardData, null, 2));
    
    // Generate HTML dashboard
    const htmlDashboard = this.generateHTMLDashboard(dashboardData);
    await fs.writeFile('core-web-vitals-dashboard.html', htmlDashboard);
    
    console.log('📊 Dashboard updated: core-web-vitals-dashboard.html');
  }

  aggregateMetrics(results) {
    const metrics = {
      lcp: { values: [], average: 0, min: 0, max: 0 },
      fid: { values: [], average: 0, min: 0, max: 0 },
      cls: { values: [], average: 0, min: 0, max: 0 }
    };
    
    results.forEach(result => {
      if (result.error) return;
      
      if (result.metrics.lcp && result.metrics.lcp.value) {
        metrics.lcp.values.push(result.metrics.lcp.value);
      }
      if (result.metrics.fid && result.metrics.fid.value) {
        metrics.fid.values.push(result.metrics.fid.value);
      }
      if (result.metrics.cls && result.metrics.cls.value) {
        metrics.cls.values.push(result.metrics.cls.value);
      }
    });
    
    // Calculate statistics
    Object.keys(metrics).forEach(key => {
      const values = metrics[key].values;
      if (values.length > 0) {
        metrics[key].average = values.reduce((a, b) => a + b, 0) / values.length;
        metrics[key].min = Math.min(...values);
        metrics[key].max = Math.max(...values);
      }
    });
    
    return metrics;
  }

  async calculateTrends() {
    try {
      // Get recent monitoring files
      const files = await fs.readdir(process.cwd());
      const monitoringFiles = files
        .filter(file => file.startsWith('core-web-vitals-monitoring-') && file.endsWith('.json'))
        .sort()
        .slice(-10); // Last 10 runs
      
      const trends = [];
      
      for (const file of monitoringFiles) {
        try {
          const data = JSON.parse(await fs.readFile(file, 'utf8'));
          const timestamp = data[0]?.timestamp || file.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/)?.[1];
          
          if (timestamp) {
            const aggregated = this.aggregateMetrics(data);
            trends.push({
              timestamp,
              lcp: aggregated.lcp.average,
              fid: aggregated.fid.average,
              cls: aggregated.cls.average
            });
          }
        } catch (error) {
          // Skip invalid files
        }
      }
      
      return trends;
    } catch (error) {
      return [];
    }
  }

  async getRecentAlerts() {
    try {
      const files = await fs.readdir(process.cwd());
      const alertFiles = files
        .filter(file => file.startsWith('core-web-vitals-alerts-') && file.endsWith('.json'))
        .sort()
        .slice(-5); // Last 5 alert files
      
      const alerts = [];
      
      for (const file of alertFiles) {
        try {
          const data = JSON.parse(await fs.readFile(file, 'utf8'));
          alerts.push(data);
        } catch (error) {
          // Skip invalid files
        }
      }
      
      return alerts;
    } catch (error) {
      return [];
    }
  }

  generateHTMLDashboard(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Core Web Vitals Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 8px 16px; border-radius: 4px; color: white; font-weight: bold; }
        .status.passed { background: #22c55e; }
        .status.failed { background: #ef4444; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-good { color: #22c55e; }
        .metric-warning { color: #f59e0b; }
        .metric-poor { color: #ef4444; }
        .trend { height: 200px; background: #f8f9fa; border-radius: 4px; margin: 10px 0; display: flex; align-items: center; justify-content: center; }
        .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 4px; margin: 5px 0; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Core Web Vitals Dashboard</h1>
            <p class="timestamp">Last Updated: ${data.lastUpdate}</p>
            <span class="status ${data.overallStatus.toLowerCase()}">${data.overallStatus}</span>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>Summary</h3>
                <div class="metric">
                    <span>Total Pages:</span>
                    <span class="metric-value">${data.summary.totalPages}</span>
                </div>
                <div class="metric">
                    <span>Passed:</span>
                    <span class="metric-value metric-good">${data.summary.passedPages}</span>
                </div>
                <div class="metric">
                    <span>Failed:</span>
                    <span class="metric-value metric-poor">${data.summary.failedPages}</span>
                </div>
            </div>
            
            <div class="card">
                <h3>LCP (Largest Contentful Paint)</h3>
                <div class="metric">
                    <span>Average:</span>
                    <span class="metric-value ${data.metrics.lcp.average <= 2500 ? 'metric-good' : 'metric-warning'}">${Math.round(data.metrics.lcp.average)}ms</span>
                </div>
                <div class="metric">
                    <span>Target:</span>
                    <span>&lt; 2500ms</span>
                </div>
                <div class="metric">
                    <span>Range:</span>
                    <span>${Math.round(data.metrics.lcp.min)}ms - ${Math.round(data.metrics.lcp.max)}ms</span>
                </div>
            </div>
            
            <div class="card">
                <h3>FID (First Input Delay)</h3>
                <div class="metric">
                    <span>Average:</span>
                    <span class="metric-value ${data.metrics.fid.average <= 100 ? 'metric-good' : 'metric-warning'}">${Math.round(data.metrics.fid.average)}ms</span>
                </div>
                <div class="metric">
                    <span>Target:</span>
                    <span>&lt; 100ms</span>
                </div>
                <div class="metric">
                    <span>Range:</span>
                    <span>${Math.round(data.metrics.fid.min)}ms - ${Math.round(data.metrics.fid.max)}ms</span>
                </div>
            </div>
            
            <div class="card">
                <h3>CLS (Cumulative Layout Shift)</h3>
                <div class="metric">
                    <span>Average:</span>
                    <span class="metric-value ${data.metrics.cls.average <= 0.1 ? 'metric-good' : 'metric-warning'}">${data.metrics.cls.average.toFixed(3)}</span>
                </div>
                <div class="metric">
                    <span>Target:</span>
                    <span>&lt; 0.1</span>
                </div>
                <div class="metric">
                    <span>Range:</span>
                    <span>${data.metrics.cls.min.toFixed(3)} - ${data.metrics.cls.max.toFixed(3)}</span>
                </div>
            </div>
            
            ${data.alerts.length > 0 ? `
            <div class="card">
                <h3>Recent Alerts</h3>
                ${data.alerts.slice(-5).map(alert => `
                    <div class="alert">
                        <strong>${alert.count} alerts</strong> at ${alert.timestamp}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new CoreWebVitalsDashboard();
  
  const args = process.argv.slice(2);
  const continuous = args.includes('--continuous');
  const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 3600000;
  
  dashboard.runDashboard({ continuous, interval })
    .then(() => {
      console.log('📊 Dashboard complete');
    })
    .catch(error => {
      console.error('❌ Dashboard failed:', error);
      process.exit(1);
    });
}

module.exports = CoreWebVitalsDashboard;