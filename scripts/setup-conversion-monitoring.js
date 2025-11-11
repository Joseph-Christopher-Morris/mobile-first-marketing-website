#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function setupConversionMonitoring() {
  console.log('📊 Setting up Conversion Monitoring for Photography Page...\n');
  
  // Create monitoring configuration
  const monitoringConfig = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    page: "/services/photography",
    trackingEvents: {
      galleryInteractions: {
        eventName: "photography_gallery_interaction",
        description: "User clicks on gallery images",
        parameters: {
          image_type: "editorial|local|campaign|clipping",
          image_position: "number",
          gallery_section: "string"
        }
      },
      ctaClicks: {
        eventName: "photography_cta_click",
        description: "User clicks on CTA buttons",
        parameters: {
          cta_type: "primary|secondary",
          cta_text: "string",
          page_section: "hero|gallery|footer"
        }
      },
      contactFormViews: {
        eventName: "photography_contact_view",
        description: "User views contact form",
        parameters: {
          referrer_section: "string",
          time_on_page: "number"
        }
      },
      bookingInquiries: {
        eventName: "photography_booking_inquiry",
        description: "User submits booking inquiry",
        parameters: {
          inquiry_type: "commercial|personal|editorial",
          form_completion_time: "number"
        }
      },
      credibilityViews: {
        eventName: "photography_credibility_view",
        description: "User views publication logos",
        parameters: {
          publication: "bbc|forbes|times",
          interaction_type: "view|hover|click"
        }
      },
      localFocusEngagement: {
        eventName: "photography_local_engagement",
        description: "User engages with local content",
        parameters: {
          content_type: "testimonials|statistics|location",
          engagement_duration: "number"
        }
      }
    },
    conversionGoals: {
      primary: {
        name: "Photography Booking Inquiry",
        eventName: "photography_booking_inquiry",
        value: 100,
        description: "User submits a photography booking inquiry form"
      },
      secondary: {
        name: "Contact Form View",
        eventName: "photography_contact_view",
        value: 25,
        description: "User views the contact form from photography page"
      },
      engagement: {
        name: "Gallery Deep Engagement",
        eventName: "photography_gallery_interaction",
        condition: "interaction_count >= 3",
        value: 10,
        description: "User interacts with 3+ gallery images"
      }
    },
    dashboardMetrics: {
      conversionRate: {
        name: "Photography Conversion Rate",
        calculation: "booking_inquiries / page_views * 100",
        target: 2.5,
        unit: "%"
      },
      galleryEngagement: {
        name: "Gallery Engagement Rate",
        calculation: "gallery_interactions / page_views * 100",
        target: 45,
        unit: "%"
      },
      averageTimeOnPage: {
        name: "Average Time on Page",
        calculation: "total_time / page_views",
        target: 120,
        unit: "seconds"
      },
      bounceRate: {
        name: "Bounce Rate",
        calculation: "single_page_sessions / total_sessions * 100",
        target: 60,
        unit: "%",
        reverse: true
      }
    },
    alertThresholds: {
      conversionRateDropAlert: {
        metric: "conversionRate",
        condition: "< 1.5",
        severity: "high",
        notification: "email"
      },
      highBounceRateAlert: {
        metric: "bounceRate",
        condition: "> 80",
        severity: "medium",
        notification: "dashboard"
      },
      lowEngagementAlert: {
        metric: "galleryEngagement",
        condition: "< 25",
        severity: "medium",
        notification: "dashboard"
      }
    }
  };
  
  // Save monitoring configuration
  const configPath = path.join('config', 'photography-conversion-monitoring.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(monitoringConfig, null, 2));
  
  console.log('✅ Conversion monitoring configuration created');
  console.log(`   Config file: ${configPath}`);
  
  // Create analytics dashboard HTML
  const dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photography Page Conversion Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .chart-container { position: relative; height: 300px; }
        h1 { text-align: center; color: #1f2937; }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-danger { color: #ef4444; }
    </style>
</head>
<body>
    <h1>Photography Page Conversion Dashboard</h1>
    
    <div class="dashboard">
        <div class="card">
            <div class="metric">
                <div class="metric-value" id="conversionRate">--</div>
                <div class="metric-label">Conversion Rate (%)</div>
            </div>
        </div>
        
        <div class="card">
            <div class="metric">
                <div class="metric-value" id="galleryEngagement">--</div>
                <div class="metric-label">Gallery Engagement (%)</div>
            </div>
        </div>
        
        <div class="card">
            <div class="metric">
                <div class="metric-value" id="avgTimeOnPage">--</div>
                <div class="metric-label">Avg Time on Page (min)</div>
            </div>
        </div>
        
        <div class="card">
            <div class="metric">
                <div class="metric-value" id="bounceRate">--</div>
                <div class="metric-label">Bounce Rate (%)</div>
            </div>
        </div>
        
        <div class="card">
            <h3>Conversion Funnel</h3>
            <div class="chart-container">
                <canvas id="funnelChart"></canvas>
            </div>
        </div>
        
        <div class="card">
            <h3>Gallery Interaction Heatmap</h3>
            <div class="chart-container">
                <canvas id="heatmapChart"></canvas>
            </div>
        </div>
        
        <div class="card">
            <h3>Conversion Trends (7 days)</h3>
            <div class="chart-container">
                <canvas id="trendsChart"></canvas>
            </div>
        </div>
        
        <div class="card">
            <h3>Traffic Sources</h3>
            <div class="chart-container">
                <canvas id="sourcesChart"></canvas>
            </div>
        </div>
    </div>
    
    <script>
        // Initialize dashboard with sample data
        function initializeDashboard() {
            // Sample metrics (replace with real GA4 data)
            document.getElementById('conversionRate').textContent = '2.1';
            document.getElementById('galleryEngagement').textContent = '38';
            document.getElementById('avgTimeOnPage').textContent = '1.8';
            document.getElementById('bounceRate').textContent = '65';
            
            // Conversion Funnel Chart
            const funnelCtx = document.getElementById('funnelChart').getContext('2d');
            new Chart(funnelCtx, {
                type: 'bar',
                data: {
                    labels: ['Page Views', 'Gallery Clicks', 'Contact Views', 'Inquiries'],
                    datasets: [{
                        label: 'Users',
                        data: [1000, 380, 150, 21],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: 'Conversion Funnel' }
                    }
                }
            });
            
            // Trends Chart
            const trendsCtx = document.getElementById('trendsChart').getContext('2d');
            new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Conversions',
                        data: [3, 5, 2, 8, 6, 4, 7],
                        borderColor: '#3b82f6',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
            // Sources Chart
            const sourcesCtx = document.getElementById('sourcesChart').getContext('2d');
            new Chart(sourcesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Organic Search', 'Direct', 'Social Media', 'Referral'],
                    datasets: [{
                        data: [45, 30, 15, 10],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        // Load dashboard on page load
        document.addEventListener('DOMContentLoaded', initializeDashboard);
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            console.log('Refreshing dashboard data...');
            // Add GA4 API calls here
        }, 300000);
    </script>
</body>
</html>`;
  
  const dashboardPath = 'photography-conversion-dashboard.html';
  fs.writeFileSync(dashboardPath, dashboardHTML);
  
  console.log('✅ Conversion dashboard created');
  console.log(`   Dashboard file: ${dashboardPath}`);
  
  // Create GA4 integration script
  const ga4Script = `// Photography Page GA4 Conversion Tracking
// Add this to your photography page component

// Track gallery interactions
function trackGalleryInteraction(imageType, position, section) {
  gtag('event', 'photography_gallery_interaction', {
    image_type: imageType,
    image_position: position,
    gallery_section: section,
    page_location: window.location.href
  });
}

// Track CTA clicks
function trackCTAClick(ctaType, ctaText, section) {
  gtag('event', 'photography_cta_click', {
    cta_type: ctaType,
    cta_text: ctaText,
    page_section: section,
    page_location: window.location.href
  });
}

// Track contact form views
function trackContactFormView(referrerSection, timeOnPage) {
  gtag('event', 'photography_contact_view', {
    referrer_section: referrerSection,
    time_on_page: timeOnPage,
    page_location: window.location.href
  });
}

// Track booking inquiries
function trackBookingInquiry(inquiryType, completionTime) {
  gtag('event', 'photography_booking_inquiry', {
    inquiry_type: inquiryType,
    form_completion_time: completionTime,
    page_location: window.location.href,
    value: 100 // Conversion value
  });
}

// Track credibility indicator interactions
function trackCredibilityView(publication, interactionType) {
  gtag('event', 'photography_credibility_view', {
    publication: publication,
    interaction_type: interactionType,
    page_location: window.location.href
  });
}

// Track local content engagement
function trackLocalEngagement(contentType, duration) {
  gtag('event', 'photography_local_engagement', {
    content_type: contentType,
    engagement_duration: duration,
    page_location: window.location.href
  });
}

// Auto-track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
  const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  if (scrollDepth > maxScrollDepth) {
    maxScrollDepth = scrollDepth;
    if (scrollDepth >= 25 && scrollDepth < 50) {
      gtag('event', 'scroll_depth_25', { page_location: window.location.href });
    } else if (scrollDepth >= 50 && scrollDepth < 75) {
      gtag('event', 'scroll_depth_50', { page_location: window.location.href });
    } else if (scrollDepth >= 75) {
      gtag('event', 'scroll_depth_75', { page_location: window.location.href });
    }
  }
});

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - startTime) / 1000);
  gtag('event', 'page_engagement_time', {
    engagement_time: timeOnPage,
    page_location: window.location.href
  });
});`;
  
  const scriptPath = 'scripts/photography-ga4-tracking.js';
  fs.writeFileSync(scriptPath, ga4Script);
  
  console.log('✅ GA4 tracking script created');
  console.log(`   Script file: ${scriptPath}`);
  
  // Create monitoring summary
  const summary = {
    setupComplete: true,
    timestamp: new Date().toISOString(),
    components: {
      conversionConfig: configPath,
      dashboard: dashboardPath,
      trackingScript: scriptPath
    },
    nextSteps: [
      "Integrate GA4 tracking code into photography page components",
      "Set up Google Analytics 4 conversion goals",
      "Configure dashboard to pull real GA4 data",
      "Set up automated reporting and alerts",
      "Monitor baseline metrics for 1-2 weeks before optimization"
    ],
    monitoringMetrics: Object.keys(monitoringConfig.dashboardMetrics),
    conversionGoals: Object.keys(monitoringConfig.conversionGoals)
  };
  
  const summaryPath = 'photography-conversion-monitoring-setup.json';
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n📊 Conversion Monitoring Setup Complete!');
  console.log('\n🎯 Key Metrics to Monitor:');
  Object.entries(monitoringConfig.dashboardMetrics).forEach(([key, metric]) => {
    console.log(`   • ${metric.name}: Target ${metric.target}${metric.unit}`);
  });
  
  console.log('\n🔔 Alert Thresholds:');
  Object.entries(monitoringConfig.alertThresholds).forEach(([key, alert]) => {
    console.log(`   • ${alert.metric} ${alert.condition} (${alert.severity} priority)`);
  });
  
  console.log('\n📈 Dashboard URL: file://' + path.resolve(dashboardPath));
  console.log('\n📝 Next Steps:');
  summary.nextSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
  
  return summary;
}

if (require.main === module) {
  setupConversionMonitoring();
}

module.exports = { setupConversionMonitoring };