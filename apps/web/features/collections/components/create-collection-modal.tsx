'use client';

import { createCollectionSchema } from '@cocostudio/shared';
import { Input, Label, Modal, TextArea, toast } from '@heroui/react';
import { clsx } from 'clsx';
import { Add, Warning2 } from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { CREATE_COLLECTION } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';

interface CreateCollectionModalProps {
  onSuccess?: () => void;
}

export function CreateCollectionModal({ onSuccess }: CreateCollectionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, closeFn: () => void) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const input = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
    };

    const validation = createCollectionSchema.safeParse(input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      await graphqlClient.request(CREATE_COLLECTION, { input });
      toast.success('Collection created successfully');
      router.refresh();
      onSuccess?.();
      closeFn();
    } catch (err: unknown) {
      const gqlErr = err as { response?: { errors?: { message: string }[] } };
      const errorMessage = gqlErr?.response?.errors?.[0]?.message || 'Failed to create collection';
      setErrors({ form: errorMessage });
      toast.danger(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <CustomButton>
        <Add size={20} variant="Linear" />
        New Collection
      </CustomButton>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            {renderProps => (
              <form onSubmit={e => handleSubmit(e, renderProps.close)}>
                <Modal.CloseTrigger />

                <Modal.Header className="flex flex-col gap-1 pl-4">
                  <div className="flex items-center">
                    <Modal.Heading>Create Collection</Modal.Heading>
                  </div>
                  <p className="text-sm text-muted ">
                    Organize your files into a new smart folder.
                  </p>
                </Modal.Header>

                <Modal.Body className="py-4 pl-4 pr-4">
                  <div className="space-y-5">
                    {/* Name Field Group */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground flex items-center gap-1.5"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g. Design Assets"
                        variant="primary"
                        fullWidth
                        autoFocus
                        disabled={loading}
                        maxLength={50}
                        className={clsx(
                          errors.name && 'border-danger focus-visible:border-danger ring-danger/20',
                        )}
                      />
                      {errors.name && (
                        <p className="text-xs text-danger font-medium">{errors.name}</p>
                      )}
                    </div>

                    {/* Description Field Group */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        Description
                      </Label>
                      <TextArea
                        name="description"
                        placeholder="Optional description..."
                        variant="primary"
                        disabled={loading}
                        fullWidth
                        className={clsx(
                          errors.description &&
                            'border-danger focus-visible:border-danger ring-danger/20',
                        )}
                      />
                      {errors.description && (
                        <p className="text-xs text-danger font-medium">{errors.description}</p>
                      )}
                    </div>

                    {/* Global Form Error */}
                    {errors.form && (
                      <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-center gap-2">
                        <Warning2 size={16} variant="Bold" />
                        <span>{errors.form}</span>
                      </div>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer>
                  <CustomButton
                    variant="ghost"
                    onPress={() => renderProps.close()}
                    type="button"
                    isDisabled={loading}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    isPending={loading}
                    variant="primary"
                    className="shadow-md shadow-primary/20"
                  >
                    Create
                  </CustomButton>
                </Modal.Footer>
              </form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
