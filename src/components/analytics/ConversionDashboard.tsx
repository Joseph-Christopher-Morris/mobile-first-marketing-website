'use client';

import { useState, useEffect } from 'react';
import { getConversionAnalytics, clearAnalyticsData } from './ConversionTracker';
import { getCTAAnalytics } from '../services/EnhancedCTA';

interface ConversionDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function ConversionDashboard({ isVisible = false, onClose }: ConversionDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [ctaAnalytics, setCTAAnalytics] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const conversionData = getConversionAnalytics();
      const ctaData = getCTAAnalytics();
      setAnalytics(conversionData);
      setCTAAnalytics(ctaData);
    }
  }, [isVisible, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalyticsData();
      setRefreshKey(prev => prev + 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Photography Conversion Analytics</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-brand-pink text-white rounded-lg hover:bg-brand-pink2 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Conversion Overview */}
          {analytics && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Conversion Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.conversions.total}</div>
                  <div className="text-sm text-blue-800">Total Conversions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.galleryEngagement.total}</div>
                  <div className="text-sm text-green-800">Gallery Interactions</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.heatMap.clicks}</div>
                  <div className="text-sm text-purple-800">Heat Map Clicks</div>
                </div>
              </div>

              {/* Conversion Goals Breakdown */}
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-3">Conversions by Goal</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.conversions.byGoal).map(([goal, count]: [string, any]) => (
                    <div key={goal} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="bg-brand-pink text-white px-2 py-1 rounded text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA Performance */}
          {ctaAnalytics && (
            <div>
              <h3 className="text-xl font-semibold mb-4">CTA Performance</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">{ctaAnalytics.totalClicks}</div>
                <div className="text-sm text-gray-600 mb-4">Total CTA Clicks</div>

                <div className="space-y-2">
                  {Object.entries(ctaAnalytics.variantPerformance).map(([variant, data]: [string, any]) => (
                    <div key={variant} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{variant.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="text-right">
                        <div className="font-bold">{data.clicks} clicks</div>
                        <div className="text-xs text-gray-500">
                          Last: {data.lastClick ? new Date(data.lastClick).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gallery Engagement */}
          {analytics && analytics.galleryEngagement.total > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Gallery Engagement</h3>
              <div className="space-y-2">
                {Object.entries(analytics.galleryEngagement.byAction).map(([action, count]: [string, any]) => (
                  <div key={action} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heat Map Summary */}
          {analytics && analytics.heatMap.clicks > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">User Interaction Heat Map</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analytics.heatMap.clicks}</div>
                  <div className="text-sm text-orange-800">Click Events</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{analytics.heatMap.movements}</div>
                  <div className="text-sm text-indigo-800">Mouse Movements</div>
                </div>
              </div>
            </div>
          )}

          {/* Export Data */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Export Data</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const data = { analytics, ctaAnalytics };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `photography-analytics-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  const csvData = analytics?.conversions.data.map((conv: any) => ({
                    goal: conv.event_label,
                    timestamp: conv.custom_parameters?.timestamp,
                    page: conv.custom_parameters?.page_url,
                    value: conv.value
                  })) || [];

                  const csvContent = [
                    ['Goal', 'Timestamp', 'Page', 'Value'],
                    ...csvData.map((row: any) => [row.goal, row.timestamp, row.page, row.value])
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `photography-conversions-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to show analytics trigger (for development/testing)
export function AnalyticsTrigger() {
  const [showDashboard, setShowDashboard] = useState(false);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowDashboard(true)}
        className="fixed bottom-4 right-4 bg-brand-pink text-white p-3 rounded-full shadow-lg hover:bg-brand-pink2 transition-colors z-40"
        title="View Analytics Dashboard"
      >
        📊
      </button>
      <ConversionDashboard
        isVisible={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </>
  );
}
