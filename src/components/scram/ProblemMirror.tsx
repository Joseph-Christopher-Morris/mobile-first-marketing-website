interface ProblemMirrorProps {
  /** The frustration statement, e.g. "My website looks fine but no one contacts me" */
  statement: string;
  /** Optional follow-up that connects to the solution */
  followUp?: string;
}

export default function ProblemMirror({ statement, followUp }: ProblemMirrorProps) {
  if (!statement || statement.trim() === '') {
    return null;
  }

  return (
    <blockquote className="border-l-4 border-brand-pink pl-5 py-3 my-8">
      <p className="text-fluid-base md:text-lg italic text-gray-700">
        &ldquo;{statement}&rdquo;
      </p>
      {followUp && (
        <p className="mt-2 text-sm md:text-base text-gray-600">
          {followUp}
        </p>
      )}
    </blockquote>
  );
}
