'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  mobileBreakpoint?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  // SEO-specific props
  title?: string;
  caption?: string;
  figureClassName?: string;
  includeStructuredData?: boolean;
  // Enhanced error handling props
  fallbackSrc?: string;
  maxRetries?: number;
  retryDelay?: number;
  showErrorMessage?: boolean;
  errorMessage?: string;
  showLoadingIndicator?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

// Generate a simple blur placeholder
const generateBlurDataURL = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Create a simple gradient blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(0.5, '#e5e7eb');
    gradient.addColorStop(1, '#d1d5db');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.1);
};

// Simple base64 blur placeholder for SSR compatibility
const createBlurDataURL = (width: number = 10, height: number = 10): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`
  ).toString('base64')}`;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  mobileBreakpoint = 768,
  className = '',
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
  title,
  caption,
  figureClassName = '',
  includeStructuredData = false,
  // Enhanced error handling props with defaults
  fallbackSrc,
  maxRetries = 2,
  retryDelay = 1000,
  showErrorMessage = true,
  errorMessage = 'Image failed to load',
  showLoadingIndicator = true,
  loadingComponent,
  errorComponent,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Mobile-first responsive sizes
  const defaultSizes =
    sizes ||
    `(max-width: ${mobileBreakpoint}px) 100vw, (max-width: 1024px) 50vw, 33vw`;

  // Generate blur placeholder if not provided
  const defaultBlurDataURL =
    blurDataURL || createBlurDataURL(width || 400, height || 300);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
    setRetryCount(0);
    setErrorDetails('');
  }, [src]);

  // Handle image load success
  const handleLoad = () => {
    console.log(`[OptimizedImage] Successfully loaded: ${currentSrc}`);
    setIsLoaded(true);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error with retry logic
  const handleError = (
    event?: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const errorMsg = `Failed to load image: ${currentSrc}`;
    console.error(`[OptimizedImage] ${errorMsg}`, event);

    setErrorDetails(errorMsg);
    setIsLoading(false);

    // Try fallback image first if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`[OptimizedImage] Trying fallback image: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setRetryCount(0);
      setIsLoading(true);
      return;
    }

    // Retry logic for original image
    if (retryCount < maxRetries) {
      const nextRetryCount = retryCount + 1;
      console.log(
        `[OptimizedImage] Retry attempt ${nextRetryCount}/${maxRetries} for: ${currentSrc}`
      );

      setTimeout(() => {
        setRetryCount(nextRetryCount);
        setIsLoading(true);
        setHasError(false);
        // Force re-render by adding timestamp to src
        setCurrentSrc(`${src}?retry=${nextRetryCount}&t=${Date.now()}`);
      }, retryDelay);
      return;
    }

    // All retries exhausted
    console.error(
      `[OptimizedImage] All retry attempts exhausted for: ${currentSrc}`
    );
    setHasError(true);
    onError?.();
  };

  // Generate structured data for images if requested
  const structuredData = includeStructuredData
    ? {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: src,
        description: alt,
        width: width?.toString(),
        height: height?.toString(),
        ...(caption && { caption }),
      }
    : null;

  // Base image props
  const imageProps = {
    src: currentSrc,
    alt,
    title: title || alt, // Use title prop or fallback to alt
    priority: priority || loading === 'eager',
    quality,
    className: `${className} transition-all duration-500 ${
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
    }`,
    sizes: defaultSizes,
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL: placeholder === 'blur' ? defaultBlurDataURL : undefined,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      objectFit,
    },
    key: `${currentSrc}-${retryCount}`, // Force re-render on retry
  };

  // Loading indicator
  const renderLoadingIndicator = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center animate-pulse`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <div className='flex flex-col items-center space-y-2'>
          <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
          <span className='text-xs text-gray-500'>Loading image...</span>
          {retryCount > 0 && (
            <span className='text-xs text-gray-400'>
              Retry {retryCount}/{maxRetries}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Error fallback with enhanced information
  const renderErrorFallback = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <div
        className={`${className} bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center text-red-600 text-sm p-4`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        role='img'
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className='flex flex-col items-center space-y-2 text-center'>
          <svg
            className='w-8 h-8 text-red-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
          {showErrorMessage && (
            <>
              <span className='font-medium'>{errorMessage}</span>
              <span className='text-xs text-red-500 max-w-full break-words'>
                {alt}
              </span>
              {process.env.NODE_ENV === 'development' && errorDetails && (
                <details className='text-xs text-red-400 mt-2'>
                  <summary className='cursor-pointer'>Debug Info</summary>
                  <p className='mt-1 font-mono text-xs break-all'>
                    {errorDetails}
                  </p>
                  <p className='mt-1'>
                    Retries: {retryCount}/{maxRetries}
                  </p>
                  {fallbackSrc && (
                    <p className='mt-1'>Fallback: {fallbackSrc}</p>
                  )}
                </details>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading && showLoadingIndicator && !isLoaded) {
    return renderLoadingIndicator();
  }

  // Show error state
  if (hasError) {
    return renderErrorFallback();
  }

  // Render image with optional figure wrapper for captions
  const renderImage = () => {
    if (fill) {
      return (
        <div className='relative overflow-hidden'>
          <Image {...imageProps} fill />
        </div>
      );
    }

    if (!width || !height) {
      throw new Error('Width and height are required when fill is false');
    }

    return <Image {...imageProps} width={width} height={height} />;
  };

  // Wrap in figure if caption is provided
  if (caption) {
    return (
      <>
        {/* Structured Data */}
        {structuredData && (
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}

        <figure
          className={`${figureClassName}`}
          itemScope
          itemType='https://schema.org/ImageObject'
        >
          {renderImage()}
          <figcaption
            className='text-sm text-gray-600 mt-2 italic'
            itemProp='caption'
          >
            {caption}
          </figcaption>
          <meta itemProp='url' content={src} />
          <meta itemProp='description' content={alt} />
          {width && <meta itemProp='width' content={width.toString()} />}
          {height && <meta itemProp='height' content={height.toString()} />}
        </figure>
      </>
    );
  }

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      {renderImage()}
    </>
  );
};

export default OptimizedImage;
