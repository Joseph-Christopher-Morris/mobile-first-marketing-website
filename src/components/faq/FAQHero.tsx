import Link from 'next/link';

interface FAQHeroProps {
  title: string;
  intro: string;
  proofLine?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  bridgeLines?: readonly string[] | string[];
}

export default function FAQHero({
  title,
  intro,
  proofLine,
  primaryCtaLabel,
  primaryCtaHref,
  bridgeLines,
}: FAQHeroProps) {
  return (
    <section className="relative w-full pt-16 md:pt-20 lg:pt-24">
      <div className="relative min-h-[60vh] md:min-h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-brand-black" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex h-full min-h-[60vh] md:min-h-[50vh] max-w-5xl flex-col items-center justify-center px-4 py-12 md:py-16 text-center text-white">
          <h1 className="text-fluid-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg max-w-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-fluid-base md:text-xl text-white/90 drop-shadow-md">
            {intro}
          </p>
          {proofLine && (
            <p className="mt-4 text-sm md:text-base text-white/80 font-medium italic">
              {proofLine}
            </p>
          )}
          <div className="mt-8">
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </div>
      </div>

      {bridgeLines && bridgeLines.length > 0 && (
        <div className="bg-white py-10 md:py-14 px-4">
          <div className="mx-auto max-w-2xl text-center space-y-2">
            {bridgeLines.map((line) => (
              <p key={line} className="text-base md:text-lg text-gray-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
