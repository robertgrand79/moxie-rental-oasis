import { useEffect, createContext, useContext, ReactNode } from 'react';
import { initRUM, getRUM, RUMReport, RUMMetrics } from '@/utils/rum';
import { useRouteTracking } from '@/hooks/useRUM';

interface RUMContextValue {
  isActive: boolean;
  getMetrics: () => RUMMetrics | null;
  trackApiLatency: (endpoint: string, duration: number) => void;
  trackComponentRender: (componentName: string, duration: number) => void;
}

const RUMContext = createContext<RUMContextValue>({
  isActive: false,
  getMetrics: () => null,
  trackApiLatency: () => {},
  trackComponentRender: () => {},
});

interface RUMProviderProps {
  children: ReactNode;
  sampleRate?: number;
  debug?: boolean;
  onReport?: (report: RUMReport) => void;
}

function RUMRouteTracker() {
  useRouteTracking();
  return null;
}

export function RUMProvider({ 
  children, 
  sampleRate = 0.1,
  debug = false,
  onReport,
}: RUMProviderProps) {
  useEffect(() => {
    const rum = initRUM({
      sampleRate,
      debug,
      onReport: (report) => {
        // Log performance summary in development
        if (debug) {
          console.log('[RUM] Performance Report:', {
            lcp: report.metrics.lcp ? `${Math.round(report.metrics.lcp)}ms` : 'N/A',
            fid: report.metrics.fid ? `${Math.round(report.metrics.fid)}ms` : 'N/A',
            cls: report.metrics.cls?.toFixed(3) ?? 'N/A',
            fcp: report.metrics.fcp ? `${Math.round(report.metrics.fcp)}ms` : 'N/A',
            ttfb: report.metrics.ttfb ? `${Math.round(report.metrics.ttfb)}ms` : 'N/A',
          });
        }
        
        onReport?.(report);
      },
    });

    return () => {
      rum.destroy();
    };
  }, [sampleRate, debug, onReport]);

  const contextValue: RUMContextValue = {
    isActive: getRUM()?.isSessionActive() ?? false,
    getMetrics: () => getRUM()?.getMetrics() ?? null,
    trackApiLatency: (endpoint, duration) => getRUM()?.trackApiLatency(endpoint, duration),
    trackComponentRender: (name, duration) => getRUM()?.trackComponentRender(name, duration),
  };

  return (
    <RUMContext.Provider value={contextValue}>
      <RUMRouteTracker />
      {children}
    </RUMContext.Provider>
  );
}

export function useRUM(): RUMContextValue {
  return useContext(RUMContext);
}
