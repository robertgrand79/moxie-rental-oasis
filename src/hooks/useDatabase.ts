import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  retryCount: number;
}

export const useDatabase = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null,
    retryCount: 0
  });

  const checkConnection = async (isRetry = false) => {
    setStatus(prev => ({ 
      ...prev, 
      isChecking: true, 
      retryCount: isRetry ? prev.retryCount + 1 : prev.retryCount 
    }));

    try {
      console.log('🔌 Checking database connection...');
      
      // Simple query to test connection
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isChecking: false,
          lastChecked: new Date(),
          error: error.message
        }));
      } else {
        console.log('✅ Database connection successful');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isChecking: false,
          lastChecked: new Date(),
          error: null
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 Database connection check failed:', errorMessage);
      
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage
      }));
    }
  };

  const retry = () => {
    if (status.retryCount < 3) {
      checkConnection(true);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Set up periodic health checks
    const interval = setInterval(() => {
      if (!status.isChecking) {
        checkConnection();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    checkConnection,
    retry,
    canRetry: status.retryCount < 3
  };
};