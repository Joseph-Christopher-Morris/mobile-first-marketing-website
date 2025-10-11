#!/usr/bin/env node

/**
 * Image Performance Testing Suite
 * Measures and analyzes image loading performance across different scenarios
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { performance } = require('perf_hooks');

class ImagePerformanceTester {
  constructor() {
    this.baseUrl = process.env.SITE_URL || 'https://d15sc9fc739ev2.cloudfront.net';
    this.testResults = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      imageTests: {},
      performanceMetrics: {},
      compressionAnalysis: {},
      cacheEfficiency: {},
      recommendations: [],
      summary: {
        totalImages: 0,
        averageLoadTime: 0,
        totalDataTransferred: 0,
        compressionSavings: 0
      }
    };
    
    this.testImages = [
      '/images/hero/paid-ads-analytics-screenshot.webp',
      '/images/services/analytics-hero.webp',
      '/images/blog/test-image.jpg'
    ];
  }

  async runPerformanceTests() {
    console.log('⚡ Starting Image Performance Tests...\n');
    
    try {
      await this.testImageLoadTimes();
      await this.analyzeCompression();
      await this.testCacheEfficiency();
      await this.testResponsivePerformance();
      await this.generateRecommendations();
      
      this.calculateSummary();
      await this.saveResults();
      
      console.log('\n✅ Image performance testing completed!');
      console.log(`📊 Results saved to: image-performance-results-${Date.now()}.json`);
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error.message);
      throw error;
    }
  }

  async testImageLoadTimes() {
    console.log('⏱️  Testing Image Load Times...');
    
    for (const imagePath of this.testImages) {
      console.log(`  Testing ${imagePath}...`);
      
      const imageUrl = `${this.baseUrl}${imagePath}`;
      const loadTest = await this.measureImageLoad(imageUrl);
      
      this.testResults.imageTests[imagePath] = {
        url: imageUrl,
        ...loadTest,
        recommendations: this.getLoadTimeRecommendations(loadTest)
      };
      
      console.log(`    Load Time: ${loadTest.loadTime}ms`);
      console.log(`    File Size: ${loadTest.fileSize} bytes`);
      console.log(`    Status: ${loadTest.success ? '✅ Success' : '❌ Failed'}`);
    }
  }

  async measureImageLoad(url) {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const request = https.get(url, (response) => {
        let data = Buffer.alloc(0);
        
        response.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
        
        response.on('end', () => {
          const endTime = performance.now();
          const loadTime = Math.round(endTime - startTime);
          
          resolve({
            success: response.statusCode === 200,
            statusCode: response.statusCode,
            loadTime,
            fileSize: data.length,
            contentType: response.headers['content-type'],
            cacheControl: response.headers['cache-control'],
            etag: response.headers['etag'],
            lastModified: response.headers['last-modified']
          });
        });
      });
      
      request.on('error', (error) => {
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);
        
        resolve({
          success: false,
          error: error.message,
          loadTime,
          fileSize: 0
        });
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);
        
        resolve({
          success: false,
          error: 'Timeout',
          loadTime,
          fileSize: 0
        });
      });
    });
  }

  getLoadTimeRecommendations(loadTest) {
    const recommendations = [];
    
    if (loadTest.loadTime > 3000) {
      recommendations.push('Load time exceeds 3 seconds - consider optimization');
    }
    
    if (loadTest.fileSize > 100000) {
      recommendations.push('File size over 100KB - consider compression');
    }
    
    if (!loadTest.cacheControl) {
      recommendations.push('Missing cache headers - implement caching');
    }
    
    if (loadTest.contentType && !loadTest.contentType.includes('webp')) {
      recommendations.push('Consider WebP format for better compression');
    }
    
    return recommendations;
  }

  async analyzeCompression() {
    console.log('🗜️  Analyzing Image Compression...');
    
    const compressionAnalysis = {
      webpVsJpeg: {},
      compressionRatios: {},
      qualityAssessment: {},
      recommendations: []
    };
    
    // Simulate compression analysis for different formats
    for (const imagePath of this.testImages) {
      const imageTest = this.testResults.imageTests[imagePath];
      
      if (imageTest && imageTest.success) {
        const analysis = {
          originalFormat: this.getImageFormat(imagePath),
          fileSize: imageTest.fileSize,
          estimatedUncompressed: imageTest.fileSize * 3, // Rough estimate
          compressionRatio: this.calculateCompressionRatio(imageTest.fileSize, imagePath),
          qualityScore: this.assessImageQuality(imageTest.fileSize, imagePath)
        };
        
        if (imagePath.endsWith('.webp')) {
          analysis.webpBenefit = 'Already using WebP format';
          analysis.estimatedJpegSize = Math.round(imageTest.fileSize * 1.3);
        } else if (imagePath.endsWith('.jpg')) {
          analysis.webpBenefit = 'Could reduce size by ~30% with WebP';
          analysis.estimatedWebpSize = Math.round(imageTest.fileSize * 0.7);
        }
        
        compressionAnalysis.compressionRatios[imagePath] = analysis;
      }
    }
    
    compressionAnalysis.recommendations = [
      'Convert JPEG images to WebP format for better compression',
      'Implement responsive images with multiple sizes',
      'Use progressive JPEG for large images',
      'Consider AVIF format for even better compression (when supported)'
    ];
    
    this.testResults.compressionAnalysis = compressionAnalysis;
    console.log('    ✅ Compression analysis completed');
  }

  getImageFormat(imagePath) {
    if (imagePath.endsWith('.webp')) return 'WebP';
    if (imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg')) return 'JPEG';
    if (imagePath.endsWith('.png')) return 'PNG';
    return 'Unknown';
  }

  calculateCompressionRatio(fileSize, imagePath) {
    // Simulate compression ratio calculation
    if (imagePath.endsWith('.webp')) return '65%';
    if (imagePath.endsWith('.jpg')) return '45%';
    if (imagePath.endsWith('.png')) return '25%';
    return '50%';
  }

  assessImageQuality(fileSize, imagePath) {
    // Simple quality assessment based on file size
    if (fileSize < 30000) return 'Good';
    if (fileSize < 80000) return 'Acceptable';
    return 'Could be optimized';
  }

  async testCacheEfficiency() {
    console.log('🗄️  Testing Cache Efficiency...');
    
    const cacheTest = {
      firstLoad: {},
      secondLoad: {},
      cacheHitRate: 0,
      recommendations: []
    };
    
    // Test first load (cold cache)
    console.log('  Testing cold cache performance...');
    for (const imagePath of this.testImages) {
      const imageUrl = `${this.baseUrl}${imagePath}`;
      const firstLoad = await this.measureImageLoad(imageUrl);
      cacheTest.firstLoad[imagePath] = firstLoad;
    }
    
    // Wait a moment then test second load (warm cache)
    console.log('  Testing warm cache performance...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (const imagePath of this.testImages) {
      const imageUrl = `${this.baseUrl}${imagePath}`;
      const secondLoad = await this.measureImageLoad(imageUrl);
      cacheTest.secondLoad[imagePath] = secondLoad;
      
      // Calculate cache efficiency
      const firstTime = cacheTest.firstLoad[imagePath].loadTime;
      const secondTime = secondLoad.loadTime;
      const improvement = firstTime > 0 ? ((firstTime - secondTime) / firstTime) * 100 : 0;
      
      console.log(`    ${imagePath}: ${improvement.toFixed(1)}% improvement`);
    }
    
    cacheTest.recommendations = [
      'Implement proper cache headers for static images',
      'Use CDN for global cache distribution',
      'Set appropriate cache expiration times',
      'Implement cache invalidation strategy for updates'
    ];
    
    this.testResults.cacheEfficiency = cacheTest;
    console.log('    ✅ Cache efficiency testing completed');
  }

  async testResponsivePerformance() {
    console.log('📱 Testing Responsive Image Performance...');
    
    const responsiveTest = {
      viewportSizes: [
        { name: 'Mobile', width: 375, expectedSize: 'small' },
        { name: 'Tablet', width: 768, expectedSize: 'medium' },
        { name: 'Desktop', width: 1920, expectedSize: 'large' }
      ],
      results: {},
      recommendations: []
    };
    
    // Simulate responsive image testing
    for (const viewport of responsiveTest.viewportSizes) {
      const result = {
        viewport: viewport.name,
        width: viewport.width,
        optimalImageSize: this.calculateOptimalImageSize(viewport.width),
        currentImageSize: 'Not implemented', // Would need actual responsive images
        performanceImpact: this.calculatePerformanceImpact(viewport.width),
        recommendations: []
      };
      
      if (viewport.width <= 375) {
        result.recommendations.push('Use smaller images for mobile devices');
      } else if (viewport.width >= 1920) {
        result.recommendations.push('Provide high-resolution images for large screens');
      }
      
      responsiveTest.results[viewport.name] = result;
    }
    
    responsiveTest.recommendations = [
      'Implement srcset attribute for responsive images',
      'Use picture element for art direction',
      'Provide multiple image sizes for different viewports',
      'Consider lazy loading for images below the fold'
    ];
    
    this.testResults.performanceMetrics.responsive = responsiveTest;
    console.log('    ✅ Responsive performance testing completed');
  }

  calculateOptimalImageSize(viewportWidth) {
    if (viewportWidth <= 375) return '400px width';
    if (viewportWidth <= 768) return '800px width';
    if (viewportWidth <= 1920) return '1200px width';
    return '1600px width';
  }

  calculatePerformanceImpact(viewportWidth) {
    // Simulate performance impact calculation
    if (viewportWidth <= 375) return 'High - mobile users sensitive to load times';
    if (viewportWidth <= 768) return 'Medium - balance between quality and speed';
    return 'Low - desktop users can handle larger images';
  }

  async generateRecommendations() {
    console.log('💡 Generating Performance Recommendations...');
    
    const recommendations = [];
    
    // Analyze load times
    const loadTimes = Object.values(this.testResults.imageTests)
      .filter(test => test.success)
      .map(test => test.loadTime);
    
    const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    
    if (averageLoadTime > 2000) {
      recommendations.push('Average load time exceeds 2 seconds - implement optimization');
    }
    
    // Analyze file sizes
    const fileSizes = Object.values(this.testResults.imageTests)
      .filter(test => test.success)
      .map(test => test.fileSize);
    
    const totalSize = fileSizes.reduce((sum, size) => sum + size, 0);
    
    if (totalSize > 500000) {
      recommendations.push('Total image size exceeds 500KB - consider compression');
    }
    
    // Format-specific recommendations
    const hasWebP = this.testImages.some(path => path.endsWith('.webp'));
    const hasJPEG = this.testImages.some(path => path.endsWith('.jpg'));
    
    if (hasJPEG && !hasWebP) {
      recommendations.push('Convert JPEG images to WebP for better compression');
    }
    
    // General recommendations
    recommendations.push(
      'Implement lazy loading for images below the fold',
      'Use responsive images with srcset attribute',
      'Enable browser caching with proper headers',
      'Consider using a CDN for global performance',
      'Optimize images before deployment',
      'Monitor Core Web Vitals for image impact'
    );
    
    this.testResults.recommendations = recommendations;
    console.log(`    ✅ Generated ${recommendations.length} recommendations`);
  }

  calculateSummary() {
    const { imageTests } = this.testResults;
    const successfulTests = Object.values(imageTests).filter(test => test.success);
    
    this.testResults.summary = {
      totalImages: Object.keys(imageTests).length,
      successfulLoads: successfulTests.length,
      averageLoadTime: successfulTests.length > 0 
        ? Math.round(successfulTests.reduce((sum, test) => sum + test.loadTime, 0) / successfulTests.length)
        : 0,
      totalDataTransferred: successfulTests.reduce((sum, test) => sum + test.fileSize, 0),
      compressionSavings: this.calculateCompressionSavings(),
      performanceGrade: this.calculatePerformanceGrade()
    };
  }

  calculateCompressionSavings() {
    // Estimate potential savings from WebP conversion
    const jpegImages = Object.entries(this.testResults.imageTests)
      .filter(([path, test]) => path.endsWith('.jpg') && test.success);
    
    const potentialSavings = jpegImages.reduce((savings, [path, test]) => {
      return savings + (test.fileSize * 0.3); // Assume 30% savings with WebP
    }, 0);
    
    return Math.round(potentialSavings);
  }

  calculatePerformanceGrade() {
    const { averageLoadTime, totalDataTransferred } = this.testResults.summary;
    
    let score = 100;
    
    // Deduct points for slow load times
    if (averageLoadTime > 1000) score -= 10;
    if (averageLoadTime > 2000) score -= 20;
    if (averageLoadTime > 3000) score -= 30;
    
    // Deduct points for large file sizes
    if (totalDataTransferred > 200000) score -= 10;
    if (totalDataTransferred > 500000) score -= 20;
    if (totalDataTransferred > 1000000) score -= 30;
    
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async saveResults() {
    const filename = `image-performance-results-${Date.now()}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    await fs.promises.writeFile(
      filepath, 
      JSON.stringify(this.testResults, null, 2)
    );
    
    // Also save a markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownFilename = `image-performance-report-${Date.now()}.md`;
    const markdownFilepath = path.join(process.cwd(), markdownFilename);
    
    await fs.promises.writeFile(markdownFilepath, markdownReport);
    
    console.log(`📄 Report saved to: ${markdownFilename}`);
  }

  generateMarkdownReport() {
    const { summary, recommendations } = this.testResults;
    
    return `# Image Performance Test Report

## Executive Summary
- **Performance Grade**: ${summary.performanceGrade}
- **Total Images Tested**: ${summary.totalImages}
- **Average Load Time**: ${summary.averageLoadTime}ms
- **Total Data Transferred**: ${(summary.totalDataTransferred / 1024).toFixed(1)}KB
- **Potential Compression Savings**: ${(summary.compressionSavings / 1024).toFixed(1)}KB

## Detailed Results

### Load Time Analysis
${Object.entries(this.testResults.imageTests).map(([path, test]) => `
**${path}**
- Load Time: ${test.loadTime}ms
- File Size: ${(test.fileSize / 1024).toFixed(1)}KB
- Status: ${test.success ? '✅ Success' : '❌ Failed'}
- Content Type: ${test.contentType || 'Unknown'}
`).join('')}

### Performance Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. **Immediate Actions**
   - Implement WebP format with JPEG fallback
   - Add responsive image sizes using srcset
   - Enable proper caching headers

2. **Medium Term**
   - Implement lazy loading for below-fold images
   - Set up performance monitoring
   - Consider AVIF format for supported browsers

3. **Long Term**
   - Implement automated image optimization pipeline
   - Monitor Core Web Vitals impact
   - Regular performance audits

---
*Generated on ${new Date().toLocaleString()}*
*Base URL: ${this.testResults.baseUrl}*
`;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ImagePerformanceTester();
  tester.runPerformanceTests().catch(console.error);
}

module.exports = ImagePerformanceTester;