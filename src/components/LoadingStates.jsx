import { memo } from 'react';
import '../styles/loading.css';

export const ProductSkeleton = memo(({ count = 6 }) => (
  <div className="skeleton-grid">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="pcb-card skeleton">
        <div className="skeleton-img" />
        <div className="skeleton-text" />
        <div className="skeleton-price" />
      </div>
    ))}
  </div>
));

export const InlineLoader = memo(({ text = "Loading..." }) => (
  <div className="inline-loader">
    <span className="loader-spinner" />
    <span>{text}</span>
  </div>
));

export const FullPageLoader = memo(({ text = "Loading..." }) => (
  <div className="full-page-loader">
    <div className="loader-content">
      <span className="loader-spinner large" />
      <span>{text}</span>
    </div>
  </div>
));
