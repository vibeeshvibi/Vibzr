import { useState, useEffect, useRef, useCallback } from 'react';

export function useSearch<T>(
  searchFn: (query: string) => Promise<T>,
  debounceMs = 350
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
    },
    []
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    setIsLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      try {
        const data = await searchFn(query);
        setResults(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError('Search failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, searchFn, debounceMs]);

  const clear = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  return { query, results, isLoading, error, search, clear };
}
