import { Metadata } from 'next';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import AdCampaignsClient from './AdCampaignsClient';

export const metadata: Metadata = generateSocialMetadata({
  pageType: 'service',
  content: {
    title: 'Google Ads Campaign Management',
    description: 'Performance-focused Google Ads with conversion tracking and clear ROI reporting. Setup from £90, management from £150/month for Cheshire small businesses.',
    image: '/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
  },
  canonicalPath: '/services/ad-campaigns',
});

export default function AdCampaignsPage() {
  return <AdCampaignsClient />;
}
