
export interface AnalyticsData {
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: { desktop: number; mobile: number; tablet: number };
  trafficSources: { organic: number; direct: number; referral: number; social: number };
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  databaseHealth: 'healthy' | 'degraded' | 'down';
  storageHealth: 'healthy' | 'degraded' | 'down';
}
