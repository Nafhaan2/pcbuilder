import { useState, useEffect, memo } from 'react';
import '../styles/toast.css';

export const Toast = memo(({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!message) return null;
  
  return (
    <div className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}>
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
});

Toast.displayName = 'Toast';
