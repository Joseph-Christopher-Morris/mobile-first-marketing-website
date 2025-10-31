import Image from "next/image";

interface PhotographyImage {
  src: string;
  alt: string;
  type: 'local' | 'clipping' | 'editorial' | 'campaign';
  caption?: string;
}

interface PhotographyGalleryProps {
  images?: PhotographyImage[];
}

const defaultPhotographyImages = [
  { src: "/images/services/Photography/forbes-mobile.png", alt: "Forbes editorial feature", type: "clipping" },
  { src: "/images/services/Photography/bbc-mobile.png", alt: "BBC online feature", type: "clipping" },
  { src: "/images/services/Photography/240427-_Nantwich_Stock_Photography-19.jpg", alt: "Nantwich market day", type: "local" },
  { src: "/images/services/Photography/250830-Nantwich_Food_Festival-11.jpg", alt: "Nantwich Food Festival", type: "local" },
  { src: "/images/services/Photography/social-campaign.png", alt: "Commercial campaign creative", type: "campaign" },
];

export default function PhotographyGallery({ images = defaultPhotographyImages }: PhotographyGalleryProps) {
  return (
    <section aria-label="Photography Portfolio" className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Portfolio Gallery</h2>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        Showcasing published editorial photography, local Nantwich projects, and commercial campaigns.
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((item, idx) => {
          const isClipping = item.type === "clipping";
          return (
            <figure key={idx} className="rounded-xl border bg-white/40 overflow-hidden flex flex-col">
              <div className={isClipping ? "relative w-full aspect-[3/4] bg-slate-50" : "relative w-full aspect-[4/3] bg-slate-50"}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className={isClipping ? "object-contain p-2" : "object-cover"}
                  sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 33vw"
                />
              </div>
              <figcaption className="p-3 text-sm">
                {item.type === "clipping" && <span className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full mr-2">Published</span>}
                {item.type === "local" && <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full mr-2">Local</span>}
                {item.type === "campaign" && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full mr-2">Campaign</span>}
                {item.alt}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}