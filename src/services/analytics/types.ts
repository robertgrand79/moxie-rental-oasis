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

export interface GAInitializationStatus {
  gaInitialized: boolean;
  hasGtag: boolean;
  gaId: string | null;
  lastCheck: number;
  error?: string;
}

export interface GAHealthCheck {
  status: 'healthy' | 'warning' | 'error' | 'not_configured';
  message: string;
  details?: {
    configurationValid: boolean;
    scriptLoaded: boolean;
    gtagAvailable: boolean;
    testSuccessful: boolean;
  };
  suggestedActions?: string[];
}