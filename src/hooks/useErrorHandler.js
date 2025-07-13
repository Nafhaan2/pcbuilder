import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleError = useCallback((err) => {
    console.error('Error caught:', err);
    setError(err);
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const retry = useCallback(async (fn) => {
    setIsRetrying(true);
    clearError();
    
    try {
      const result = await fn();
      setIsRetrying(false);
      return result;
    } catch (err) {
      setIsRetrying(false);
      handleError(err);
      throw err;
    }
  }, [handleError, clearError]);
  
  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
};