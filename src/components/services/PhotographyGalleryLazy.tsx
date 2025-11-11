"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import with code splitting for the gallery component
const PhotographyGallery = dynamic(() => import('./PhotographyGallery'), {
  loading: () => (
    <section className="py-14 sm:py-16 bg-white" role="status" aria-live="polite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-4">Portfolio Gallery</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Loading portfolio gallery...
        </p>
        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 items-start"
          aria-label="Loading gallery images"
        >
          {/* Loading skeleton */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full animate-pulse"
              aria-label={`Loading image ${idx + 1} of 6`}
            >
              <div className="relative w-full bg-slate-200 h-[340px]" />
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Gallery is loading, please wait...</span>
      </div>
    </section>
  ),
  ssr: false, // Disable SSR for this component to improve initial page load
});

interface PhotographyImage {
  src: string;
  alt?: string;
  type: 'local' | 'clipping' | 'editorial' | 'campaign' | 'screenshot';
  caption?: string;
  title?: string;
  subtitle?: string;
  location?: string;
  client?: string;
  publication?: string;
}

interface PhotographyGalleryLazyProps {
  images: PhotographyImage[];
}

export default function PhotographyGalleryLazy({ images }: PhotographyGalleryLazyProps) {
  return (
    <Suspense fallback={
      <section className="py-14 sm:py-16 bg-white" role="status" aria-live="polite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-4">Portfolio Gallery</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Loading portfolio gallery...
          </p>
          <div
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 items-start"
            aria-label="Loading gallery images"
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full animate-pulse"
                aria-label={`Loading image ${idx + 1} of 6`}
              >
                <div className="relative w-full bg-slate-200 h-[340px]" />
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
          <span className="sr-only">Gallery is loading, please wait...</span>
        </div>
      </section>
    }>
      <PhotographyGallery images={images} />
    </Suspense>
  );
}
