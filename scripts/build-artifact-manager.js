#!/usr/bin/env node

/**
 * Build Artifact Manager
 * 
 * Manages build artifact retention, versioning, and cleanup
 * Requirements: 10.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildArtifactManager {
  constructor() {
    this.artifactsDir = '.kiro/artifacts';
    this.versionsDir = '.kiro/versions';
    this.maxRetentionDays = 30;
    this.maxVersions = 50;
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.artifactsDir, this.versionsDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateVersionId() {
    const timestamp = Date.now();
    const gitCommit = this.getGitCommit().substring(0, 8);
    return `v${timestamp}-${gitCommit}`;
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  archiveBuildArtifacts(buildDir = 'out', deploymentId = null) {
    if (!fs.existsSync(buildDir)) {
      throw new Error(`Build directory not found: ${buildDir}`);
    }

    const versionId = this.generateVersionId();
    const timestamp = new Date().toISOString();
    
    console.log(`📦 Archiving build artifacts as version: ${versionId}`);
    
    // Create version directory
    const versionDir = path.join(this.versionsDir, versionId);
    fs.mkdirSync(versionDir, { recursive: true });
    
    // Copy build artifacts
    this.copyDirectory(buildDir, path.join(versionDir, 'build'));
    
    // Create version metadata
    const metadata = {
      versionId,
      timestamp,
      deploymentId,
      gitCommit: this.getGitCommit(),
      gitBranch: this.getGitBranch(),
      buildDir,
      artifacts: this.scanArtifacts(path.join(versionDir, 'build')),
      size: this.calculateDirectorySize(path.join(versionDir, 'build'))
    };
    
    fs.writeFileSync(
      path.join(versionDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Update versions index
    this.updateVersionsIndex(metadata);
    
    console.log(`✅ Artifacts archived: ${this.formatBytes(metadata.size)}`);
    console.log(`📁 Location: ${versionDir}`);
    
    return { versionId, metadata };
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  scanArtifacts(dir, basePath = '') {
    const artifacts = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        artifacts.push(...this.scanArtifacts(fullPath, relativePath));
      } else {
        artifacts.push({
          name: item,
          path: relativePath,
          size: stats.size,
          type: path.extname(item),
          checksum: this.calculateChecksum(fullPath)
        });
      }
    });
    
    return artifacts;
  }

  calculateChecksum(filePath) {
    try {
      const crypto = require('crypto');
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      return null;
    }
  }

  calculateDirectorySize(dir) {
    let size = 0;
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        size += this.calculateDirectorySize(fullPath);
      } else {
        size += stats.size;
      }
    });
    
    return size;
  }

  updateVersionsIndex(metadata) {
    const indexPath = path.join(this.versionsDir, 'versions-index.json');
    let index = [];
    
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }
    
    // Add new version to beginning
    index.unshift({
      versionId: metadata.versionId,
      timestamp: metadata.timestamp,
      deploymentId: metadata.deploymentId,
      gitCommit: metadata.gitCommit,
      gitBranch: metadata.gitBranch,
      artifactCount: metadata.artifacts.length,
      size: metadata.size
    });
    
    // Keep only max versions
    if (index.length > this.maxVersions) {
      const toRemove = index.slice(this.maxVersions);
      index = index.slice(0, this.maxVersions);
      
      // Clean up old versions
      toRemove.forEach(version => {
        this.removeVersion(version.versionId);
      });
    }
    
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  listVersions(limit = 10) {
    const indexPath = path.join(this.versionsDir, 'versions-index.json');
    
    if (!fs.existsSync(indexPath)) {
      return [];
    }
    
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return index.slice(0, limit);
  }

  getVersion(versionId) {
    const versionDir = path.join(this.versionsDir, versionId);
    const metadataPath = path.join(versionDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  restoreVersion(versionId, targetDir = 'out') {
    const versionDir = path.join(this.versionsDir, versionId);
    const buildDir = path.join(versionDir, 'build');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error(`Version not found: ${versionId}`);
    }
    
    console.log(`🔄 Restoring version ${versionId} to ${targetDir}`);
    
    // Remove existing target directory
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    
    // Copy version artifacts to target
    this.copyDirectory(buildDir, targetDir);
    
    console.log(`✅ Version ${versionId} restored to ${targetDir}`);
    
    return this.getVersion(versionId);
  }

  removeVersion(versionId) {
    const versionDir = path.join(this.versionsDir, versionId);
    
    if (fs.existsSync(versionDir)) {
      fs.rmSync(versionDir, { recursive: true, force: true });
      console.log(`🗑️ Removed version: ${versionId}`);
    }
  }

  cleanupOldVersions() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.maxRetentionDays);
    
    const versions = this.listVersions(1000); // Get all versions
    let removedCount = 0;
    
    versions.forEach(version => {
      const versionDate = new Date(version.timestamp);
      if (versionDate < cutoffDate) {
        this.removeVersion(version.versionId);
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old versions`);
      
      // Update index to remove cleaned versions
      const remainingVersions = versions.filter(version => {
        const versionDate = new Date(version.timestamp);
        return versionDate >= cutoffDate;
      });
      
      const indexPath = path.join(this.versionsDir, 'versions-index.json');
      fs.writeFileSync(indexPath, JSON.stringify(remainingVersions, null, 2));
    }
    
    return removedCount;
  }

  generateRetentionReport() {
    const versions = this.listVersions(1000);
    const totalSize = versions.reduce((sum, v) => sum + v.size, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      totalVersions: versions.length,
      totalSize,
      maxRetentionDays: this.maxRetentionDays,
      maxVersions: this.maxVersions,
      versions: versions.map(v => ({
        versionId: v.versionId,
        timestamp: v.timestamp,
        age: Math.round((Date.now() - new Date(v.timestamp).getTime()) / (1000 * 60 * 60 * 24)),
        size: v.size,
        artifactCount: v.artifactCount
      }))
    };
    
    const reportPath = path.join(this.artifactsDir, `retention-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Retention report generated: ${reportPath}`);
    console.log(`📦 Total versions: ${report.totalVersions}`);
    console.log(`💾 Total size: ${this.formatBytes(report.totalSize)}`);
    
    return report;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const manager = new BuildArtifactManager();
  
  switch (command) {
    case 'archive':
      const buildDir = process.argv[3] || 'out';
      const deploymentId = process.argv[4] || null;
      try {
        const result = manager.archiveBuildArtifacts(buildDir, deploymentId);
        console.log(`Version ID: ${result.versionId}`);
      } catch (error) {
        console.error('❌ Archive failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'list':
      const limit = parseInt(process.argv[3]) || 10;
      const versions = manager.listVersions(limit);
      if (versions.length > 0) {
        console.log('Recent versions:');
        console.table(versions);
      } else {
        console.log('No versions found');
      }
      break;
      
    case 'restore':
      const versionId = process.argv[3];
      const targetDir = process.argv[4] || 'out';
      if (!versionId) {
        console.error('Usage: node build-artifact-manager.js restore <version-id> [target-dir]');
        process.exit(1);
      }
      try {
        manager.restoreVersion(versionId, targetDir);
      } catch (error) {
        console.error('❌ Restore failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'cleanup':
      const removed = manager.cleanupOldVersions();
      console.log(`Cleanup completed. Removed ${removed} versions.`);
      break;
      
    case 'report':
      manager.generateRetentionReport();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node build-artifact-manager.js archive [build-dir] [deployment-id]');
      console.log('  node build-artifact-manager.js list [limit]');
      console.log('  node build-artifact-manager.js restore <version-id> [target-dir]');
      console.log('  node build-artifact-manager.js cleanup');
      console.log('  node build-artifact-manager.js report');
  }
}

module.exports = BuildArtifactManager;