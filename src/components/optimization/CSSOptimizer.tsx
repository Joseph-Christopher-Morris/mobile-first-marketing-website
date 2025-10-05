'use client';

import { useEffect } from 'react';
import { cssOptimization, removeCriticalCSS } from '@/lib/critical-css';

interface CSSOptimizerProps {
  usedClasses?: string[];
  removeCriticalAfterLoad?: boolean;
}

/**
 * Component that optimizes CSS loading and removes unused styles
 */
const CSSOptimizer: React.FC<CSSOptimizerProps> = ({
  usedClasses = [],
  removeCriticalAfterLoad = true,
}) => {
  useEffect(() => {
    // Wait for main stylesheet to load
    const checkStylesheetLoad = () => {
      const stylesheets = Array.from(document.styleSheets);
      const mainStylesheet = stylesheets.find(
        sheet => sheet.href && sheet.href.includes('_next/static/css')
      );

      if (mainStylesheet) {
        // Main stylesheet loaded, perform optimizations
        if (removeCriticalAfterLoad) {
          removeCriticalCSS();
        }

        // Remove unused CSS if classes are provided
        if (usedClasses.length > 0) {
          cssOptimization.removeUnusedCSS(usedClasses);
        }

        // Minify inline styles
        cssOptimization.minifyInlineStyles();

        if (process.env.NODE_ENV === 'development') {
          console.log('CSS optimization completed');
        }
      } else {
        // Retry after a short delay
        setTimeout(checkStylesheetLoad, 100);
      }
    };

    // Start checking after a brief delay
    setTimeout(checkStylesheetLoad, 50);
  }, [usedClasses, removeCriticalAfterLoad]);

  return null;
};

export default CSSOptimizer;
