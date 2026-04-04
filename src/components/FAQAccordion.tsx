'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  title?: string;
  /** Optional section slug for globally unique IDs, e.g. "website-conversion" */
  sectionSlug?: string;
}

export function FAQAccordion({ faqs, title = 'Frequently Asked Questions', sectionSlug }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const questionId = (index: number) =>
    sectionSlug ? `faq-${sectionSlug}-${index}-question` : `faq-question-${index}`;
  const answerId = (index: number) =>
    sectionSlug ? `faq-${sectionSlug}-${index}-answer` : `faq-answer-${index}`;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
          {title}
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={answerId(index)}
                id={questionId(index)}
              >
                <span className="text-lg font-semibold text-slate-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-brand-pink flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
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
                id={answerId(index)}
                role="region"
                aria-labelledby={questionId(index)}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
