import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import AdCampaignsClient from './AdCampaignsClient';

export const metadata: Metadata = buildMetadata({
  intent: "Google Ads Management",
  qualifier: "for Cheshire Businesses",
  description: "Stop paying for clicks that don't turn into customers. I help Cheshire businesses run simple, targeted ad campaigns that actually get your phone ringing.",
  canonicalPath: "/services/ad-campaigns/",
  ogImage: "/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp",
});

export default function AdCampaignsPage() {
  return <AdCampaignsClient />;
}
