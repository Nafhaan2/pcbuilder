
import { lazy, Suspense, useEffect } from 'react';
import { BuilderProvider } from './contexts/BuilderContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InlineLoader } from './components/LoadingStates';
import './styles/theme.css';
import './styles/cards.css';

// Lazy load the modern builder component
const BuilderMain = lazy(() => import('./components/BuilderMain'));

// Preload function
const preloadBuilderMain = () => import('./components/BuilderMain');

export default function App() {
  // Preload BuilderMain immediately after mount
  useEffect(() => {
    preloadBuilderMain();
  }, []);

  return (
    <ErrorBoundary>
      <BuilderProvider>
        <Suspense fallback={
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <InlineLoader text="Loading PC Builder..." />
          </div>
        }>
          <BuilderMain />
        </Suspense>
      </BuilderProvider>
    </ErrorBoundary>
  );
}