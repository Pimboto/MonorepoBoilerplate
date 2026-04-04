'use client';

import { Collection } from '../types';
import { CollectionCard } from './collection-card';
import { CreateCollectionModal } from './create-collection-modal';

interface CollectionListProps {
  collections: Collection[];
}

export default function CollectionList({ collections }: CollectionListProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Collections</h1>
          <p className="text-default-500 mt-1">Organize and manage your image collections</p>
        </div>
        <CreateCollectionModal />
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-default-500">No collections yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
