import { memo } from 'react';
import '../styles/errors.css';

export const ErrorMessage = memo(({ 
  error, 
  type = 'error', // error, warning, info
  onRetry,
  onDismiss 
}) => {
  if (!error) return null;
  
  // User-friendly error messages
  const getUserMessage = (error) => {
    if (typeof error === 'string') return error;
    
    // Map technical errors to user-friendly messages
    const errorMap = {
      'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
      'NetworkError': 'Network connection lost. Please try again.',
      '404': 'The requested data was not found.',
      '500': 'Server error. Our team has been notified.',
      'outofstock': 'This item is currently out of stock.',
      'insufficient_stock': 'Not enough items in stock.',
      'invalid_nonce': 'Your session has expired. Please refresh the page.',
    };
    
    // Check for known error patterns
    for (const [key, message] of Object.entries(errorMap)) {
      if (error.message?.includes(key) || error.toString().includes(key)) {
        return message;
      }
    }
    
    return error.message || 'An unexpected error occurred.';
  };
  
  return (
    <div className={`error-message ${type}`} role="alert">
      <div className="error-content">
        <span className="error-icon">
          {type === 'error' && '⚠️'}
          {type === 'warning' && '⚡'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="error-text">{getUserMessage(error)}</span>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-button" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="error-button secondary" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';