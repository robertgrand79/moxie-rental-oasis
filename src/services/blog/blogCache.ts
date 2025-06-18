
export interface CachedBlogResponse<T> {
  data: T;
  timestamp: number;
}

class BlogCacheManager {
  private cache = new Map<string, CachedBlogResponse<any>>();
  private readonly CACHE_DURATION = 60000; // 1 minute

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  createKey(params: Record<string, any>): string {
    return Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value || ''}`)
      .join('-');
  }
}

export const blogCache = new BlogCacheManager();
