
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useEventsUrlParams = (onOpenAdd: () => void) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      onOpenAdd();
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams, onOpenAdd]);
};
