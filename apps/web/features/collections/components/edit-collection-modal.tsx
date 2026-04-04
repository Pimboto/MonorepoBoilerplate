'use client';

import { Form, Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import { Edit } from 'iconsax-reactjs';
import { useState } from 'react';
import { z } from 'zod';
import { CustomButton } from '@/components/ui/CustomButton';
import { UPDATE_COLLECTION } from '@/lib/graphql/collections';
import { graphqlClient } from '@/lib/graphql-client';
import { Collection, UpdateCollectionInput } from '../types';

// Use Zod schema for validation
const updateCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  description: z.string().max(1000).optional(),
});

interface EditCollectionModalProps {
  collection: Collection;
  onSuccess?: () => void;
}

export function EditCollectionModal({ collection, onSuccess }: EditCollectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close?: () => void) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const input: UpdateCollectionInput = {
      name: (formData.get('name') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
    };

    // Validate with Zod
    const validation = updateCollectionSchema.safeParse(input);
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
      // Call GraphQL mutation directly
      await graphqlClient.request(UPDATE_COLLECTION, {
        id: collection.id,
        input,
      });

      console.log('Collection updated');

      // Reset form, refresh and close
      setErrors({});
      toast.success('Collection updated successfully');
      onSuccess?.();
      close?.();
    } catch (err: any) {
      console.error('Update collection error:', err);
      const errorMessage =
        err?.response?.errors?.[0]?.message || err.message || 'Failed to update collection';
      setErrors({ form: errorMessage });
      toast.danger('Failed to update collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <CustomButton isIconOnly size="sm" variant="tertiary">
        <Edit size={16} />
      </CustomButton>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            {renderProps => (
              <Form onSubmit={e => handleSubmit(e, renderProps.close)}>
                <Modal.CloseTrigger />
                <Modal.Header className="flex flex-col gap-1 pl-4">
                  <div className="flex items-center">
                    <Modal.Heading>Edit Collection</Modal.Heading>
                  </div>
                  <p className="text-sm text-muted ">Update collection details</p>
                </Modal.Header>
                <Modal.Body className=" py-4 pl-4 pr-4">
                  <div className="space-y-5">
                    <TextField name="name" type="text">
                      <Label>Name</Label>
                      <Input
                        placeholder="Collection name"
                        variant="primary"
                        defaultValue={collection.name}
                        className={errors.name ? 'border-danger' : ''}
                      />
                      {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                    </TextField>

                    <TextField name="description">
                      <Label>Description</Label>
                      <TextArea
                        placeholder="Optional description..."
                        variant="primary"
                        defaultValue={collection.description || ''}
                        className={errors.description ? 'border-danger' : ''}
                      />
                      {errors.description && (
                        <p className="text-danger text-xs mt-1">{errors.description}</p>
                      )}
                    </TextField>
                  </div>

                  {errors.form && <p className="text-danger text-sm mt-2">{errors.form}</p>}
                </Modal.Body>
                <Modal.Footer>
                  <CustomButton variant="ghost" onPress={() => renderProps.close()} type="button">
                    Cancel
                  </CustomButton>
                  <CustomButton type="submit" isPending={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </CustomButton>
                </Modal.Footer>
              </Form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
