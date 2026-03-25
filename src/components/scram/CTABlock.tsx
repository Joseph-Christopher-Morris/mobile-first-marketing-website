import Link from 'next/link';

interface CTABlockProps {
  /** Heading text for the CTA block */
  heading: string;
  /** Supporting copy */
  body?: string;
  /** Primary CTA label, e.g. "Book a call" */
  primaryLabel: string;
  /** Primary CTA href */
  primaryHref: string;
  /** Secondary CTA label, e.g. "Email me directly" */
  secondaryLabel: string;
  /** Secondary CTA href */
  secondaryHref: string;
  /** Visual variant for different page positions */
  variant: 'above-fold' | 'mid-page' | 'end-of-page';
  /** Optional reassurance line, e.g. "I reply the same day" */
  reassurance?: string;
  /** Value-linked outcome line below the primary CTA */
  valueLine?: string;
  /** Optional urgency line below the value line */
  urgencyLine?: string;
}

const variantStyles: Record<CTABlockProps['variant'], { section: string; heading: string }> = {
  'above-fold': {
    section: 'bg-brand-black py-10 md:py-14',
    heading: 'text-white',
  },
  'mid-page': {
    section: 'bg-gray-50 py-12 md:py-16',
    heading: 'text-brand-black',
  },
  'end-of-page': {
    section: 'bg-brand-black py-14 md:py-20',
    heading: 'text-white',
  },
};

function CTALink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const isExternal = href.startsWith('http');
  const isMailOrTel = href.startsWith('mailto:') || href.startsWith('tel:');

  if (isMailOrTel || isExternal) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export default function CTABlock({
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant,
  reassurance,
  valueLine,
  urgencyLine,
}: CTABlockProps) {
  const styles = variantStyles[variant];
  const isDark = variant === 'above-fold' || variant === 'end-of-page';
  const bodyColor = isDark ? 'text-white/80' : 'text-gray-600';
  const reassuranceColor = isDark ? 'text-white/70' : 'text-gray-500';

  return (
    <section className={`${styles.section} px-4`}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className={`text-fluid-2xl md:text-3xl font-bold ${styles.heading}`}>
          {heading}
        </h2>

        {body && (
          <p className={`mt-3 text-fluid-base md:text-lg ${bodyColor}`}>
            {body}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <CTALink
            href={primaryHref}
            ariaLabel={primaryLabel}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
          >
            {primaryLabel}
          </CTALink>

          {valueLine && (
            <p className={`text-fluid-base md:text-lg ${isDark ? 'text-white/85' : 'text-gray-700'}`}>
              {valueLine}
            </p>
          )}

          {urgencyLine && (
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              {urgencyLine}
            </p>
          )}

          {/* Low-pressure reassurance */}
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            No pressure. I&apos;ll just show you what I see.
          </p>

          <p className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
            Or{' '}
            <CTALink
              href={secondaryHref}
              ariaLabel={secondaryLabel}
              className={`underline underline-offset-2 ${
                isDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-600 hover:text-brand-black'
              } transition-colors`}
            >
              email me
            </CTALink>
            {' '}if that&apos;s easier
          </p>
        </div>

        {reassurance && (
          <p className={`mt-5 text-sm italic ${reassuranceColor}`}>
            {reassurance}
          </p>
        )}
      </div>
    </section>
  );
}
