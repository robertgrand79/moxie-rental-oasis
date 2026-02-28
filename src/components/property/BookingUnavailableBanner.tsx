import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BookingUnavailableBannerProps {
  className?: string;
}

const BookingUnavailableBanner = ({ className = '' }: BookingUnavailableBannerProps) => {
  return (
    <div className={`rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            Bookings Currently Unavailable
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
            The host is setting up their payment system. Please check back soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingUnavailableBanner;
