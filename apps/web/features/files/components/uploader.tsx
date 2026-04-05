'use client';

import { toast } from '@heroui/react';
import { DocumentUpload } from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { CREATE_FILE } from '@/lib/graphql/files';
import { graphqlClient } from '@/lib/graphql-client';
import { useUploadThing } from '@/lib/uploadthing';

interface CollectionUploaderProps {
  collectionId: string;
}

export function CollectionUploader({ collectionId }: CollectionUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('collectionFileUploader', {
    onUploadProgress: p => {
      setProgress(p);
    },
    onClientUploadComplete: async res => {
      if (res) {
        try {
          // Save each file via GraphQL
          await Promise.all(
            res.map(file =>
              graphqlClient.request(CREATE_FILE, {
                input: {
                  name: file.name,
                  url: file.url,
                  key: file.key,
                  size: file.size,
                  type: file.type || 'unknown',
                  collectionId,
                },
              }),
            ),
          );
          router.refresh();
          toast.success('Files uploaded successfully');
          setUploading(false);
          setProgress(0);
        } catch {
          toast.danger('Failed to save file metadata');
          setUploading(false);
        }
      }
    },
    onUploadError: (error: Error) => {
      toast.danger(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const filesArray = Array.from(files);
    await startUpload(filesArray);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <CustomButton
        variant="secondary"
        size="md"
        isPending={uploading}
        isDisabled={uploading}
        onPress={handleClick}
      >
        <DocumentUpload size={20} />
        {uploading ? `Uploading ${progress}%` : 'Upload Files'}
      </CustomButton>
    </div>
  );
}
