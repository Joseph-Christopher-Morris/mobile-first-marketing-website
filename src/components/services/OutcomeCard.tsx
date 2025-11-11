import React from 'react';

export interface OutcomeCardProps {
  metric: string;
  value: string;
  description: string;
  variant?: 'default' | 'primary' | 'success' | 'revenue';
  icon?: React.ReactNode;
  className?: string;
}

export const OutcomeCard: React.FC<OutcomeCardProps> = ({
  metric,
  value,
  description,
  variant = 'default',
  icon,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          card: 'bg-pink-50 border-pink-200',
          value: 'text-pink-600',
          metric: 'text-pink-800',
          description: 'text-pink-700'
        };
      case 'success':
        return {
          card: 'bg-green-50 border-green-200',
          value: 'text-green-600',
          metric: 'text-green-800',
          description: 'text-green-700'
        };
      case 'revenue':
        return {
          card: 'bg-purple-50 border-purple-200',
          value: 'text-purple-600',
          metric: 'text-purple-800',
          description: 'text-purple-700'
        };
      default:
        return {
          card: 'bg-white border-gray-200',
          value: 'text-pink-600',
          metric: 'text-gray-900',
          description: 'text-gray-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`rounded-lg border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${styles.card} ${className}`}>
      {/* Icon */}
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="p-2 rounded-full bg-white/50">
            {icon}
          </div>
        </div>
      )}

      {/* Value */}
      <div className={`text-3xl font-bold mb-2 text-center ${styles.value}`}>
        {value}
      </div>

      {/* Metric Label */}
      <div className={`text-lg font-semibold mb-3 text-center ${styles.metric}`}>
        {metric}
      </div>

      {/* Description */}
      <p className={`text-sm leading-relaxed text-center ${styles.description}`}>
        {description}
      </p>
    </div>
  );
};

// Specialized outcome cards for common ROI metrics
export const RevenueOutcomeCard: React.FC<{
  revenue: string;
  investment: string;
  description: string;
  className?: string;
}> = ({ revenue, investment, description, className }) => (
  <OutcomeCard
    metric="Revenue Generated"
    value={`${revenue} from ${investment}`}
    description={description}
    variant="revenue"
    className={className}
    icon={
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    }
  />
);

export const ConversionOutcomeCard: React.FC<{
  rate: string;
  description: string;
  className?: string;
}> = ({ rate, description, className }) => (
  <OutcomeCard
    metric="Conversion Rate"
    value={rate}
    description={description}
    variant="success"
    className={className}
    icon={
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    }
  />
);

export const LeadsOutcomeCard: React.FC<{
  count: string;
  source: string;
  description: string;
  className?: string;
}> = ({ count, source, description, className }) => (
  <OutcomeCard
    metric={`Leads from ${source}`}
    value={count}
    description={description}
    variant="primary"
    className={className}
    icon={
      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    }
  />
);

export const ROIOutcomeCard: React.FC<{
  percentage: string;
  description: string;
  className?: string;
}> = ({ percentage, description, className }) => (
  <OutcomeCard
    metric="Return on Investment"
    value={percentage}
    description={description}
    variant="success"
    className={className}
    icon={
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    }
  />
);

export default OutcomeCard;
