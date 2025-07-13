// src/components/PriceDisplay.jsx
import { memo } from 'react';
import { formatPrice, parsePrice } from '../utils/price';

export const PriceDisplay = memo(({ priceHtml, className = "price" }) => {
  if (!priceHtml) return null;
  
  // Safe price parsing without dangerouslySetInnerHTML
  const { amount, currency, formatted } = parsePrice(priceHtml);
  
  return (
    <span className={className} data-amount={amount} data-currency={currency}>
      {formatted}
    </span>
  );
});

PriceDisplay.displayName = 'PriceDisplay';