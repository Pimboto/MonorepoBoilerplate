'use client';

import { Skeleton } from '@heroui/react';
import CollectionList from '@/features/collections/components/collection-list';
import { useCollections } from '@/features/collections/hooks/useCollections';

function CollectionsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const { collections, loading, error } = useCollections();

  if (loading) {
    return <CollectionsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-danger">Error: {error}</p>
      </div>
    );
  }

  return <CollectionList collections={collections} />;
}
