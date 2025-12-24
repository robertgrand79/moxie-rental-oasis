import { useRef, useCallback, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in ms
  maxSize?: number;
  staleWhileRevalidate?: boolean;
}

/**
 * In-memory cache for API responses
 */
class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry as CacheEntry<T>;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.get(key);
    return entry !== undefined;
  }

  size(): number {
    return this.cache.size;
  }

  // Invalidate entries matching a pattern
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const globalCache = new ResponseCache(200);

/**
 * Hook for caching API responses
 */
export function useApiCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = false } = options;
  const pendingRequests = useRef(new Map<string, Promise<T>>());

  const generateKey = useCallback((url: string, params?: Record<string, any>) => {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }, []);

  const get = useCallback((url: string, params?: Record<string, any>) => {
    const key = generateKey(url, params);
    return globalCache.get<T>(key);
  }, [generateKey]);

  const set = useCallback((url: string, data: T, params?: Record<string, any>) => {
    const key = generateKey(url, params);
    globalCache.set(key, data, ttl);
  }, [generateKey, ttl]);

  const fetchWithCache = useCallback(async (
    url: string,
    fetcher: () => Promise<T>,
    params?: Record<string, any>
  ): Promise<T> => {
    const key = generateKey(url, params);
    
    // Check cache first
    const cached = globalCache.get<T>(key);
    if (cached && !staleWhileRevalidate) {
      return cached.data;
    }

    // Check for pending request
    const pending = pendingRequests.current.get(key);
    if (pending) {
      return pending;
    }

    // Make request
    const promise = fetcher();
    pendingRequests.current.set(key, promise);

    try {
      const data = await promise;
      globalCache.set(key, data, ttl);
      return data;
    } finally {
      pendingRequests.current.delete(key);
    }
  }, [generateKey, ttl, staleWhileRevalidate]);

  const invalidate = useCallback((url: string, params?: Record<string, any>) => {
    const key = generateKey(url, params);
    globalCache.delete(key);
  }, [generateKey]);

  const invalidateAll = useCallback(() => {
    globalCache.clear();
  }, []);

  const invalidatePattern = useCallback((pattern: RegExp) => {
    globalCache.invalidatePattern(pattern);
  }, []);

  return {
    get,
    set,
    fetchWithCache,
    invalidate,
    invalidateAll,
    invalidatePattern,
    cacheSize: globalCache.size(),
  };
}

/**
 * Hook for request deduplication
 */
export function useRequestDedup<T>() {
  const pendingRequests = useRef(new Map<string, Promise<T>>());

  const dedupe = useCallback(async (
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> => {
    // Return existing request if pending
    const existing = pendingRequests.current.get(key);
    if (existing) {
      return existing;
    }

    // Create new request
    const promise = fetcher();
    pendingRequests.current.set(key, promise);

    try {
      return await promise;
    } finally {
      pendingRequests.current.delete(key);
    }
  }, []);

  return { dedupe };
}

/**
 * Optimized query key generator for React Query
 */
export function createQueryKey(
  base: string,
  params?: Record<string, any>
): (string | Record<string, any>)[] {
  if (!params) return [base];
  
  // Filter out undefined values and sort keys for consistency
  const cleanParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  
  return Object.keys(cleanParams).length > 0 ? [base, cleanParams] : [base];
}

/**
 * Preload data for faster navigation
 */
export function usePreloader<T>() {
  const preloadCache = useRef(new Map<string, Promise<T>>());

  const preload = useCallback((key: string, fetcher: () => Promise<T>) => {
    if (!preloadCache.current.has(key)) {
      preloadCache.current.set(key, fetcher());
    }
  }, []);

  const getPreloaded = useCallback((key: string): Promise<T> | undefined => {
    return preloadCache.current.get(key);
  }, []);

  const clearPreloaded = useCallback((key: string) => {
    preloadCache.current.delete(key);
  }, []);

  return { preload, getPreloaded, clearPreloaded };
}
