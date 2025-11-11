import Image from 'next/image';

interface PerformanceComparisonProps {
  title?: string;
  subtitle?: string;
  beforeTitle?: string;
  afterTitle?: string;
  beforeImage: string;
  afterImage: string;
  beforeImageAlt: string;
  afterImageAlt: string;
  beforeStats: {
    performanceScore: string;
    annualCost: string;
    loadTime: string;
  };
  afterStats: {
    performanceScore: string;
    annualCost: string;
    loadTimeImprovement: string;
  };
  resultText?: string;
  className?: string;
}

export function PerformanceComparison({
  title = "Before & After: Real Performance Results",
  subtitle,
  beforeTitle = "Before: Slow & Expensive",
  afterTitle = "After: Fast & Affordable",
  beforeImage,
  afterImage,
  beforeImageAlt,
  afterImageAlt,
  beforeStats,
  afterStats,
  resultText = "Real client results: From 14 seconds to under 2 seconds load time",
  className = "",
}: PerformanceComparisonProps) {
  return (
    <section className={`mb-20 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Before */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-red-800 mb-6 text-center">
            {beforeTitle}
          </h3>
          <div className="bg-white rounded-lg overflow-hidden mb-4">
            <Image
              src={beforeImage}
              alt={beforeImageAlt}
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <div className="space-y-2 text-sm text-red-700">
            <div className="flex justify-between">
              <span>Performance Score</span>
              <span className="font-semibold">{beforeStats.performanceScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Hosting Cost</span>
              <span className="font-semibold">{beforeStats.annualCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Load Time</span>
              <span className="font-semibold">{beforeStats.loadTime}</span>
            </div>
          </div>
        </div>

        {/* After */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
            {afterTitle}
          </h3>
          <div className="bg-white rounded-lg overflow-hidden mb-4">
            <Image
              src={afterImage}
              alt={afterImageAlt}
              width={600}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span>Performance Score</span>
              <span className="font-semibold">{afterStats.performanceScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Hosting Cost</span>
              <span className="font-semibold">{afterStats.annualCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Load Time Improvement</span>
              <span className="font-semibold">{afterStats.loadTimeImprovement}</span>
            </div>
          </div>
        </div>
      </div>

      {resultText && (
        <div className="text-center mt-8">
          <p className="text-lg text-gray-600">
            <strong>Real client results:</strong> {resultText}
          </p>
        </div>
      )}
    </section>
  );
}
