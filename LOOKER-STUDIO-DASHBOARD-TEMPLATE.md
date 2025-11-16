# Looker Studio Dashboard Template

## Dashboard Structure

### Section 1: Traffic Overview (GA4)
- **Scorecard**: Total Users (current period)
- **Scorecard**: Sessions (current period)
- **Scorecard**: Engagement Rate (%)
- **Scorecard**: Avg Session Duration

### Section 2: Conversion Performance (GA4)
- **Scorecard**: Form Submissions (with % change)
- **Scorecard**: CTA Clicks (with % change)
- **Scorecard**: Phone Calls (with % change)
- **Time Series Chart**: Conversions over time

### Section 3: Behavior Insights (Clarity)
- **Scorecard**: Avg Scroll Depth (%)
- **Scorecard**: Rage Clicks
- **Scorecard**: Dead Clicks
- **Scorecard**: Session Recordings Count

### Section 4: Top Pages (Blended)
- **Table**: Page Path, Page Views (GA4), Clicks (Clarity), Scroll Depth (Clarity)
- **Sort by**: Page Views descending
- **Limit**: Top 10 pages

### Section 5: Device Insights (GA4)
- **Pie Chart**: Sessions by Device Category
- **Bar Chart**: Conversion Rate by Device

### Section 6: Geographic Focus (GA4)
- **Geo Map**: Sessions by City (UK focus)
- **Table**: Top Cities (Cheshire, Nantwich, Crewe highlighted)

### Section 7: Traffic Sources (GA4)
- **Pie Chart**: Sessions by Source/Medium
- **Table**: Top 10 Traffic Sources with Conversion Rate

### Section 8: Session Recordings Link (Clarity)
- **Text Box**: Link to Clarity dashboard
- **URL**: https://clarity.microsoft.com/projects/view/u4yftkmpxx

## Data Blending Configuration

**Join Key**: Page Path  
**Left Source**: GA4 (Primary)  
**Right Source**: Clarity (Secondary)  
**Join Type**: Left Outer Join

## Filters

- **Date Range**: Last 30 days (default)
- **Device Category**: All, Mobile, Desktop, Tablet
- **Page Path**: Contains filter
- **City**: Cheshire, Nantwich, Crewe

## Styling

- **Theme**: Light
- **Primary Color**: #FF2B6A (brand pink)
- **Secondary Color**: #0B0B0B (brand black)
- **Font**: Inter

---

**Full guide**: GA4-CLARITY-LOOKER-STUDIO-INTEGRATION.md
