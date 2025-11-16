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
        'http://localhost/services/analytics/index.html',
        'http://localhost/blog/index.html',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance budgets
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Resource hints
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',
        
        // Image optimization
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // JavaScript
        'unused-javascript': 'warn',
        'unminified-javascript': 'error',
        
        // CSS
        'unused-css-rules': 'warn',
        'unminified-css': 'error',
        
        // Network
        'uses-http2': 'warn',
        'uses-text-compression': 'error',
        
        // Caching
        'uses-long-cache-ttl': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
