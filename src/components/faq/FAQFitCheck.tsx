interface FAQFitCheckProps {
  title: string;
  items: readonly string[] | string[];
}

export default function FAQFitCheck({ title, items }: FAQFitCheckProps) {
  return (
    <section className="bg-white py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
          {title}
        </h2>
        <ul className="space-y-3 text-gray-700 text-base md:text-lg">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 text-brand-pink" aria-hidden="true">
                &#8226;
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
