'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Collection } from '@/features/collections/types';
import { GET_COLLECTIONS } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlClient.request<{ collections: Collection[] }>(GET_COLLECTIONS);
      setCollections(data.collections || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collections';
      setError(message);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections,
  };
}
