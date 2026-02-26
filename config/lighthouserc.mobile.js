module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      url: [
        'http://localhost/index.html',
        'http://localhost/about/index.html',
        'http://localhost/contact/index.html',
        'http://localhost/services/index.html',
        'http://localhost/services/photography/index.html',
        'http://localhost/services/ad-campaigns/index.html',
        'http://localhost/blog/index.html',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Mobile Performance budgets (stricter)
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 400 }],
        'speed-index': ['error', { maxNumericValue: 4000 }],
        'interactive': ['error', { maxNumericValue: 5000 }],
        
        // Performance score
        'categories:performance': ['warn', { minScore: 0.85 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Mobile-specific
        'viewport': 'error',
        'tap-targets': 'error',
        'font-size': 'error',
        
        // Resource optimization
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        'unused-javascript': 'warn',
        'uses-text-compression': 'error',
        
        // Disable some checks
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',
        'uses-http2': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
