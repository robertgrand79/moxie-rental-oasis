import { useEffect } from 'react';

// Trusted origins for cross-origin communication
const TRUSTED_ORIGINS = [
  'https://widget.hospitable.com',
  'https://booking.hospitable.com',
  'https://hospitable.com',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://connect.facebook.net'
];

interface PostMessageData {
  type?: string;
  action?: string;
  data?: any;
}

export const usePostMessageHandler = () => {
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Validate origin
      const isOriginTrusted = TRUSTED_ORIGINS.some(origin => 
        event.origin === origin || event.origin.endsWith('.hospitable.com')
      );

      if (!isOriginTrusted) {
        // Log but don't throw error to avoid console warnings
        return;
      }

      try {
        const messageData = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;

        // Handle Hospitable-specific messages
        if (messageData?.type === 'hospitable') {
          handleHospitableMessage(messageData, event.origin);
        }

        // Handle booking modal resize
        if (messageData?.action === 'resize') {
          handleBookingResize(messageData.data);
        }

        // Handle booking completion
        if (messageData?.action === 'booking_complete') {
          handleBookingComplete(messageData.data);
        }

      } catch (error) {
        // Silently handle parsing errors
        console.debug('PostMessage parsing failed:', error);
      }
    };

    // Add event listener
    window.addEventListener('message', handlePostMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);
};

const handleHospitableMessage = (data: PostMessageData, origin: string) => {
  // Handle Hospitable widget communication
  if (data.action === 'widget_loaded') {
    console.debug('Hospitable widget loaded successfully');
  }
  
  if (data.action === 'booking_started') {
    console.debug('Booking process initiated');
  }
};

const handleBookingResize = (resizeData: any) => {
  // Handle iframe resize requests
  if (resizeData?.height && typeof resizeData.height === 'number') {
    const iframe = document.querySelector('iframe[title*="Book"]');
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.style.height = `${Math.min(resizeData.height, window.innerHeight * 0.9)}px`;
    }
  }
};

const handleBookingComplete = (bookingData: any) => {
  // Handle successful booking completion
  console.debug('Booking completed:', bookingData);
  
  // Could trigger analytics or other completion actions
  if ('gtag' in window && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'booking_complete', {
      event_category: 'booking',
      event_label: bookingData?.property_id || 'unknown'
    });
  }
};