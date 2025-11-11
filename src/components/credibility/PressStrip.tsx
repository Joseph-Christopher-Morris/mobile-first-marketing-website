// src/components/credibility/PressStrip.tsx
import Image from 'next/image';
import clsx from 'clsx';

type Variant = 'light' | 'dark';

const LOGOS = [
  {
    name: 'BBC',
    src: '/images/press-logos/bbc.png',
    alt: 'BBC logo',
  },
  {
    name: 'Forbes',
    src: '/images/press-logos/forbes.png',
    alt: 'Forbes logo',
  },
  {
    name: 'Financial Times',
    src: '/images/press-logos/financial-times.png',
    alt: 'Financial Times logo',
  },
  {
    name: 'CNN',
    src: '/images/press-logos/cnn.png',
    alt: 'CNN logo',
  },
  {
    name: 'Daily Mail',
    src: '/images/press-logos/daily-mail.png',
    alt: 'Daily Mail logo',
  },
  {
    name: 'AutoTrader',
    src: '/images/press-logos/autotrader.png',
    alt: 'AutoTrader logo',
  },
  {
    name: 'Business Insider',
    src: '/images/press-logos/business-insider.png',
    alt: 'Business Insider logo',
  },
];

export function PressStrip({ variant = 'light' }: { variant?: Variant }) {
  const isDark = variant === 'dark';

  return (
    <section
      aria-label="Press coverage"
      className="mt-6 md:mt-8"
    >
      <p
        className={clsx(
          'text-xs md:text-sm font-medium tracking-wide uppercase text-center mb-3',
          isDark ? 'text-white/70' : 'text-slate-600'
        )}
      >
        Trusted by local businesses and featured in:
      </p>

      <div
        className={clsx(
          'mx-auto max-w-5xl rounded-full border px-4 py-3 md:px-6 md:py-4',
          'backdrop-blur-sm',
          isDark
            ? 'bg-black/40 border-white/10'
            : 'bg-white border-slate-200 shadow-sm'
        )}
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {LOGOS.map((logo) => (
            <li
              key={logo.name}
              className="relative h-6 w-20 md:h-8 md:w-24"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="96px"
                className="object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
