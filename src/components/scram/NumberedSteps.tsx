interface Step {
  /** Step number (displayed as "1.", "2.", etc.) */
  number: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
}

interface NumberedStepsProps {
  /** Section heading, e.g. "How It Works" */
  heading?: string;
  /** Array of steps */
  steps: Step[];
}

export default function NumberedSteps({
  heading,
  steps,
}: NumberedStepsProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
            {heading}
          </h2>
        )}

        <div className={heading ? 'mt-8 space-y-8' : 'space-y-8'}>
          {steps.map((step) => (
            <div key={step.number} className="border-l-4 border-brand-pink pl-5">
              <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                {step.number}. {step.title}
              </h3>
              <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
