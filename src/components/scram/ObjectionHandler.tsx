interface Objection {
  question: string;
  answer: string;
}

interface ObjectionHandlerProps {
  /** Section heading */
  heading?: string;
  /** Array of objection Q&A pairs */
  objections: Objection[];
}

export default function ObjectionHandler({
  heading = 'Common concerns',
  objections,
}: ObjectionHandlerProps) {
  if (!objections || objections.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          {heading}
        </h2>

        <dl className="mt-8 space-y-8">
          {objections.map((objection, index) => (
            <div key={index} className="border-l-4 border-brand-pink pl-5">
              <dt className="text-fluid-base md:text-lg font-semibold text-brand-black">
                {objection.question}
              </dt>
              <dd className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                {objection.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
