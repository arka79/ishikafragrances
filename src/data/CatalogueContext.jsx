import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from './products.js';
import { fetchPublicCatalogue } from './publicCatalogue.js';

// The live catalogue comes from Firestore. The bundled copy keeps the page
// usable before Firebase is configured (or if the network is unavailable).
const CatalogueContext = createContext({
  products: PRODUCTS,
  source: 'bundled',
  refresh: () => {},
});

export const CatalogueProvider = ({ children }) => {
  const [products, setProducts] = useState(PRODUCTS);
  const [source, setSource] = useState('bundled');

  const refresh = useCallback(async () => {
    try {
      const payload = await fetchPublicCatalogue();
      if (Array.isArray(payload.products) && payload.products.length > 0) {
        setProducts(payload.products);
        setSource('live');
      }
    } catch (error) {
      // Keep the bundled catalogue when the live one cannot be read.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ products, source, refresh }), [products, source, refresh]);

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
};

export const useCatalogue = () => useContext(CatalogueContext);
