export default function SummaryChange() {
  return (
    <section aria-labelledby="summary-of-changes" className="mx-auto max-w-5xl p-6 text-center">
      <h2 id="summary-of-changes" className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
        <span className="text-green-600 text-4xl">▼</span>
        82% Faster
      </h2>
      <div className="flex items-center justify-center mb-6">
        <img src="/images/icons/clock-green.svg" alt="Clock icon representing faster loading" className="h-24 w-24 md:h-32 md:w-32" loading="lazy" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Load Time Improvement</h3>
      <p className="text-lg font-medium mb-1">From 14.2s → 1.8s after AWS migration</p>
      <p className="text-base text-gray-600">Faster Pages + Better SEO = More Enquiries</p>
    </section>
  );
}
