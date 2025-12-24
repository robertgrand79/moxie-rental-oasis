import React, { Suspense, ComponentType, lazy } from 'react';
import { Skeleton } from './skeleton';

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  preload?: boolean;
}

/**
 * Create a lazy-loaded component with built-in suspense boundary
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): T {
  const LazyComponent = lazy(importFn);

  // Preload if requested
  if (options.preload) {
    importFn();
  }

  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <Suspense fallback={options.fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  return WrappedComponent as T;
}

const DefaultFallback = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Preload a component without rendering it
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  importFn().catch(() => {
    // Silently fail preloading
  });
}

/**
 * Create multiple lazy components from a module
 */
export function createLazyModule<
  T extends Record<string, ComponentType<any>>
>(
  importFn: () => Promise<T>,
  componentNames: (keyof T)[],
  options: LazyComponentOptions = {}
): Record<keyof T, ComponentType<any>> {
  const components: Record<string, ComponentType<any>> = {};

  componentNames.forEach((name) => {
    components[name as string] = createLazyComponent(
      async () => {
        const module = await importFn();
        return { default: module[name] };
      },
      options
    );
  });

  return components as Record<keyof T, ComponentType<any>>;
}

/**
 * Route-based code splitting helper
 */
export function lazyRoute(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return {
    element: (
      <Suspense fallback={fallback || <PageSkeleton />}>
        <LazyComponent />
      </Suspense>
    ),
    preload: () => importFn(),
  };
}

const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-6 space-y-6">
    <Skeleton className="h-10 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

export { DefaultFallback, PageSkeleton };
