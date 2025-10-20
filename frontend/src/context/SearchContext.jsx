import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price_asc');

  const updateQuery = useCallback((value) => {
    setQuery(value);
  }, []);

  const updateSort = useCallback((value) => {
    setSort(value);
  }, []);

  const value = useMemo(() => ({ query, setQuery: updateQuery, sort, setSort: updateSort }), [query, updateQuery, sort, updateSort]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch debe usarse dentro de un SearchProvider');
  return ctx;
};