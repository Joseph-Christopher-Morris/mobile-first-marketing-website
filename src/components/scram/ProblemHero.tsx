import Image from 'next/image';
import Link from 'next/link';

interface ProblemHeroProps {
  /** Problem-led heading, e.g. "Not getting enquiries from your website?" */
  heading: string;
  /** Subline with local reference, e.g. "I fix websites for Nantwich and Crewe businesses..." */
  subline: string;
  /** Above-the-fold CTA label */
  ctaLabel: string;
  /** CTA href (anchor or route) */
  ctaHref: string;
  /** Optional proof element text, e.g. "Tested in real Cheshire businesses" */
  proofText?: string;
  /** Optional hero image src */
  imageSrc?: string;
  /** Optional hero image alt */
  imageAlt?: string;
  /** Optional data-speakable attribute value for SpeakableSpecification schema */
  speakableId?: string;
}

export default function ProblemHero({
  heading,
  subline,
  ctaLabel,
  ctaHref,
  proofText,
  imageSrc,
  imageAlt = '',
  speakableId,
}: ProblemHeroProps) {
  const isAnchor = ctaHref.startsWith('#');
  const isExternal = ctaHref.startsWith('http');

  return (
    <section className="relative w-full pt-16 md:pt-20 lg:pt-24">
      <div className="relative min-h-[60vh] md:min-h-[50vh] w-full overflow-hidden">
        {/* Background image (optional) */}
        {imageSrc && (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 1280px, 1600px"
              quality={75}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/65" aria-hidden="true" />
          </>
        )}

        {/* Solid background when no image */}
        {!imageSrc && (
          <div className="absolute inset-0 bg-brand-black" aria-hidden="true" />
        )}

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full min-h-[60vh] md:min-h-[50vh] max-w-5xl flex-col items-center justify-center px-4 py-12 md:py-16 text-center text-white">
          <h1 className="text-fluid-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg max-w-4xl">
            {heading}
          </h1>

          <p className="mt-4 max-w-2xl text-fluid-base md:text-xl text-white/90 drop-shadow-md">
            {subline}
          </p>

          {/* Proof element — above the fold */}
          {proofText && (
            <p
              className="mt-4 text-sm md:text-base text-white/80 font-medium italic"
              {...(speakableId ? { 'data-speakable': speakableId } : {})}
            >
              {proofText}
            </p>
          )}

          {/* CTA button — 44x44px minimum tap target */}
          <div className="mt-8">
            {isAnchor ? (
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
              >
                {ctaLabel}
              </a>
            ) : isExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
