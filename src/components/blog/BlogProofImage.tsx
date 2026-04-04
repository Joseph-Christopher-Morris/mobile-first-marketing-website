import Image from 'next/image';

type BlogProofImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  caption?: string;
};

export default function BlogProofImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  caption,
}: BlogProofImageProps) {
  return (
    <figure className={`w-full max-w-3xl mx-auto px-4 sm:px-0 ${className}`}>
      <div className="w-full bg-gray-50 rounded-xl p-2 sm:p-3 border border-gray-100">
        <p className="text-xs text-red-600 break-all">{src}</p>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="w-full h-auto rounded-lg"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-gray-600 text-center">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
