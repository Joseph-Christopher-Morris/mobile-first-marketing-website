import Image from "next/image";

type PressVariant = "home" | "photography";

const HOME_LOGOS = [
  { name: "BBC", src: "/images/press-logos/bbc-logo.svg" },
  { name: "Forbes", src: "/images/press-logos/forbes-logo.svg" },
  { name: "Financial Times", src: "/images/press-logos/financial-times-logo.svg" },
  { name: "CNN", src: "/images/press-logos/cnn-logo.svg" },
  { name: "Daily Mail", src: "/images/press-logos/daily-mail-logo.svg" },
  { name: "Business Insider", src: "/images/press-logos/business-insider-logo.svg" },
];

const PHOTO_LOGOS = [
  { name: "BBC", src: "/images/press-logos/bbc-logo.svg" },
  { name: "Forbes", src: "/images/press-logos/forbes-logo.svg" },
  { name: "Financial Times", src: "/images/press-logos/financial-times-logo.svg" },
  { name: "AutoTrader", src: "/images/press-logos/autotrader-logo.svg" },
];

type Props = {
  variant: PressVariant;
  className?: string;
};

export function PressLogos({ variant, className = "" }: Props) {
  const logos = variant === "home" ? HOME_LOGOS : PHOTO_LOGOS;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-4 ${className}`}
      aria-label="Publications where my work has been featured"
    >
      {logos.map((logo) => (
        <div key={logo.name} className="h-8 flex items-center">
          <Image
            src={logo.src}
            alt={`${logo.name} logo`}
            width={140}
            height={32}
            className="h-8 w-auto object-contain"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
