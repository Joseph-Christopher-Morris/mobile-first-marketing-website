import Image from 'next/image';

interface AuthorityProofBlockProps {
  /** Array of publication proof items */
  publications: Array<{
    name: string;
    imageSrc: string;
    imageAlt: string;
    caption: string;
  }>;
}

export default function AuthorityProofBlock({
  publications,
}: AuthorityProofBlockProps) {
  // Filter out unsupported publications (those without valid image/proof content)
  const supported = publications.filter(
    (pub) => pub.name && pub.imageSrc && pub.imageAlt && pub.caption
  );

  if (supported.length === 0) return null;

  return (
    <section className="py-14 md:py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
          Images used in real media, commercial, and editorial contexts
        </h2>
        <p className="mt-3 text-fluid-base text-gray-600">
          Photography published by trusted brands and publications.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {supported.map((pub) => (
            <div
              key={pub.name}
              className="rounded-lg overflow-hidden bg-gray-50"
            >
              <div className="relative h-48">
                <Image
                  src={pub.imageSrc}
                  alt={pub.imageAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-brand-black">
                  {pub.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{pub.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
