import Image from 'next/image';
import { STOCK_PROOF } from '@/lib/proof-data';

interface StockPhotographyProofBlockProps {
  /** Variant: 'homepage' renders smaller/lower hierarchy, 'photography' renders with more detail */
  variant?: 'homepage' | 'photography';
}

/**
 * SVG line chart showing revenue growth trajectory.
 * Renders a visible plotted line with data points and year labels.
 */
function RevenueLineChart() {
  const { revenueStart, revenueEnd } = STOCK_PROOF;

  // Revenue data points (normalised 0–100 for SVG viewBox)
  const points = [
    { year: '2020', x: 20, y: 92 },
    { year: '2021', x: 70, y: 82 },
    { year: '2022', x: 120, y: 65 },
    { year: '2023', x: 170, y: 42 },
    { year: '2024', x: 220, y: 20 },
    { year: '2025', x: 270, y: 5 },
  ];

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L270,100 L20,100 Z`;

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`Revenue growth line chart from ${revenueStart} to ${revenueEnd} over six years`}
    >
      <svg viewBox="0 0 290 120" className="w-full h-32" preserveAspectRatio="xMidYMid meet">
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#stockAreaGrad)" />

        {/* Trend line */}
        <path
          d={linePath}
          fill="none"
          stroke="#b45309"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p) => (
          <circle key={p.year} cx={p.x} cy={p.y} r="4" fill="#b45309" stroke="#fff" strokeWidth="1.5" />
        ))}

        {/* Year labels */}
        {points.map((p) => (
          <text
            key={`label-${p.year}`}
            x={p.x}
            y={112}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="9"
          >
            {p.year}
          </text>
        ))}
      </svg>
    </div>
  );
}

function HomepageVariant() {
  const { revenueStart, revenueEnd, interpretation } = STOCK_PROOF;

  return (
    <section className="py-10 md:py-14 px-4">
      <div className="mx-auto max-w-3xl">
        <h3 className="text-fluid-lg md:text-xl font-bold text-brand-black">
          What people repeatedly pay for
        </h3>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Revenue growth + line chart */}
          <div className="rounded-lg bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
              Stock photography revenue
            </p>
            <div className="mb-4 space-y-1">
              <p className="text-sm text-gray-500">
                From <span className="font-medium">{revenueStart}</span>
              </p>
              <p className="text-xl font-bold text-amber-800">
                To {revenueEnd}
              </p>
            </div>
            <RevenueLineChart />
          </div>

          {/* Top-selling image — photography-sample-4.webp */}
          <div className="rounded-lg bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Top-selling image
            </p>
            <div className="relative h-40 rounded overflow-hidden bg-gray-200">
              <Image
                src="/images/services/photography/photography-sample-4.webp"
                alt="Best-selling stock photograph showing consistent buyer demand"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Best-selling image. Repeatedly licensed across multiple markets
            </p>
          </div>
        </div>

        {/* Interpretation line */}
        <p className="mt-5 text-fluid-base text-gray-700">
          {interpretation}
        </p>
      </div>
    </section>
  );
}

function PhotographyVariant() {
  const { revenueStart, revenueEnd, interpretation } = STOCK_PROOF;

  return (
    <section className="py-14 md:py-20 px-4 bg-amber-50/40">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          Proof that I know what people repeatedly need
        </h2>
        <p className="mt-3 text-fluid-base text-gray-600">
          Stock photography earnings built over years of learning what buyers
          search for.
        </p>

        {/* Revenue growth headline + line chart */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 mb-2">
            Revenue growth
          </p>
          <div className="space-y-1">
            <p className="text-base text-gray-500">
              From <span className="font-medium">{revenueStart}</span>
            </p>
            <p className="text-3xl font-bold text-amber-800">
              To {revenueEnd}
            </p>
          </div>
          <div className="mt-5">
            <RevenueLineChart />
          </div>
        </div>

        {/* Top-selling images — primary visually dominant */}
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Top-selling images
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Primary: best-selling image — dominant (3/5 width) */}
            <div className="md:col-span-3 rounded-lg overflow-hidden bg-gray-100">
              <div className="relative h-64 md:h-72">
                <Image
                  src="/images/services/photography/photography-sample-4.webp"
                  alt="Best-selling editorial photograph of UK car dealerships featured in The Times"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
              <p className="text-xs text-gray-500 p-2">
                Best-selling image. Licensed by The Times and multiple buyers
              </p>
            </div>
            {/* Supporting: Singtel / Sydney context — secondary (2/5 width) */}
            <div className="md:col-span-2 rounded-lg overflow-hidden bg-gray-100">
              <div className="relative h-48 md:h-72">
                <Image
                  src="/images/services/photography/photography-sample-1.webp"
                  alt="Stock photograph used in Singtel Investor Day 2025 material"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
              <p className="text-xs text-gray-500 p-2">
                Used in Singtel Investor Day 2025 material, showing repeated demand across different industries
              </p>
            </div>
          </div>
        </div>

        {/* Interpretation line */}
        <div className="mt-8 border-l-4 border-amber-400 pl-5">
          <p className="text-fluid-base md:text-lg text-gray-700 leading-relaxed">
            {interpretation}
          </p>
        </div>

        {/* Demand interpretation */}
        <p className="mt-4 text-fluid-base font-semibold text-amber-800">
          This is consistent demand. Not a one-off.
        </p>

        {/* Cross-domain connection */}
        <p className="mt-3 text-fluid-base text-gray-700">
          The same principle applies to websites. What people see changes what they do.
        </p>
      </div>
    </section>
  );
}

export default function StockPhotographyProofBlock({
  variant = 'homepage',
}: StockPhotographyProofBlockProps) {
  if (variant === 'photography') {
    return <PhotographyVariant />;
  }
  return <HomepageVariant />;
}
