
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useLifestyleUrlParams = (handleAddNew: () => void) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    
    if (action === 'new') {
      handleAddNew();
      // Remove the action parameter after handling it
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, handleAddNew]);
};
