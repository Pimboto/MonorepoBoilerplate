'use client';

import { useCallback, useEffect, useState } from 'react';
import { GET_COLLECTION, UPDATE_COLLECTION } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';
import type { Collection } from '../types';

export function useCollection(id: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphqlClient.request<{ collection: Collection }>(GET_COLLECTION, {
        id,
      });
      setCollection(data.collection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateCollection = useCallback(
    async (input: { name?: string; description?: string | null }) => {
      const data = await graphqlClient.request<{ updateCollection: Collection }>(
        UPDATE_COLLECTION,
        { id, input },
      );
      setCollection(data.updateCollection);
      return data.updateCollection;
    },
    [id],
  );

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return { collection, loading, error, updateCollection, refetch: fetchCollection };
}
