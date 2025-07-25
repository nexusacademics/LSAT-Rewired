// components/TripleReview/CircuitBuilder.tsx
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Circuit, DiagramNode } from '../../types';

interface CircuitBuilderProps {
  existingCircuit: Circuit | null;
  onSave: (circuit: Circuit) => void;
}

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({ existingCircuit, onSave }) => {
  const initialNodes: Node[] = existingCircuit?.diagram?.map((n) => ({
    id: n.id,
    type: 'default',
    data: { label: n.text },
    position: { x: n.x, y: n.y },
  })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // No edges yet

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Save handler
  const handleSave = () => {
    const diagram: DiagramNode[] = nodes.map((node) => ({
      id: node.id,
      text: node.data.label,
      x: node.position.x,
      y: node.position.y,
    }));

    const newCircuit: Circuit = {
      id: existingCircuit?.id || crypto.randomUUID(),
      diagram,
    };

    onSave(newCircuit);
  };

  useEffect(() => {
    if (existingCircuit?.diagram?.length) {
      setNodes(existingCircuit.diagram.map((n) => ({
        id: n.id,
        type: 'default',
        data: { label: n.text },
        position: { x: n.x, y: n.y },
      })));
    }
  }, [existingCircuit, setNodes]);

  return (
    <div className="w-full h-[600px] rounded-lg border bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background gap={16} />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
