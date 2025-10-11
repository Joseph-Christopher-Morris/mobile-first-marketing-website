/**
 * Critical CSS utilities for mobile-first optimization
 */

/**
 * Critical CSS styles that should be inlined for above-the-fold content
 * These styles are essential for initial page render and mobile performance
 */
export const criticalStyles = `
  /* Reset and base styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #1f2937;
    background-color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Mobile-first responsive typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 1rem 0;
    font-weight: 600;
    line-height: 1.2;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.75rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }
    
    h2 {
      font-size: 2rem;
    }
    
    h3 {
      font-size: 1.75rem;
    }
  }

  /* Critical layout styles */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 768px) {
    .container {
      padding: 0 2rem;
    }
  }

  /* Critical button styles */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    text-decoration: none;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: #ffffff;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  /* Critical navigation styles */
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }

  /* Critical hero section styles */
  .hero {
    padding: 2rem 0;
    text-align: center;
  }

  @media (min-width: 768px) {
    .hero {
      padding: 4rem 0;
    }
  }

  /* Loading states */
  .loading {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  }

  .loaded {
    opacity: 1;
    transform: translateY(0);
  }

  /* Critical utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .hidden {
    display: none;
  }

  @media (max-width: 767px) {
    .hidden-mobile {
      display: none;
    }
  }

  @media (min-width: 768px) {
    .hidden-desktop {
      display: none;
    }
  }
`;

/**
 * Generate critical CSS for a specific page
 */
export const generateCriticalCSS = (
  pageType: 'home' | 'blog' | 'service' | 'contact'
) => {
  const baseCSS = criticalStyles;

  const pageSpecificCSS = {
    home: `
      /* Home page critical styles */
      .hero-home {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        min-height: 60vh;
        display: flex;
        align-items: center;
      }
    `,
    blog: `
      /* Blog page critical styles */
      .blog-header {
        padding: 1rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .blog-post {
        max-width: 65ch;
        margin: 0 auto;
      }
    `,
    service: `
      /* Service page critical styles */
      .service-hero {
        background-color: #f8fafc;
        padding: 3rem 0;
      }
    `,
    contact: `
      /* Contact page critical styles */
      .contact-form {
        max-width: 600px;
        margin: 0 auto;
      }
    `,
  };

  return baseCSS + (pageSpecificCSS[pageType] || '');
};

/**
 * Inline critical CSS in the document head
 */
export const inlineCriticalCSS = (css: string) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }
};

/**
 * Remove critical CSS after main stylesheet loads
 */
export const removeCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const criticalStyles = document.querySelectorAll('style[data-critical]');
    criticalStyles.forEach(style => style.remove());
  }
};

/**
 * Font loading optimization
 */
export const optimizeFontLoading = () => {
  if (typeof document !== 'undefined') {
    // Add font-display: swap to any external font links
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

    // Preload critical font files
    const preloadFonts = [
      '/_next/static/media/inter-latin-400-normal.woff2',
      '/_next/static/media/inter-latin-600-normal.woff2',
    ];

    preloadFonts.forEach(fontUrl => {
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
  }
};

/**
 * CSS optimization utilities
 */
export const cssOptimization = {
  /**
   * Remove unused CSS classes (basic implementation)
   */
  removeUnusedCSS: (usedClasses: string[]) => {
    if (typeof document !== 'undefined') {
      const stylesheets = Array.from(document.styleSheets);

      stylesheets.forEach(stylesheet => {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          rules.forEach((rule, index) => {
            if (rule.type === CSSRule.STYLE_RULE) {
              const styleRule = rule as CSSStyleRule;
              const selector = styleRule.selectorText;

              // Simple check for unused classes
              const hasUsedClass = usedClasses.some(className =>
                selector.includes(`.${className}`)
              );

              if (!hasUsedClass && selector.startsWith('.')) {
                stylesheet.deleteRule(index);
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets can't be accessed
          console.warn('Cannot access stylesheet:', e);
        }
      });
    }
  },

  /**
   * Minify inline styles
   */
  minifyInlineStyles: () => {
    if (typeof document !== 'undefined') {
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
        if (style.textContent) {
          style.textContent = style.textContent
            .replace(/\s+/g, ' ')
            .replace(/;\s*}/g, '}')
            .replace(/{\s*/g, '{')
            .replace(/;\s*/g, ';')
            .trim();
        }
      });
    }
  },
};
