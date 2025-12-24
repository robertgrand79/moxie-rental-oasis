import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getRUM, RUMMetrics } from '@/utils/rum';

/**
 * Hook to track route changes in RUM
 */
export function useRouteTracking(): void {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const rum = getRUM();
    if (!rum) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    rum.startRouteChange();

    // End tracking after React commits the update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rum.endRouteChange();
      });
    });
  }, [location.pathname]);
}

/**
 * Hook to track component render time
 */
export function useComponentRenderTracking(componentName: string): void {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const rum = getRUM();
    if (!rum) return;

    const duration = performance.now() - renderStart.current;
    rum.trackComponentRender(componentName, duration);
  }, [componentName]);
}

/**
 * Hook to get current RUM metrics
 */
export function useRUMMetrics(): RUMMetrics | null {
  const rum = getRUM();
  return rum?.getMetrics() ?? null;
}

/**
 * Hook to track API call latency
 */
export function useApiLatencyTracker() {
  const trackApiCall = useCallback(
    async function trackCall<T>(
      endpoint: string,
      apiCall: () => Promise<T>
    ): Promise<T> {
      const rum = getRUM();
      const start = performance.now();
      
      try {
        const result = await apiCall();
        const duration = performance.now() - start;
        rum?.trackApiLatency(endpoint, duration);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        rum?.trackApiLatency(`${endpoint}:error`, duration);
        throw error;
      }
    },
    []
  );

  return { trackApiCall };
}

/**
 * Hook to measure expensive computations
 */
export function useMeasure<T>(
  name: string,
  computation: () => T,
  deps: React.DependencyList
): T {
  const result = useRef<T>(computation());

  useEffect(() => {
    const rum = getRUM();
    const start = performance.now();
    result.current = computation();
    const duration = performance.now() - start;
    
    if (duration > 16) { // More than one frame
      rum?.trackComponentRender(`${name}:expensive`, duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result.current;
}

/**
 * Higher-order component to track render performance
 */
export function withRenderTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const TrackedComponent: React.FC<P> = (props) => {
    useComponentRenderTracking(componentName);
    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `RUMTracked(${componentName})`;
  return TrackedComponent;
}
