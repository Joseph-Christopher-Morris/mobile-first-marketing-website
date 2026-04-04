'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FAQItemData {
  question: string;
  answerText: string;
  internalLink?: { href: string; label: string };
}

interface FAQSectionProps {
  sectionSlug: string;
  title: string;
  items: FAQItemData[];
}

// ---------------------------------------------------------------------------
// Accordion item
// ---------------------------------------------------------------------------

function FAQAccordionItem({
  question,
  answerText,
  internalLink,
  questionId,
  answerId,
  isOpen,
  onToggle,
}: {
  question: string;
  answerText: string;
  internalLink?: { href: string; label: string };
  questionId: string;
  answerId: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={answerId}
        id={questionId}
      >
        <span className="text-lg font-semibold text-slate-900 pr-4">
          {question}
        </span>
        <svg
          className={`w-6 h-6 text-brand-pink flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="p-6 pt-0 text-gray-700 leading-relaxed">
          <p>{answerText}</p>
          {internalLink && (
            <p className="mt-3">
              <Link
                href={internalLink.href}
                className="text-brand-pink hover:text-brand-pink2 underline underline-offset-2 transition-colors"
              >
                {internalLink.label}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function FAQSection({ sectionSlug, title, items }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <FAQAccordionItem
              key={`faq-${sectionSlug}-${index}`}
              question={item.question}
              answerText={item.answerText}
              internalLink={item.internalLink}
              questionId={`faq-${sectionSlug}-${index}-question`}
              answerId={`faq-${sectionSlug}-${index}-answer`}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
