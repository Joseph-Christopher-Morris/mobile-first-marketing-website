import React from 'react';
import Image from 'next/image';

export interface ProofElementProps {
  type: 'savings' | 'performance' | 'metric';
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  metric?: {
    value: string;
    label: string;
    improvement?: string;
  };
  className?: string;
}

export const ProofElement: React.FC<ProofElementProps> = ({
  type,
  title,
  description,
  imageSrc,
  imageAlt,
  metric,
  className = ''
}) => {
  if (type === 'metric' && metric) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 text-center ${className}`}>
        <div className="text-3xl font-bold text-pink-600 mb-2">
          {metric.value}
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {metric.label}
        </div>
        {metric.improvement && (
          <div className="text-sm text-green-600 font-medium">
            {metric.improvement}
          </div>
        )}
        {description && (
          <p className="mt-3 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
    );
  }

  if (type === 'savings' && imageSrc) {
    return (
      <div className={`bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {title}
          </h3>
        )}
        <div className="relative w-full max-w-md mx-auto">
          <Image
            src={imageSrc}
            alt={imageAlt || 'Cost savings proof'}
            width={400}
            height={300}
            className="w-full h-auto rounded-lg shadow-md"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        </div>
        {description && (
          <p className="mt-4 text-center text-gray-700 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }

  if (type === 'performance' && imageSrc) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        {title && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              {title}
            </h3>
          </div>
        )}
        <div className="p-6">
          <div className="relative w-full">
            <Image
              src={imageSrc}
              alt={imageAlt || 'Performance improvement proof'}
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-sm border border-gray-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
            />
          </div>
          {description && (
            <p className="mt-4 text-center text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Fallback for unsupported configurations
  return (
    <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600">
          {description}
        </p>
      )}
    </div>
  );
};

// Specialized components for common use cases
export const SavingsProof: React.FC<{
  imageSrc: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  className?: string;
}> = ({ imageSrc, imageAlt, title, description, className }) => (
  <ProofElement
    type="savings"
    imageSrc={imageSrc}
    imageAlt={imageAlt}
    title={title}
    description={description}
    className={className}
  />
);

export const PerformanceProof: React.FC<{
  imageSrc: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  className?: string;
}> = ({ imageSrc, imageAlt, title, description, className }) => (
  <ProofElement
    type="performance"
    imageSrc={imageSrc}
    imageAlt={imageAlt}
    title={title}
    description={description}
    className={className}
  />
);

export const MetricProof: React.FC<{
  value: string;
  label: string;
  improvement?: string;
  description?: string;
  className?: string;
}> = ({ value, label, improvement, description, className }) => (
  <ProofElement
    type="metric"
    metric={{ value, label, improvement }}
    description={description}
    className={className}
  />
);

export default ProofElement;
