'use client';

import { Modal, Skeleton, toast } from '@heroui/react';
import { Add, Calendar1, Edit2, Hierarchy, Trash } from 'iconsax-reactjs';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import type { WorkflowGql } from '@/features/workflows/types';
import { CREATE_WORKFLOW, DELETE_WORKFLOW, GET_WORKFLOWS } from '@/lib/graphql/workflows';
import { graphqlClient } from '@/lib/graphql-client';

function WorkflowsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {['a', 'b', 'c', 'd', 'e', 'f'].map(key => (
          <Skeleton key={`wf-skeleton-${key}`} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowGql[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlClient.request<{ workflows: WorkflowGql[] }>(GET_WORKFLOWS);
      setWorkflows(data.workflows || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workflows';
      setError(message);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const data = await graphqlClient.request<{
        createWorkflow: WorkflowGql;
      }>(CREATE_WORKFLOW, {
        input: { name: 'Untitled Workflow' },
      });
      router.push(`/app/workflows/editor?id=${data.createWorkflow.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create workflow';
      toast.danger(message);
    } finally {
      setCreating(false);
    }
  }, [router]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await graphqlClient.request(DELETE_WORKFLOW, { id });
      toast.success('Workflow deleted');
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch {
      toast.danger('Failed to delete workflow');
    }
  }, []);

  if (loading) {
    return <WorkflowsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-danger">Error: {error}</p>
      </div>
    );
  }

  const nodeCount = (w: WorkflowGql): number => {
    if (Array.isArray(w.nodes)) return w.nodes.length;
    return 0;
  };

  const edgeCount = (w: WorkflowGql): number => {
    if (Array.isArray(w.edges)) return w.edges.length;
    return 0;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-default-500">
            Build and manage AI generation pipelines with a visual node editor.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-primary text-primary-foreground
            rounded-full text-sm font-semibold
            border-[1.5px] border-black/10 dark:border-white/10
            shadow-[0_2px_4px_rgba(0,0,0,0.04)]
            hover:opacity-90 active:scale-[0.97]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          <Add size={18} variant="Linear" />
          {creating ? 'Creating...' : 'New Workflow'}
        </button>
      </div>

      {/* Workflow Grid */}
      {workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map(workflow => (
            <div
              key={workflow.id}
              className="
                group flex flex-col gap-4 p-5 rounded-2xl
                bg-content1 border border-divider shadow-small
                hover:shadow-medium
                transition-all duration-200
              "
            >
              {/* Top: Icon + Info */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-default-100 dark:bg-default-50 shrink-0">
                  <Hierarchy size={24} variant="Linear" className="text-default-400" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p className="text-xs text-default-400 line-clamp-2">{workflow.description}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-default-400">
                <span>
                  {nodeCount(workflow)} node{nodeCount(workflow) === 1 ? '' : 's'}
                </span>
                <span className="w-px h-3 bg-divider" />
                <span>
                  {edgeCount(workflow)} connection{edgeCount(workflow) === 1 ? '' : 's'}
                </span>
                <span className="w-px h-3 bg-divider" />
                <span className="flex items-center gap-1">
                  <Calendar1 size={12} />
                  {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-divider">
                <button
                  type="button"
                  onClick={() => router.push(`/app/workflows/editor?id=${workflow.id}`)}
                  className="
                    inline-flex items-center gap-2 px-4 py-2
                    bg-default-100 dark:bg-default-50 text-foreground
                    rounded-lg text-sm font-medium
                    border border-divider
                    hover:bg-default-200 dark:hover:bg-default-100
                    active:scale-[0.97]
                    transition-all duration-200
                  "
                >
                  <Edit2 size={16} variant="Linear" />
                  Open
                </button>

                <div className="ml-auto">
                  <Modal>
                    <CustomButton
                      isIconOnly
                      size="sm"
                      variant="danger"
                      className="
                        w-9 h-9 min-w-9 rounded-lg
                        bg-danger/10 border border-danger/20
                        text-danger
                        hover:bg-danger/20
                        active:scale-[0.97]
                        transition-all duration-200
                      "
                    >
                      <Trash size={16} variant="Linear" />
                    </CustomButton>
                    <Modal.Backdrop>
                      <Modal.Container>
                        <Modal.Dialog>
                          {renderProps => (
                            <>
                              <Modal.CloseTrigger />
                              <Modal.Header>
                                <Modal.Heading>Delete Workflow</Modal.Heading>
                              </Modal.Header>
                              <Modal.Body>
                                <p className="text-sm text-default-500">
                                  Are you sure you want to delete{' '}
                                  <strong className="text-foreground">{workflow.name}</strong>? This
                                  action cannot be undone.
                                </p>
                              </Modal.Body>
                              <Modal.Footer>
                                <CustomButton variant="ghost" onPress={() => renderProps.close()}>
                                  Cancel
                                </CustomButton>
                                <CustomButton
                                  variant="danger"
                                  onPress={async () => {
                                    await handleDelete(workflow.id);
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-default-100 dark:bg-default-50">
            <Hierarchy size={28} variant="Linear" className="text-default-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">No workflows yet</h3>
            <p className="text-sm text-default-500 mt-1 max-w-sm">
              Create your first workflow to start building AI generation pipelines with
              drag-and-drop nodes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              bg-default-100 dark:bg-default-50 text-foreground
              rounded-full text-sm font-medium
              border border-default-200 dark:border-divider
              hover:bg-default-200 dark:hover:bg-default-100
              active:scale-[0.97]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}
