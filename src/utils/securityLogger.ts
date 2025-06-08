interface SecurityEvent {
  type: 'auth_failure' | 'invalid_input' | 'rate_limit' | 'xss_attempt' | 'unauthorized_access';
  userId?: string;
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.events.push(securityEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent);
    }

    // In production, you might want to send this to your monitoring service
    this.sendToMonitoring(securityEvent);
  }

  private async sendToMonitoring(event: SecurityEvent) {
    // In a real application, send to your monitoring service
    // For now, we'll just store locally
    try {
      const storedEvents = localStorage.getItem('security_events');
      const events = storedEvents ? JSON.parse(storedEvents) : [];
      events.push(event);
      
      // Keep only the last 100 events in localStorage
      const recentEvents = events.slice(-100);
      localStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to store security event:', error);
    }
  }

  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  clearEvents() {
    this.events = [];
    localStorage.removeItem('security_events');
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logAuthFailure = (details: Record<string, any>) => {
  securityLogger.log({
    type: 'auth_failure',
    details
  });
};

export const logInvalidInput = (field: string, value: string, userId?: string) => {
  securityLogger.log({
    type: 'invalid_input',
    userId,
    details: { field, value: value.substring(0, 100) } // Limit value length
  });
};

export const logRateLimit = (endpoint: string, userId?: string) => {
  securityLogger.log({
    type: 'rate_limit',
    userId,
    details: { endpoint }
  });
};

export const logXSSAttempt = (input: string, userId?: string) => {
  securityLogger.log({
    type: 'xss_attempt',
    userId,
    details: { input: input.substring(0, 200) }
  });
};

export const logUnauthorizedAccess = (resource: string, userId?: string) => {
  securityLogger.log({
    type: 'unauthorized_access',
    userId,
    details: { resource }
  });
};
