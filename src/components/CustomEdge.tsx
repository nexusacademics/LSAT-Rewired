import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, selected }: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? '#8b5cf6' : '#999',
        strokeWidth: selected ? 3 : 2,
      }}
    />
  );
}
