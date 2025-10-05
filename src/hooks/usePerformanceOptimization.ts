import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance';

interface PerformanceOptimizationOptions {
  enableFontOptimization?: boolean;
  enableCSSOptimization?: boolean;
  enableImageOptimization?: boolean;
  enableLazyLoading?: boolean;
}

/**
 * Hook for managing performance optimizations
 */
export const usePerformanceOptimization = (
  options: PerformanceOptimizationOptions = {}
) => {
  const {
    enableFontOptimization = true,
    enableCSSOptimization = true,
    enableImageOptimization = true,
    enableLazyLoading = true,
  } = options;

  const [isOptimized, setIsOptimized] = useState(false);
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());

  useEffect(() => {
    const optimizePerformance = async () => {
      try {
        // Font optimization
        if (enableFontOptimization) {
          await optimizeFonts();
        }

        // CSS optimization
        if (enableCSSOptimization) {
          await optimizeCSS();
        }

        // Image optimization
        if (enableImageOptimization) {
          await optimizeImages();
        }

        // Lazy loading setup
        if (enableLazyLoading) {
          setupLazyLoading();
        }

        setIsOptimized(true);
      } catch (error) {
        console.error('Performance optimization failed:', error);
      }
    };

    optimizePerformance();

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => {
      clearInterval(metricsInterval);
    };
  }, [
    enableFontOptimization,
    enableCSSOptimization,
    enableImageOptimization,
    enableLazyLoading,
  ]);

  return {
    isOptimized,
    metrics,
    thresholds: performanceMonitor.checkThresholds(),
  };
};

/**
 * Font optimization utilities
 */
const optimizeFonts = async (): Promise<void> => {
  return new Promise(resolve => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    // Add font-display: swap to Google Fonts
    const fontLinks = document.querySelectorAll(
      'link[href*="fonts.googleapis.com"]'
    );
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('display=swap')) {
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', `${href}${separator}display=swap`);
      }
    });

    // Preload critical fonts
    const criticalFonts = [
      '/_next/static/media/inter-latin-400-normal.woff2',
      '/_next/static/media/inter-latin-600-normal.woff2',
    ];

    criticalFonts.forEach(fontUrl => {
      const existingPreload = document.querySelector(`link[href="${fontUrl}"]`);
      if (!existingPreload) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Wait for fonts to load or timeout
    if ('fonts' in document) {
      Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]).then(() => {
        document.body.classList.add('fonts-loaded');
        resolve();
      });
    } else {
      setTimeout(() => {
        document.body.classList.add('fonts-loaded');
        resolve();
      }, 1000);
    }
  });
};

/**
 * CSS optimization utilities
 */
const optimizeCSS = async (): Promise<void> => {
  return new Promise(resolve => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    // Wait for stylesheets to load
    const checkStylesheets = () => {
      const stylesheets = Array.from(document.styleSheets);
      const allLoaded = stylesheets.every(sheet => {
        try {
          return sheet.cssRules !== null;
        } catch (e) {
          return true; // Cross-origin sheets
        }
      });

      if (allLoaded) {
        // Remove critical CSS after main stylesheets load
        const criticalStyles = document.querySelectorAll(
          'style[data-critical]'
        );
        criticalStyles.forEach(style => style.remove());

        // Minify inline styles
        const inlineStyles = document.querySelectorAll(
          'style:not([data-critical])'
        );
        inlineStyles.forEach(style => {
          if (style.textContent) {
            style.textContent = style.textContent
              .replace(/\s+/g, ' ')
              .replace(/;\s*}/g, '}')
              .replace(/{\s*/g, '{')
              .trim();
          }
        });

        resolve();
      } else {
        setTimeout(checkStylesheets, 100);
      }
    };

    setTimeout(checkStylesheets, 50);
  });
};

/**
 * Image optimization utilities
 */
const optimizeImages = async (): Promise<void> => {
  return new Promise(resolve => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    // Add loading="lazy" to images below the fold
    const images = document.querySelectorAll('img:not([loading])');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.loading = 'lazy';
          }
        });
      },
      { rootMargin: '50px' }
    );

    images.forEach(img => observer.observe(img));

    // Optimize image formats
    const webpSupported = checkWebPSupport();
    if (webpSupported) {
      document.documentElement.classList.add('webp-supported');
    }

    resolve();
  });
};

/**
 * Lazy loading setup
 */
const setupLazyLoading = (): void => {
  if (typeof window === 'undefined') return;

  // Set up intersection observer for lazy loading
  const lazyElements = document.querySelectorAll('[data-lazy]');

  if (lazyElements.length > 0) {
    const lazyObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.classList.add('lazy-loaded');
            lazyObserver.unobserve(element);
          }
        });
      },
      { rootMargin: '50px' }
    );

    lazyElements.forEach(element => lazyObserver.observe(element));
  }
};

/**
 * Check WebP support
 */
const checkWebPSupport = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};
