// src/components/ModernBuilderTable.jsx
import { useState, useCallback, memo } from 'react';
import { COMPONENTS } from '../constants';
import { useBuilder } from '../contexts/BuilderContext';
import { PriceDisplay } from './PriceDisplay';
import ModernChooserModal from './ModernChooserModal';
import '../styles/theme.css';
import '../styles/modern-builder.css';

// Modern Component Row
const ComponentRow = memo(({ component, selected, onSelect }) => {
  const sel = selected[component.key];
  const isMulti = component.multi === true;
  const hasSel = isMulti ? Array.isArray(sel) && sel.length : !!sel;
  const firstSel = isMulti ? sel?.[0] : sel;

  const displayName = isMulti && Array.isArray(sel) 
    ? `${sel.length} items selected`
    : sel?.name;

  const displaySpecs = firstSel?.short_description || 
    (isMulti && Array.isArray(sel) 
      ? sel.map(p => p.name.split(' ')[0]).join(', ')
      : '');

  return (
    <div className="component-row" onClick={() => onSelect(component.key)}>
      <div className="component-image">
        {firstSel?.images?.[0]?.src ? (
          <img 
            src={firstSel.images[0].src} 
            alt={firstSel.name}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="placeholder-image">
            <span className="placeholder-icon">
              {component.key === 'cpu' && '⚡'}
              {component.key === 'motherboard' && '🔲'}
              {component.key === 'memory' && '💾'}
              {component.key === 'storage' && '💿'}
              {component.key === 'gpu' && '🎮'}
              {component.key === 'case' && '🖥️'}
              {component.key === 'psu' && '🔌'}
              {component.key === 'cooler' && '❄️'}
              {component.key === 'fans' && '💨'}
            </span>
          </div>
        )}
      </div>

      <div className="component-details">
        <div className="component-type text-xs">{component.label.toUpperCase()}</div>
        <div className="component-name heading-md">
          {hasSel ? displayName : `Choose ${component.label}`}
        </div>
        {hasSel && displaySpecs && (
          <div className="component-specs text-sm">{displaySpecs}</div>
        )}
      </div>

      <div className="component-price">
        {!isMulti && sel && (
          <PriceDisplay priceHtml={sel.price_html} />
        )}
        {isMulti && Array.isArray(sel) && sel.length > 0 && (
          <div className="multi-price">
            {sel.reduce((sum, p) => sum + Number(p?.price || 0), 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </div>
        )}
      </div>

      <div className="component-action">
        <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
});

ComponentRow.displayName = 'ComponentRow';

// Main Modern Builder Table
export default function ModernBuilderTable({ onAddToCart, isAddingToCart }) {
  const { 
    selected, 
    total,
    error: contextError,
    isPending
  } = useBuilder();
  
  const [activeComponent, setActiveComponent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const displayError = errorMsg || contextError;

  const handleComponentSelect = useCallback((componentKey) => {
    setActiveComponent(componentKey);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveComponent(null);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart) return;
    
    setErrorMsg('');
    
    try {
      await onAddToCart();
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, [onAddToCart, isAddingToCart]);

  return (
    <div className="modern-builder-container">
      {/* Header */}
      <div className="builder-header">
        <h1 className="heading-xl">Build Your PC</h1>
        <p className="text-secondary">Select components to create your custom build</p>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="error-banner" role="alert">
          {displayError}
        </div>
      )}

      {/* Component List */}
      <div className="components-list">
        {COMPONENTS.map((component) => (
          <ComponentRow
            key={component.key}
            component={component}
            selected={selected}
            onSelect={handleComponentSelect}
          />
        ))}
      </div>

      {/* Summary Bar */}
      <div className="summary-bar">
        <div className="summary-content">
          <div className="summary-info">
            <span className="text-xs">SUBTOTAL</span>
            <span className="total-price heading-lg">{total}</span>
          </div>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isPending}
          >
            {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Modal for component selection */}
      {activeComponent && (
        <ModernChooserModal
          componentKey={activeComponent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}