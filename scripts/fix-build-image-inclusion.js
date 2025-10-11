#!/usr/bin/env node

/**
 * Fix Build Process Image Inclusion Script
 *
 * This script addresses Task 4.1: Fix Build Process Image Inclusion
 * - Resolve Next.js build directory cleanup issues
 * - Ensure images are properly copied from public/ to out/ directory
 * - Verify all source images are included in build output
 *
 * Requirements addressed: 3.2
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildImageInclusionFixer {
  constructor() {
    this.buildDir = 'out';
    this.publicDir = 'public';
    this.imageExtensions = [
      '.webp',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.svg',
      '.avif',
    ];
    this.results = {
      cleanup: {},
      build: {},
      verification: {},
    };
  }

  /**
   * Force cleanup of build directory
   */
  async forceCleanupBuildDir() {
    console.log('🧹 Force cleaning build directory...');

    try {
      if (fs.existsSync(this.buildDir)) {
        // Try multiple cleanup methods for Windows
        try {
          // Method 1: PowerShell Remove-Item with force
          execSync(
            `powershell -Command "Remove-Item -Recurse -Force '${this.buildDir}'"`,
            {
              stdio: 'pipe',
              timeout: 30000,
            }
          );
          console.log('   ✅ Cleaned with PowerShell Remove-Item');
        } catch (error1) {
          try {
            // Method 2: CMD rmdir with force
            execSync(`rmdir /s /q "${this.buildDir}"`, {
              stdio: 'pipe',
              timeout: 30000,
            });
            console.log('   ✅ Cleaned with CMD rmdir');
          } catch (error2) {
            try {
              // Method 3: Node.js recursive removal
              this.removeDirectoryRecursive(this.buildDir);
              console.log('   ✅ Cleaned with Node.js recursive removal');
            } catch (error3) {
              console.warn(
                '   ⚠️  Could not fully clean build directory, continuing...'
              );
              console.warn(
                `   Errors: ${error1.message}, ${error2.message}, ${error3.message}`
              );
            }
          }
        }
      }

      // Verify cleanup
      const cleanupSuccess = !fs.existsSync(this.buildDir);
      this.results.cleanup = {
        attempted: true,
        success: cleanupSuccess,
        method: cleanupSuccess ? 'successful' : 'partial',
      };

      if (cleanupSuccess) {
        console.log('   ✅ Build directory successfully cleaned');
      } else {
        console.log(
          '   ⚠️  Build directory partially cleaned, proceeding with build'
        );
      }

      return cleanupSuccess;
    } catch (error) {
      console.error('❌ Build directory cleanup failed:', error.message);
      this.results.cleanup = {
        attempted: true,
        success: false,
        error: error.message,
      };
      return false;
    }
  }

  /**
   * Recursively remove directory (Node.js fallback)
   */
  removeDirectoryRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          this.removeDirectoryRecursive(filePath);
        } else {
          // Try to remove file attributes that might prevent deletion
          try {
            fs.chmodSync(filePath, 0o666);
          } catch (e) {
            // Ignore chmod errors
          }
          fs.unlinkSync(filePath);
        }
      }

      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Run Next.js build with proper error handling
   */
  async runBuild() {
    console.log('🔨 Running Next.js build...');

    try {
      // Set environment variables for build
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      };

      // Run build with timeout and proper error handling
      execSync('npm run build', {
        stdio: 'inherit',
        env,
        timeout: 300000, // 5 minutes timeout
      });

      this.results.build = {
        success: true,
        completed: true,
      };

      console.log('✅ Next.js build completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Next.js build failed:', error.message);
      this.results.build = {
        success: false,
        error: error.message,
      };
      return false;
    }
  }

  /**
   * Get all images from source directory
   */
  getSourceImages() {
    const images = [];
    const publicImagesDir = path.join(process.cwd(), this.publicDir, 'images');

    if (!fs.existsSync(publicImagesDir)) {
      return images;
    }

    const walkDir = (dir, baseDir = '') => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, path.join(baseDir, file));
        } else {
          const ext = path.extname(file).toLowerCase();
          if (this.imageExtensions.includes(ext)) {
            const relativePath = path
              .join('images', baseDir, file)
              .replace(/\\/g, '/');
            images.push({
              sourcePath: filePath,
              relativePath,
              filename: file,
              extension: ext,
              size: stat.size,
            });
          }
        }
      }
    };

    walkDir(publicImagesDir);
    return images;
  }

  /**
   * Get all images from build directory
   */
  getBuildImages() {
    const images = [];
    const buildImagesDir = path.join(process.cwd(), this.buildDir, 'images');

    if (!fs.existsSync(buildImagesDir)) {
      return images;
    }

    const walkDir = (dir, baseDir = '') => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, path.join(baseDir, file));
        } else {
          const ext = path.extname(file).toLowerCase();
          if (this.imageExtensions.includes(ext)) {
            const relativePath = path
              .join('images', baseDir, file)
              .replace(/\\/g, '/');
            images.push({
              buildPath: filePath,
              relativePath,
              filename: file,
              extension: ext,
              size: stat.size,
            });
          }
        }
      }
    };

    walkDir(buildImagesDir);
    return images;
  }

  /**
   * Verify all source images are included in build
   */
  async verifyImageInclusion() {
    console.log('🔍 Verifying image inclusion in build...');

    try {
      const sourceImages = this.getSourceImages();
      const buildImages = this.getBuildImages();

      console.log(`   Source images: ${sourceImages.length}`);
      console.log(`   Build images: ${buildImages.length}`);

      // Create maps for comparison
      const sourceImageMap = new Map();
      sourceImages.forEach(img => sourceImageMap.set(img.relativePath, img));

      const buildImageMap = new Map();
      buildImages.forEach(img => buildImageMap.set(img.relativePath, img));

      // Find missing images
      const missingImages = [];
      const includedImages = [];
      const sizeMismatches = [];

      for (const [relativePath, sourceImg] of sourceImageMap) {
        const buildImg = buildImageMap.get(relativePath);

        if (!buildImg) {
          missingImages.push(sourceImg);
        } else {
          includedImages.push({
            relativePath,
            sourceSize: sourceImg.size,
            buildSize: buildImg.size,
          });

          // Check for size mismatches (could indicate corruption)
          if (sourceImg.size !== buildImg.size) {
            sizeMismatches.push({
              relativePath,
              sourceSize: sourceImg.size,
              buildSize: buildImg.size,
            });
          }
        }
      }

      // Check for extra images in build (shouldn't happen but good to know)
      const extraImages = [];
      for (const [relativePath, buildImg] of buildImageMap) {
        if (!sourceImageMap.has(relativePath)) {
          extraImages.push(buildImg);
        }
      }

      this.results.verification = {
        sourceCount: sourceImages.length,
        buildCount: buildImages.length,
        includedCount: includedImages.length,
        missingCount: missingImages.length,
        sizeMismatchCount: sizeMismatches.length,
        extraCount: extraImages.length,
        missingImages: missingImages.map(img => img.relativePath),
        sizeMismatches,
        extraImages: extraImages.map(img => img.relativePath),
        allIncluded: missingImages.length === 0,
      };

      // Report results
      if (missingImages.length === 0) {
        console.log('✅ All source images included in build');
      } else {
        console.error(`❌ ${missingImages.length} images missing from build:`);
        missingImages.forEach(img => console.error(`   - ${img.relativePath}`));
      }

      if (sizeMismatches.length > 0) {
        console.warn(
          `⚠️  ${sizeMismatches.length} images have size mismatches:`
        );
        sizeMismatches.forEach(mismatch => {
          console.warn(
            `   - ${mismatch.relativePath}: ${mismatch.sourceSize} → ${mismatch.buildSize} bytes`
          );
        });
      }

      if (extraImages.length > 0) {
        console.log(
          `ℹ️  ${extraImages.length} extra images found in build (not in source)`
        );
      }

      return missingImages.length === 0;
    } catch (error) {
      console.error('❌ Image inclusion verification failed:', error.message);
      this.results.verification = {
        success: false,
        error: error.message,
      };
      return false;
    }
  }

  /**
   * Test specific blog image
   */
  async testBlogImage() {
    console.log('📝 Testing specific blog image...');

    const blogImagePath = 'images/hero/paid-ads-analytics-screenshot.webp';

    try {
      const sourcePath = path.join(
        process.cwd(),
        this.publicDir,
        blogImagePath
      );
      const buildPath = path.join(process.cwd(), this.buildDir, blogImagePath);

      const sourceExists = fs.existsSync(sourcePath);
      const buildExists = fs.existsSync(buildPath);

      let sourceSize = 0;
      let buildSize = 0;

      if (sourceExists) {
        sourceSize = fs.statSync(sourcePath).size;
      }

      if (buildExists) {
        buildSize = fs.statSync(buildPath).size;
      }

      const blogImageTest = {
        imagePath: blogImagePath,
        sourceExists,
        buildExists,
        sourceSize,
        buildSize,
        sizesMatch: sourceExists && buildExists && sourceSize === buildSize,
        passed: sourceExists && buildExists && sourceSize === buildSize,
      };

      console.log(`   Source exists: ${sourceExists ? '✅' : '❌'}`);
      console.log(`   Build exists: ${buildExists ? '✅' : '❌'}`);

      if (sourceExists && buildExists) {
        console.log(
          `   Sizes match: ${blogImageTest.sizesMatch ? '✅' : '❌'} (${sourceSize} vs ${buildSize} bytes)`
        );
      }

      this.results.blogImageTest = blogImageTest;

      return blogImageTest.passed;
    } catch (error) {
      console.error('❌ Blog image test failed:', error.message);
      this.results.blogImageTest = {
        passed: false,
        error: error.message,
      };
      return false;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Build Image Inclusion Fix Report');
    console.log('='.repeat(50));

    // Cleanup results
    if (this.results.cleanup.attempted) {
      console.log(
        `\n🧹 Build Directory Cleanup: ${this.results.cleanup.success ? '✅ SUCCESS' : '❌ FAILED'}`
      );
      if (this.results.cleanup.method) {
        console.log(`   Method: ${this.results.cleanup.method}`);
      }
      if (this.results.cleanup.error) {
        console.log(`   Error: ${this.results.cleanup.error}`);
      }
    }

    // Build results
    if (this.results.build.success !== undefined) {
      console.log(
        `\n🔨 Next.js Build: ${this.results.build.success ? '✅ SUCCESS' : '❌ FAILED'}`
      );
      if (this.results.build.error) {
        console.log(`   Error: ${this.results.build.error}`);
      }
    }

    // Verification results
    if (this.results.verification.sourceCount !== undefined) {
      console.log(
        `\n🔍 Image Inclusion Verification: ${this.results.verification.allIncluded ? '✅ SUCCESS' : '❌ FAILED'}`
      );
      console.log(`   Source images: ${this.results.verification.sourceCount}`);
      console.log(`   Build images: ${this.results.verification.buildCount}`);
      console.log(`   Included: ${this.results.verification.includedCount}`);

      if (this.results.verification.missingCount > 0) {
        console.log(`   Missing: ${this.results.verification.missingCount}`);
      }

      if (this.results.verification.sizeMismatchCount > 0) {
        console.log(
          `   Size mismatches: ${this.results.verification.sizeMismatchCount}`
        );
      }
    }

    // Blog image test
    if (this.results.blogImageTest) {
      console.log(
        `\n📝 Blog Image Test: ${this.results.blogImageTest.passed ? '✅ SUCCESS' : '❌ FAILED'}`
      );
      console.log(`   Image: ${this.results.blogImageTest.imagePath}`);
    }

    // Overall result
    const allPassed = [
      this.results.cleanup.success !== false,
      this.results.build.success === true,
      this.results.verification.allIncluded === true,
      this.results.blogImageTest?.passed === true,
    ].every(result => result === true);

    console.log(
      `\n📋 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
    );

    // Save detailed report
    const reportPath = path.join(
      process.cwd(),
      'build-image-inclusion-fix-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    return allPassed;
  }

  /**
   * Main execution
   */
  async run() {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting build image inclusion fix...');
      console.log('');

      // Step 1: Force cleanup build directory
      await this.forceCleanupBuildDir();

      // Step 2: Run Next.js build
      const buildSuccess = await this.runBuild();

      if (!buildSuccess) {
        console.error('❌ Build failed, cannot proceed with verification');
        return { success: false, results: this.results };
      }

      // Step 3: Verify image inclusion
      await this.verifyImageInclusion();

      // Step 4: Test specific blog image
      await this.testBlogImage();

      // Step 5: Generate report
      const allPassed = this.generateReport();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log(`\n⏱️  Fix completed in ${duration} seconds`);

      if (allPassed) {
        console.log('\n🎉 Build image inclusion fix completed successfully!');
        return { success: true, results: this.results };
      } else {
        console.log('\n⚠️  Some issues remain - see report above');
        return { success: false, results: this.results };
      }
    } catch (error) {
      console.error('\n❌ Build image inclusion fix failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Check if Node.js and npm are properly installed');
      console.error('2. Verify package.json has correct build script');
      console.error('3. Ensure Next.js configuration is valid');
      console.error('4. Check for file permission issues');

      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new BuildImageInclusionFixer();

  fixer
    .run()
    .then(result => {
      console.log('\n✅ Build image inclusion fix process completed');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(
        '\n❌ Build image inclusion fix process failed:',
        error.message
      );
      process.exit(1);
    });
}

module.exports = BuildImageInclusionFixer;
