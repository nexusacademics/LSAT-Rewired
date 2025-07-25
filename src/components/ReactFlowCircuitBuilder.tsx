// components/ReactFlowCircuitBuilder.tsx
import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Premise A' },
    position: { x: 100, y: 100 },
    type: 'default',
  },
  {
    id: '2',
    data: { label: 'Conclusion B' },
    position: { x: 400, y: 200 },
    type: 'default',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'default' },
];

export const ReactFlowCircuitBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] rounded-xl border shadow-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-white"
      >
        <Background gap={16} color="#eee" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};
