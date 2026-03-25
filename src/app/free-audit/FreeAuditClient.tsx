'use client';

import { useEffect } from 'react';
import { AuditForm } from '@/components/AuditForm';

export default function FreeAuditClient() {
  useEffect(() => {
    sessionStorage.setItem('visited_audit_page', 'true');
  }, []);

  return (
    <>
      {/* What you get */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            What you get
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Clear issues
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>What is confusing visitors</li>
                <li>What is missing from the page</li>
                <li>What is causing people to leave</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 bg-white shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Simple actions
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>What to change first</li>
                <li>What to prioritise</li>
                <li>What will make the biggest difference</li>
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Short written breakdown. Within 24 hours. Free.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Send me your website
            </h2>
            <p className="mb-8 text-gray-600">
              Enter your details and I will reply within 24 hours.
            </p>
            <AuditForm />
          </div>
        </div>
      </section>
    </>
  );
}
