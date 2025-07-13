// src/hooks/useCartOperations.js
import { useState, useCallback } from 'react';
import { useBuilder } from '../contexts/BuilderContext';

export const useCartOperations = () => {
  const { getSelectedItems } = useBuilder();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState('');

  const addToCart = useCallback(async () => {
    setIsAddingToCart(true);
    setCartError('');

    try {
      const items = getSelectedItems();

      if (!items.length) {
        throw new Error('Please pick at least one component.');
      }

      // Try batch add first
      const tryBatch = async (path) => {
        const res = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WC-Store-API-Nonce': window.pcBuilderData.storeNonce,
          },
          credentials: 'include',
          body: JSON.stringify({ items }),
        });
        return res;
      };

      // Try modern endpoint
      let res = await tryBatch('/wp-json/wc/store/v1/cart/add-items');
      if (res.ok) {
        window.location.href = window.pcBuilderData.cartUrl;
        return;
      }

      // Try legacy endpoint
      if (res.status === 404) {
        res = await tryBatch('/wp-json/wc/store/cart/add-items');
        if (res.ok) {
          window.location.href = window.pcBuilderData.cartUrl;
          return;
        }
      }

      // Fallback to individual adds
      const failed = [];
      for (const item of items) {
        try {
          const r = await fetch('/wp-json/wc/store/cart/add-item', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-WC-Store-API-Nonce': window.pcBuilderData.storeNonce,
            },
            credentials: 'include',
            body: JSON.stringify(item),
          });
          
          if (!r.ok) failed.push(item.id);
        } catch (e) {
          failed.push(item.id);
        }
      }

      if (failed.length === 0) {
        window.location.href = window.pcBuilderData.cartUrl;
      } else if (failed.length === items.length) {
        // All failed, use GET method
        const qs = items.map(({ id }) => id).join('&add-to-cart=');
        window.location.href = `${window.pcBuilderData.cartUrl}?add-to-cart=${qs}`;
      } else {
        throw new Error(`${failed.length} item(s) could not be added.`);
      }
    } catch (err) {
      setCartError(err.message);
    } finally {
      setIsAddingToCart(false);
    }
  }, [getSelectedItems]);

  return {
    addToCart,
    isAddingToCart,
    cartError,
  };
};