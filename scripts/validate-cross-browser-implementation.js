#!/usr/bin/env node

/**
 * Cross-Browser Implementation Validator
 * Validates that the BlogPreview component implements cross-browser best practices
 */

const fs = require('fs');
const path = require('path');

class CrossBrowserImplementationValidator {
  constructor() {
    this.validationResults = {
      timestamp: new Date().toISOString(),
      componentAnalysis: {},
      implementationChecks: {},
      recommendations: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        score: 0
      }
    };
  }

  async validateImplementation() {
    console.log('🔍 Validating Cross-Browser Implementation...\n');
    
    try {
      await this.analyzeBlogPreviewComponent();
      await this.analyzeOptimizedImageComponent();
      await this.checkResponsiveImageImplementation();
      await this.validateWebPFallbackMechanism();
      await this.checkAccessibilityImplementation();
      await this.validatePerformanceOptimizations();
      
      this.generateRecommendations();
      this.calculateScore();
      await this.saveResults();
      
      console.log('\n✅ Cross-browser implementation validation completed!');
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }

  async analyzeBlogPreviewComponent() {
    console.log('📝 Analyzing BlogPreview Component...');
    
    const componentPath = 'src/components/sections/BlogPreview.tsx';
    
    try {
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      const analysis = {
        usesOptimizedImage: componentContent.includes('OptimizedImage'),
        hasResponsiveImages: componentContent.includes('srcset') || componentContent.includes('sizes'),
        implementsLazyLoading: componentContent.includes('loading="lazy"'),
        hasProperAltText: componentContent.includes('alt='),
        usesWebPFormat: componentContent.includes('.webp'),
        hasErrorHandling: componentContent.includes('onError') || componentContent.includes('onerror'),
        issues: [],
        recommendations: []
      };
      
      // Check for issues
      if (!analysis.usesOptimizedImage) {
        analysis.issues.push('Not using OptimizedImage component');
        analysis.recommendations.push('Replace <img> tags with OptimizedImage component');
      }
      
      if (!analysis.hasResponsiveImages) {
        analysis.issues.push('Missing responsive image implementation');
        analysis.recommendations.push('Add srcset and sizes attributes for responsive images');
      }
      
      if (!analysis.implementsLazyLoading) {
        analysis.issues.push('Missing lazy loading implementation');
        analysis.recommendations.push('Add loading="lazy" for images below the fold');
      }
      
      this.validationResults.componentAnalysis.blogPreview = analysis;
      this.validationResults.summary.totalChecks += 6;
      this.validationResults.summary.passedChecks += Object.values(analysis).filter(v => v === true).length;
      
      console.log(`  ✅ BlogPreview analysis completed - ${analysis.issues.length} issues found`);
      
    } catch (error) {
      console.error('  ❌ Failed to analyze BlogPreview component:', error.message);
      this.validationResults.componentAnalysis.blogPreview = {
        error: error.message,
        issues: ['Component file not found or not readable']
      };
    }
  }

  async analyzeOptimizedImageComponent() {
    console.log('🖼️  Analyzing OptimizedImage Component...');
    
    const componentPath = 'src/components/ui/OptimizedImage.tsx';
    
    try {
      const componentContent = fs.readFileSync(componentPath, 'utf8');
      
      const analysis = {
        hasErrorHandling: componentContent.includes('onError') || componentContent.includes('onerror'),
        hasLoadingStates: componentContent.includes('loading') || componentContent.includes('Loading'),
        implementsFallback: componentContent.includes('fallback') || componentContent.includes('placeholder'),
        hasRetryMechanism: componentContent.includes('retry') || componentContent.includes('Retry'),
        supportsWebP: componentContent.includes('webp') || componentContent.includes('WebP'),
        hasAccessibilityFeatures: componentContent.includes('alt') && componentContent.includes('aria'),
        issues: [],
        recommendations: []
      };
      
      // Check for issues
      if (!analysis.hasErrorHandling) {
        analysis.issues.push('Missing error handling for failed image loads');
        analysis.recommendations.push('Add onError handler for graceful failure handling');
      }
      
      if (!analysis.hasLoadingStates) {
        analysis.issues.push('Missing loading state indicators');
        analysis.recommendations.push('Add loading state UI for better user experience');
      }
      
      if (!analysis.implementsFallback) {
        analysis.issues.push('Missing fallback image mechanism');
        analysis.recommendations.push('Implement fallback image for failed loads');
      }
      
      this.validationResults.componentAnalysis.optimizedImage = analysis;
      this.validationResults.summary.totalChecks += 6;
      this.validationResults.summary.passedChecks += Object.values(analysis).filter(v => v === true).length;
      
      console.log(`  ✅ OptimizedImage analysis completed - ${analysis.issues.length} issues found`);
      
    } catch (error) {
      console.error('  ❌ Failed to analyze OptimizedImage component:', error.message);
      this.validationResults.componentAnalysis.optimizedImage = {
        error: error.message,
        issues: ['Component file not found or not readable']
      };
    }
  }

  async checkResponsiveImageImplementation() {
    console.log('📱 Checking Responsive Image Implementation...');
    
    const checks = {
      hasSrcsetImplementation: false,
      hasSizesAttribute: false,
      usesPictureElement: false,
      hasBreakpointDefinitions: false,
      implementsArtDirection: false,
      issues: [],
      recommendations: []
    };
    
    // Check for responsive image patterns in components
    const componentPaths = [
      'src/components/sections/BlogPreview.tsx',
      'src/components/ui/OptimizedImage.tsx'
    ];
    
    for (const componentPath of componentPaths) {
      try {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          
          if (content.includes('srcset') || content.includes('srcSet')) {
            checks.hasSrcsetImplementation = true;
          }
          
          if (content.includes('sizes')) {
            checks.hasSizesAttribute = true;
          }
          
          if (content.includes('<picture>') || content.includes('picture')) {
            checks.usesPictureElement = true;
          }
          
          if (content.includes('breakpoint') || content.includes('media')) {
            checks.hasBreakpointDefinitions = true;
          }
        }
      } catch (error) {
        console.log(`    Warning: Could not read ${componentPath}`);
      }
    }
    
    // Generate recommendations
    if (!checks.hasSrcsetImplementation) {
      checks.issues.push('Missing srcset implementation for responsive images');
      checks.recommendations.push('Implement srcset attribute with multiple image sizes');
    }
    
    if (!checks.usesPictureElement) {
      checks.issues.push('Not using picture element for WebP fallback');
      checks.recommendations.push('Use <picture> element for WebP with JPEG fallback');
    }
    
    this.validationResults.implementationChecks.responsiveImages = checks;
    this.validationResults.summary.totalChecks += 5;
    this.validationResults.summary.passedChecks += Object.values(checks).filter(v => v === true).length;
    
    console.log(`  ✅ Responsive image check completed - ${checks.issues.length} issues found`);
  }

  async validateWebPFallbackMechanism() {
    console.log('🔄 Validating WebP Fallback Mechanism...');
    
    const checks = {
      hasWebPImages: false,
      hasJPEGFallback: false,
      usesPictureElement: false,
      hasFormatDetection: false,
      implementsGracefulDegradation: false,
      issues: [],
      recommendations: []
    };
    
    // Check for WebP images in content
    const blogContentPath = 'src/content/blog';
    if (fs.existsSync(blogContentPath)) {
      const blogFiles = fs.readdirSync(blogContentPath);
      
      for (const file of blogFiles) {
        try {
          const content = fs.readFileSync(path.join(blogContentPath, file), 'utf8');
          
          if (content.includes('.webp')) {
            checks.hasWebPImages = true;
          }
          
          if (content.includes('.jpg') || content.includes('.jpeg')) {
            checks.hasJPEGFallback = true;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    // Check component implementation
    const componentPaths = [
      'src/components/sections/BlogPreview.tsx',
      'src/components/ui/OptimizedImage.tsx'
    ];
    
    for (const componentPath of componentPaths) {
      try {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          
          if (content.includes('<picture>')) {
            checks.usesPictureElement = true;
          }
          
          if (content.includes('webp') && (content.includes('jpg') || content.includes('jpeg'))) {
            checks.implementsGracefulDegradation = true;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Generate recommendations
    if (checks.hasWebPImages && !checks.hasJPEGFallback) {
      checks.issues.push('WebP images found but no JPEG fallback');
      checks.recommendations.push('Provide JPEG fallback images for WebP format');
    }
    
    if (!checks.usesPictureElement && checks.hasWebPImages) {
      checks.issues.push('WebP images without picture element fallback');
      checks.recommendations.push('Use <picture> element for proper WebP fallback');
    }
    
    this.validationResults.implementationChecks.webpFallback = checks;
    this.validationResults.summary.totalChecks += 5;
    this.validationResults.summary.passedChecks += Object.values(checks).filter(v => v === true).length;
    
    console.log(`  ✅ WebP fallback validation completed - ${checks.issues.length} issues found`);
  }

  async checkAccessibilityImplementation() {
    console.log('♿ Checking Accessibility Implementation...');
    
    const checks = {
      hasAltTextImplementation: false,
      hasAriaLabels: false,
      supportsFocusManagement: false,
      hasKeyboardNavigation: false,
      implementsScreenReaderSupport: false,
      issues: [],
      recommendations: []
    };
    
    const componentPaths = [
      'src/components/sections/BlogPreview.tsx',
      'src/components/ui/OptimizedImage.tsx'
    ];
    
    for (const componentPath of componentPaths) {
      try {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          
          if (content.includes('alt=') || content.includes('alt:')) {
            checks.hasAltTextImplementation = true;
          }
          
          if (content.includes('aria-') || content.includes('role=')) {
            checks.hasAriaLabels = true;
          }
          
          if (content.includes('tabIndex') || content.includes('focus')) {
            checks.supportsFocusManagement = true;
          }
          
          if (content.includes('onKeyDown') || content.includes('onKeyPress')) {
            checks.hasKeyboardNavigation = true;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Generate recommendations
    if (!checks.hasAltTextImplementation) {
      checks.issues.push('Missing alt text implementation');
      checks.recommendations.push('Add descriptive alt text for all images');
    }
    
    if (!checks.hasAriaLabels) {
      checks.issues.push('Missing ARIA labels for accessibility');
      checks.recommendations.push('Add appropriate ARIA labels and roles');
    }
    
    this.validationResults.implementationChecks.accessibility = checks;
    this.validationResults.summary.totalChecks += 5;
    this.validationResults.summary.passedChecks += Object.values(checks).filter(v => v === true).length;
    
    console.log(`  ✅ Accessibility check completed - ${checks.issues.length} issues found`);
  }

  async validatePerformanceOptimizations() {
    console.log('⚡ Validating Performance Optimizations...');
    
    const checks = {
      implementsLazyLoading: false,
      hasImageOptimization: false,
      usesCaching: false,
      implementsPreloading: false,
      hasPerformanceMonitoring: false,
      issues: [],
      recommendations: []
    };
    
    const componentPaths = [
      'src/components/sections/BlogPreview.tsx',
      'src/components/ui/OptimizedImage.tsx'
    ];
    
    for (const componentPath of componentPaths) {
      try {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          
          if (content.includes('loading="lazy"') || content.includes('lazy')) {
            checks.implementsLazyLoading = true;
          }
          
          if (content.includes('optimization') || content.includes('compress')) {
            checks.hasImageOptimization = true;
          }
          
          if (content.includes('cache') || content.includes('Cache')) {
            checks.usesCaching = true;
          }
          
          if (content.includes('preload') || content.includes('priority')) {
            checks.implementsPreloading = true;
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Generate recommendations
    if (!checks.implementsLazyLoading) {
      checks.issues.push('Missing lazy loading implementation');
      checks.recommendations.push('Implement lazy loading for images below the fold');
    }
    
    if (!checks.hasImageOptimization) {
      checks.issues.push('No image optimization detected');
      checks.recommendations.push('Implement image optimization pipeline');
    }
    
    this.validationResults.implementationChecks.performance = checks;
    this.validationResults.summary.totalChecks += 5;
    this.validationResults.summary.passedChecks += Object.values(checks).filter(v => v === true).length;
    
    console.log(`  ✅ Performance optimization check completed - ${checks.issues.length} issues found`);
  }

  generateRecommendations() {
    const allRecommendations = [];
    
    // Collect recommendations from all checks
    Object.values(this.validationResults.componentAnalysis).forEach(analysis => {
      if (analysis.recommendations) {
        allRecommendations.push(...analysis.recommendations);
      }
    });
    
    Object.values(this.validationResults.implementationChecks).forEach(check => {
      if (check.recommendations) {
        allRecommendations.push(...check.recommendations);
      }
    });
    
    // Add general cross-browser recommendations
    allRecommendations.push(
      'Test implementation on actual devices and browsers',
      'Set up automated cross-browser testing in CI/CD',
      'Monitor Core Web Vitals in production',
      'Implement progressive enhancement for image features'
    );
    
    // Remove duplicates
    this.validationResults.recommendations = [...new Set(allRecommendations)];
  }

  calculateScore() {
    const { totalChecks, passedChecks } = this.validationResults.summary;
    this.validationResults.summary.score = totalChecks > 0 
      ? Math.round((passedChecks / totalChecks) * 100) 
      : 0;
    
    this.validationResults.summary.failedChecks = totalChecks - passedChecks;
  }

  async saveResults() {
    const timestamp = Date.now();
    const filename = `cross-browser-validation-results-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    await fs.promises.writeFile(
      filepath, 
      JSON.stringify(this.validationResults, null, 2)
    );
    
    // Also save markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownFilename = `cross-browser-validation-report-${timestamp}.md`;
    const markdownFilepath = path.join(process.cwd(), markdownFilename);
    
    await fs.promises.writeFile(markdownFilepath, markdownReport);
    
    console.log(`📄 Validation report saved to: ${markdownFilename}`);
  }

  generateMarkdownReport() {
    const { summary, componentAnalysis, implementationChecks, recommendations } = this.validationResults;
    
    return `# Cross-Browser Implementation Validation Report

## Executive Summary
- **Overall Score**: ${summary.score}%
- **Total Checks**: ${summary.totalChecks}
- **Passed**: ${summary.passedChecks}
- **Failed**: ${summary.failedChecks}

## Component Analysis

${Object.entries(componentAnalysis).map(([component, analysis]) => `
### ${component.charAt(0).toUpperCase() + component.slice(1)} Component
${analysis.error ? `❌ **Error**: ${analysis.error}` : ''}
${analysis.issues && analysis.issues.length > 0 ? `
**Issues Found**: ${analysis.issues.length}
${analysis.issues.map(issue => `- ❌ ${issue}`).join('\n')}
` : '✅ No issues found'}
`).join('')}

## Implementation Checks

${Object.entries(implementationChecks).map(([check, result]) => `
### ${check.charAt(0).toUpperCase() + check.slice(1).replace(/([A-Z])/g, ' $1')}
${result.issues && result.issues.length > 0 ? `
**Issues Found**: ${result.issues.length}
${result.issues.map(issue => `- ❌ ${issue}`).join('\n')}
` : '✅ Implementation looks good'}
`).join('')}

## Recommendations

${recommendations.map(rec => `- ${rec}`).join('\n')}

## Cross-Browser Compatibility Checklist

- [ ] Implement WebP with JPEG fallback using \`<picture>\` element
- [ ] Add responsive images with \`srcset\` and \`sizes\` attributes
- [ ] Implement lazy loading for images below the fold
- [ ] Add proper alt text for all images
- [ ] Test on Safari (WebP fallback required)
- [ ] Test on mobile devices (iOS and Android)
- [ ] Validate keyboard navigation and accessibility
- [ ] Set up performance monitoring

## Next Steps

1. **High Priority**
   - Fix any failed validation checks
   - Implement missing WebP fallback mechanism
   - Add responsive image support

2. **Medium Priority**
   - Set up automated cross-browser testing
   - Implement performance monitoring
   - Add accessibility improvements

3. **Low Priority**
   - Consider AVIF format for future enhancement
   - Implement advanced image optimization features

---
*Generated on ${new Date().toLocaleString()}*
*Validation Score: ${summary.score}%*
`;
  }

  displaySummary() {
    const { summary } = this.validationResults;
    
    console.log('\n📊 Validation Summary:');
    console.log(`   Overall Score: ${summary.score}%`);
    console.log(`   Total Checks: ${summary.totalChecks}`);
    console.log(`   Passed: ${summary.passedChecks}`);
    console.log(`   Failed: ${summary.failedChecks}`);
    
    if (summary.score >= 80) {
      console.log('   🎉 Excellent cross-browser implementation!');
    } else if (summary.score >= 60) {
      console.log('   👍 Good implementation with room for improvement');
    } else {
      console.log('   ⚠️  Implementation needs significant improvements');
    }
    
    console.log('\n💡 Top Recommendations:');
    this.validationResults.recommendations.slice(0, 3).forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CrossBrowserImplementationValidator();
  validator.validateImplementation().catch(console.error);
}

module.exports = CrossBrowserImplementationValidator;