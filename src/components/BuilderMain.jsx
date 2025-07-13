// src/components/BuilderMain.jsx - Updated to use ModernBuilderTable
import { useEffect, useState, useCallback } from 'react';
import { useBuilder } from '../contexts/BuilderContext';
import { useCartOperations } from '../hooks/useCartOperations';
import { useToast } from '../hooks/useToast';
import ModernBuilderTable from './ModernBuilderTable';
import { Toast } from './Toast';
import { FullPageLoader } from './LoadingStates';
import { ErrorMessage } from './ErrorMessages';
import { COMPONENTS } from '../constants';


// Preload ChooserGrid immediately
const preloadChooserModal = () => import('./ModernChooserModal');

export default function BuilderMain() {
  const { 
    selected, 
    catalog, 
    activeKey, 
    setActiveKey, 
    selectProduct, 
    updateCatalog,
    total,
    error 
  } = useBuilder();
  
  const { addToCart, isAddingToCart, cartError } = useCartOperations();
  const { toasts, showToast } = useToast();
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchProgress, setPrefetchProgress] = useState(0);

  // Enhanced add to cart with notifications
  const handleAddToCart = useCallback(async () => {
    try {
      await addToCart();
      showToast('Build added to cart successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error', 5000);
    }
  }, [addToCart, showToast]);

  // Aggressive prefetch strategy
  useEffect(() => {
    // 1. Immediately preload Modal component
    preloadChooserModal();

    // 2. Start fetching data immediately (no delay)
    const prefetchAll = async () => {
      if (isPrefetching) return;
      
      setIsPrefetching(true);
      setPrefetchProgress(0);
      
      // Get all unique slugs
      const allSlugs = new Set();
      COMPONENTS.forEach(comp => {
        if (Array.isArray(comp.slug)) {
          comp.slug.forEach(s => allSlugs.add(s));
        } else {
          allSlugs.add(comp.slug);
        }
      });

      const slugsToFetch = Array.from(allSlugs).filter(slug => !catalog[slug]);
      const totalSlugs = slugsToFetch.length;
      
      if (totalSlugs === 0) {
        setIsPrefetching(false);
        return;
      }

      try {
        // 3. Prioritize first few categories (likely to be clicked first)
        const prioritySlugs = [];
        const regularSlugs = [];
        
        COMPONENTS.slice(0, 3).forEach(comp => {
          const slugList = Array.isArray(comp.slug) ? comp.slug : [comp.slug];
          slugList.forEach(slug => {
            if (slugsToFetch.includes(slug)) {
              prioritySlugs.push(slug);
            }
          });
        });
        
        slugsToFetch.forEach(slug => {
          if (!prioritySlugs.includes(slug)) {
            regularSlugs.push(slug);
          }
        });

        // 4. Fetch priority categories first
        let completed = 0;
        
        const fetchSlug = async (slug) => {
          try {
            const res = await fetch(
              `${window.pcBuilderData.root}pcbuilder/v1/products?category=${slug}&per_page=100`,
              { headers: { 'X-WP-Nonce': window.pcBuilderData.nonce } }
            );
            
            if (!res.ok) throw new Error(`Failed to fetch ${slug}`);
            const data = await res.json();
            
            completed++;
            setPrefetchProgress(Math.round((completed / totalSlugs) * 100));
            
            return { slug, data: data.body || [] };
          } catch (err) {
            console.error(`Prefetch error for ${slug}:`, err);
            completed++;
            setPrefetchProgress(Math.round((completed / totalSlugs) * 100));
            return { slug, data: [] };
          }
        };

        // Fetch priority slugs first
        if (prioritySlugs.length > 0) {
          const priorityResults = await Promise.all(prioritySlugs.map(fetchSlug));
          const priorityUpdates = {};
          priorityResults.forEach(({ slug, data }) => {
            if (data.length > 0) {
              priorityUpdates[slug] = data;
            }
          });
          
          if (Object.keys(priorityUpdates).length > 0) {
            updateCatalog(priorityUpdates);
          }
        }

        // Then fetch the rest
        if (regularSlugs.length > 0) {
          const regularResults = await Promise.all(regularSlugs.map(fetchSlug));
          const regularUpdates = {};
          regularResults.forEach(({ slug, data }) => {
            if (data.length > 0) {
              regularUpdates[slug] = data;
            }
          });
          
          if (Object.keys(regularUpdates).length > 0) {
            updateCatalog(regularUpdates);
          }
        }
      } catch (err) {
        console.error('Prefetch error:', err);
      } finally {
        setIsPrefetching(false);
        setPrefetchProgress(100);
      }
    };

    // Start immediately, no delay
    prefetchAll();
  }, []); // Empty deps, only run once on mount

  return (
    <>
      <ModernBuilderTable
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
      />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => {}}
          />
        ))}
      </div>

      {/* Full page loader for critical operations */}
      {isAddingToCart && (
        <FullPageLoader text="Adding to cart..." />
      )}
      
      {/* Prefetch indicator with progress */}
      {isPrefetching && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 12,
          minWidth: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ marginBottom: 4 }}>Loading catalog... {prefetchProgress}%</div>
          <div style={{
            width: '100%',
            height: 4,
            background: 'var(--bg-primary)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${prefetchProgress}%`,
              height: '100%',
              background: 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}
    </>
  );
}