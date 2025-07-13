// src/components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PC Builder Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#ff6b6b',
          background: '#1a1a1a',
          borderRadius: '8px',
          margin: '20px',
        }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}