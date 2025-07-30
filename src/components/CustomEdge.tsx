import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isDashed = data?.style === 'dashed';

  const [isHovered, setHovered] = useState(false);

  const handleStyleToggle = () => {
    if (data?.onStyleChange) {
      data.onStyleChange(id, isDashed ? 'solid' : 'dashed');
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd="url(#arrowhead)"
        style={{
          stroke: selected ? '#facc15' : '#555',
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isDashed ? '6 4' : 'none',
          filter: selected ? 'drop-shadow(0 0 4px #facc15)' : 'none',
          transition: 'stroke 0.2s, filter 0.2s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'white',
              padding: '4px 6px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
            onClick={handleStyleToggle}
          >
            {isDashed ? 'Make Solid' : 'Make Dashed'}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
