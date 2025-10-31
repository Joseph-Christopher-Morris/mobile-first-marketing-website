import Image from "next/image";

interface PhotographyImage {
  src: string;
  alt?: string;
  type: 'local' | 'clipping' | 'editorial' | 'campaign' | 'screenshot';
  caption?: string;
  title?: string;
  subtitle?: string;
}

interface PhotographyGalleryProps {
  images: PhotographyImage[];
}

export default function PhotographyGallery({ images }: PhotographyGalleryProps) {
  return (
    <section aria-label="Photography Portfolio" className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Portfolio Gallery</h2>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        A mix of local photography, commercial campaigns, and real editorial placements.
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
        {images.map((item, idx) => {
          // Check if this is a tall/screenshot type that needs height capping
          const isTall = item.type === "clipping" || item.type === "screenshot";
          
          // Special handling for Financial Times editorial cards with full styling
          if (item.type === "clipping" && item.title && item.subtitle) {
            return (
              <figure
                key={idx}
                className="flex flex-col rounded-2xl border overflow-hidden bg-[#f6e9dc] text-slate-900 h-full max-h-[460px]"
                aria-label="Editorial Proof: Financial Times EV Sales Article"
              >
                {/* Title */}
                <div className="px-4 pt-4 font-serif text-xl font-semibold leading-snug line-clamp-2">
                  {item.title}
                </div>
                
                {/* Subtitle */}
                <div className="px-4 pb-3 text-base leading-tight line-clamp-2">
                  {item.subtitle}
                </div>
                
                {/* Image */}
                <div className="relative w-full bg-[#f6e9dc] max-h-[240px] min-h-[180px]">
                  <Image
                    src={item.src}
                    alt={item.alt ?? item.title}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                
                {/* Caption */}
                <div className="px-4 py-4 text-sm leading-snug italic line-clamp-3 flex-1">
                  {item.caption}
                </div>
              </figure>
            );
          }

          // Balanced card rendering for all other types
          return (
            <figure 
              key={idx} 
              className="flex flex-col rounded-2xl border bg-white overflow-hidden h-full max-h-[460px]"
            >
              {/* Image container with balanced aspect handling */}
              <div
                className={
                  isTall
                    ? "relative w-full bg-slate-50 max-h-[240px] min-h-[180px]"
                    : "relative w-full bg-slate-50 aspect-[4/3]"
                }
              >
                <Image
                  src={item.src}
                  alt={item.alt ?? item.title ?? "Photography sample"}
                  fill
                  className={isTall ? "object-contain p-2" : "object-cover"}
                  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              {/* Text content with flex-1 to fill remaining space */}
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-sm font-semibold leading-snug line-clamp-2">
                  {item.title || item.alt || "Photography Sample"}
                </p>
                
                {item.caption && (
                  <p className="text-xs text-slate-600 mt-1 leading-snug line-clamp-3">
                    {item.caption}
                  </p>
                )}
                
                {/* Type badges */}
                <div className="mt-auto pt-3">
                  {item.type === "clipping" && (
                    <span className="inline-block rounded-full bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5">
                      Published
                    </span>
                  )}
                  {item.type === "local" && (
                    <span className="inline-block rounded-full bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5">
                      Local
                    </span>
                  )}
                  {item.type === "campaign" && (
                    <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5">
                      Campaign
                    </span>
                  )}
                  {item.type === "editorial" && (
                    <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5">
                      Editorial
                    </span>
                  )}
                </div>
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}