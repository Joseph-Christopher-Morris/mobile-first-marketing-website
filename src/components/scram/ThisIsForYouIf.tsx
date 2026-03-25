interface ThisIsForYouIfProps {
  /** Array of condition strings */
  conditions: string[];
  /** Optional heading override */
  heading?: string;
}

export default function ThisIsForYouIf({
  conditions,
  heading,
}: ThisIsForYouIfProps) {
  if (conditions.length === 0) return null;

  return (
    <section className="py-14 md:py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          {heading || 'This is for you if'}
        </h2>

        <ul className="mt-8 space-y-4" role="list">
          {conditions.map((condition) => (
            <li
              key={condition}
              className="flex items-start gap-3 text-fluid-base md:text-lg text-gray-700"
            >
              <span
                className="mt-1 flex-shrink-0 text-green-600 font-bold"
                aria-hidden="true"
              >
                ✓
              </span>
              {condition}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
