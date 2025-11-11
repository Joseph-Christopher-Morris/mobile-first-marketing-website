"use client";

import Image from "next/image";

const pressLogos = [
  { src: "/images/press-logos/bbc.png", alt: "BBC logo" },
  { src: "/images/press-logos/forbes.png", alt: "Forbes logo" },
  { src: "/images/press-logos/financial-times.png", alt: "Financial Times logo" },
  { src: "/images/press-logos/cnn.png", alt: "CNN logo" },
  { src: "/images/press-logos/daily-mail.png", alt: "Daily Mail logo" },
  { src: "/images/press-logos/business-insider.png", alt: "Business Insider logo" },
  { src: "/images/press-logos/autotrader.png", alt: "Autotrader logo" },
];

export function PressMentions({ variant = "dark" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";

  return (
    <section
      aria-label="Publications featuring work by Vivid Media Cheshire"
      className={`w-full py-6 ${
        isDark ? "bg-transparent text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <p
        className={`text-center text-xs md:text-sm font-medium mb-4 ${
          isDark ? "text-white/80" : "text-slate-600"
        }`}
      >
        Work featured or referenced by leading publications
      </p>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10 px-4">
        {pressLogos.map((logo) => (
          <div
            key={logo.src}
            className="relative w-24 h-10 md:w-28 md:h-12 grayscale opacity-70 hover:opacity-100 transition"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="(max-width:768px) 80px, 120px"
              className="object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
