#!/usr/bin/env node

/**
 * Deployment Status Dashboard
 * 
 * Provides real-time deployment status tracking and monitoring
 * Requirements: 10.5
 */

const fs = require('fs');
const path = require('path');
const DeploymentAuditLogger = require('./deployment-audit-logger');

class DeploymentStatusDashboard {
  constructor() {
    this.dashboardDir = '.kiro/dashboard';
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }
  }

  generateDashboard() {
    const history = DeploymentAuditLogger.getDeploymentHistory(20);
    const stats = this.calculateStats(history);
    const html = this.generateHTML(history, stats);
    
    const dashboardPath = path.join(this.dashboardDir, 'deployment-dashboard.html');
    fs.writeFileSync(dashboardPath, html);
    
    // Also generate JSON for API consumption
    const jsonData = {
      timestamp: new Date().toISOString(),
      stats,
      history,
      status: this.getOverallStatus(history)
    };
    
    const jsonPath = path.join(this.dashboardDir, 'deployment-status.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    console.log(`📊 Dashboard generated: ${dashboardPath}`);
    console.log(`📊 Status JSON: ${jsonPath}`);
    
    return { dashboardPath, jsonPath, stats };
  }

  calculateStats(history) {
    if (history.length === 0) {
      return {
        totalDeployments: 0,
        successRate: 0,
        averageDuration: 0,
        lastDeployment: null,
        deploymentsLast24h: 0,
        deploymentsLast7d: 0
      };
    }

    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    const successful = history.filter(d => d.status === 'success').length;
    const totalDuration = history.reduce((sum, d) => sum + (d.duration || 0), 0);
    const deploymentsLast24h = history.filter(d => new Date(d.timestamp).getTime() > last24h).length;
    const deploymentsLast7d = history.filter(d => new Date(d.timestamp).getTime() > last7d).length;

    return {
      totalDeployments: history.length,
      successRate: Math.round((successful / history.length) * 100),
      averageDuration: Math.round(totalDuration / history.length / 1000), // seconds
      lastDeployment: history[0],
      deploymentsLast24h,
      deploymentsLast7d
    };
  }

  getOverallStatus(history) {
    if (history.length === 0) return 'unknown';
    
    const recent = history.slice(0, 5);
    const failures = recent.filter(d => d.status === 'failed').length;
    
    if (failures === 0) return 'healthy';
    if (failures <= 2) return 'warning';
    return 'critical';
  }

  generateHTML(history, stats) {
    const statusColor = {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      unknown: '#6b7280'
    };

    const overallStatus = this.getOverallStatus(history);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCRAM Deployment Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.875rem;
            background: ${statusColor[overallStatus]};
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1e293b;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .deployments-table {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .table-header {
            background: #f1f5f9;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .table-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 0.75rem 1.5rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background: #f8fafc;
            font-weight: 600;
            color: #475569;
            font-size: 0.875rem;
        }
        
        .status-success { color: #10b981; }
        .status-failed { color: #ef4444; }
        .status-in_progress { color: #f59e0b; }
        
        .deployment-id {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.75rem;
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
        }
        
        .timestamp {
            color: #64748b;
            font-size: 0.875rem;
        }
        
        .duration {
            font-weight: 500;
        }
        
        .refresh-info {
            text-align: center;
            margin-top: 2rem;
            color: #64748b;
            font-size: 0.875rem;
        }
        
        .no-data {
            text-align: center;
            padding: 3rem;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SCRAM Deployment Dashboard</h1>
            <div class="status-badge">${overallStatus}</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalDeployments}</div>
                <div class="stat-label">Total Deployments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageDuration}s</div>
                <div class="stat-label">Average Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.deploymentsLast24h}</div>
                <div class="stat-label">Last 24 Hours</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.deploymentsLast7d}</div>
                <div class="stat-label">Last 7 Days</div>
            </div>
        </div>
        
        <div class="deployments-table">
            <div class="table-header">
                <h2>Recent Deployments</h2>
            </div>
            ${history.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Deployment ID</th>
                        <th>Status</th>
                        <th>Environment</th>
                        <th>Branch</th>
                        <th>Duration</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(deployment => `
                    <tr>
                        <td><span class="deployment-id">${deployment.deploymentId}</span></td>
                        <td><span class="status-${deployment.status}">${deployment.status.toUpperCase()}</span></td>
                        <td>${deployment.environment}</td>
                        <td>${deployment.gitBranch}</td>
                        <td class="duration">${deployment.duration ? Math.round(deployment.duration / 1000) + 's' : 'N/A'}</td>
                        <td class="timestamp">${new Date(deployment.timestamp).toLocaleString()}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="no-data">
                <p>No deployment history available</p>
            </div>
            `}
        </div>
        
        <div class="refresh-info">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }

  watchDeployments() {
    console.log('👀 Watching for deployment changes...');
    
    const auditDir = '.kiro/audit-logs';
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    // Watch for changes in audit logs
    fs.watch(auditDir, (eventType, filename) => {
      if (eventType === 'change' && filename && filename.endsWith('.json')) {
        console.log(`📊 Deployment update detected: ${filename}`);
        this.generateDashboard();
      }
    });

    // Generate initial dashboard
    this.generateDashboard();
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const dashboard = new DeploymentStatusDashboard();
  
  switch (command) {
    case 'generate':
      dashboard.generateDashboard();
      break;
      
    case 'watch':
      dashboard.watchDeployments();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node deployment-status-dashboard.js generate');
      console.log('  node deployment-status-dashboard.js watch');
  }
}

module.exports = DeploymentStatusDashboard;