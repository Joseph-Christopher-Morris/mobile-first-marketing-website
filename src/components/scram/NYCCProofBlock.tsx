import { NYCC_PROOF } from '@/lib/proof-data';

interface NYCCProofBlockProps {
  /** Optional heading override */
  heading?: string;
}

export default function NYCCProofBlock({ heading }: NYCCProofBlockProps) {
  const { adminTimeSaved, outcomes, social, attribution } = NYCC_PROOF;

  return (
    <section className="py-10 md:py-14 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-xl md:text-2xl font-bold text-brand-black">
          {heading || 'Real results from a real project'}
        </h2>
        <p className="mt-3 text-fluid-base text-gray-600">
          What changed, by how much, and why it matters.
        </p>

        {/* Priority 1: Admin time saved */}
        <div className="mt-10 space-y-6">
          <div className="rounded-lg bg-green-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700 mb-2">
              Admin time saved
            </p>
            <p className="text-3xl font-bold text-green-800">
              {adminTimeSaved}
            </p>
            <p className="mt-2 text-fluid-base text-gray-700">
              Repetitive booking questions stopped. The website now answers them
              before anyone picks up the phone.
            </p>
          </div>

          {/* Priority 2: Clearer structure, fewer confused enquiries */}
          <div className="rounded-lg bg-blue-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-2">
              Booking clarity
            </p>
            <ul className="space-y-2">
              {outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-2 text-fluid-base text-gray-700"
                >
                  <span
                    className="mt-1 flex-shrink-0 text-blue-600"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-fluid-base text-gray-700">
              People find what they need without calling to ask. That means fewer
              wasted conversations and more genuine bookings.
            </p>
          </div>

          {/* Priority 3: Social growth */}
          <div className="rounded-lg bg-gray-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Social growth in {social.period}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-black">
                  {social.followers}
                </p>
                <p className="text-xs text-gray-500 mt-1">followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-black">
                  {social.posts}
                </p>
                <p className="text-xs text-gray-500 mt-1">posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-black">
                  {social.reactions}
                </p>
                <p className="text-xs text-gray-500 mt-1">reactions</p>
              </div>
            </div>
            <p className="mt-3 text-fluid-base text-gray-700">
              Consistent content built a real audience. The numbers grew because
              the structure made posting sustainable.
            </p>
          </div>
        </div>

        {/* Priority 4: Optional client quote/praise — visually subordinate */}
        <p className="mt-6 text-sm text-gray-500 italic">
          &ldquo;It has completely changed how I manage bookings and
          communicate with customers.&rdquo;
        </p>

        {/* Attribution */}
        <p className="mt-4 text-sm text-gray-500">
          Data from the {attribution}
        </p>
      </div>
    </section>
  );
}
