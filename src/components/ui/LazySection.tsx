import React, { ReactNode } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

/**
 * Wrapper component that lazy loads its children when they come into view
 * Useful for below-the-fold content to improve initial page load performance
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}) => {
  const { elementRef, isIntersecting } = useLazyLoad({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={`animate-pulse ${className}`}>
      <div className='bg-gray-200 rounded-lg h-32 w-full mb-4'></div>
      <div className='space-y-2'>
        <div className='bg-gray-200 rounded h-4 w-3/4'></div>
        <div className='bg-gray-200 rounded h-4 w-1/2'></div>
      </div>
    </div>
  );

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
    >
      {isIntersecting ? children : fallback || defaultFallback}
    </div>
  );
};

export default LazySection;
