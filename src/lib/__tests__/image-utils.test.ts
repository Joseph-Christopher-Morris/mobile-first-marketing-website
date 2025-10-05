import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateResponsiveSizes,
  getImageSizes,
  getOptimalDimensions,
  isWebPSupported,
  generateSrcSet,
  imageConfigs,
  breakpoints,
  imageQuality,
  lazyLoadOptions,
} from '../image-utils';
import type { ImageBreakpoint } from '../image-utils';

// Mock Image constructor for WebP support test
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  height = 0;

  set src(value: string) {
    // Simulate WebP support test
    if (value.includes('data:image/webp')) {
      this.height = 2;
      setTimeout(() => this.onload?.(), 0);
    }
  }
} as any;

describe('Image Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateResponsiveSizes', () => {
    it('should generate correct sizes string for multiple breakpoints', () => {
      const breakpoints: ImageBreakpoint[] = [
        { breakpoint: 768, width: 343 },
        { breakpoint: 1024, width: 600 },
        { breakpoint: 9999, width: 800 },
      ];

      const result = generateResponsiveSizes(breakpoints);

      expect(result).toBe(
        '(max-width: 768px) 343px, (max-width: 1024px) 600px, 800px'
      );
    });

    it('should handle single breakpoint', () => {
      const breakpoints: ImageBreakpoint[] = [{ breakpoint: 768, width: 343 }];

      const result = generateResponsiveSizes(breakpoints);

      expect(result).toBe('343px');
    });

    it('should handle empty breakpoints array', () => {
      const breakpoints: ImageBreakpoint[] = [];

      const result = generateResponsiveSizes(breakpoints);

      expect(result).toBe('');
    });
  });

  describe('getImageSizes', () => {
    it('should return correct sizes for hero images', () => {
      const sizes = getImageSizes('hero');

      expect(sizes).toContain('(max-width: 768px) 375px');
      expect(sizes).toContain('(max-width: 1024px) 768px');
      expect(sizes).toContain('1200px');
    });

    it('should return correct sizes for card images', () => {
      const sizes = getImageSizes('card');

      expect(sizes).toContain('(max-width: 768px) 343px');
      expect(sizes).toContain('(max-width: 1024px) 350px');
      expect(sizes).toContain('400px');
    });

    it('should return correct sizes for thumbnail images', () => {
      const sizes = getImageSizes('thumbnail');

      expect(sizes).toContain('(max-width: 768px) 80px');
      expect(sizes).toContain('(max-width: 1024px) 100px');
      expect(sizes).toContain('120px');
    });

    it('should return correct sizes for gallery images', () => {
      const sizes = getImageSizes('gallery');

      expect(sizes).toContain('(max-width: 768px) 343px');
      expect(sizes).toContain('(max-width: 1024px) 350px');
      expect(sizes).toContain('500px');
    });

    it('should return correct sizes for blog images', () => {
      const sizes = getImageSizes('blog');

      expect(sizes).toContain('(max-width: 768px) 343px');
      expect(sizes).toContain('(max-width: 1024px) 600px');
      expect(sizes).toContain('800px');
    });
  });

  describe('getOptimalDimensions', () => {
    it('should return correct mobile dimensions', () => {
      const dimensions = getOptimalDimensions('hero', 'mobile');

      expect(dimensions).toEqual({ width: 375, height: 250 });
    });

    it('should return correct tablet dimensions', () => {
      const dimensions = getOptimalDimensions('card', 'tablet');

      expect(dimensions).toEqual({ width: 350, height: 250 });
    });

    it('should return correct desktop dimensions', () => {
      const dimensions = getOptimalDimensions('thumbnail', 'desktop');

      expect(dimensions).toEqual({ width: 120, height: 120 });
    });
  });

  describe('isWebPSupported', () => {
    it('should return false in server environment', async () => {
      // Mock window as undefined (server environment)
      const originalWindow = global.window;
      delete (global as any).window;

      const result = await isWebPSupported();

      expect(result).toBe(false);

      // Restore window
      (global as any).window = originalWindow;
    });

    it('should detect WebP support in browser', async () => {
      // Mock window object
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      const result = await isWebPSupported();

      expect(result).toBe(true);
    });
  });

  describe('generateSrcSet', () => {
    it('should generate correct srcSet string', () => {
      const baseSrc = '/images/hero.jpg';
      const widths = [375, 768, 1200];

      const result = generateSrcSet(baseSrc, widths);

      expect(result).toBe(
        '/images/hero.jpg 375w, /images/hero.jpg 768w, /images/hero.jpg 1200w'
      );
    });

    it('should handle single width', () => {
      const baseSrc = '/images/thumbnail.jpg';
      const widths = [120];

      const result = generateSrcSet(baseSrc, widths);

      expect(result).toBe('/images/thumbnail.jpg 120w');
    });

    it('should handle empty widths array', () => {
      const baseSrc = '/images/test.jpg';
      const widths: number[] = [];

      const result = generateSrcSet(baseSrc, widths);

      expect(result).toBe('');
    });
  });

  describe('imageConfigs', () => {
    it('should have all required image types', () => {
      expect(imageConfigs).toHaveProperty('hero');
      expect(imageConfigs).toHaveProperty('card');
      expect(imageConfigs).toHaveProperty('thumbnail');
      expect(imageConfigs).toHaveProperty('gallery');
      expect(imageConfigs).toHaveProperty('blog');
    });

    it('should have mobile, tablet, and desktop configurations for each type', () => {
      Object.values(imageConfigs).forEach(config => {
        expect(config).toHaveProperty('mobile');
        expect(config).toHaveProperty('tablet');
        expect(config).toHaveProperty('desktop');

        expect(config.mobile).toHaveProperty('width');
        expect(config.mobile).toHaveProperty('height');
        expect(config.tablet).toHaveProperty('width');
        expect(config.tablet).toHaveProperty('height');
        expect(config.desktop).toHaveProperty('width');
        expect(config.desktop).toHaveProperty('height');
      });
    });

    it('should have progressive sizing (mobile <= tablet <= desktop)', () => {
      Object.values(imageConfigs).forEach(config => {
        expect(config.mobile.width).toBeLessThanOrEqual(config.tablet.width);
        expect(config.tablet.width).toBeLessThanOrEqual(config.desktop.width);
      });
    });
  });

  describe('breakpoints', () => {
    it('should have correct breakpoint values', () => {
      expect(breakpoints.mobile).toBe(0);
      expect(breakpoints.tablet).toBe(768);
      expect(breakpoints.desktop).toBe(1024);
      expect(breakpoints.wide).toBe(1280);
    });

    it('should have progressive breakpoint values', () => {
      expect(breakpoints.mobile).toBeLessThan(breakpoints.tablet);
      expect(breakpoints.tablet).toBeLessThan(breakpoints.desktop);
      expect(breakpoints.desktop).toBeLessThan(breakpoints.wide);
    });
  });

  describe('imageQuality', () => {
    it('should have appropriate quality values', () => {
      expect(imageQuality.thumbnail).toBe(60);
      expect(imageQuality.normal).toBe(75);
      expect(imageQuality.high).toBe(85);
      expect(imageQuality.hero).toBe(90);
    });

    it('should have progressive quality values', () => {
      expect(imageQuality.thumbnail).toBeLessThan(imageQuality.normal);
      expect(imageQuality.normal).toBeLessThan(imageQuality.high);
      expect(imageQuality.high).toBeLessThan(imageQuality.hero);
    });

    it('should have quality values within valid range', () => {
      Object.values(imageQuality).forEach(quality => {
        expect(quality).toBeGreaterThanOrEqual(1);
        expect(quality).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('lazyLoadOptions', () => {
    it('should have correct lazy loading configuration', () => {
      expect(lazyLoadOptions.root).toBe(null);
      expect(lazyLoadOptions.rootMargin).toBe('50px');
      expect(lazyLoadOptions.threshold).toBe(0.1);
    });

    it('should have valid threshold value', () => {
      expect(lazyLoadOptions.threshold).toBeGreaterThanOrEqual(0);
      expect(lazyLoadOptions.threshold).toBeLessThanOrEqual(1);
    });
  });
});
