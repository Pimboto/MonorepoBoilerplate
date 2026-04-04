'use client';

import { useEffect, useState } from 'react';
import { Collection } from '@/features/collections/types';
import { GET_COLLECTIONS } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await graphqlClient.request(GET_COLLECTIONS);
      setCollections(data.collections || []);
    } catch (err: any) {
      console.error('Failed to fetch collections', err);
      setError(err.message || 'Failed to fetch collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections,
  };
}
