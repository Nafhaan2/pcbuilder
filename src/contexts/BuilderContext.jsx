// src/contexts/BuilderContext.jsx - Enhanced with optimistic updates
import { createContext, useContext, useState, useCallback, useMemo, useTransition } from 'react';
import { COMPONENTS } from '../constants';

const BuilderContext = createContext(null);

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
};

export const BuilderProvider = ({ children }) => {
  const [catalog, setCatalog] = useState({});
  const [selected, setSelected] = useState({});
  const [activeKey, setActiveKey] = useState(null);
  const [error, setError] = useState('');
  
  // For optimistic updates
  const [optimisticSelected, setOptimisticSelected] = useState({});
  const [isPending, startTransition] = useTransition();

  // Update catalog with new data
  const updateCatalog = useCallback((updates) => {
    setCatalog(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle product selection with optimistic updates
  const selectProduct = useCallback((componentKey, product) => {
    const comp = COMPONENTS.find(c => c.key === componentKey);
    if (!comp) return;

    // Immediate optimistic update
    setOptimisticSelected(prev => {
      if (comp.multi) {
        const prevArr = Array.isArray(prev[componentKey]) ? prev[componentKey] : [];
        const exists = prevArr.some(p => p.id === product.id);
        const nextArr = exists
          ? prevArr.filter(p => p.id !== product.id)
          : [...prevArr, product];
        return { ...prev, [componentKey]: nextArr };
      } else {
        return { ...prev, [componentKey]: product };
      }
    });

    // Actual update in transition (non-blocking)
    startTransition(() => {
      setSelected(prev => {
        if (comp.multi) {
          const prevArr = Array.isArray(prev[componentKey]) ? prev[componentKey] : [];
          const exists = prevArr.some(p => p.id === product.id);
          const nextArr = exists
            ? prevArr.filter(p => p.id !== product.id)
            : [...prevArr, product];
          return { ...prev, [componentKey]: nextArr };
        } else {
          return { ...prev, [componentKey]: product };
        }
      });
    });
  }, []);

  // Merge optimistic and actual selected state
  const mergedSelected = useMemo(() => {
    return { ...selected, ...optimisticSelected };
  }, [selected, optimisticSelected]);

  // Calculate total price with optimistic updates
  const total = useMemo(() => {
    const sum = Object.values(mergedSelected).reduce((acc, item) => {
      if (!item) return acc;
      
      if (Array.isArray(item)) {
        return acc + item.reduce((s, p) => s + Number(p?.price || 0), 0);
      }
      return acc + Number(item?.price || 0);
    }, 0);
    
    return sum.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }, [mergedSelected]);

  // Get selected items as flat array
  const getSelectedItems = useCallback(() => {
    const items = [];
    Object.values(mergedSelected).forEach(val => {
      if (!val) return;
      
      const itemsToAdd = Array.isArray(val) ? val : [val];
      itemsToAdd.forEach(p => {
        if (p?.id) {
          items.push({ id: p.id, quantity: 1 });
        }
      });
    });
    return items;
  }, [mergedSelected]);

  // Clear optimistic updates (call after successful save)
  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticSelected({});
  }, []);

  const value = {
    // State
    catalog,
    selected: mergedSelected,
    activeKey,
    error,
    total,
    isPending,
    
    // Actions
    updateCatalog,
    selectProduct,
    setActiveKey,
    setError,
    getSelectedItems,
    clearOptimisticUpdates,
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
};