import Link from 'next/link';

interface FAQFinalCTAProps {
  title: string;
  supportingText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryText?: string;
  secondaryEmail?: string;
}

export default function FAQFinalCTA({
  title,
  supportingText,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryText,
  secondaryEmail,
}: FAQFinalCTAProps) {
  return (
    <section className="bg-brand-black py-14 md:py-20 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-3 text-fluid-base md:text-lg text-white/80">
          {supportingText}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <Link
            href={primaryCtaHref}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
          >
            {primaryCtaLabel}
          </Link>
          {secondaryText && secondaryEmail && (
            <p className="text-sm text-white/70">
              {secondaryText}{' '}
              <a
                href={`mailto:${secondaryEmail}`}
                className="underline underline-offset-2 text-white/80 hover:text-white transition-colors"
              >
                {secondaryEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
