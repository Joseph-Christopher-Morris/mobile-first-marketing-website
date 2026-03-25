import Link from 'next/link';

interface BlogPostCTAProps {
  /** Problem reminder text — posts can override but not remove */
  problemReminder?: string;
  /** What happens when they get in touch */
  solutionStatement?: string;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA link destination */
  ctaHref?: string;
}

const DEFAULT_PROBLEM = "Your website is not getting enquiries.";
const DEFAULT_SOLUTION = "Send me your website. I will tell you what is not working.";
const DEFAULT_LABEL = "Send me your website";
const DEFAULT_HREF = "/contact/";

export { DEFAULT_PROBLEM, DEFAULT_SOLUTION, DEFAULT_LABEL, DEFAULT_HREF };

export default function BlogPostCTA({
  problemReminder = DEFAULT_PROBLEM,
  solutionStatement = DEFAULT_SOLUTION,
  ctaLabel = DEFAULT_LABEL,
  ctaHref = DEFAULT_HREF,
}: BlogPostCTAProps) {
  return (
    <aside className="mt-12 border-t-2 border-brand-pink pt-8 pb-4">
      <p className="text-fluid-xl md:text-2xl font-bold text-brand-black">
        {problemReminder}
      </p>

      <p className="mt-3 text-fluid-base md:text-lg text-gray-700">
        {solutionStatement}
      </p>

      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
      >
        {ctaLabel}
      </Link>
    </aside>
  );
}
