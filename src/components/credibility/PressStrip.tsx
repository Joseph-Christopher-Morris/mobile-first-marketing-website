import React from 'react';

const OUTLETS = [
  'BBC',
  'Forbes',
  'Financial Times',
  'CNN',
  'AutoTrader',
  'Daily Mail',
  'Business Insider',
];

export function PressStrip() {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <p className="text-[11px] sm:text-xs tracking-[0.14em] uppercase font-semibold text-white/90 text-center">
        Trusted by local businesses and photos licenced in:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-white/90 text-sm sm:text-base">
        {OUTLETS.map((name) => (
          <span key={name} className="whitespace-nowrap">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
