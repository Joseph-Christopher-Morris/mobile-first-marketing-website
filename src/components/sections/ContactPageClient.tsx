'use client';

import { siteConfig } from '@/config/site';
import Analytics from '@/lib/analytics';

interface ContactPageClientProps {
  children: React.ReactNode;
}

export function ContactPageClient({ children }: ContactPageClientProps) {
  const handlePhoneClick = () => {
    Analytics.trackPhoneCall(siteConfig.contact.phone);
  };

  const handleEmailClick = () => {
    Analytics.trackEmailClick(siteConfig.contact.email);
  };

  return <div>{children}</div>;
}

interface ContactLinkProps {
  type: 'phone' | 'email';
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function ContactLink({
  type,
  value,
  children,
  className = '',
}: ContactLinkProps) {
  const handleClick = () => {
    if (type === 'phone') {
      Analytics.trackPhoneCall(value);
    } else if (type === 'email') {
      Analytics.trackEmailClick(value);
    }
  };

  const href =
    type === 'phone' ? `tel:${value.replace(/\D/g, '')}` : `mailto:${value}`;

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
