import React from 'react';
import { usePageViewTracking } from '@/hooks/usePageViewTracking';

interface PageViewTrackerProps {
  children: React.ReactNode;
}

/**
 * Component that tracks page views for analytics.
 * Must be placed inside Router context.
 */
const PageViewTracker: React.FC<PageViewTrackerProps> = ({ children }) => {
  usePageViewTracking();
  return <>{children}</>;
};

export default PageViewTracker;
