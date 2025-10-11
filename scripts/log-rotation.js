#!/usr/bin/env node

/**
 * Log Rotation for Performance Monitoring
 */

const fs = require('fs');
const path = require('path');

class LogRotation {
  constructor() {
    this.logsDir = './logs';
    this.maxSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 5;
  }

  rotateLog(logFile) {
    const logPath = path.join(this.logsDir, logFile);
    
    if (!fs.existsSync(logPath)) return;
    
    const stats = fs.statSync(logPath);
    if (stats.size < this.maxSize) return;
    
    // Rotate existing files
    for (let i = this.maxFiles - 1; i > 0; i--) {
      const oldFile = logPath + '.' + i;
      const newFile = logPath + '.' + (i + 1);
      
      if (fs.existsSync(oldFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }
    
    // Move current log to .1
    fs.renameSync(logPath, logPath + '.1');
    
    console.log('📋 Rotated log file: ' + logFile);
  }

  rotateAllLogs() {
    const logFiles = ['performance-alerts.log', 'monitoring.log'];
    logFiles.forEach(file => this.rotateLog(file));
  }
}

if (require.main === module) {
  const rotation = new LogRotation();
  rotation.rotateAllLogs();
}

module.exports = LogRotation;
