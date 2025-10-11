/**
 * Quality gates and automated testing thresholds
 */

export interface QualityGates {
  performance: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint (ms)
    ttfb: number; // Time to First Byte (ms)
    loadTime: number; // Total load time (ms)
  };
  coverage: {
    statements: number; // Percentage
    branches: number; // Percentage
    functions: number; // Percentage
    lines: number; // Percentage
  };
  accessibility: {
    wcagLevel: 'AA' | 'AAA';
    contrastRatio: number;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };
  mobile: {
    touchTargetSize: number; // Minimum size in pixels
    viewportCompatibility: string[]; // Supported viewport sizes
    gestureSupport: boolean;
    offlineSupport: boolean;
  };
  security: {
    vulnerabilities: {
      critical: number;
      high: number;
      medium: number;
    };
    httpsOnly: boolean;
    cspEnabled: boolean;
  };
}

export const defaultQualityGates: QualityGates = {
  performance: {
    lcp: 2500, // 2.5 seconds
    fid: 100, // 100 milliseconds
    cls: 0.1, // 0.1 score
    fcp: 1800, // 1.8 seconds
    ttfb: 600, // 600 milliseconds
    loadTime: 3000, // 3 seconds
  },
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
  accessibility: {
    wcagLevel: 'AA',
    contrastRatio: 4.5,
    keyboardNavigation: true,
    screenReaderSupport: true,
  },
  mobile: {
    touchTargetSize: 44, // 44px minimum
    viewportCompatibility: ['375x667', '414x896', '768x1024'], // iPhone, Android, iPad
    gestureSupport: true,
    offlineSupport: false, // Optional for this project
  },
  security: {
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 5, // Allow up to 5 medium vulnerabilities
    },
    httpsOnly: true,
    cspEnabled: true,
  },
};

export class QualityGateValidator {
  private gates: QualityGates;

  constructor(gates: QualityGates = defaultQualityGates) {
    this.gates = gates;
  }

