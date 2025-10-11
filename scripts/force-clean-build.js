#!/usr/bin/env node

/**
 * Force Clean Build Directory Script
 * Handles Windows-specific file permission and locking issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ForceCleanBuild {
  constructor() {
    this.buildDir = 'out';
  }

  /**
   * Kill any processes that might be locking files
   */
  async killLockingProcesses() {
    console.log('🔪 Killing processes that might be locking build files...');

    try {
      // Kill any Node.js processes that might be holding file handles
      execSync(
        'taskkill /f /im node.exe 2>nul || echo "No node processes to kill"',
        { stdio: 'pipe' }
      );

      // Kill any Next.js processes
      execSync(
        'taskkill /f /im next.exe 2>nul || echo "No next processes to kill"',
        { stdio: 'pipe' }
      );

      // Wait a moment for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('   ✅ Process cleanup completed');
    } catch (error) {
      console.log('   ⚠️  Process cleanup had issues, continuing...');
    }
  }

  /**
   * Remove file attributes that prevent deletion
   */
  removeFileAttributes(filePath) {
    try {
      // Remove read-only, hidden, and system attributes
      execSync(`attrib -r -h -s "${filePath}" 2>nul`, { stdio: 'pipe' });
    } catch (error) {
      // Ignore attribute errors
    }
  }

  /**
   * Force remove directory with multiple methods
   */
  async forceRemoveDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return true;
    }

    console.log(`🗑️  Force removing directory: ${dirPath}`);

    // Method 1: PowerShell with force and recurse
    try {
      execSync(
        `powershell -Command "Get-ChildItem -Path '${dirPath}' -Recurse | Remove-Item -Force -Recurse; Remove-Item -Path '${dirPath}' -Force"`,
        {
          stdio: 'pipe',
          timeout: 60000,
        }
      );

      if (!fs.existsSync(dirPath)) {
        console.log('   ✅ Removed with PowerShell');
        return true;
      }
    } catch (error) {
      console.log('   ⚠️  PowerShell method failed, trying next...');
    }

    // Method 2: CMD with force
    try {
      execSync(`rmdir /s /q "${dirPath}"`, {
        stdio: 'pipe',
        timeout: 60000,
      });

      if (!fs.existsSync(dirPath)) {
        console.log('   ✅ Removed with CMD rmdir');
        return true;
      }
    } catch (error) {
      console.log('   ⚠️  CMD method failed, trying next...');
    }

    // Method 3: Robocopy trick (copy empty dir over existing)
    try {
      const tempDir = path.join(process.cwd(), 'temp_empty_dir');

      // Create empty temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Use robocopy to "mirror" empty directory over target (effectively deleting)
      execSync(
        `robocopy "${tempDir}" "${dirPath}" /mir /nfl /ndl /njh /njs /nc /ns /np`,
        {
          stdio: 'pipe',
          timeout: 60000,
        }
      );

      // Remove the now-empty target directory
      execSync(`rmdir "${dirPath}"`, { stdio: 'pipe' });

      // Clean up temp directory
      execSync(`rmdir "${tempDir}"`, { stdio: 'pipe' });

      if (!fs.existsSync(dirPath)) {
        console.log('   ✅ Removed with Robocopy method');
        return true;
      }
    } catch (error) {
      console.log('   ⚠️  Robocopy method failed, trying next...');
    }

    // Method 4: Node.js recursive with attribute removal
    try {
      this.removeDirectoryRecursiveWithAttributes(dirPath);

      if (!fs.existsSync(dirPath)) {
        console.log('   ✅ Removed with Node.js recursive method');
        return true;
      }
    } catch (error) {
      console.log('   ⚠️  Node.js recursive method failed');
    }

    // Method 5: Move to temp location then delete
    try {
      const tempPath = path.join(process.cwd(), `temp_delete_${Date.now()}`);

      // Move directory to temp location
      fs.renameSync(dirPath, tempPath);

      // Try to delete from temp location
      setTimeout(() => {
        try {
          execSync(`rmdir /s /q "${tempPath}"`, { stdio: 'pipe' });
        } catch (e) {
          console.log('   ⚠️  Temp deletion will complete in background');
        }
      }, 5000);

      console.log('   ✅ Moved to temp location for background deletion');
      return true;
    } catch (error) {
      console.log('   ⚠️  Move method failed');
    }

    console.log('   ❌ All removal methods failed');
    return false;
  }

  /**
   * Recursively remove directory with attribute handling
   */
  removeDirectoryRecursiveWithAttributes(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      // Remove attributes that prevent deletion
      this.removeFileAttributes(filePath);

      if (stat.isDirectory()) {
        this.removeDirectoryRecursiveWithAttributes(filePath);
      } else {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          // Try to change permissions and retry
          try {
            fs.chmodSync(filePath, 0o666);
            fs.unlinkSync(filePath);
          } catch (retryError) {
            console.warn(`   Could not delete file: ${filePath}`);
          }
        }
      }
    }

    // Remove attributes from directory itself
    this.removeFileAttributes(dirPath);

    try {
      fs.rmdirSync(dirPath);
    } catch (error) {
      throw new Error(`Could not remove directory: ${dirPath}`);
    }
  }

  /**
   * Main execution
   */
  async run() {
    try {
      console.log('🚀 Starting force clean build process...');

      // Step 1: Kill locking processes
      await this.killLockingProcesses();

      // Step 2: Force remove build directory
      const removed = await this.forceRemoveDirectory(this.buildDir);

      if (removed) {
        console.log('✅ Build directory successfully cleaned');
        return { success: true };
      } else {
        console.log('⚠️  Build directory partially cleaned');
        return { success: false, partial: true };
      }
    } catch (error) {
      console.error('❌ Force clean failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// CLI execution
if (require.main === module) {
  const cleaner = new ForceCleanBuild();

  cleaner
    .run()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Force clean completed successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Force clean completed with issues');
        process.exit(result.partial ? 0 : 1);
      }
    })
    .catch(error => {
      console.error('\n❌ Force clean failed:', error.message);
      process.exit(1);
    });
}

module.exports = ForceCleanBuild;
