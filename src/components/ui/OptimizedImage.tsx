'use client';

import React, { useState } from 'react';
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
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Mobile-first responsive sizes
  const defaultSizes =
    sizes ||
    `(max-width: ${mobileBreakpoint}px) 100vw, (max-width: 1024px) 50vw, 33vw`;

  // Generate blur placeholder if not provided
  const defaultBlurDataURL =
    blurDataURL || createBlurDataURL(width || 400, height || 300);

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
    src,
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
  };

  // Error fallback
  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span>Image failed to load</span>
      </div>
    );
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
