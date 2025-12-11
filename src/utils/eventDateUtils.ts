/**
 * Utility functions for event date handling
 * Parses dates without timezone conversion to avoid UTC issues
 */

export interface EventDateFields {
  event_date: string;
  end_date?: string | null;
}

/**
 * Check if an event has passed (is in the past)
 * Uses end_date if available, otherwise uses event_date
 */
export const isEventPast = (event: EventDateFields): boolean => {
  const dateToCheck = event.end_date || event.event_date;
  if (!dateToCheck) return false;
  
  // Parse date string manually to avoid UTC timezone issues
  const [year, month, day] = dateToCheck.split('-').map(Number);
  const eventDate = new Date(year, month - 1, day, 23, 59, 59); // End of day
  const today = new Date();
  
  return eventDate < today;
};

/**
 * Check if an event is upcoming (today or in the future)
 */
export const isEventUpcoming = (event: EventDateFields): boolean => {
  return !isEventPast(event);
};
