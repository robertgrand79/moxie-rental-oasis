import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * Virtualized list component for rendering large lists efficiently
 */
function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  onEndReached,
  endReachedThreshold = 100,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasCalledEndReached, setHasCalledEndReached] = useState(false);

  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    const visible: { item: T; index: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        visible.push({ item: items[i], index: i });
      }
    }
    return visible;
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if we're near the end
    const distanceFromEnd = totalHeight - (target.scrollTop + containerHeight);
    if (distanceFromEnd < endReachedThreshold && !hasCalledEndReached && onEndReached) {
      setHasCalledEndReached(true);
      onEndReached();
    }
  }, [totalHeight, containerHeight, endReachedThreshold, hasCalledEndReached, onEndReached]);

  // Reset end reached flag when items change
  useEffect(() => {
    setHasCalledEndReached(false);
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;

/**
 * Hook for virtualized data with dynamic loading
 */
export function useVirtualizedData<T>(
  fetchFn: (offset: number, limit: number) => Promise<T[]>,
  options: {
    pageSize?: number;
    initialItems?: T[];
  } = {}
) {
  const { pageSize = 20, initialItems = [] } = options;
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchFn(items.length, pageSize);
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
      setItems(prev => [...prev, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [items.length, pageSize, isLoading, hasMore, fetchFn]);

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
  };
}
