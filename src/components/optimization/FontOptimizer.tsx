'use client';

import { useEffect } from 'react';
import { optimizeFontLoading } from '@/lib/critical-css';

/**
 * Component that optimizes font loading for better performance
 * Should be included in the app layout
 */
const FontOptimizer = () => {
  useEffect(() => {
    // Optimize font loading on mount
    optimizeFontLoading();

    // Monitor font loading performance
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        // All fonts have loaded
        document.body.classList.add('fonts-loaded');

        // Report font loading time
        if (process.env.NODE_ENV === 'development') {
          const fontLoadTime = performance.now();
          console.log(`Fonts loaded in ${fontLoadTime.toFixed(2)}ms`);
        }
      });

      // Track individual font loads
      document.fonts.addEventListener('loadingdone', event => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Font loaded:', event);
        }
      });

      document.fonts.addEventListener('loadingerror', event => {
        console.warn('Font loading error:', event);
      });
    }

    // Fallback for browsers without Font Loading API
    const fallbackTimer = setTimeout(() => {
      document.body.classList.add('fonts-loaded');
    }, 3000); // 3 second fallback

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default FontOptimizer;
