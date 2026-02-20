import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import FreeAuditClient from './FreeAuditClient';

export const metadata: Metadata = buildMetadata({
  intent: "Free Website Audit",
  qualifier: "for Cheshire Businesses",
  description: "Discover how your website performs against Cheshire East competitors with our free 10-point website audit. No obligation required.",
  canonicalPath: "/free-audit/",
});

export default function FreeAuditPage() {
  return <FreeAuditClient />;
}
