'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  imageConfigs,
  getImageSizes,
  getOptimalDimensions,
  imageQuality,
  type ResponsiveImageConfig,
} from '@/lib/image-utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  type: keyof typeof imageConfigs;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  quality?: keyof typeof imageQuality;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
  customConfig?: ResponsiveImageConfig;
}

/**
 * Advanced responsive image component optimized for mobile-first design
 * Automatically handles different screen sizes and provides optimal loading
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  type,
  priority = false,
  className = '',
  fill = false,
  quality = 'normal',
  placeholder = 'blur',
  blurDataURL,
  objectFit = 'cover',
  onLoad,
  onError,
  customConfig,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<
    'mobile' | 'tablet' | 'desktop'
  >('mobile');

  // Use custom config or default config for the image type
  const config = customConfig || imageConfigs[type];

  // Get optimal dimensions for current breakpoint
  const { width, height } = getOptimalDimensions(type, currentBreakpoint);

  // Generate responsive sizes
  const sizes = getImageSizes(type);

  // Update breakpoint based on window size
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCurrentBreakpoint('desktop');
      } else if (width >= 768) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('mobile');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Generate blur placeholder
  const defaultBlurDataURL =
    blurDataURL ||
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f1f5f9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
    ).toString('base64')}`;

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Base image props
  const imageProps = {
    src,
    alt,
    priority,
    quality: imageQuality[quality],
    className: `${className} transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
    }`,
    sizes,
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL: placeholder === 'blur' ? defaultBlurDataURL : undefined,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      objectFit,
    },
  };

  // Error fallback with responsive sizing
  if (hasError) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium rounded-lg border border-gray-200`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          minHeight: fill ? '200px' : height,
        }}
      >
        <div className='text-center'>
          <div className='w-8 h-8 mx-auto mb-2 opacity-50'>
            <svg fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <span>Image unavailable</span>
        </div>
      </div>
    );
  }

  // Fill variant for hero images and backgrounds
  if (fill) {
    return (
      <div className='relative overflow-hidden'>
        <Image {...imageProps} fill />
        {!isLoaded && (
          <div className='absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse' />
        )}
      </div>
    );
  }

  // Fixed dimensions variant
  return (
    <div className='relative overflow-hidden rounded-lg'>
      <Image {...imageProps} width={width} height={height} />
      {!isLoaded && (
        <div
          className='absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg'
          style={{ width, height }}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;
