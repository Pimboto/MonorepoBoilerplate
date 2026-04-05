'use client';

import { Spinner, toast } from '@heroui/react';
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { ArrowLeft2, DocumentDownload, DocumentUpload, Save2 } from 'iconsax-reactjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type DragEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { NodePalette } from '@/features/workflows/components/NodePalette';
import { WorkflowCanvas } from '@/features/workflows/components/WorkflowCanvas';
import {
  createDefaultImageEditsParams,
  createDefaultPlaygroundParams,
  createDefaultVideoParams,
  type WorkflowGql,
  type WorkflowNodeData,
} from '@/features/workflows/types';
import { CREATE_WORKFLOW, GET_WORKFLOW, UPDATE_WORKFLOW } from '@/lib/graphql/workflows';
import { graphqlClient } from '@/lib/graphql-client';

const NODE_TYPE_MAP: Record<string, () => WorkflowNodeData> = {
  skyPlayground: createDefaultPlaygroundParams,
  skyImageEdits: createDefaultImageEditsParams,
  skyVideo: createDefaultVideoParams,
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function WorkflowEditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('id');

  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [initialLoading, setInitialLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();

  // Refs for auto-save debounce
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIdRef = useRef<string | null>(workflowId);
  // Track whether we've loaded the workflow to avoid saving on initial load
  const hasLoadedRef = useRef(false);

  // Keep currentIdRef in sync (covers the case where we create then redirect)
  useEffect(() => {
    currentIdRef.current = workflowId;
  }, [workflowId]);

  // ---- Load or create workflow on mount ----
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (workflowId) {
        // Fetch existing workflow
        try {
          const data = await graphqlClient.request<{ workflow: WorkflowGql }>(GET_WORKFLOW, {
            id: workflowId,
          });
          if (cancelled) return;
          const wf = data.workflow;
          setWorkflowName(wf.name);
          const parsedNodes = Array.isArray(wf.nodes) ? (wf.nodes as Node[]) : [];
          const parsedEdges = Array.isArray(wf.edges) ? (wf.edges as Edge[]) : [];
          setNodes(parsedNodes);
          setEdges(parsedEdges);
        } catch (err: unknown) {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : 'Failed to load workflow';
          toast.danger(message);
        } finally {
          if (!cancelled) {
            setInitialLoading(false);
            // Mark as loaded after a tick so auto-save doesn't fire for the initial state set
            setTimeout(() => {
              hasLoadedRef.current = true;
            }, 100);
          }
        }
      } else {
        // Create a new workflow then redirect
        try {
          const data = await graphqlClient.request<{ createWorkflow: WorkflowGql }>(
            CREATE_WORKFLOW,
            { input: { name: 'Untitled Workflow' } },
          );
          if (cancelled) return;
          router.replace(`/app/workflows/editor?id=${data.createWorkflow.id}`);
        } catch (err: unknown) {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : 'Failed to create workflow';
          toast.danger(message);
          setInitialLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [workflowId, setNodes, setEdges, router]);

  // ---- Save to backend ----
  const persistSave = useCallback(
    async (name: string, currentNodes: Node[], currentEdges: Edge[]) => {
      const id = currentIdRef.current;
      if (!id) return;

      setSaveStatus('saving');
      try {
        await graphqlClient.request(UPDATE_WORKFLOW, {
          id,
          input: {
            name,
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges)),
          },
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(prev => (prev === 'saved' ? 'idle' : prev)), 2000);
      } catch {
        setSaveStatus('error');
        toast.danger('Failed to save workflow');
      }
    },
    [],
  );

  const handleSave = useCallback(() => {
    persistSave(workflowName, nodes, edges);
  }, [persistSave, workflowName, nodes, edges]);

  // ---- Auto-save: debounce 2 seconds after any change ----
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (!currentIdRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      persistSave(workflowName, nodes, edges);
    }, 2000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [workflowName, nodes, edges, persistSave]);

  // ---- Canvas callbacks ----

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            className: 'stroke-default-300',
            style: { strokeWidth: 2 },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !NODE_TYPE_MAP[type]) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { ...NODE_TYPE_MAP[type]() },
      };

      setNodes(nds => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  // ---- Export / Import ----

  const handleExport = useCallback(() => {
    const data = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [workflowName, nodes, edges]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async event => {
        try {
          const data = JSON.parse(event.target?.result as string) as {
            name?: string;
            nodes?: Node[];
            edges?: Edge[];
          };
          const importedName = data.name || workflowName;
          const importedNodes = data.nodes || [];
          const importedEdges = data.edges || [];

          setWorkflowName(importedName);
          setNodes(importedNodes);
          setEdges(importedEdges);

          // Persist immediately after import
          const id = currentIdRef.current;
          if (id) {
            await graphqlClient.request(UPDATE_WORKFLOW, {
              id,
              input: {
                name: importedName,
                nodes: JSON.parse(JSON.stringify(importedNodes)),
                edges: JSON.parse(JSON.stringify(importedEdges)),
              },
            });
            toast.success('Workflow imported and saved');
          }
        } catch {
          toast.danger('Invalid workflow file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [workflowName, setNodes, setEdges]);

  // ---- Save status label ----
  const saveLabel = (() => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return 'Save';
    }
  })();

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-default-500">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-divider bg-content1/80 backdrop-blur-xl">
        {/* Left: Back + Name */}
        <div className="flex items-center gap-3">
          <Link
            href="/app/workflows"
            className="
              flex items-center justify-center w-8 h-8 rounded-lg
              bg-default-100 dark:bg-default-50 border border-divider
              text-default-500 hover:text-foreground hover:bg-default-200 dark:hover:bg-default-100
              transition-all duration-200
            "
          >
            <ArrowLeft2 size={16} variant="Linear" />
          </Link>

          <div className="w-px h-5 bg-divider" />

          <input
            type="text"
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            className="
              bg-transparent text-sm font-semibold text-foreground
              border-none outline-none
              hover:text-foreground/80 focus:text-foreground
              placeholder:text-default-300
              w-56
            "
          />

          {/* Save status indicator */}
          {saveStatus !== 'idle' && (
            <span
              className={`text-xs font-medium ${
                saveStatus === 'saving'
                  ? 'text-default-400'
                  : saveStatus === 'saved'
                    ? 'text-success'
                    : 'text-danger'
              }`}
            >
              {saveLabel}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Import */}
          <button
            type="button"
            onClick={handleImport}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-default-100 dark:bg-default-50 border border-divider
              text-xs font-medium text-default-500
              hover:bg-default-200 dark:hover:bg-default-100 hover:text-foreground
              transition-all duration-200
            "
          >
            <DocumentUpload size={14} variant="Linear" />
            Import
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              bg-default-100 dark:bg-default-50 border border-divider
              text-xs font-medium text-default-500
              hover:bg-default-200 dark:hover:bg-default-100 hover:text-foreground
              transition-all duration-200
            "
          >
            <DocumentDownload size={14} variant="Linear" />
            Export
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="
              flex items-center gap-2 px-4 py-1.5 rounded-lg
              bg-gradient-to-b from-violet-500 to-violet-600
              border border-violet-400/30
              text-xs font-semibold text-white
              shadow-lg shadow-violet-500/20
              hover:from-violet-400 hover:to-violet-500
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.97]
              transition-all duration-200
            "
          >
            <Save2 size={14} variant="Bold" />
            {saveLabel}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Node Palette */}
        <NodePalette />

        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The editor page wraps everything in a ReactFlowProvider so that
 * `useReactFlow()` (for screenToFlowPosition) works at this level,
 * and the same provider is shared with the canvas and node components.
 *
 * Suspense boundary is required because useSearchParams() needs it.
 */
export default function WorkflowEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <Spinner size="lg" />
        </div>
      }
    >
      <ReactFlowProvider>
        <WorkflowEditorInner />
      </ReactFlowProvider>
    </Suspense>
  );
}
