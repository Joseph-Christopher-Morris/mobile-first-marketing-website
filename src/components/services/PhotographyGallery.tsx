"use client";

import { useState, useRef, useEffect } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface PhotographyImage {
  src: string;
  alt?: string;
  type: 'local' | 'clipping' | 'editorial' | 'campaign' | 'screenshot';
  caption?: string;
  title?: string;
  subtitle?: string;
  location?: string; // For local work
  client?: string;   // For campaign work
  publication?: string; // For editorial work
}

interface PhotographyGalleryProps {
  images: PhotographyImage[];
}



export default function PhotographyGallery({ images }: PhotographyGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLElement | null)[]>([]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const { key } = event;
    let newIndex = index;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (index + 1) % images.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = index === 0 ? images.length - 1 : index - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = images.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleImageClick(index);
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    imageRefs.current[newIndex]?.focus();
  };

  // Handle image click with accessibility support
  const handleImageClick = (index: number) => {
    const item = images[index];

    // Track gallery image click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'gallery_image_click', {
        event_category: 'engagement',
        event_label: item.type,
        custom_parameter_1: item.title || `image_${index}`,
        custom_parameter_2: item.location || item.client || 'unknown',
        value: 1
      });
    }

    // Announce to screen readers
    const announcement = `Viewing ${item.title || 'image'} ${index + 1} of ${images.length}`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };

  // Set up image refs
  useEffect(() => {
    imageRefs.current = imageRefs.current.slice(0, images.length);
  }, [images.length]);

  return (
    <section
      aria-label="Photography Portfolio Gallery"
      className="py-14 sm:py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={galleryRef}>
        <h2 id="gallery-heading" className="text-2xl font-semibold mb-4">Portfolio Gallery</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          A mix of local photography, commercial campaigns, and real editorial placements.
          Use arrow keys to navigate between images, Enter or Space to view details.
        </p>

        {/* Mobile-first responsive grid */}
        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 items-start"
          role="grid"
          aria-labelledby="gallery-heading"
          aria-describedby="gallery-instructions"
        >
        <div id="gallery-instructions" className="sr-only">
          Photography portfolio gallery with {images.length} images. Use arrow keys to navigate, Enter or Space to view image details.
        </div>
        {images.map((item, idx) => {
          const isClipping = item.type === 'clipping';

          return (
            <div
              key={idx}
              ref={(el) => { imageRefs.current[idx] = el; }}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 ${
                isClipping ? "bg-[#ecddcc]" : ""
              }`}
              role="gridcell"
              tabIndex={0}
              aria-label={`${item.type} photography: ${item.title || item.alt || 'Photography sample'}. ${item.location ? `Location: ${item.location}. ` : ''}${item.client ? `Client: ${item.client}. ` : ''}${item.publication ? `Publication: ${item.publication}. ` : ''}Image ${idx + 1} of ${images.length}`}
              aria-describedby={`caption-${idx}`}
              data-gallery-image={`${item.type}_${idx}`}
              onClick={() => handleImageClick(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onFocus={() => setFocusedIndex(idx)}
            >
              {/* Image wrapper with mobile-first responsive sizing */}
              <div className={`relative w-full bg-slate-100 ${isClipping ? "p-4 pb-0" : ""}`}>
                <img
                  src={item.src}
                  alt={item.alt ?? item.title ?? "Photography sample"}
                  loading="lazy"
                  className={`w-full h-auto mx-auto ${
                    isClipping
                      ? "max-h-[320px] object-contain"
                      : "max-h-[380px] md:max-h-[340px] object-contain md:object-cover"
                  }`}
                  onLoad={() => handleImageLoad(idx)}
                />
              </div>

              {/* Text content with consistent spacing */}
              {isClipping ? (
                <div className="px-4 pt-3 pb-4 space-y-2">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {item.caption && (
                    <p className="text-xs text-slate-700 leading-relaxed">{item.caption}</p>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-4 gap-2">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.caption && (
                    <p
                      id={`caption-${idx}`}
                      className="text-xs text-slate-600 leading-relaxed line-clamp-4 md:line-clamp-5"
                    >
                      {item.caption}
                    </p>
                  )}
                  {item.client && (
                    <p className="text-xs text-slate-500 mt-auto">Client: {item.client}</p>
                  )}

                  {/* Type badges */}
                  <div className="mt-2">
                    {item.type === "editorial" && (
                      <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5">
                        Editorial
                      </span>
                    )}
                    {item.type === "local" && (
                      <span className="inline-block rounded-full bg-brand-pink/10 text-brand-pink text-[10px] px-2 py-0.5 font-medium">
                        Local Nantwich
                      </span>
                    )}
                    {item.type === "campaign" && (
                      <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5">
                        Campaign
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
