# Site Metrics System - Quick Start Guide

## For Developers

### Getting Started
1. **Enable Site Metrics**: Navigate to `/admin/metrics`
2. **Configure GA** (optional): Go to `/admin/settings` > SEO & Analytics
3. **Test System**: Visit `/admin/metrics-testing`

### Key Files
- `src/components/admin/SiteMetricsDashboard.tsx` - Main dashboard
- `src/services/analytics/analyticsService.ts` - Core service
- `src/hooks/useRealAnalytics.ts` - Main React hook

### Quick Integration
```tsx
import { useRealAnalytics } from '@/hooks/useRealAnalytics';

function MyComponent() {
  const { analyticsData, loading, refreshData } = useRealAnalytics();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Visitors: {analyticsData?.visitors}</p>
      <button onClick={refreshData}>Refresh</button>
    </div>
  );
}
```

### Common Tasks

#### Add Custom Metric
```tsx
// 1. Update AnalyticsData interface in types.ts
export interface AnalyticsData {
  // existing fields...
  customMetric: number;
}

// 2. Update analytics service
async getRealAnalyticsData(): Promise<AnalyticsData> {
  return {
    // existing data...
    customMetric: await this.getCustomMetric()
  };
}
```

#### Add New Test
```tsx
// In useSiteMetricsTestSuite.ts
const testCustomFeature = useCallback(async (): Promise<TestResult> => {
  try {
    // Your test logic here
    return createTestResult('Custom Feature', 'pass', 'Working correctly');
  } catch (error) {
    return createTestResult('Custom Feature', 'fail', 'Test failed');
  }
}, []);
```

### Performance Best Practices
- Use throttled/debounced functions for frequent operations
- Monitor memory usage in production
- Clean up resources when components unmount
- Use lazy loading for non-critical scripts

### Troubleshooting
1. **Check console logs** - Look for "🔧 GA Debug:" messages
2. **Use testing dashboard** - Visit `/admin/metrics-testing`
3. **Check health status** - GA Health Check card shows detailed status
4. **Monitor edge cases** - Edge Case Monitor shows automatic handling

---

## For System Administrators

### Configuration
1. **Google Analytics Setup**
   - Get GA4 property ID (format: G-XXXXXXXXXX)
   - Add to Site Settings > SEO & Analytics
   - Test on Site Metrics page

2. **Performance Monitoring**
   - Monitor memory usage warnings
   - Check for browser extension conflicts
   - Review edge case handling logs

### Monitoring
- **Core Metrics**: Uptime, load speed, error rates
- **User Activity**: Real-time visitors, page views
- **System Health**: Database and storage status
- **GA Status**: Configuration and connection health

### Security Considerations
- GA scripts only load on metrics page
- Demo data generated locally when GA unavailable
- No sensitive data sent to analytics without consent
- CSP-compatible implementation

### Maintenance
- Edge cases handled automatically
- Local storage cleaned up periodically
- Memory optimization runs continuously
- Orphaned resources cleaned up automatically

---

*For complete documentation, see `docs/SITE_METRICS_DOCUMENTATION.md`*
