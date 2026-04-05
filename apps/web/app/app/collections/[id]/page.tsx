import { ArrowLeft } from 'iconsax-reactjs';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollection } from '@/features/collections/actions';
import { FileList } from '@/features/files/components/file-list';
import { CollectionUploader } from '@/features/files/components/uploader';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-divider pb-6">
        <Link
          href="/app/collections"
          className="flex items-center gap-2 text-default-500 hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to collections</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <p className="text-default-500 mt-1 max-w-2xl">
              {collection.description || 'No description'}
            </p>
          </div>
          <CollectionUploader collectionId={collection.id} />
        </div>
      </div>

      {/* Stats or Filters could go here */}

      {/* Files Grid */}
      <FileList files={collection.files || []} />
    </div>
  );
}
