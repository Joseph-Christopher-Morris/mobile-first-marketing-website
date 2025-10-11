/**
 * Image optimization utilities for mobile-first responsive design
 */

export interface ResponsiveImageConfig {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

export interface ImageBreakpoint {
  breakpoint: number;
  width: number;
  height?: number;
}

/**
 * Generate responsive image sizes string for Next.js Image component
 */
export const generateResponsiveSizes = (
  breakpoints: ImageBreakpoint[]
): string => {
  return breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return `${bp.width}px`;
      }
      return `(max-width: ${bp.breakpoint}px) ${bp.width}px`;
    })
    .join(', ');
};

/**
 * Common responsive configurations for different content types
 */
export const imageConfigs = {
  hero: {
    mobile: { width: 375, height: 250 },
    tablet: { width: 768, height: 400 },
    desktop: { width: 1200, height: 600 },
  },
  card: {
    mobile: { width: 343, height: 200 },
    tablet: { width: 350, height: 250 },
    desktop: { width: 400, height: 300 },
  },
  thumbnail: {
    mobile: { width: 80, height: 80 },
    tablet: { width: 100, height: 100 },
    desktop: { width: 120, height: 120 },
  },
  gallery: {
    mobile: { width: 343, height: 343 },
    tablet: { width: 350, height: 350 },
    desktop: { width: 500, height: 500 },
  },
  blog: {
    mobile: { width: 343, height: 200 },
    tablet: { width: 600, height: 350 },
    desktop: { width: 800, height: 450 },
  },
} as const;

/**
 * Generate sizes string for common image types
 */
export const getImageSizes = (type: keyof typeof imageConfigs): string => {
  const config = imageConfigs[type];
  return generateResponsiveSizes([
    { breakpoint: 768, width: config.mobile.width },
    { breakpoint: 1024, width: config.tablet.width },
    { breakpoint: 9999, width: config.desktop.width },
  ]);
};

/**
 * Get optimal dimensions for a given breakpoint
 */
export const getOptimalDimensions = (
  type: keyof typeof imageConfigs,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): { width: number; height: number } => {
  return imageConfigs[type][breakpoint];
};

/**
 * Check if WebP is supported (client-side only)
 */
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise(resolve => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (baseSrc: string, widths: number[]): string => {
  return widths
    .map(width => {
      // For static export, we'll use the original image
      // In a real CDN setup, you'd append width parameters
      return `${baseSrc} ${width}w`;
    })
    .join(', ');
};

/**
 * Mobile-first breakpoints
 */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

/**
 * Common image quality settings
 */
export const imageQuality = {
  thumbnail: 60,
  normal: 75,
  high: 85,
  hero: 90,
} as const;

/**
 * Lazy loading intersection observer options
 */
export const lazyLoadOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1,
};
