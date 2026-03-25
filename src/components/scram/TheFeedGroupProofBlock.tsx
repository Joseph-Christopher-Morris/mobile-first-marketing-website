import { THEFEEDGROUP_PROOF } from '@/lib/proof-data';

interface TheFeedGroupProofBlockProps {
  /** Optional heading override */
  heading?: string;
}

export default function TheFeedGroupProofBlock({
  heading,
}: TheFeedGroupProofBlockProps) {
  const { clicks, impressions, ctr, avgCpc, attribution } =
    THEFEEDGROUP_PROOF;

  return (
    <section className="py-12 md:py-16 px-4 bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-xl md:text-2xl font-bold text-brand-black">
          {heading || 'Traffic does not fix a weak website'}
        </h2>
        <p className="mt-4 text-fluid-base md:text-lg text-gray-700">
          The ads worked. The page didn&apos;t. That is why enquiries did not happen.
        </p>

        {/* Campaign metrics */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-brand-black">{clicks}</p>
            <p className="text-xs text-gray-500 mt-1">clicks</p>
          </div>
          <div className="rounded-lg bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-brand-black">
              {impressions}
            </p>
            <p className="text-xs text-gray-500 mt-1">impressions</p>
          </div>
          <div className="rounded-lg bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-brand-black">~{ctr}</p>
            <p className="text-xs text-gray-500 mt-1">CTR</p>
          </div>
          <div className="rounded-lg bg-white p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-brand-black">~{avgCpc}</p>
            <p className="text-xs text-gray-500 mt-1">average CPC</p>
          </div>
        </div>

        {/* Message: traffic alone is not enough */}
        <div className="mt-10 border-l-4 border-brand-pink pl-5">
          <p className="text-fluid-base md:text-lg text-gray-700 leading-relaxed">
            The page has to match what people search for. Sending traffic to a
            page that does not answer the right question wastes every click.
          </p>
        </div>

        {/* Logic completion */}
        <p className="mt-8 text-fluid-base md:text-lg font-medium text-gray-800">
          So the problem wasn&apos;t traffic. It was what people saw next.
        </p>

        {/* Repeatability signal */}
        <p className="mt-3 text-fluid-base text-gray-600">
          This is a common pattern I see.
        </p>

        {/* Attribution */}
        <p className="mt-6 text-sm text-gray-500">
          Data from the {attribution}
        </p>
      </div>
    </section>
  );
}
