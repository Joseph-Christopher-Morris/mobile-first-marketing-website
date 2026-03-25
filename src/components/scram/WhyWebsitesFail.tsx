import Link from 'next/link';

interface WhyWebsitesFailProps {
  /** Optional custom heading */
  heading?: string;
  /** Whether to include the solution CTA at the end */
  showSolutionCTA?: boolean;
  /** Optional custom CTA heading when showSolutionCTA is true */
  solutionCtaHeading?: string;
}

const reasons = [
  {
    title: 'Your site is too slow',
    description:
      'Visitors leave before they see what you offer. A few seconds of delay costs you enquiries.',
  },
  {
    title: 'The structure makes no sense',
    description:
      'People land on your site and cannot find what they need. There is no clear next step. They leave and try someone else.',
  },
  {
    title: 'The message is not clear',
    description:
      'Your site talks about what you do. It does not explain why it matters to the person reading it. If visitors do not see their problem, they leave.',
  },
];

export default function WhyWebsitesFail({
  heading = 'Why most websites do not bring in enquiries',
  showSolutionCTA = false,
  solutionCtaHeading = 'I fix these problems for Nantwich and Crewe businesses',
}: WhyWebsitesFailProps) {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          {heading}
        </h2>

        <div className="mt-8 space-y-8">
          {reasons.map((reason, index) => (
            <div key={index} className="border-l-4 border-brand-pink pl-5">
              <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                {reason.title}
              </h3>
              <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {showSolutionCTA && (
          <div className="mt-12 rounded-lg bg-gray-50 p-6 md:p-8 text-center">
            <h3 className="text-fluid-2xl md:text-2xl font-bold text-brand-black">
              {solutionCtaHeading}
            </h3>
            <p className="mt-3 text-fluid-base md:text-lg text-gray-700">
              I rebuild websites so visitors know what to do next. The structure is clear. The pages load fast. Enquiries follow.
            </p>
            <div className="mt-6">
              <Link
                href="/services/website-design/"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
              >
                See how I fix websites
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
