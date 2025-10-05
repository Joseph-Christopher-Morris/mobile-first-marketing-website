/**
 * SEO Performance utilities for optimizing page speed and Core Web Vitals
 */

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface SEOPerformanceConfig {
  enableCriticalCSS: boolean;
  enableResourceHints: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableCodeSplitting: boolean;
}

/**
 * Generate resource hints for better performance
 */
export function generateResourceHints(): Array<{
  rel: string;
  href: string;
  as?: string;
  type?: string;
}> {
  return [
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },

    // Preconnect for critical external resources
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com' },

    // Preload critical resources
    {
      rel: 'preload',
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
    },
  ];
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function generateCriticalCSS(): string {
  return `
    /* Critical CSS for mobile-first design */
    html { font-family: system-ui, -apple-system, sans-serif; }
    body { margin: 0; padding: 0; line-height: 1.6; }
    
    /* Mobile-first layout */
    .container { 
      width: 100%; 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 0 1rem; 
    }
    
    /* Critical navigation styles */
    .header { 
      position: sticky; 
      top: 0; 
      z-index: 50; 
      background: white; 
      border-bottom: 1px solid #e5e7eb; 
    }
    
    /* Hero section critical styles */
    .hero { 
      min-height: 50vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      text-align: center; 
    }
    
    /* Button critical styles */
    .btn { 
      display: inline-block; 
      padding: 0.75rem 1.5rem; 
      border-radius: 0.375rem; 
      text-decoration: none; 
      font-weight: 600; 
      transition: all 0.2s; 
      min-height: 44px; /* Touch target */
      min-width: 44px; 
    }
    
    /* Loading states */
    .loading { opacity: 0.7; }
    
    @media (min-width: 768px) {
      .container { padding: 0 2rem; }
      .hero { min-height: 60vh; }
    }
  `;
}

/**
 * Validate image optimization
 */
export interface ImageOptimizationCheck {
  hasAltText: boolean;
  hasAppropriateSize: boolean;
  hasModernFormat: boolean;
  hasLazyLoading: boolean;
  hasResponsiveSizes: boolean;
}

export function validateImageOptimization(
  images: Array<{ src: string; alt?: string; loading?: string; sizes?: string }>
): ImageOptimizationCheck[] {
  return images.map(img => ({
    hasAltText: Boolean(img.alt && img.alt.trim().length > 0),
    hasAppropriateSize:
      !img.src.includes('?') ||
      img.src.includes('w=') ||
      img.src.includes('width='),
    hasModernFormat: img.src.includes('.webp') || img.src.includes('.avif'),
    hasLazyLoading: img.loading === 'lazy',
    hasResponsiveSizes: Boolean(img.sizes),
  }));
}

/**
 * Generate font optimization configuration
 */
export function generateFontOptimization() {
  return {
    preloadFonts: [
      {
        href: '/fonts/inter-var.woff2',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
    ],
    fontDisplay: 'swap',
    fontSubsets: ['latin'],
    variableFonts: true,
  };
}

/**
 * Core Web Vitals thresholds
 */
export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500, // ms
    needsImprovement: 4000,
  },
  FID: {
    good: 100, // ms
    needsImprovement: 300,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800, // ms
    needsImprovement: 3000,
  },
  TTFB: {
    good: 800, // ms
    needsImprovement: 1800,
  },
};

/**
 * Evaluate performance metrics against thresholds
 */
export function evaluatePerformanceMetrics(metrics: PerformanceMetrics) {
  const results = {
    lcp: metrics.lcp
      ? metrics.lcp <= CORE_WEB_VITALS_THRESHOLDS.LCP.good
        ? 'good'
        : metrics.lcp <= CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement
          ? 'needs-improvement'
          : 'poor'
      : 'unknown',
    fid: metrics.fid
      ? metrics.fid <= CORE_WEB_VITALS_THRESHOLDS.FID.good
        ? 'good'
        : metrics.fid <= CORE_WEB_VITALS_THRESHOLDS.FID.needsImprovement
          ? 'needs-improvement'
          : 'poor'
      : 'unknown',
    cls:
      metrics.cls !== undefined
        ? metrics.cls <= CORE_WEB_VITALS_THRESHOLDS.CLS.good
          ? 'good'
          : metrics.cls <= CORE_WEB_VITALS_THRESHOLDS.CLS.needsImprovement
            ? 'needs-improvement'
            : 'poor'
        : 'unknown',
    fcp: metrics.fcp
      ? metrics.fcp <= CORE_WEB_VITALS_THRESHOLDS.FCP.good
        ? 'good'
        : metrics.fcp <= CORE_WEB_VITALS_THRESHOLDS.FCP.needsImprovement
          ? 'needs-improvement'
          : 'poor'
      : 'unknown',
    ttfb: metrics.ttfb
      ? metrics.ttfb <= CORE_WEB_VITALS_THRESHOLDS.TTFB.good
        ? 'good'
        : metrics.ttfb <= CORE_WEB_VITALS_THRESHOLDS.TTFB.needsImprovement
          ? 'needs-improvement'
          : 'poor'
      : 'unknown',
  };

  const overallScore =
    Object.values(results).filter(score => score === 'good').length /
    Object.values(results).filter(score => score !== 'unknown').length;

  return {
    individual: results,
    overall:
      overallScore >= 0.8
        ? 'good'
        : overallScore >= 0.5
          ? 'needs-improvement'
          : 'poor',
    score: overallScore,
  };
}

/**
 * Generate performance optimization recommendations
 */
export function generatePerformanceRecommendations(
  metrics: PerformanceMetrics,
  config: SEOPerformanceConfig
): string[] {
  const recommendations: string[] = [];
  const evaluation = evaluatePerformanceMetrics(metrics);

  if (evaluation.individual.lcp !== 'good') {
    recommendations.push(
      'Optimize Largest Contentful Paint by reducing server response times and optimizing critical resources'
    );
  }

  if (evaluation.individual.fid !== 'good') {
    recommendations.push(
      'Improve First Input Delay by reducing JavaScript execution time and using code splitting'
    );
  }

  if (evaluation.individual.cls !== 'good') {
    recommendations.push(
      'Reduce Cumulative Layout Shift by setting explicit dimensions for images and avoiding dynamic content insertion'
    );
  }

  if (!config.enableCriticalCSS) {
    recommendations.push(
      'Enable critical CSS inlining to improve First Contentful Paint'
    );
  }

  if (!config.enableImageOptimization) {
    recommendations.push(
      'Enable image optimization with modern formats (WebP, AVIF) and responsive sizing'
    );
  }

  if (!config.enableFontOptimization) {
    recommendations.push(
      'Optimize font loading with preload hints and font-display: swap'
    );
  }

  if (!config.enableCodeSplitting) {
    recommendations.push(
      'Implement code splitting to reduce initial bundle size'
    );
  }

  return recommendations;
}
