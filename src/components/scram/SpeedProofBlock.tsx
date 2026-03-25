import { SPEED_PROOF } from '@/lib/proof-data';

interface SpeedProofBlockProps {
  /** Variant controls visual size: 'full' for homepage, 'compact' for service pages */
  variant?: 'full' | 'compact';
  /** Source attribution text, e.g. "Data from my own photography website migration" */
  sourceAttribution: string;
}

function FullVariant({ sourceAttribution }: { sourceAttribution: string }) {
  const { before, after, unit } = SPEED_PROOF;

  return (
    <section className="py-14 md:py-20 px-4 bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          My website took 14 seconds to load. Now it loads in under 2.
        </h2>
        <p className="mt-4 text-fluid-base md:text-lg text-gray-700">
          People stopped leaving early. Enquiries followed.
        </p>
        <p className="mt-2 text-fluid-base text-gray-600">
          People stayed longer. They didn&apos;t drop off straight away.
        </p>

        {/* Before / After bars */}
        <div className="mt-10 space-y-8">
          {/* Load time */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Load time ({unit})
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Before</span>
                  <span className="text-sm font-bold text-red-600">
                    {before.loadTime}s
                  </span>
                </div>
                <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: '95%' }}
                    role="img"
                    aria-label={`Before: ${before.loadTime} ${unit} load time`}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">After</span>
                  <span className="text-sm font-bold text-green-700">
                    {after.loadTime}s
                  </span>
                </div>
                <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: '13%' }}
                    role="img"
                    aria-label={`After: ${after.loadTime} ${unit} load time`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance score */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Performance score
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Before</span>
                  <span className="text-sm font-bold text-red-600">
                    {before.performanceScore}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${before.performanceScore}%` }}
                    role="img"
                    aria-label={`Before: performance score ${before.performanceScore}`}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">After</span>
                  <span className="text-sm font-bold text-green-700">
                    {after.performanceScore}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${after.performanceScore}%` }}
                    role="img"
                    aria-label={`After: performance score ${after.performanceScore}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome connection */}
        <div className="mt-10 border-l-4 border-brand-pink pl-5">
          <p className="text-fluid-base md:text-lg text-gray-700 leading-relaxed">
            When a page loads in under two seconds, people stay. They see the
            offer. They read the next line. That is when enquiries happen.
          </p>
        </div>

        {/* Source attribution */}
        <p className="mt-6 text-sm text-gray-500">{sourceAttribution}</p>
      </div>
    </section>
  );
}

function CompactVariant({ sourceAttribution }: { sourceAttribution: string }) {
  const { before, after, unit } = SPEED_PROOF;

  return (
    <section className="py-10 md:py-14 px-4">
      <div className="mx-auto max-w-3xl">
        <h3 className="text-fluid-lg md:text-xl font-bold text-brand-black">
          Speed changes everything
        </h3>

        {/* Inline before/after */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1">
              Before
            </p>
            <p className="text-2xl font-bold text-red-700">
              {before.loadTime}
              <span className="text-sm font-normal">s</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              load time ({unit})
            </p>
            <p className="text-lg font-bold text-red-700 mt-2">
              {before.performanceScore}
              <span className="text-xs font-normal">/100</span>
            </p>
            <p className="text-xs text-gray-500">performance</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">
              After
            </p>
            <p className="text-2xl font-bold text-green-700">
              {after.loadTime}
              <span className="text-sm font-normal">s</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              load time ({unit})
            </p>
            <p className="text-lg font-bold text-green-700 mt-2">
              {after.performanceScore}
              <span className="text-xs font-normal">/100</span>
            </p>
            <p className="text-xs text-gray-500">performance</p>
          </div>
        </div>

        {/* Outcome connection */}
        <p className="mt-5 text-fluid-base text-gray-700">
          Faster pages keep people on the site. People who stay are more likely
          to enquire.
        </p>

        {/* Source attribution */}
        <p className="mt-3 text-sm text-gray-500">{sourceAttribution}</p>
      </div>
    </section>
  );
}

export default function SpeedProofBlock({
  variant = 'full',
  sourceAttribution,
}: SpeedProofBlockProps) {
  if (variant === 'compact') {
    return <CompactVariant sourceAttribution={sourceAttribution} />;
  }
  return <FullVariant sourceAttribution={sourceAttribution} />;
}
