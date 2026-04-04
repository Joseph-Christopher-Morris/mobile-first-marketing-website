interface FAQNextStepsProps {
  title: string;
  steps: readonly string[] | string[];
}

export default function FAQNextSteps({ title, steps }: FAQNextStepsProps) {
  return (
    <section className="bg-gray-50 py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
          {title}
        </h2>
        <ol className="space-y-4 text-gray-700 text-base md:text-lg">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-pink text-white text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
