'use client';

import { Skeleton } from '@heroui/react';

export default function CollectionDetailLoading() {
  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-divider pb-6">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-56 rounded-lg" />
            <Skeleton className="h-5 w-80 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={`file-${i}`} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
