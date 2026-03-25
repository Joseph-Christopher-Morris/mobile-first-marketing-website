const comparisons = [
  {
    label: 'Direct communication',
    direct: 'You talk to the person doing the work. No middlemen, no delays.',
    agency: 'Requests pass through account managers before reaching the team.',
  },
  {
    label: 'Practical implementation',
    direct: 'I focus on what gets results for your business.',
    agency: 'Larger teams often follow rigid processes that add time and cost.',
  },
  {
    label: 'Accountability',
    direct: 'One person owns your project from start to finish.',
    agency: 'Work can shift between team members as priorities change.',
  },
];

export default function AntiAgencyBlock() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          Working with me vs. a larger agency
        </h2>
        <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
          Agencies do great work for the right projects. But if you run a local
          business and want someone who gets stuck in from day one, here is how
          working directly compares.
        </p>

        <div className="mt-8 space-y-8">
          {comparisons.map((item) => (
            <div key={item.label} className="border-l-4 border-brand-pink pl-5">
              <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                {item.label}
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  <span className="font-semibold text-brand-black">Direct: </span>
                  {item.direct}
                </p>
                <p className="text-fluid-base md:text-lg text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-600">Agency: </span>
                  {item.agency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
