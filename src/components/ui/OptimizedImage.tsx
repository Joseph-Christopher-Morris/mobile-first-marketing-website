"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
}

// Generate blur placeholder for progressive loading
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-colour="#f6f7f8" offset="20%" />
      <stop stop-colour="#edeef1" offset="50%" />
      <stop stop-colour="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

// Generate WebP source with JPEG fallback
const generateImageSources = (src: string) => {
  const basePath = src.replace(/\.[^/.]+$/, ""); // Remove extension
  const extension = src.split('.').pop()?.toLowerCase();

  // For static export, we'll rely on Next.js Image component's built-in optimisation
  // which will serve WebP when supported by the browser
  return {
    webp: src.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    original: src
  };
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  quality = 85,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "blur",
  blurDataURL,
  onLoad,
  style,
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate default blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL ||
    `data:image/svg+xml;base64,${toBase64(shimmer(width || 400, height || 300))}`;

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  // Generate responsive sizes based on common breakpoints
  const responsiveSizes = sizes || [
    "(max-width: 640px) 100vw",
    "(max-width: 1024px) 50vw",
    "(max-width: 1280px) 33vw",
    "25vw"
  ].join(", ");

  // Enhanced className with loading states
  const enhancedClassName = [
    className,
    "transition-opacity duration-300",
    imageLoaded ? "opacity-100" : "opacity-0",
    imageError ? "bg-gray-200" : ""
  ].filter(Boolean).join(" ");

  if (imageError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height, ...style }}
      >
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={enhancedClassName}
      priority={priority}
      quality={quality}
      sizes={responsiveSizes}
      placeholder={placeholder}
      blurDataURL={placeholder === "blur" ? defaultBlurDataURL : undefined}
      loading={priority ? "eager" : loading}
      onLoad={handleLoad}
      onError={handleError}
      style={style}
      {...props}
    />
  );
}

// Hook for preloading critical images
export const useImagePreload = (src: string) => {
  const preloadImage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  }, [src]);

  return preloadImage;
};

// Component for hero image with preloading
export function HeroOptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  const preloadImage = useImagePreload(src);

  // Preload on component mount
  useState(() => {
    preloadImage();
  });

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      quality={90}
      sizes="(max-width: 768px) 100vw, 50vw"
      {...props}
    />
  );
}
