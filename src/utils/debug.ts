/**
 * Environment-aware debug utility
 * 
 * In production: Only errors are logged
 * In development: All logs are shown
 * 
 * Usage:
 *   import { debug } from '@/utils/debug';
 *   debug.log('Message'); // Only shows in dev
 *   debug.error('Error'); // Always shows
 */

const isDev = import.meta.env.DEV;

// Semantic log categories for consistent prefixes
const LOG_CATEGORIES = {
  api: '[API]',
  auth: '[Auth]',
  db: '[DB]',
  ui: '[UI]',
  config: '[Config]',
  sms: '[SMS]',
  analytics: '[Analytics]',
  image: '[Image]',
  push: '[Push]',
  calendar: '[Calendar]',
  device: '[Device]',
  tenant: '[Tenant]',
} as const;

type LogCategory = keyof typeof LOG_CATEGORIES;

/**
 * Debug logging utility that respects environment
 */
export const debug = {
  /** General log - dev only */
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  /** Warning log - dev only */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  /** Error log - always shown (important for debugging production issues) */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /** Info log - dev only */
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },

  /** Categorized log with prefix - dev only */
  category: (category: LogCategory, ...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES[category], ...args);
  },

  /** API-related logs */
  api: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.api, ...args);
  },

  /** Authentication-related logs */
  auth: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.auth, ...args);
  },

  /** Database-related logs */
  db: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.db, ...args);
  },

  /** UI-related logs */
  ui: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.ui, ...args);
  },

  /** Configuration-related logs */
  config: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.config, ...args);
  },

  /** SMS-related logs */
  sms: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.sms, ...args);
  },

  /** Analytics-related logs */
  analytics: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.analytics, ...args);
  },

  /** Image-related logs */
  image: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.image, ...args);
  },

  /** Push notification-related logs */
  push: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.push, ...args);
  },

  /** Calendar-related logs */
  calendar: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.calendar, ...args);
  },

  /** Device-related logs */
  device: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.device, ...args);
  },

  /** Tenant-related logs */
  tenant: (...args: unknown[]) => {
    if (isDev) console.log(LOG_CATEGORIES.tenant, ...args);
  },
};

export default debug;
