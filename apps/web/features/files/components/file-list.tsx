'use client';

import { Card, Modal, toast } from '@heroui/react';
import { Document, Eye, Trash } from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import type { FileItem } from '@/features/collections/types';
import { DELETE_FILE } from '@/lib/graphql/files';
import { graphqlClient } from '@/lib/graphql-client';

interface FileCardProps {
  file: FileItem;
}

export function FileCard({ file }: FileCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const isImage = file.type.startsWith('image/');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await graphqlClient.request(DELETE_FILE, { id: file.id });
      toast.success('File deleted successfully');
      router.refresh();
    } catch {
      toast.danger('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <Card className="group relative overflow-hidden aspect-square hover:shadow-lg transition-all">
      {/* Image or Document Icon */}
      {isImage ? (
        <img
          src={file.url}
          alt={file.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-default/20 to-default/5">
          <Document size={64} variant="Bulk" className="text-muted" />
        </div>
      )}

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {/* View Image Button */}
        <Modal>
          <CustomButton isIconOnly size="lg" variant="secondary">
            <Eye size={24} />
          </CustomButton>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-4xl">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>{file.name}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <img src={file.url} alt={file.name} className="w-full h-auto rounded-lg" />
                </Modal.Body>
                <Modal.Footer>
                  <p className="text-sm text-muted">{fileSizeMB} MB</p>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        {/* Delete Button with Confirmation */}
        <Modal>
          <CustomButton isIconOnly size="lg" variant="danger">
            <Trash size={24} />
          </CustomButton>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-md">
                {renderProps => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Delete File</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p>Are you sure you want to delete "{file.name}"?</p>
                      <p className="text-sm text-muted mt-2">This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <CustomButton variant="ghost" onPress={() => renderProps.close()}>
                        Cancel
                      </CustomButton>
                      <CustomButton
                        variant="danger"
                        isPending={deleting}
                        onPress={async () => {
                          await handleDelete();
                          renderProps.close();
                        }}
                      >
                        Delete
                      </CustomButton>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {/* File Info Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-3">
        <p className="text-foreground text-xs font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-muted text-xs">{fileSizeMB} MB</p>
      </div>
    </Card>
  );
}

interface FileListProps {
  files: FileItem[];
}

export function FileList({ files }: FileListProps) {
  if (!files || files.length === 0) {
    return (
      <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted border-2 border-dashed border-divider rounded-2xl bg-default/20">
        <Document size={64} variant="Broken" className="mb-4 opacity-30" />
        <p className="text-lg font-medium">No files in this collection</p>
        <p className="text-sm mt-1">Upload some files to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
      {files.map(file => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
