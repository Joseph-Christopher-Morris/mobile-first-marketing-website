interface SpeedToEnquiriesProps {
  /** Optional custom heading */
  heading?: string;
  /** Optional supporting copy override */
  body?: string;
}

export default function SpeedToEnquiries({
  heading = 'A slow site loses enquiries before visitors even see what you offer',
  body = 'Every extra second your site takes to load, potential customers leave. They go to a competitor whose site loads faster. I build websites that load quickly so visitors stay long enough to get in touch. Faster load times mean more people see your offer and more enquiries land in your inbox.',
}: SpeedToEnquiriesProps) {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          {heading}
        </h2>
        <div className="mt-6 border-l-4 border-brand-pink pl-5">
          <p className="text-fluid-base md:text-lg text-gray-700 leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
