import Link from 'next/link';

export function PricingTeaser() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Websites from £300, hosting from £15 per month, Google Ads management from £150 per month,
          and event photography from £200 per day.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
        >
          View full pricing
        </Link>
      </div>
    </section>
  );
}
