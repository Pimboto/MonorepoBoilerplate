'use client';

import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type DragEvent, useCallback, useMemo } from 'react';
import { SkyImageEditsNode, SkyPlaygroundNode, SkyVideoNode } from '../nodes';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

/**
 * Presentational canvas component. The parent owns all state (nodes, edges)
 * and passes callbacks. This component must live inside a `<ReactFlowProvider>`
 * so that node components can use `useReactFlow()` for in-place data updates.
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
}: WorkflowCanvasProps) {
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      skyPlayground: SkyPlaygroundNode,
      skyImageEdits: SkyImageEditsNode,
      skyVideo: SkyVideoNode,
    }),
    [],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[15, 15]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2 },
          className: 'stroke-default-300',
        }}
        proOptions={{ hideAttribution: true }}
        className="workflow-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="!bg-background [&>pattern>circle]:fill-default-300 dark:[&>pattern>circle]:fill-default-200"
        />

        <Controls
          showInteractive={false}
          className="
            !bg-content1 !border !border-divider !rounded-xl
            !shadow-medium
            [&>button]:!bg-transparent [&>button]:!border-divider
            [&>button]:!text-default-500 [&>button]:hover:!bg-default-100
            [&>button]:hover:!text-foreground
            [&>button]:!rounded-lg [&>button]:!w-8 [&>button]:!h-8
            [&>button>svg]:!fill-current
          "
        />

        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={() => 'rgba(160, 160, 160, 0.5)'}
          className="
            !bg-content1 !border !border-divider !rounded-xl
            !shadow-medium
          "
          maskColor="var(--color-background)"
        />
      </ReactFlow>
    </div>
  );
}
