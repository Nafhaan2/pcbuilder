// src/utils/lazyWithPreload.js - Utility for preloading components
export const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

// Usage example:
// const ChooserGrid = lazyWithPreload(() => import('./ChooserGrid'));
// Then preload on hover: onMouseEnter={() => ChooserGrid.preload()}