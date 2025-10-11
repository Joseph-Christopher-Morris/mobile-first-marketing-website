'use client';

import React from 'react';

interface AnalyticsChartProps {
  className?: string;
  title?: string;
  metric?: string;
  value?: string;
  change?: string;
  data?: number[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  className = '',
  title = 'Click-through rate',
  metric = '2.9%',
  value = '446',
  change = '+15.2%',
  data = [420, 520, 480, 580, 620, 580, 480, 380, 420, 480, 520, 580, 620, 580, 520, 480, 520, 580, 620, 580, 520, 480, 420, 380]
}) => {
  // Generate SVG path from data points
  const generatePath = (points: number[]) => {
    const width = 300;
    const height = 120;
    const padding = 20;
    
    const maxValue = Math.max(...points);
    const minValue = Math.min(...points);
    const range = maxValue - minValue;
    
    const stepX = (width - padding * 2) / (points.length - 1);
    
    let path = '';
    
    points.forEach((point, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((point - minValue) / range) * (height - padding * 2);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  return (
    <div className={`bg-white p-6 rounded-lg ${className}`}>
      {/* Header Stats */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{metric}</div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-xs text-gray-500 mt-1">
            The percentage of people who clicked on your ads after viewing them.
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total clicks</div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-green-600 font-medium">{change}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width="300" height="120" className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="30" height="24" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 24" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <path
            d={generatePath(data)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const width = 300;
            const height = 120;
            const padding = 20;
            const maxValue = Math.max(...data);
            const minValue = Math.min(...data);
            const range = maxValue - minValue;
            const stepX = (width - padding * 2) / (data.length - 1);
            const x = padding + index * stepX;
            const y = height - padding - ((point - minValue) / range) * (height - padding * 2);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#6366f1"
                className="opacity-60"
              />
            );
          })}
        </svg>
        
        {/* Time labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>7/1</span>
          <span>7/8</span>
          <span>7/15</span>
          <span>7/22</span>
          <span>7/29</span>
          <span>8/5</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;