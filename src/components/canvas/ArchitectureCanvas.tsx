import React, { useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SystemNode } from '../nodes/SystemNode';
import { TrafficEdge } from '../edges/TrafficEdge';
import { useGameStore } from '../../store/gameStore';
import type { ComponentType, SystemNodeData } from '../../types/game';

const nodeTypes = {
  client: SystemNode,
  cdn: SystemNode,
  load_balancer: SystemNode,
  compute: SystemNode,
  cache: SystemNode,
  database: SystemNode,
  queue: SystemNode,
};

const edgeTypes = {
  default: TrafficEdge,
};

const CanvasInternal: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useGameStore((s) => s.nodes);
  const edges = useGameStore((s) => s.edges);
  const onNodesChange = useGameStore((s) => s.onNodesChange);
  const onEdgesChange = useGameStore((s) => s.onEdgesChange);
  const onConnect = useGameStore((s) => s.onConnect);
  const addNode = useGameStore((s) => s.addNode);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as ComponentType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex-1 h-full w-full relative bg-slate-950" ref={reactFlowWrapper}>
      <ReactFlow<Node<SystemNodeData>>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        colorMode="dark"
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#38bdf8', strokeWidth: 2.5 },
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#334155" 
        />
        <Controls 
          className="!bg-slate-900 !border !border-slate-800 !rounded-lg !text-slate-300"
          showInteractive={false}
        />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-slate-900/80 !border !border-slate-800 !rounded-lg overflow-hidden"
          maskColor="rgba(2, 6, 23, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};

export const ArchitectureCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasInternal />
    </ReactFlowProvider>
  );
};
