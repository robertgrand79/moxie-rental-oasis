import { useCallback, useRef, useMemo } from 'react';

/**
 * Creates a debounced version of a callback
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Creates a throttled version of a callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottleRef = useRef(false);
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callbackRef.current(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    }) as T,
    [limit]
  );
}

/**
 * Memoizes expensive computations with deep comparison
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T } | null>(null);

  const depsChanged = !ref.current || !shallowEqual(ref.current.deps, deps);

  if (depsChanged) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}

/**
 * Shallow equality check for arrays
 */
function shallowEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Prevents unnecessary re-renders by comparing previous and current props
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  const previousValue = ref.current;
  ref.current = value;
  return previousValue;
}

/**
 * Creates a stable callback that doesn't change reference but always calls latest function
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Memoizes an object to prevent unnecessary re-renders
 */
export function useStableObject<T extends object>(obj: T): T {
  const ref = useRef(obj);
  
  const hasChanged = Object.keys(obj).some(
    key => (obj as any)[key] !== (ref.current as any)[key]
  );

  if (hasChanged) {
    ref.current = obj;
  }

  return ref.current;
}

/**
 * Batch multiple state updates to reduce re-renders
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const isScheduled = useRef(false);

  const schedule = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (!isScheduled.current) {
      isScheduled.current = true;
      requestAnimationFrame(() => {
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        isScheduled.current = false;
        updates.forEach(fn => fn());
      });
    }
  }, []);

  return schedule;
}

/**
 * Lazy initialization hook for expensive initial values
 */
export function useLazy<T>(factory: () => T): T {
  const initialized = useRef(false);
  const valueRef = useRef<T | null>(null);

  if (!initialized.current) {
    valueRef.current = factory();
    initialized.current = true;
  }

  return valueRef.current as T;
}

/**
 * Creates a memoized selector function
 */
export function useSelector<S, R>(
  state: S,
  selector: (state: S) => R
): R {
  return useMemo(() => selector(state), [state, selector]);
}
