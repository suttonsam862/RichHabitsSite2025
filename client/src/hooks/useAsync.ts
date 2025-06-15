import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

/**
 * Generic async hook for handling loading states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false
  });
  
  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true
      });
      return data;
    } catch (error) {
      setState({
        data: null,
        error: error as Error,
        isLoading: false,
        isError: true,
        isSuccess: false
      });
      throw error;
    }
  }, dependencies);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  return { ...state, execute };
}