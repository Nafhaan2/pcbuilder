// src/components/ModernChooserModal.jsx
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { COMPONENTS } from '../constants';
import { useBuilder } from '../contexts/BuilderContext';
import { useProductData } from '../hooks/useProductData';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { PriceDisplay } from './PriceDisplay';
import { ProductSkeleton } from './LoadingStates';
import { validateProduct } from '../utils/validation';
import '../styles/modern-modal.css';

// Modern Product Card
const ModernProductCard = memo(({ product, isChosen, isOOS, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    if (!isOOS) {
      try {
        validateProduct(product);
        onSelect(product);
      } catch (err) {
        console.error('Invalid product:', err);
      }
    }
  }, [product, isOOS, onSelect]);

  return (
    <div 
      className={`modern-product-card ${isChosen ? 'selected' : ''} ${isOOS ? 'oos' : ''}`}
      onClick={handleClick}
    >
      <div className="product-image">
        {product.images?.[0]?.src && !imageError ? (
          <img 
            src={product.images[0].src} 
            alt={product.name || 'Product'}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="no-image">
            <span>No Image</span>
          </div>
        )}
        {isOOS && <div className="oos-overlay">Out of Stock</div>}
        {isChosen && <div className="selected-badge">✓</div>}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.short_description && (
          <p className="product-specs">{product.short_description}</p>
        )}
        <div className="product-footer">
          <PriceDisplay priceHtml={product.price_html} />
          {product.stock_quantity && product.stock_quantity < 10 && (
            <span className="low-stock">Only {product.stock_quantity} left</span>
          )}
        </div>
      </div>
    </div>
  );
});

ModernProductCard.displayName = 'ModernProductCard';

// Filter Pills
const FilterPill = memo(({ label, isActive, onClick }) => (
  <button 
    className={`filter-pill ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
));

FilterPill.displayName = 'FilterPill';

// Main Modal Component
export default function ModernChooserModal({ componentKey, onClose }) {
  const { selected, selectProduct } = useBuilder();
  const { error: fetchError, handleError, clearError } = useErrorHandler();
  
  const comp = COMPONENTS.find((c) => c.key === componentKey);
  const {
    label,
    slug,
    tabNames = [],
    multi = false,
    attrType,
    attrCap,
  } = comp;

  const slugList = Array.isArray(slug) ? slug : [slug];
  const hasSlugTabs = slugList.length > 1;

  const [activeSlugIdx, setActiveSlugIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [capFilter, setCapFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, loading, error: dataError } = useProductData(slugList);
  const error = fetchError || dataError;

  // Extract filter options
  const { typeTerms, capTerms } = useMemo(() => {
    const t = new Set();
    const c = new Set();
    
    products.forEach((p) => {
      if (!p.attributes) return;
      
      p.attributes.forEach((a) => {
        if (attrType && (a.slug === attrType || a.slug === `pa_${attrType}`)) {
          a.options?.forEach((o) => t.add(o));
        }
        if (attrCap && (a.slug === attrCap || a.slug === `pa_${attrCap}`)) {
          a.options?.forEach((o) => c.add(o));
        }
      });
    });
    
    return { typeTerms: [...t].sort(), capTerms: [...c].sort() };
  }, [products, attrType, attrCap]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p) return false;
      
      // Search filter
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (hasSlugTabs) {
        const currentSlug = slugList[activeSlugIdx];
        const hasSlug = p.categories?.some((c) => c.slug === currentSlug);
        if (!hasSlug) return false;
      }
      
      // Attribute filters
      if (!typeFilter && !capFilter) return true;
      if (!p.attributes) return false;
      
      let hasType = !typeFilter;
      let hasCap = !capFilter;
      
      for (const attr of p.attributes) {
        if (typeFilter && !hasType && attrType) {
          if ((attr.slug === attrType || attr.slug === `pa_${attrType}`) && 
              attr.options?.includes(typeFilter)) {
            hasType = true;
          }
        }
        
        if (capFilter && !hasCap && attrCap) {
          if ((attr.slug === attrCap || attr.slug === `pa_${attrCap}`) && 
              attr.options?.includes(capFilter)) {
            hasCap = true;
          }
        }
        
        if (hasType && hasCap) return true;
      }
      
      return hasType && hasCap;
    });
  }, [products, searchQuery, hasSlugTabs, slugList, activeSlugIdx, typeFilter, capFilter, attrType, attrCap]);

  const isChosen = useCallback((p) => {
    if (!p) return false;
    
    if (multi) {
      return Array.isArray(selected[componentKey]) &&
        selected[componentKey].some((d) => d.id === p.id);
    }
    return selected[componentKey]?.id === p.id;
  }, [multi, selected, componentKey]);

  const handleProductClick = useCallback((p) => {
    if (!p || p.stock_status === 'outofstock') return;
    
    try {
      validateProduct(p);
      selectProduct(componentKey, p);
      if (!multi) {
        onClose();
      }
    } catch (err) {
      handleError(err);
    }
  }, [selectProduct, componentKey, multi, onClose, handleError]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="heading-lg">Select {label}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters */}
        <div className="filters-section">
          {/* Category Tabs */}
          {hasSlugTabs && (
            <div className="filter-group">
              <span className="filter-label">Category:</span>
              <div className="filter-pills">
                {slugList.map((s, i) => (
                  <FilterPill
                    key={s}
                    label={tabNames[i] || s.replace(/[-_]/g, ' ')}
                    isActive={i === activeSlugIdx}
                    onClick={() => setActiveSlugIdx(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Type Filters */}
          {attrType && typeTerms.length > 1 && (
            <div className="filter-group">
              <span className="filter-label">{attrType.replace(/[-_]/g, ' ')}:</span>
              <div className="filter-pills">
                <FilterPill
                  label="All"
                  isActive={!typeFilter}
                  onClick={() => setTypeFilter('')}
                />
                {typeTerms.map((t) => (
                  <FilterPill
                    key={t}
                    label={t}
                    isActive={t === typeFilter}
                    onClick={() => setTypeFilter(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Capacity Filters */}
          {attrCap && capTerms.length > 1 && (
            <div className="filter-group">
              <span className="filter-label">{attrCap.replace(/[-_]/g, ' ')}:</span>
              <div className="filter-pills">
                <FilterPill
                  label="All"
                  isActive={!capFilter}
                  onClick={() => setCapFilter('')}
                />
                {capTerms.map((c) => (
                  <FilterPill
                    key={c}
                    label={c}
                    isActive={c === capFilter}
                    onClick={() => setCapFilter(c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="modal-content">
          {loading && <ProductSkeleton count={6} />}
          
          {!loading && error && (
            <div className="error-state">
              <p>Error loading products</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <p>No products found</p>
              {(searchQuery || typeFilter || capFilter) && (
                <button onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                  setCapFilter('');
                }}>Clear filters</button>
              )}
            </div>
          )}
          
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((p) => (
                <ModernProductCard
                  key={p.id}
                  product={p}
                  isChosen={isChosen(p)}
                  isOOS={p.stock_status === 'outofstock'}
                  onSelect={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {multi && (
          <div className="modal-footer">
            <button className="done-btn" onClick={onClose}>
              Done ({selected[componentKey]?.length || 0} selected)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}