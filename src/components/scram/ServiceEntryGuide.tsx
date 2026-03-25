import Link from 'next/link';

const paths = [
  {
    problem: 'Not getting enquiries?',
    solution: 'Visitors land on your site and leave without getting in touch. I rebuild the structure so the next step is obvious.',
    service: 'Website Design',
    href: '/services/website-design/',
  },
  {
    problem: 'Site too slow?',
    solution: 'A slow site loses visitors before they see what you offer. I fix the speed so people stay.',
    service: 'Hosting',
    href: '/services/website-hosting/',
  },
  {
    problem: 'Ads not working?',
    solution: 'You are spending money but not getting leads. I rework the setup so your budget brings in enquiries.',
    service: 'Ad Campaigns',
    href: '/services/ad-campaigns/',
  },
];

export default function ServiceEntryGuide() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          Not sure where to start?
        </h2>
        <p className="mt-3 text-fluid-base md:text-lg text-gray-700">
          Pick the problem that sounds most like yours.
        </p>

        <div className="mt-8 space-y-6">
          {paths.map((path) => (
            <div
              key={path.href}
              className="border-l-4 border-brand-pink pl-5 py-2"
            >
              <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                {path.problem}
              </h3>
              <p className="mt-1 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                {path.solution}
              </p>
              <Link
                href={path.href}
                className="mt-3 inline-flex items-center justify-center px-6 py-2 rounded-lg text-base font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
              >
                Learn about {path.service}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