  /**
   * Validate performance metrics against quality gates
   */
  validatePerformance(metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    loadTime?: number;
  }): {
    passed: boolean;
    failures: string[];
    score: number;
  } {
    const failures: string[] = [];
    let passedChecks = 0;
    const totalChecks = Object.keys(this.gates.performance).length;

    Object.entries(this.gates.performance).forEach(([metric, threshold]) => {
      const value = metrics[metric as keyof typeof metrics];

      if (value !== undefined) {
        if (value <= threshold) {
          passedChecks++;
        } else {
          failures.push(
            `${metric.toUpperCase()}: ${value}ms exceeds threshold of ${threshold}ms`
          );
        }
      } else {
        failures.push(`${metric.toUpperCase()}: metric not available`);
      }
    });

    return {
      passed: failures.length === 0,
      failures,
      score: Math.round((passedChecks / totalChecks) * 100),
    };
  }

  /**
   * Validate test coverage against quality gates
   */
  validateCoverage(coverage: {
    statements?: number;
    branches?: number;
    functions?: number;
    lines?: number;
  }): {
    passed: boolean;
    failures: string[];
    score: number;
  } {
    const failures: string[] = [];
    let passedChecks = 0;
    const totalChecks = Object.keys(this.gates.coverage).length;

    Object.entries(this.gates.coverage).forEach(([metric, threshold]) => {
      const value = coverage[metric as keyof typeof coverage];

      if (value !== undefined) {
        if (value >= threshold) {
          passedChecks++;
        } else {
          failures.push(
            `${metric}: ${value}% is below threshold of ${threshold}%`
          );
        }
      } else {
        failures.push(`${metric}: coverage metric not available`);
      }
    });

    return {
      passed: failures.length === 0,
      failures,
      score: Math.round((passedChecks / totalChecks) * 100),
    };
  }

  /**
   * Validate accessibility requirements
   */
  validateAccessibility(results: {
    wcagLevel?: 'AA' | 'AAA';
    contrastRatio?: number;
    keyboardNavigation?: boolean;
    screenReaderSupport?: boolean;
    violations?: Array<{ impact: string; description: string }>;
  }): {
    passed: boolean;
    failures: string[];
    score: number;
  } {
    const failures: string[] = [];
    let passedChecks = 0;
    let totalChecks = 4;

    // WCAG Level
    if (results.wcagLevel) {
      if (
        results.wcagLevel === this.gates.accessibility.wcagLevel ||
        (this.gates.accessibility.wcagLevel === 'AA' &&
          results.wcagLevel === 'AAA')
      ) {
        passedChecks++;
      } else {
        failures.push(
          `WCAG Level: ${results.wcagLevel} does not meet requirement of ${this.gates.accessibility.wcagLevel}`
        );
      }
    } else {
      failures.push('WCAG Level: not tested');
    }

    // Contrast Ratio
    if (results.contrastRatio !== undefined) {
      if (results.contrastRatio >= this.gates.accessibility.contrastRatio) {
        passedChecks++;
      } else {
        failures.push(
          `Contrast Ratio: ${results.contrastRatio} is below threshold of ${this.gates.accessibility.contrastRatio}`
        );
      }
    } else {
      failures.push('Contrast Ratio: not tested');
    }

    // Keyboard Navigation
    if (results.keyboardNavigation !== undefined) {
      if (
        results.keyboardNavigation ===
        this.gates.accessibility.keyboardNavigation
      ) {
        passedChecks++;
      } else {
        failures.push('Keyboard Navigation: requirement not met');
      }
    } else {
      failures.push('Keyboard Navigation: not tested');
    }

    // Screen Reader Support
    if (results.screenReaderSupport !== undefined) {
      if (
        results.screenReaderSupport ===
        this.gates.accessibility.screenReaderSupport
      ) {
        passedChecks++;
      } else {
        failures.push('Screen Reader Support: requirement not met');
      }
    } else {
      failures.push('Screen Reader Support: not tested');
    }

    // Check for violations
    if (results.violations) {
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalViolations.length > 0) {
        failures.push(
          `Accessibility Violations: ${criticalViolations.length} critical/serious violations found`
        );
      }
    }

    return {
      passed: failures.length === 0,
      failures,
      score: Math.round((passedChecks / totalChecks) * 100),
    };
  }

  /**
   * Validate mobile-specific requirements
   */
  validateMobile(results: {
    touchTargetSize?: number;
    viewportCompatibility?: string[];
    gestureSupport?: boolean;
    offlineSupport?: boolean;
  }): {
    passed: boolean;
    failures: string[];
    score: number;
  } {
    const failures: string[] = [];
    let passedChecks = 0;
    let totalChecks = 4;

    // Touch Target Size
    if (results.touchTargetSize !== undefined) {
      if (results.touchTargetSize >= this.gates.mobile.touchTargetSize) {
        passedChecks++;
      } else {
        failures.push(
          `Touch Target Size: ${results.touchTargetSize}px is below minimum of ${this.gates.mobile.touchTargetSize}px`
        );
      }
    } else {
      failures.push('Touch Target Size: not tested');
    }

    // Viewport Compatibility
    if (results.viewportCompatibility) {
      const supportedViewports = this.gates.mobile.viewportCompatibility.filter(
        vp => results.viewportCompatibility!.includes(vp)
      );

      if (
        supportedViewports.length ===
        this.gates.mobile.viewportCompatibility.length
      ) {
        passedChecks++;
      } else {
        const missing = this.gates.mobile.viewportCompatibility.filter(
          vp => !results.viewportCompatibility!.includes(vp)
        );
        failures.push(
          `Viewport Compatibility: Missing support for ${missing.join(', ')}`
        );
      }
    } else {
      failures.push('Viewport Compatibility: not tested');
    }

    // Gesture Support
    if (results.gestureSupport !== undefined) {
      if (results.gestureSupport === this.gates.mobile.gestureSupport) {
        passedChecks++;
      } else {
        failures.push('Gesture Support: requirement not met');
      }
    } else {
      failures.push('Gesture Support: not tested');
    }

    // Offline Support (optional)
    if (this.gates.mobile.offlineSupport) {
      if (results.offlineSupport !== undefined) {
        if (results.offlineSupport === this.gates.mobile.offlineSupport) {
          passedChecks++;
        } else {
          failures.push('Offline Support: requirement not met');
        }
      } else {
        failures.push('Offline Support: not tested');
      }
    } else {
      passedChecks++; // Skip this check if not required
    }

    return {
      passed: failures.length === 0,
      failures,
      score: Math.round((passedChecks / totalChecks) * 100),
    };
  }

  /**
   * Generate comprehensive quality report
   */
  generateQualityReport(results: {
    performance?: Parameters<QualityGateValidator['validatePerformance']>[0];
    coverage?: Parameters<QualityGateValidator['validateCoverage']>[0];
    accessibility?: Parameters<
      QualityGateValidator['validateAccessibility']
    >[0];
    mobile?: Parameters<QualityGateValidator['validateMobile']>[0];
  }): {
    overall: {
      passed: boolean;
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    categories: {
      performance: ReturnType<QualityGateValidator['validatePerformance']>;
      coverage: ReturnType<QualityGateValidator['validateCoverage']>;
      accessibility: ReturnType<QualityGateValidator['validateAccessibility']>;
      mobile: ReturnType<QualityGateValidator['validateMobile']>;
    };
    recommendations: string[];
  } {
    const categories = {
      performance: this.validatePerformance(results.performance || {}),
      coverage: this.validateCoverage(results.coverage || {}),
      accessibility: this.validateAccessibility(results.accessibility || {}),
      mobile: this.validateMobile(results.mobile || {}),
    };

    const overallScore = Math.round(
      Object.values(categories).reduce((sum, cat) => sum + cat.score, 0) / 4
    );

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    const allFailures = Object.values(categories).flatMap(cat => cat.failures);
    const recommendations = this.generateRecommendations(categories);

    return {
      overall: {
        passed: allFailures.length === 0,
        score: overallScore,
        grade,
      },
      categories,
      recommendations,
    };
  }

  private generateRecommendations(categories: {
    performance: ReturnType<QualityGateValidator['validatePerformance']>;
    coverage: ReturnType<QualityGateValidator['validateCoverage']>;
    accessibility: ReturnType<QualityGateValidator['validateAccessibility']>;
    mobile: ReturnType<QualityGateValidator['validateMobile']>;
  }): string[] {
    const recommendations: string[] = [];

    if (!categories.performance.passed) {
      recommendations.push(
        'Optimize performance by reducing bundle sizes, optimizing images, and implementing code splitting'
      );
    }

    if (!categories.coverage.passed) {
      recommendations.push(
        'Increase test coverage by adding unit tests for uncovered functions and components'
      );
    }

    if (!categories.accessibility.passed) {
      recommendations.push(
        'Improve accessibility by adding proper ARIA labels, ensuring keyboard navigation, and fixing contrast issues'
      );
    }

    if (!categories.mobile.passed) {
      recommendations.push(
        'Enhance mobile experience by increasing touch target sizes and testing on various devices'
      );
    }

    return recommendations;
  }

  /**
   * Update quality gates configuration
   */
  updateGates(newGates: Partial<QualityGates>): void {
    this.gates = { ...this.gates, ...newGates };
  }
}

export const qualityGateValidator = new QualityGateValidator();
