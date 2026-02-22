import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import FreeAuditClient from './FreeAuditClient';

export const metadata: Metadata = buildMetadata({
  intent: "Free Website & Marketing Audit",
  description: "Get a free review of your website, ads, or analytics setup with clear recommendations.",
  canonicalPath: "/free-audit/",
});

export default function FreeAuditPage() {
  return <FreeAuditClient />;
}
