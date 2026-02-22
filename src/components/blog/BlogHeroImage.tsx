"use client";

import Image from 'next/image';
import { useState } from 'react';

interface BlogHeroImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
}

export default function BlogHeroImage({
  src,
  alt,
  priority = true,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
  fetchPriority = "high",
  loading = "eager",
}: BlogHeroImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // Only set fallback once to prevent infinite loop
    if (!hasError) {
      setHasError(true);
      setImageSrc('/images/blog/default.webp');
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className='object-cover'
      priority={priority}
      sizes={sizes}
      fetchPriority={fetchPriority}
      loading={loading}
      onError={handleError}
    />
  );
}
