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
      // Removed preset to avoid conflicts - managing all rules explicitly
      assertions: {
        //
        // --- Category minimum scores (realistic CI thresholds) ---
        //
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.88 }],
        'categories:best-practices': ['error', { minScore: 0.80 }],
        'categories:seo': ['error', { minScore: 0.95 }],

        //
        // --- Performance budgets (keep strict) ---
        //
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],

        //
        // --- Overrides for preset failures ---
        //
        // Remove invalid audit key; use themed-omnibox instead
        'theme-color': 'off',
        'themed-omnibox': 'warn',

        // Third-party services (GA4, Clarity, etc.) legitimately set cookies
        'third-party-cookies': 'off',

        // Large images / JS — keep visible but not blocking CI yet
        'total-byte-weight': 'warn',

        // Compression comes from CloudFront, not local server
        'uses-text-compression': 'warn',

        //
        // --- A11y / PWA audits coming from lighthouse:recommended ---
        // These are valuable but should not block CI yet.
        //
        'color-contrast': 'warn',
        'label': 'warn',
        'label-content-name-mismatch': 'warn',
        'heading-order': 'warn',
        'identical-links-same-purpose': 'warn',
        'select-name': 'warn',
        'unsized-images': 'warn',

        //
        // --- Best-practices / security audits (warn until CSP etc. added) ---
        //
        'csp-xss': 'warn',
        'inspector-issues': 'warn',

        //
        // --- PWA installability audits (warn until you add full manifest/icons) ---
        //
        'installable-manifest': 'warn',
        'maskable-icon': 'warn',
        'splash-screen': 'warn',

        //
        // Resource hints (not relevant for static export)
        //
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',

        //
        // Image optimisation warnings
        //
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',

        //
        // JavaScript warnings
        //
        'unused-javascript': 'warn',
        'unminified-javascript': ['error'],

        //
        // CSS warnings
        //
        'unused-css-rules': 'warn',
        'unminified-css': ['error'],

        //
        // Network / caching
        //
        'uses-http2': 'warn',
        'uses-long-cache-ttl': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
