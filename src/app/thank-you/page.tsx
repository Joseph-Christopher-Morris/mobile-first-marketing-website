import { buildSEO } from "@/lib/seo";
import Conversion from "./Conversion";

export const metadata = buildSEO({
  intent: "Thank You",
  description: "Thanks for your message — I'll get back to you shortly.",
  canonicalPath: "/thank-you/",
  noindex: true,
});

export default function ThankYouPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <Conversion />
      <h1 className="text-3xl font-semibold mb-4">Thank you</h1>
      <p className="text-lg text-slate-600">I will reply the same day during business hours.</p>
      
      <div className="mt-8 p-6 bg-slate-50 rounded-lg">
        <p className="font-semibold text-slate-800 mb-2">Business Hours (UK time)</p>
        <p className="text-slate-600">Monday to Friday: 09:00 – 18:00</p>
        <p className="text-slate-600">Saturday: 10:00 – 14:00</p>
        <p className="text-slate-600">Sunday: 10:00 – 16:00</p>
      </div>

      <div className="mt-8">
        <a 
          href="/" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Return to Home
        </a>
      </div>
    </main>
  );
}
