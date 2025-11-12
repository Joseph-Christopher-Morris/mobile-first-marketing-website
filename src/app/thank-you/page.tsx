import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title: "Thank You | Message Received",
  description: "Thanks for getting in touch! I've received your message and will reply the same day.",
  robots: "noindex, nofollow",
};

export default function ThankYouPage() {
  return (
    <Layout>
      <main className="py-24 bg-gray-50 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Thanks for Getting in Touch!
          </h1>

          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            I've received your message and will reply the same day with ideas, options, and next steps tailored to your project.
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What happens next?</h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-pink-600 mr-2">•</span>
                I'll review your enquiry and research your current setup
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-2">•</span>
                You'll receive a personal reply with specific recommendations
              </li>
              <li className="flex items-start">
                <span className="text-pink-600 mr-2">•</span>
                We can schedule a call to discuss your project in detail
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-pink-600 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Return to Home Page
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center bg-white text-pink-600 px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors border-2 border-pink-600"
            >
              Browse Services
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Need to get in touch about something else?{" "}
            <Link href="/contact" className="text-pink-600 hover:text-pink-700 font-medium">
              Send another message
            </Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
