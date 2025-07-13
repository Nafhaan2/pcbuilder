// src/hooks/useProductData.js - Enhanced with request deduplication
import { useState, useEffect, useRef } from 'react';
import { useBuilder } from '../contexts/BuilderContext';

// Global cache for in-flight requests
const requestCache = new Map();

export const useProductData = (slugs) => {
  const { catalog, updateCatalog } = useBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllersRef = useRef([]);

  useEffect(() => {
    // Cleanup function
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Cancel previous requests for this component
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current = [];

      // Determine which slugs need fetching
      const slugList = Array.isArray(slugs) ? slugs : [slugs];
      const slugsToFetch = slugList.filter(slug => !catalog[slug]);

      if (slugsToFetch.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchPromises = slugsToFetch.map(async (slug) => {
          // Check if request is already in flight
          if (requestCache.has(slug)) {
            // Return existing promise
            return requestCache.get(slug);
          }

          // Create new request
          const controller = new AbortController();
          abortControllersRef.current.push(controller);

          const promise = fetch(
            `${window.pcBuilderData.root}pcbuilder/v1/products?category=${slug}&per_page=100`,
            {
              headers: { 'X-WP-Nonce': window.pcBuilderData.nonce },
              signal: controller.signal,
            }
          )
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${slug}`);
            return res.json();
          })
          .then(json => ({ slug, data: json.body || [] }))
          .catch(err => {
            if (err.name === 'AbortError') return null;
            throw err;
          })
          .finally(() => {
            // Remove from cache when done
            requestCache.delete(slug);
          });

          // Store in cache
          requestCache.set(slug, promise);
          return promise;
        });

        const results = await Promise.all(fetchPromises);
        
        const updates = {};
        results.forEach(result => {
          if (result && result.data) {
            updates[result.slug] = result.data;
          }
        });

        if (Object.keys(updates).length > 0) {
          updateCatalog(updates);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slugs, catalog, updateCatalog]);

  // Get merged data for the requested slugs
  const data = Array.isArray(slugs)
    ? slugs.flatMap(slug => catalog[slug] || [])
    : catalog[slugs] || [];

  return { data, loading, error };
};