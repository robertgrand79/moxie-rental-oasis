import { QueryClient } from '@tanstack/react-query';

/**
 * Invalidates all pricing-related query caches to ensure consistency
 * across calendar views, pricing tabs, and booking calculations.
 */
export const invalidateAllPricingQueries = (queryClient: QueryClient) => {
  // Unified calendar weekly view pricing
  queryClient.invalidateQueries({ queryKey: ['unified-pricing'] });
  
  // PriceLabs pricing calendar tab
  queryClient.invalidateQueries({ queryKey: ['pricelabs-pricing-calendar'] });
  
  // Dynamic pricing used in various places
  queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
  queryClient.invalidateQueries({ queryKey: ['calendar-pricing'] });
  
  // Booking charges calculation (uses dynamic_pricing for guest checkout)
  queryClient.invalidateQueries({ queryKey: ['booking-charges'] });
};
