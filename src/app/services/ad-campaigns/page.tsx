import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import AdCampaignsClient from './AdCampaignsClient';

export const metadata: Metadata = buildMetadata({
  intent: "Google Ads Campaign Management",
  qualifier: "in Cheshire",
  description: "Performance-focused ad campaigns with analytics tracking, conversion optimisation and real campaign reporting.",
  canonicalPath: "/services/ad-campaigns/",
  ogImage: "/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp",
});

export default function AdCampaignsPage() {
  return <AdCampaignsClient />;
}
