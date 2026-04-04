interface ProofItem {
  description: string;
}

interface FAQProofStripProps {
  title: string;
  items: readonly ProofItem[] | ProofItem[];
}

export default function FAQProofStrip({ title, items }: FAQProofStripProps) {
  return (
    <section className="bg-gray-50 py-12 md:py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.description}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <span className="mt-0.5 text-brand-pink" aria-hidden="true">
                &#10003;
              </span>
              <p className="text-gray-800 text-sm md:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
