/**
 * Product Analytics Service
 * Tracks key user actions for both owners and guests
 */

import { supabase } from '@/integrations/supabase/client';

export type OwnerEvent = 
  | 'account_created'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'first_property_added'
  | 'property_added'
  | 'property_updated'
  | 'property_deleted'
  | 'site_published'
  | 'site_unpublished'
  | 'custom_domain_configured'
  | 'custom_domain_verified'
  | 'first_booking_received'
  | 'booking_received'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'subscription_started'
  | 'subscription_changed'
  | 'subscription_cancelled'
  | 'payment_received'
  | 'message_sent'
  | 'automation_created'
  | 'integration_connected'
  | 'team_member_invited'
  | 'settings_updated';

export type GuestEvent = 
  | 'site_visited'
  | 'property_viewed'
  | 'property_gallery_viewed'
  | 'availability_checked'
  | 'booking_started'
  | 'booking_step_completed'
  | 'booking_completed'
  | 'booking_abandoned'
  | 'payment_completed'
  | 'payment_failed'
  | 'chat_initiated'
  | 'chat_message_sent'
  | 'review_submitted'
  | 'contact_form_submitted'
  | 'newsletter_subscribed'
  | 'property_shared';

type EventType = OwnerEvent | GuestEvent;

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface AnalyticsUser {
  id: string;
  type: 'owner' | 'guest';
  organizationId?: string;
  email?: string;
  properties?: Record<string, any>;
}

class ProductAnalytics {
  private static instance: ProductAnalytics;
  private user: AnalyticsUser | null = null;
  private sessionId: string;
  private pageviewQueue: { page: string; timestamp: Date; referrer?: string }[] = [];
  private eventQueue: { event: EventType; properties: EventProperties; timestamp: Date }[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): ProductAnalytics {
    if (!ProductAnalytics.instance) {
      ProductAnalytics.instance = new ProductAnalytics();
    }
    return ProductAnalytics.instance;
  }

  init(): void {
    if (this.initialized) return;

    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track initial pageview
    this.trackPageview(window.location.pathname);

    this.initialized = true;
    console.log('📊 Product Analytics initialized');
  }

  identify(user: AnalyticsUser): void {
    this.user = user;
    
    // Track identification
    this.persistEvent('user_identified', {
      userId: user.id,
      userType: user.type,
      organizationId: user.organizationId,
    });
  }

  reset(): void {
    this.user = null;
    this.sessionId = this.generateSessionId();
  }

  // Owner Event Tracking
  trackOwnerEvent(event: OwnerEvent, properties: EventProperties = {}): void {
    this.track(event, {
      ...properties,
      userType: 'owner',
    });
  }

  // Guest Event Tracking
  trackGuestEvent(event: GuestEvent, properties: EventProperties = {}): void {
    this.track(event, {
      ...properties,
      userType: 'guest',
    });
  }

  // Generic tracking
  track(event: EventType, properties: EventProperties = {}): void {
    const enrichedProperties = this.enrichProperties(properties);
    
    this.eventQueue.push({
      event,
      properties: enrichedProperties,
      timestamp: new Date(),
    });

    console.log(`📊 Event tracked: ${event}`, enrichedProperties);

    // Flush if queue is large
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  trackPageview(page: string, referrer?: string): void {
    this.pageviewQueue.push({
      page,
      timestamp: new Date(),
      referrer: referrer || document.referrer,
    });
  }

  // Conversion Funnel Helpers
  trackFunnelStep(funnelName: string, step: number, stepName: string, properties: EventProperties = {}): void {
    this.track(`funnel_step` as EventType, {
      funnelName,
      step,
      stepName,
      ...properties,
    });
  }

  trackSignupFunnel(step: 'started' | 'email_entered' | 'password_set' | 'completed'): void {
    const stepMap = { started: 1, email_entered: 2, password_set: 3, completed: 4 };
    this.trackFunnelStep('signup', stepMap[step], step);
  }

  trackOnboardingFunnel(step: string, stepNumber: number): void {
    this.trackFunnelStep('onboarding', stepNumber, step);
  }

  trackBookingFunnel(step: 'view_property' | 'check_dates' | 'start_booking' | 'enter_details' | 'payment' | 'complete'): void {
    const stepMap = { view_property: 1, check_dates: 2, start_booking: 3, enter_details: 4, payment: 5, complete: 6 };
    this.trackFunnelStep('booking', stepMap[step], step);
  }

  trackSubscriptionFunnel(step: 'view_plans' | 'select_plan' | 'enter_payment' | 'complete'): void {
    const stepMap = { view_plans: 1, select_plan: 2, enter_payment: 3, complete: 4 };
    this.trackFunnelStep('subscription', stepMap[step], step);
  }

  // Revenue Tracking
  trackRevenue(amount: number, currency: string = 'USD', type: 'booking' | 'subscription', properties: EventProperties = {}): void {
    this.track('payment_received' as EventType, {
      amount,
      currency,
      revenueType: type,
      ...properties,
    });
  }

  private enrichProperties(properties: EventProperties): EventProperties {
    return {
      ...properties,
      sessionId: this.sessionId,
      userId: this.user?.id,
      userType: this.user?.type,
      organizationId: this.user?.organizationId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  private generateSessionId(): string {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;

    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.pageviewQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    const pageviews = [...this.pageviewQueue];

    // Clear queues
    this.eventQueue = [];
    this.pageviewQueue = [];

    // Persist events
    for (const { event, properties, timestamp } of events) {
      await this.persistEvent(event, properties, timestamp);
    }

    // Persist pageviews
    for (const { page, timestamp, referrer } of pageviews) {
      await this.persistEvent('pageview', { page, referrer }, timestamp);
    }
  }

  private async persistEvent(event: string, properties: EventProperties, timestamp?: Date): Promise<void> {
    try {
      await (supabase as any).from('analytics_events').insert({
        event_name: event,
        properties,
        user_id: this.user?.id,
        organization_id: this.user?.organizationId,
        session_id: this.sessionId,
        created_at: timestamp?.toISOString() || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to persist analytics event:', error);
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const productAnalytics = ProductAnalytics.getInstance();
