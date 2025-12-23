import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

// Generate or retrieve a persistent visitor ID
const getVisitorId = (): string => {
  const key = 'visitor_id';
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
};

// Generate or retrieve a session ID (expires after 30 minutes of inactivity)
const getSessionId = (): string => {
  const key = 'session_id';
  const timestampKey = 'session_timestamp';
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  const existingSession = sessionStorage.getItem(key);
  const lastTimestamp = sessionStorage.getItem(timestampKey);
  const now = Date.now();
  
  if (existingSession && lastTimestamp && (now - parseInt(lastTimestamp)) < sessionTimeout) {
    sessionStorage.setItem(timestampKey, now.toString());
    return existingSession;
  }
  
  const newSession = crypto.randomUUID();
  sessionStorage.setItem(key, newSession);
  sessionStorage.setItem(timestampKey, now.toString());
  return newSession;
};

interface TrackPageViewOptions {
  contentType?: string;
  contentId?: string;
  pageTitle?: string;
}

export const trackPageView = async (
  organizationId: string | null,
  pagePath: string,
  options: TrackPageViewOptions = {}
) => {
  // Don't track admin pages
  if (pagePath.startsWith('/admin') || pagePath.startsWith('/auth')) {
    return;
  }

  try {
    await supabase.from('page_views').insert({
      organization_id: organizationId,
      page_path: pagePath,
      page_title: options.pageTitle || document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      content_type: options.contentType || null,
      content_id: options.contentId || null,
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics
    console.debug('Page view tracking failed:', error);
  }
};

export const usePageViewTracking = () => {
  const location = useLocation();
  const { organization } = useCurrentOrganization();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Avoid double-tracking the same path
    if (lastTrackedPath.current === location.pathname) {
      return;
    }
    
    lastTrackedPath.current = location.pathname;
    
    // Small delay to ensure page title is updated
    const timer = setTimeout(() => {
      trackPageView(organization?.id || null, location.pathname);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, organization?.id]);
};

export default usePageViewTracking;
