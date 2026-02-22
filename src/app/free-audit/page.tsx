import { Metadata } from 'next';
import { buildSEO } from '@/lib/seo';
import FreeAuditClient from './FreeAuditClient';

export const metadata: Metadata = buildSEO({
  intent: "Free Website & Marketing Audit",
  description: "Get free review of your website, Google Ads, or analytics setup with clear recommendations. Same-day response from Cheshire digital marketing specialist.",
  canonicalPath: "/free-audit/",
});

export default function FreeAuditPage() {
  return <FreeAuditClient />;
}
