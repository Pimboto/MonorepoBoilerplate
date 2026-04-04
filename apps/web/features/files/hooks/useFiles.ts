'use client';

import { useCallback, useEffect, useState } from 'react';
import { CREATE_FILE, DELETE_FILE, GET_FILES_BY_COLLECTION } from '@/lib/graphql/files';
import { graphqlClient } from '@/lib/graphql-client';
import type { FileItem } from '../types';

export function useFiles(collectionId: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await graphqlClient.request<{ filesByCollection: FileItem[] }>(
        GET_FILES_BY_COLLECTION,
        { collectionId },
      );
      setFiles(data.filesByCollection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  const createFile = useCallback(
    async (input: {
      name: string;
      url: string;
      key: string;
      size: number;
      type: string;
      collectionId: string;
    }) => {
      const data = await graphqlClient.request<{ createFile: FileItem }>(CREATE_FILE, { input });
      setFiles(prev => [data.createFile, ...prev]);
      return data.createFile;
    },
    [],
  );

  const deleteFile = useCallback(async (id: string) => {
    await graphqlClient.request(DELETE_FILE, { id });
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, createFile, deleteFile, refetch: fetchFiles };
}
