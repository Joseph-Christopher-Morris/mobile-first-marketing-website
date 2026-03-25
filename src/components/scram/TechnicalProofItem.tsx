interface TechnicalProofItemProps {
  /** Short heading for the proof item */
  heading: string;
  /** Single metric line, e.g. "71 → 91" */
  metric: string;
  /** One sentence explaining why this matters */
  description: string;
}

export default function TechnicalProofItem({
  heading,
  metric,
  description,
}: TechnicalProofItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 max-w-md">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {heading}
      </p>
      <p className="mt-1 text-lg font-bold text-brand-black">{metric}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}
